const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * List albums with pagination & artist info
 */
async function getAlbums(req, res, next) {
  try {
    const { search = '', limit = 20, offset = 0 } = req.query;
    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const numOffset = Math.max(parseInt(offset, 10) || 0, 0);

    let query = `
      SELECT al.album_id, al.title, al.release_date, al.cover_image_url,
             ar.artist_id, ar.name AS artist_name,
             COUNT(t.track_id) AS track_count,
             COALESCE(SUM(t.duration_sec), 0) AS total_duration_sec
      FROM album al
      INNER JOIN artist ar ON al.artist_id = ar.artist_id
      LEFT JOIN track t ON al.album_id = t.album_id
    `;
    const params = [];

    if (search.trim()) {
      query += ' WHERE al.title LIKE ? OR ar.name LIKE ? ';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' GROUP BY al.album_id, al.title, al.release_date, al.cover_image_url, ar.artist_id, ar.name ORDER BY al.release_date DESC LIMIT ? OFFSET ?';
    params.push(numLimit, numOffset);

    const [rows] = await pool.query(query, params);

    return sendSuccess(res, { albums: rows, count: rows.length }, 'Albums retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get album details and its complete tracklist
 */
async function getAlbumById(req, res, next) {
  try {
    const albumId = parseInt(req.params.id, 10);

    const [albums] = await pool.query(
      `SELECT al.album_id, al.title, al.release_date, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name, ar.image_url AS artist_image_url
       FROM album al
       INNER JOIN artist ar ON al.artist_id = ar.artist_id
       WHERE al.album_id = ?`,
      [albumId]
    );

    if (albums.length === 0) {
      return sendError(res, 'Album not found.', 404);
    }
    const album = albums[0];

    // Fetch ordered tracks in album
    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.audio_url,
              fn_play_count(t.track_id) AS play_count
       FROM track t
       WHERE t.album_id = ?
       ORDER BY t.track_no ASC`,
      [albumId]
    );
    album.tracks = tracks;

    return sendSuccess(res, { album }, 'Album details retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAlbums,
  getAlbumById,
};
