const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Record a listening event
 */
async function recordListeningEvent(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { track_id, duration_listened_sec } = req.body;

    // Verify track exists and retrieve total duration
    const [tracks] = await pool.query('SELECT duration_sec FROM track WHERE track_id = ?', [track_id]);
    if (tracks.length === 0) {
      return sendError(res, 'Track not found.', 404);
    }
    const trackDuration = tracks[0].duration_sec;

    // Insert into listening_history
    const [result] = await pool.query(
      `INSERT INTO listening_history (user_id, track_id, duration_listened_sec, played_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, track_id, duration_listened_sec]
    );

    const listenId = result.insertId;

    // Compute completion percentage using fn_completion_pct or fallback formula
    const completionPct = Math.min(100.0, ((duration_listened_sec / trackDuration) * 100)).toFixed(2);

    return sendSuccess(
      res,
      {
        listen_id: listenId,
        user_id: userId,
        track_id,
        duration_listened_sec,
        completion_pct: parseFloat(completionPct),
      },
      'Listening event recorded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get authenticated user's listening history
 */
async function getUserListeningHistory(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { limit = 30, offset = 0 } = req.query;
    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
    const numOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const [rows] = await pool.query(
      `SELECT lh.listen_id, lh.track_id, t.title AS track_title,
              t.duration_sec AS full_duration_sec,
              lh.duration_listened_sec,
              ROUND(LEAST(100.00, (lh.duration_listened_sec / t.duration_sec) * 100), 2) AS completion_pct,
              CASE 
                WHEN lh.duration_listened_sec < 30 THEN 'Skipped'
                WHEN lh.duration_listened_sec >= t.duration_sec THEN 'Full Play'
                ELSE 'Partial'
              END AS playback_status,
              lh.played_at,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name
       FROM listening_history lh
       INNER JOIN track t ON lh.track_id = t.track_id
       INNER JOIN album al ON t.album_id = al.album_id
       LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
       LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
       WHERE lh.user_id = ?
       ORDER BY lh.played_at DESC
       LIMIT ? OFFSET ?`,
      [userId, numLimit, numOffset]
    );

    return sendSuccess(res, { history: rows, count: rows.length }, 'Listening history retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get stream count & listeners for a specific track
 */
async function getTrackHistorySummary(req, res, next) {
  try {
    const trackId = parseInt(req.params.id, 10);

    const [[summary]] = await pool.query(
      `SELECT COUNT(listen_id) AS total_plays,
              COUNT(DISTINCT user_id) AS unique_listeners,
              ROUND(COALESCE(AVG(duration_listened_sec), 0), 1) AS avg_duration_listened_sec
       FROM listening_history
       WHERE track_id = ?`,
      [trackId]
    );

    return sendSuccess(res, { track_id: trackId, summary }, 'Track history summary retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Log current user's emotional mood session
 */
async function logUserMood(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { mood_id, intensity } = req.body;

    // Check mood exists
    const [moods] = await pool.query('SELECT name FROM mood WHERE mood_id = ?', [mood_id]);
    if (moods.length === 0) {
      return sendError(res, 'Mood not found.', 404);
    }

    const [result] = await pool.query(
      `INSERT INTO user_mood_log (user_id, mood_id, intensity, logged_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, mood_id, intensity]
    );

    return sendSuccess(
      res,
      {
        log_id: result.insertId,
        user_id: userId,
        mood_id,
        mood_name: moods[0].name,
        intensity,
      },
      'User mood session logged successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user's past mood logs
 */
async function getUserMoodHistory(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { limit = 20 } = req.query;
    const numLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [logs] = await pool.query(
      `SELECT uml.log_id, uml.mood_id, m.name AS mood_name,
              uml.intensity, uml.logged_at
       FROM user_mood_log uml
       INNER JOIN mood m ON uml.mood_id = m.mood_id
       WHERE uml.user_id = ?
       ORDER BY uml.logged_at DESC
       LIMIT ?`,
      [userId, numLimit]
    );

    return sendSuccess(res, { mood_logs: logs, count: logs.length }, 'User mood history retrieved');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordListeningEvent,
  getUserListeningHistory,
  getTrackHistorySummary,
  logUserMood,
  getUserMoodHistory,
};
