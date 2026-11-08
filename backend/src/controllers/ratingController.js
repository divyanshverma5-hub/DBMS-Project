const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Rate a track (or update an existing rating)
 * Uses INSERT ... ON DUPLICATE KEY UPDATE preserving composite PK (user_id, track_id).
 */
async function rateTrack(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { track_id, rating } = req.body;

    // Verify track exists
    const [tracks] = await pool.query('SELECT title FROM track WHERE track_id = ?', [track_id]);
    if (tracks.length === 0) {
      return sendError(res, 'Track not found.', 404);
    }

    // Execute approved UPSERT query (Q2 Phase 2 decision)
    await pool.query(
      `INSERT INTO rating (user_id, track_id, rating, rated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating),
         rated_at = VALUES(rated_at)`,
      [userId, track_id, rating]
    );

    return sendSuccess(
      res,
      {
        user_id: userId,
        track_id,
        rating,
      },
      'Track rating saved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a user rating
 */
async function deleteRating(req, res, next) {
  try {
    const userId = req.user.user_id;
    const trackId = parseInt(req.params.trackId, 10);

    const [result] = await pool.query(
      'DELETE FROM rating WHERE user_id = ? AND track_id = ?',
      [userId, trackId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Rating not found.', 404);
    }

    return sendSuccess(res, { track_id: trackId }, 'Rating removed successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user's submitted ratings
 */
async function getUserRatings(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [ratings] = await pool.query(
      `SELECT r.track_id, t.title AS track_title, r.rating, r.rated_at,
              ar.name AS artist_name, al.title AS album_title, al.cover_image_url
       FROM rating r
       INNER JOIN track t ON r.track_id = t.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE r.user_id = ?
       ORDER BY r.rated_at DESC`,
      [userId]
    );

    return sendSuccess(res, { ratings, count: ratings.length }, 'User ratings retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get public ratings & average breakdown for a track
 */
async function getTrackRatings(req, res, next) {
  try {
    const trackId = parseInt(req.params.trackId, 10);

    const [[stats]] = await pool.query(
      `SELECT COUNT(*) AS total_ratings,
              ROUND(COALESCE(AVG(rating), 0), 2) AS average_rating
       FROM rating
       WHERE track_id = ?`,
      [trackId]
    );

    const [reviews] = await pool.query(
      `SELECT r.user_id, u.username, r.rating, r.rated_at
       FROM rating r
       INNER JOIN app_user u ON r.user_id = u.user_id
       WHERE r.track_id = ?
       ORDER BY r.rated_at DESC
       LIMIT 50`,
      [trackId]
    );

    return sendSuccess(res, { track_id: trackId, stats, reviews }, 'Track ratings retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  rateTrack,
  deleteRating,
  getUserRatings,
  getTrackRatings,
};
