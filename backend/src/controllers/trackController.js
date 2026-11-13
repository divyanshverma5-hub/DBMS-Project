const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * List tracks with rich filtering (by title, artist, album, genre, mood, valence/energy range)
 * and pagination.
 */
async function getTracks(req, res, next) {
  try {
    const {
      search = '',
      artist_id,
      album_id,
      genre_id,
      mood_id,
      min_valence,
      max_valence,
      min_energy,
      max_energy,
      limit = 20,
      offset = 0,
      sort_by = 'title',
      sort_dir = 'ASC',
    } = req.query;

    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const numOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const conditions = [];
    const params = [];

    let query = `
      SELECT t.track_id, t.title, t.track_no, t.duration_sec,
             t.valence, t.energy, t.tempo_bpm, t.youtube_video_id,
             al.album_id, al.title AS album_title, al.cover_image_url,
             ar.artist_id, ar.name AS artist_name,
             fn_play_count(t.track_id) AS play_count
      FROM track t
      INNER JOIN album al ON t.album_id = al.album_id
      LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
      LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
    `;

    // Join filters
    if (genre_id) {
      query += ' INNER JOIN track_genre tg ON t.track_id = tg.track_id AND tg.genre_id = ? ';
      params.push(parseInt(genre_id, 10));
    }

    if (mood_id) {
      query += ' INNER JOIN track_mood tm ON t.track_id = tm.track_id AND tm.mood_id = ? ';
      params.push(parseInt(mood_id, 10));
    }

    // WHERE predicates
    if (search.trim()) {
      conditions.push('(t.title LIKE ? OR ar.name LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (artist_id) {
      conditions.push('EXISTS(SELECT 1 FROM track_artist ta_sub WHERE ta_sub.track_id = t.track_id AND ta_sub.artist_id = ?)');
      params.push(parseInt(artist_id, 10));
    }

    if (album_id) {
      conditions.push('t.album_id = ?');
      params.push(parseInt(album_id, 10));
    }

    if (min_valence !== undefined) {
      conditions.push('t.valence >= ?');
      params.push(parseFloat(min_valence));
    }
    if (max_valence !== undefined) {
      conditions.push('t.valence <= ?');
      params.push(parseFloat(max_valence));
    }

    if (min_energy !== undefined) {
      conditions.push('t.energy >= ?');
      params.push(parseFloat(min_energy));
    }
    if (max_energy !== undefined) {
      conditions.push('t.energy <= ?');
      params.push(parseFloat(max_energy));
    }

    conditions.push('t.youtube_video_id IS NOT NULL');

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const allowedSortFields = {
      title: 't.title',
      duration: 't.duration_sec',
      valence: 't.valence',
      energy: 't.energy',
      tempo: 't.tempo_bpm',
      popularity: 'play_count',
    };
    const sortField = allowedSortFields[sort_by] || 't.title';
    const direction = sort_dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${direction} LIMIT ? OFFSET ?`;
    params.push(numLimit, numOffset);

    const [tracks] = await pool.query(query, params);

    return sendSuccess(res, {
      tracks,
      pagination: {
        count: tracks.length,
        limit: numLimit,
        offset: numOffset,
      },
    }, 'Tracks retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get track by ID with all artist roles, genres, and tagged moods
 */
async function getTrackById(req, res, next) {
  try {
    const trackId = parseInt(req.params.id, 10);

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.youtube_video_id,
              al.album_id, al.title AS album_title, al.release_date, al.cover_image_url,
              fn_play_count(t.track_id) AS play_count,
              ROUND(COALESCE((SELECT AVG(rating) FROM rating WHERE track_id = t.track_id), 0), 2) AS avg_rating,
              (SELECT COUNT(*) FROM rating WHERE track_id = t.track_id) AS total_ratings
       FROM track t
       INNER JOIN album al ON t.album_id = al.album_id
       WHERE t.track_id = ?`,
      [trackId]
    );

    if (tracks.length === 0) {
      return sendError(res, 'Track not found.', 404);
    }
    const track = tracks[0];

    // Performing artists (main, featured, producer)
    const [artists] = await pool.query(
      `SELECT ar.artist_id, ar.name, ar.image_url, ta.role
       FROM track_artist ta
       INNER JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE ta.track_id = ?
       ORDER BY FIELD(ta.role, 'main', 'featured', 'producer', 'remixer')`,
      [trackId]
    );
    track.artists = artists;

    // Genres
    const [genres] = await pool.query(
      `SELECT g.genre_id, g.name
       FROM track_genre tg
       INNER JOIN genre g ON tg.genre_id = g.genre_id
       WHERE tg.track_id = ?`,
      [trackId]
    );
    track.genres = genres;

    // Tagged moods with confidence score
    const [moods] = await pool.query(
      `SELECT m.mood_id, m.name, tm.confidence
       FROM track_mood tm
       INNER JOIN mood m ON tm.mood_id = m.mood_id
       WHERE tm.track_id = ?
       ORDER BY tm.confidence DESC`,
      [trackId]
    );
    track.moods = moods;

    return sendSuccess(res, { track }, 'Track details retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTracks,
  getTrackById,
};
