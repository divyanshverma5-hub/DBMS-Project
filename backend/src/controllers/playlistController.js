const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Create a new playlist
 * Preserves weak entity design: calls sp_create_playlist for concurrency-safe per-user sequential numbering.
 */
async function createPlaylist(req, res, next) {
  let connection;
  try {
    connection = await pool.getConnection();
    const userId = req.user.user_id;
    const { name, mood_id = null } = req.body;

    // Call stored procedure
    // Signature: sp_create_playlist(p_user_id, p_name, p_mood_id, OUT p_playlist_no)
    await connection.query('CALL sp_create_playlist(?, ?, ?, @p_playlist_no)', [
      userId,
      name,
      mood_id || null,
    ]);

    const [[{ p_playlist_no }]] = await connection.query('SELECT @p_playlist_no AS p_playlist_no');

    return sendSuccess(
      res,
      {
        user_id: userId,
        playlist_no: p_playlist_no,
        name,
        mood_id: mood_id || null,
      },
      'Playlist created successfully',
      201
    );
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * List all playlists belonging to current user
 */
async function getUserPlaylists(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [playlists] = await pool.query(
      `SELECT p.user_id, p.playlist_no, p.name, p.created_at, p.mood_id,
              m.name AS mood_name,
              fn_track_count(p.user_id, p.playlist_no) AS track_count,
              fn_total_duration(p.user_id, p.playlist_no) AS total_duration_sec
       FROM playlist p
       LEFT JOIN mood m ON p.mood_id = m.mood_id
       WHERE p.user_id = ?
       ORDER BY p.playlist_no ASC`,
      [userId]
    );

    return sendSuccess(res, { playlists, count: playlists.length }, 'User playlists retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed playlist with ordered tracklisting
 */
async function getPlaylistById(req, res, next) {
  try {
    const playlistNo = parseInt(req.params.playlistNo, 10);
    // Can optionally view other users' playlists if userId is provided in query, defaults to authenticated user
    const targetUserId = req.query.user_id ? parseInt(req.query.user_id, 10) : req.user.user_id;

    const [playlists] = await pool.query(
      `SELECT p.user_id, p.playlist_no, p.name, p.created_at, p.mood_id,
              m.name AS mood_name, u.username AS owner_username,
              fn_track_count(p.user_id, p.playlist_no) AS track_count,
              fn_total_duration(p.user_id, p.playlist_no) AS total_duration_sec
       FROM playlist p
       INNER JOIN app_user u ON p.user_id = u.user_id
       LEFT JOIN mood m ON p.mood_id = m.mood_id
       WHERE p.user_id = ? AND p.playlist_no = ?`,
      [targetUserId, playlistNo]
    );

    if (playlists.length === 0) {
      return sendError(res, 'Playlist not found.', 404);
    }
    const playlist = playlists[0];

    // Fetch ordered tracks in playlist
    const [tracks] = await pool.query(
      `SELECT pt.position, pt.added_at,
              t.track_id, t.title, t.duration_sec, t.valence, t.energy, t.audio_url, t.youtube_video_id,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name, ar.image_url AS artist_image_url
       FROM playlist_track pt
       INNER JOIN track t ON pt.track_id = t.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE pt.user_id = ? AND pt.playlist_no = ?
       ORDER BY pt.position ASC`,
      [targetUserId, playlistNo]
    );
    playlist.tracks = tracks;

    return sendSuccess(res, { playlist }, 'Playlist details retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Rename/update playlist
 */
async function updatePlaylist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const playlistNo = parseInt(req.params.playlistNo, 10);
    const { name, mood_id } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (mood_id !== undefined) {
      updates.push('mood_id = ?');
      params.push(mood_id || null);
    }

    if (updates.length === 0) {
      return sendError(res, 'No update fields provided.', 400);
    }

    params.push(userId, playlistNo);
    const [result] = await pool.query(
      `UPDATE playlist SET ${updates.join(', ')} WHERE user_id = ? AND playlist_no = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Playlist not found or you do not have permission to modify it.', 404);
    }

    return sendSuccess(res, { playlist_no: playlistNo, name, mood_id }, 'Playlist updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a playlist
 */
async function deletePlaylist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const playlistNo = parseInt(req.params.playlistNo, 10);

    const [result] = await pool.query(
      'DELETE FROM playlist WHERE user_id = ? AND playlist_no = ?',
      [userId, playlistNo]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Playlist not found or unauthorized.', 404);
    }

    return sendSuccess(res, { playlist_no: playlistNo }, 'Playlist deleted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Add a track to playlist
 * Uses concurrency-safe sp_add_track_to_playlist
 */
async function addTrackToPlaylist(req, res, next) {
  let connection;
  try {
    const userId = req.user.user_id;
    const playlistNo = parseInt(req.params.playlistNo, 10);
    const { track_id } = req.body;

    // Check if track already exists in this playlist
    const [existing] = await pool.query(
      'SELECT position FROM playlist_track WHERE user_id = ? AND playlist_no = ? AND track_id = ?',
      [userId, playlistNo, track_id]
    );

    if (existing.length > 0) {
      return sendError(res, 'Track is already present in this playlist.', 409);
    }

    // Call stored procedure sp_add_track_to_playlist
    // Signature: (user_id, playlist_no, track_id, OUT p_position)
    connection = await pool.getConnection();
    await connection.query('CALL sp_add_track_to_playlist(?, ?, ?, @out_pos)', [
      userId,
      playlistNo,
      track_id,
    ]);

    const [[{ out_pos }]] = await connection.query('SELECT @out_pos AS out_pos');

    return sendSuccess(
      res,
      {
        user_id: userId,
        playlist_no: playlistNo,
        track_id,
        position: out_pos,
      },
      'Track added to playlist successfully',
      201
    );
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Remove a track from playlist
 */
async function removeTrackFromPlaylist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const playlistNo = parseInt(req.params.playlistNo, 10);
    const trackId = parseInt(req.params.trackId, 10);

    const [result] = await pool.query(
      'DELETE FROM playlist_track WHERE user_id = ? AND playlist_no = ? AND track_id = ?',
      [userId, playlistNo, trackId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Track not found in this playlist.', 404);
    }

    return sendSuccess(res, { track_id: trackId }, 'Track removed from playlist successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
};
