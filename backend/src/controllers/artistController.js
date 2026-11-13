const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * List artists with optional search and pagination
 */
async function getArtists(req, res, next) {
  try {
    const { search = '', limit = 20, offset = 0 } = req.query;
    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const numOffset = Math.max(parseInt(offset, 10) || 0, 0);

    let query = `
      SELECT ar.artist_id, ar.name, ar.country, ar.debut_year, ar.image_url,
             COUNT(DISTINCT al.album_id) AS total_albums,
             COUNT(DISTINCT ta.track_id) AS total_tracks
      FROM artist ar
      LEFT JOIN album al ON ar.artist_id = al.artist_id
      LEFT JOIN track_artist ta ON ar.artist_id = ta.artist_id
    `;
    const params = [];

    if (search.trim()) {
      query += ' WHERE ar.name LIKE ? ';
      params.push(`%${search.trim()}%`);
    }

    query += ' GROUP BY ar.artist_id, ar.name, ar.country, ar.debut_year, ar.image_url ORDER BY ar.name ASC LIMIT ? OFFSET ?';
    params.push(numLimit, numOffset);

    const [rows] = await pool.query(query, params);

    // Also get total count
    let countQuery = 'SELECT COUNT(*) AS total FROM artist';
    const countParams = [];
    if (search.trim()) {
      countQuery += ' WHERE name LIKE ?';
      countParams.push(`%${search.trim()}%`);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    return sendSuccess(res, {
      artists: rows,
      pagination: {
        total,
        limit: numLimit,
        offset: numOffset,
        has_more: numOffset + rows.length < total,
      },
    }, 'Artists retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get artist details along with aliases and albums
 */
async function getArtistById(req, res, next) {
  try {
    const artistId = parseInt(req.params.id, 10);

    // Artist info
    const [artists] = await pool.query(
      'SELECT artist_id, name, country, debut_year, image_url FROM artist WHERE artist_id = ?',
      [artistId]
    );

    if (artists.length === 0) {
      return sendError(res, 'Artist not found.', 404);
    }
    const artist = artists[0];

    // Aliases (multivalued attribute artist_alias)
    const [aliases] = await pool.query(
      'SELECT alias FROM artist_alias WHERE artist_id = ? ORDER BY alias ASC',
      [artistId]
    );
    artist.aliases = aliases.map(a => a.alias);

    // Albums
    const [albums] = await pool.query(
      'SELECT album_id, title, release_date, cover_image_url FROM album WHERE artist_id = ? ORDER BY release_date DESC',
      [artistId]
    );
    artist.albums = albums;

    return sendSuccess(res, { artist }, 'Artist details retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get all tracks associated with an artist (both main and featured)
 */
async function getArtistTracks(req, res, next) {
  try {
    const artistId = parseInt(req.params.id, 10);

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec, t.valence, t.energy,
              t.tempo_bpm, t.audio_url, t.youtube_video_id, ta.role AS artist_role,
              al.album_id, al.title AS album_title, al.cover_image_url
       FROM track t
       INNER JOIN track_artist ta ON t.track_id = ta.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       WHERE ta.artist_id = ?
       ORDER BY al.release_date DESC, t.track_no ASC`,
      [artistId]
    );

    return sendSuccess(res, { tracks, count: tracks.length }, 'Artist tracks retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getArtists,
  getArtistById,
  getArtistTracks,
};
