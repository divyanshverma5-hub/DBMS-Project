const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get personalized recommendations for the authenticated user
 * Database-facing initial version for Phase 3.
 */
async function getUserRecommendations(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { mood_id, limit = 20 } = req.query;
    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    let query = `
      SELECT r.rec_id, r.user_id, r.score, r.generated_at,
             m.mood_id, m.name AS mood_name,
             t.track_id, t.title AS track_title, t.duration_sec,
             t.valence, t.energy, t.tempo_bpm, t.audio_url,
             al.album_id, al.title AS album_title, al.cover_image_url,
             ar.artist_id, ar.name AS artist_name
      FROM recommendation r
      INNER JOIN track t ON r.track_id = t.track_id
      INNER JOIN mood m ON r.mood_id = m.mood_id
      INNER JOIN album al ON t.album_id = al.album_id
      LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
      LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (mood_id) {
      query += ' AND r.mood_id = ?';
      params.push(parseInt(mood_id, 10));
    }

    query += ' ORDER BY r.generated_at DESC, r.score DESC LIMIT ?';
    params.push(numLimit);

    const [recommendations] = await pool.query(query, params);

    return sendSuccess(res, { recommendations, count: recommendations.length }, 'Recommendations retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Store a newly generated recommendation entry
 * Respects unique candidate key (user_id, track_id, mood_id, generated_at)
 */
async function storeRecommendation(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { track_id, mood_id, score } = req.body;

    if (!track_id || !mood_id || score === undefined) {
      return sendError(res, 'track_id, mood_id, and score are required.', 400);
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0.0 || numScore > 1.0) {
      return sendError(res, 'Score must be a float between 0.0 and 1.0.', 400);
    }

    // Verify track and mood exist
    const [tExists] = await pool.query('SELECT 1 FROM track WHERE track_id = ?', [track_id]);
    if (tExists.length === 0) return sendError(res, 'Track not found.', 404);

    const [mExists] = await pool.query('SELECT 1 FROM mood WHERE mood_id = ?', [mood_id]);
    if (mExists.length === 0) return sendError(res, 'Mood not found.', 404);

    // Insert with millisecond precision timestamp
    const [result] = await pool.query(
      `INSERT INTO recommendation (user_id, track_id, mood_id, score, generated_at)
       VALUES (?, ?, ?, ?, NOW(3))`,
      [userId, track_id, mood_id, numScore]
    );

    return sendSuccess(
      res,
      {
        rec_id: result.insertId,
        user_id: userId,
        track_id,
        mood_id,
        score: numScore,
      },
      'Recommendation record stored successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserRecommendations,
  storeRecommendation,
};
