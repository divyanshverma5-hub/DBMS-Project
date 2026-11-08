const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * List all music genres with track counts
 */
async function getGenres(req, res, next) {
  try {
    const [genres] = await pool.query(
      `SELECT g.genre_id, g.name,
              COUNT(DISTINCT tg.track_id) AS tracks_count
       FROM genre g
       LEFT JOIN track_genre tg ON g.genre_id = tg.genre_id
       GROUP BY g.genre_id, g.name
       ORDER BY g.name ASC`
    );

    return sendSuccess(res, { genres }, 'Genres retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get tracks classified under a specific genre
 */
async function getTracksByGenre(req, res, next) {
  try {
    const genreId = parseInt(req.params.id, 10);

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.audio_url,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name
       FROM track t
       INNER JOIN track_genre tg ON t.track_id = tg.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE tg.genre_id = ?
       ORDER BY t.title ASC`,
      [genreId]
    );

    return sendSuccess(res, { tracks, count: tracks.length }, 'Genre tracks retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * List all moods with their parent relationships and track count
 */
async function getMoods(req, res, next) {
  try {
    const [moods] = await pool.query(
      `SELECT m.mood_id, m.name, m.parent_mood_id, m.description,
              parent.name AS parent_mood_name,
              COUNT(DISTINCT tm.track_id) AS tagged_tracks_count
       FROM mood m
       LEFT JOIN mood parent ON m.parent_mood_id = parent.mood_id
       LEFT JOIN track_mood tm ON m.mood_id = tm.mood_id
       GROUP BY m.mood_id, m.name, m.parent_mood_id, m.description, parent.name
       ORDER BY m.parent_mood_id IS NULL DESC, m.name ASC`
    );

    return sendSuccess(res, { moods }, 'Moods retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get full mood hierarchy tree using Recursive CTE
 * Implements Query 15 from Phase 2 database design!
 */
async function getMoodHierarchy(req, res, next) {
  try {
    const [hierarchy] = await pool.query(
      `WITH RECURSIVE mood_tree AS (
         -- Anchor: root moods
         SELECT mood_id, name AS mood_name, parent_mood_id, 0 AS level,
                CAST(name AS CHAR(255)) AS breadcrumb_path
         FROM mood
         WHERE parent_mood_id IS NULL
         
         UNION ALL
         
         -- Recursive member: child moods
         SELECT child.mood_id, child.name AS mood_name, child.parent_mood_id,
                parent.level + 1 AS level,
                CONCAT(parent.breadcrumb_path, ' -> ', child.name) AS breadcrumb_path
         FROM mood child
         INNER JOIN mood_tree parent ON child.parent_mood_id = parent.mood_id
       )
       SELECT mood_id, mood_name, parent_mood_id, level, breadcrumb_path
       FROM mood_tree
       ORDER BY level ASC, mood_name ASC`
    );

    return sendSuccess(res, { hierarchy }, 'Mood hierarchy tree retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get tracks tagged with a specific mood, ordered by confidence score
 */
async function getTracksByMood(req, res, next) {
  try {
    const moodId = parseInt(req.params.id, 10);

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title, t.track_no, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.audio_url,
              tm.confidence,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name
       FROM track t
       INNER JOIN track_mood tm ON t.track_id = tm.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE tm.mood_id = ?
       ORDER BY tm.confidence DESC, t.title ASC`,
      [moodId]
    );

    return sendSuccess(res, { tracks, count: tracks.length }, 'Mood tracks retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGenres,
  getTracksByGenre,
  getMoods,
  getMoodHierarchy,
  getTracksByMood,
};
