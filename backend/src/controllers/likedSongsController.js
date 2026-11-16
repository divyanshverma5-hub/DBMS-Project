const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function listLikedSongs(req, res, next) {
  try {
    const userId = req.user.user_id;
    const moodId = req.query.mood_id ? Number(req.query.mood_id) : null;
    if (moodId !== null && (!Number.isSafeInteger(moodId) || moodId < 1)) {
      return sendError(res, 'A valid mood_id is required.', 400);
    }

    const params = [userId];
    let moodFilter = '';
    if (moodId !== null) {
      moodFilter = ` AND EXISTS (
        SELECT 1 FROM track_mood filter_tm
        WHERE filter_tm.track_id = t.track_id AND filter_tm.mood_id = ?
      )`;
      params.push(moodId);
    }

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec, t.valence, t.energy,
              t.tempo_bpm, t.youtube_video_id, ls.liked_at,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name, ar.image_url AS artist_image_url,
              GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ', ') AS moods
       FROM liked_songs ls
       INNER JOIN track t ON t.track_id = ls.track_id
       INNER JOIN album al ON al.album_id = t.album_id
       LEFT JOIN track_artist ta ON ta.track_id = t.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ar.artist_id = ta.artist_id
       LEFT JOIN track_mood tm ON tm.track_id = t.track_id
       LEFT JOIN mood m ON m.mood_id = tm.mood_id
       WHERE ls.user_id = ?${moodFilter}
       GROUP BY t.track_id, t.title, t.track_no, t.duration_sec, t.valence, t.energy,
                t.tempo_bpm, t.youtube_video_id, ls.liked_at, al.album_id,
                al.title, al.cover_image_url, ar.artist_id, ar.name, ar.image_url
       ORDER BY ls.liked_at DESC`,
      params
    );
    return sendSuccess(res, { tracks, count: tracks.length }, 'Liked songs retrieved successfully');
  } catch (err) { next(err); }
}

async function getLikedMoods(req, res, next) {
  try {
    const [moods] = await pool.query(
      `SELECT DISTINCT m.mood_id, m.name
       FROM liked_songs ls
       INNER JOIN track_mood tm ON tm.track_id = ls.track_id
       INNER JOIN mood m ON m.mood_id = tm.mood_id
       WHERE ls.user_id = ?
       ORDER BY m.name ASC`,
      [req.user.user_id]
    );
    return sendSuccess(res, { moods }, 'Liked-song moods retrieved successfully');
  } catch (err) { next(err); }
}

async function getLikeStatus(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);
    if (!Number.isSafeInteger(trackId) || trackId < 1) return sendError(res, 'A valid track ID is required.', 400);
    const [rows] = await pool.query(
      'SELECT 1 FROM liked_songs WHERE user_id = ? AND track_id = ? LIMIT 1',
      [req.user.user_id, trackId]
    );
    return sendSuccess(res, { liked: rows.length > 0 }, 'Like status retrieved');
  } catch (err) { next(err); }
}

async function likeSong(req, res, next) {
  try {
    const trackId = Number(req.body.track_id);
    if (!Number.isSafeInteger(trackId) || trackId < 1) return sendError(res, 'A valid track_id is required.', 400);
    const [tracks] = await pool.query('SELECT track_id FROM track WHERE track_id = ?', [trackId]);
    if (!tracks.length) return sendError(res, 'Track not found.', 404);
    await pool.query(
      'INSERT INTO liked_songs (user_id, track_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE liked_at = liked_at',
      [req.user.user_id, trackId]
    );
    return sendSuccess(res, { track_id: trackId, liked: true }, 'Song added to Liked Songs');
  } catch (err) { next(err); }
}

async function unlikeSong(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);
    if (!Number.isSafeInteger(trackId) || trackId < 1) return sendError(res, 'A valid track ID is required.', 400);
    await pool.query('DELETE FROM liked_songs WHERE user_id = ? AND track_id = ?', [req.user.user_id, trackId]);
    return sendSuccess(res, { track_id: trackId, liked: false }, 'Song removed from Liked Songs');
  } catch (err) { next(err); }
}

module.exports = { listLikedSongs, getLikedMoods, getLikeStatus, likeSong, unlikeSong };
