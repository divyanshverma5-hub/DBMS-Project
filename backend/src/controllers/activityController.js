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
 * Update the accumulated duration for an existing listening session.
 * A session can only be updated by its owner.
 */
async function updateListeningEvent(req, res, next) {
  try {
    const userId = req.user.user_id;
    const listenId = parseInt(req.params.listenId, 10);
    const { duration_listened_sec } = req.body;

    const [sessions] = await pool.query(
      'SELECT listen_id FROM listening_history WHERE listen_id = ? AND user_id = ?',
      [listenId, userId]
    );

    if (sessions.length === 0) {
      return sendError(res, 'Listening session not found.', 404);
    }

    await pool.query(
      `UPDATE listening_history
       SET duration_listened_sec = GREATEST(duration_listened_sec, ?)
       WHERE listen_id = ? AND user_id = ?`,
      [duration_listened_sec, listenId, userId]
    );

    return sendSuccess(
      res,
      { listen_id: listenId, duration_listened_sec },
      'Listening session updated successfully'
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

/**
 * Return today's skip allowance for the authenticated account.
 * The daily window is UTC and resets at 00:00 UTC.
 */
async function getDailySkipStatus(req, res, next) {
  try {
    const userId = req.user.user_id;
    const [[account]] = await pool.query(
      `SELECT CASE
                WHEN pu.user_id IS NOT NULL THEN 'premium'
                WHEN fu.user_id IS NOT NULL THEN 'free'
                ELSE 'unassigned'
              END AS account_type,
              fu.daily_skip_limit
       FROM app_user u
       LEFT JOIN free_user fu ON fu.user_id = u.user_id
       LEFT JOIN premium_user pu ON pu.user_id = u.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!account || account.account_type === 'unassigned') {
      return sendError(res, 'An active Free or Premium account is required.', 403);
    }

    const [[usage]] = await pool.query(
      `SELECT COUNT(*) AS skips_used
       FROM user_skip_history
       WHERE user_id = ?
         AND skipped_at >= UTC_DATE()
         AND skipped_at < UTC_DATE() + INTERVAL 1 DAY`,
      [userId]
    );
    const limit = account.account_type === 'free' ? Number(account.daily_skip_limit) : null;
    const used = Number(usage.skips_used) || 0;

    return sendSuccess(res, {
      skip_status: {
        account_type: account.account_type,
        daily_skip_limit: limit,
        skips_used: used,
        skips_remaining: limit === null ? null : Math.max(0, limit - used),
      },
    }, 'Daily skip allowance retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Record one Next-track action. Locking the user's row serializes concurrent
 * requests so simultaneous clicks cannot exceed the Free allowance.
 */
async function recordTrackSkip(req, res, next) {
  const userId = req.user.user_id;
  const trackId = Number(req.body.track_id);
  if (!Number.isSafeInteger(trackId) || trackId < 1) {
    return sendError(res, 'A valid track_id is required.', 400);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [users] = await connection.query(
      'SELECT user_id FROM app_user WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    if (users.length === 0) {
      await connection.rollback();
      return sendError(res, 'User account not found.', 404);
    }

    const [[account]] = await connection.query(
      `SELECT CASE
                WHEN pu.user_id IS NOT NULL THEN 'premium'
                WHEN fu.user_id IS NOT NULL THEN 'free'
                ELSE 'unassigned'
              END AS account_type,
              fu.daily_skip_limit
       FROM app_user u
       LEFT JOIN free_user fu ON fu.user_id = u.user_id
       LEFT JOIN premium_user pu ON pu.user_id = u.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (account.account_type === 'premium') {
      await connection.commit();
      return sendSuccess(res, {
        skip_status: { account_type: 'premium', daily_skip_limit: null, skips_used: 0, skips_remaining: null },
      }, 'Premium skips are unlimited');
    }
    if (account.account_type !== 'free') {
      await connection.rollback();
      return sendError(res, 'An active Free or Premium account is required.', 403);
    }

    const limit = Number(account.daily_skip_limit);
    const [[usage]] = await connection.query(
      `SELECT COUNT(*) AS skips_used
       FROM user_skip_history
       WHERE user_id = ?
         AND skipped_at >= UTC_DATE()
         AND skipped_at < UTC_DATE() + INTERVAL 1 DAY`,
      [userId]
    );
    const used = Number(usage.skips_used) || 0;
    if (used >= limit) {
      await connection.rollback();
      return sendError(res, `Daily skip limit reached. You have used all ${limit} free skips; the allowance resets at 00:00 UTC.`, 429);
    }

    const [tracks] = await connection.query('SELECT track_id FROM track WHERE track_id = ?', [trackId]);
    if (tracks.length === 0) {
      await connection.rollback();
      return sendError(res, 'Track not found.', 404);
    }

    await connection.query(
      'INSERT INTO user_skip_history (user_id, track_id, skipped_at) VALUES (?, ?, UTC_TIMESTAMP())',
      [userId, trackId]
    );
    await connection.commit();

    const skipsUsed = used + 1;
    return sendSuccess(res, {
      skip_status: {
        account_type: 'free',
        daily_skip_limit: limit,
        skips_used: skipsUsed,
        skips_remaining: Math.max(0, limit - skipsUsed),
      },
    }, 'Track skip recorded successfully');
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch { /* Keep the original error. */ }
    }
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  recordListeningEvent,
  updateListeningEvent,
  getUserListeningHistory,
  getTrackHistorySummary,
  logUserMood,
  getUserMoodHistory,
  getDailySkipStatus,
  recordTrackSkip,
};
