'use strict';

const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const BloomFilter = require('../lib/bloomFilter');
const { rankTracksForMood, getMoodTarget } = require('../lib/recommendationEngine');
const { filterUnheardCandidates } = require('../lib/recommendationHistoryFilter');

function getRecentHistoryDays() {
  const raw = process.env.RECOMMENDATION_RECENT_DAYS || '30';
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    throw new Error('RECOMMENDATION_RECENT_DAYS must be an integer between 1 and 3650.');
  }
  return days;
}

async function generateRecommendations(req, res, next) {
  let connection;
  try {
    const userId = req.user.user_id;
    const moodId = Number(req.body.mood_id);
    const requestedLimit = req.body.limit === undefined ? 20 : Number(req.body.limit);

    if (!Number.isSafeInteger(moodId) || moodId < 1) {
      return sendError(res, 'A valid positive integer mood_id is required.', 400);
    }
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50) {
      return sendError(res, 'limit must be an integer between 1 and 50.', 400);
    }

    const [[mood]] = await pool.query(
      'SELECT mood_id, name FROM mood WHERE mood_id = ?',
      [moodId]
    );
    if (!mood) return sendError(res, 'Mood not found.', 404);
    if (!getMoodTarget(mood.name)) {
      return sendError(res, 'Recommendations are not configured for this mood yet.', 422);
    }

    const recentDays = getRecentHistoryDays();
    const [history] = await pool.query(
      `SELECT DISTINCT track_id
       FROM listening_history
       WHERE user_id = ?
         AND played_at >= DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL ? DAY)`,
      [userId, recentDays]
    );

    const bloom = new BloomFilter(Math.max(1, history.length), 0.01);
    history.forEach(({ track_id }) => bloom.add(track_id));

    const [tracks] = await pool.query(
      `SELECT t.track_id, t.title AS track_title, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.audio_url,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name,
              COALESCE(tm.confidence, 0) AS mood_confidence
       FROM track t
       INNER JOIN album al ON al.album_id = t.album_id
       LEFT JOIN (
         SELECT track_id, MIN(artist_id) AS artist_id
         FROM track_artist
         WHERE role = 'main'
         GROUP BY track_id
       ) ta ON ta.track_id = t.track_id
       LEFT JOIN artist ar ON ar.artist_id = ta.artist_id
       LEFT JOIN track_mood tm
         ON tm.track_id = t.track_id AND tm.mood_id = ?
       WHERE t.valence IS NOT NULL
         AND t.energy IS NOT NULL
         AND t.audio_url IS NOT NULL
         AND TRIM(t.audio_url) <> ''`,
      [moodId]
    );

    const unseen = await filterUnheardCandidates(tracks, bloom, async (ids) => {
      if (ids.length === 0) return [];
      const marks = ids.map(() => '?').join(', ');
      const [rows] = await pool.query(
        `SELECT DISTINCT track_id
         FROM listening_history
         WHERE user_id = ?
           AND played_at >= DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL ? DAY)
           AND track_id IN (${marks})`,
        [userId, recentDays, ...ids]
      );
      return rows.map((row) => row.track_id);
    });

    const ranked = rankTracksForMood(unseen, mood.name).slice(0, requestedLimit);
    if (ranked.length === 0) {
      return sendSuccess(res, {
        mood, recommendations: [], count: 0,
        bloom_filter: bloom.getStats(),
        excluded_previously_heard: history.length,
        history_window_days: recentDays,
      }, 'No eligible unheard tracks are available for this mood.');
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [[clock]] = await connection.query(
      'SELECT CURRENT_TIMESTAMP(3) AS generated_at'
    );
    const generatedAt = clock.generated_at;

    const values = [];
    const tuples = ranked.map((track) => {
      values.push(userId, track.track_id, moodId, track.score, generatedAt);
      return '(?, ?, ?, ?, ?)';
    });
    await connection.query(
      `INSERT INTO recommendation
         (user_id, track_id, mood_id, score, generated_at)
       VALUES ${tuples.join(', ')}`,
      values
    );

    const trackIds = ranked.map((track) => track.track_id);
    const idMarks = trackIds.map(() => '?').join(', ');
    const [stored] = await connection.query(
      `SELECT r.rec_id, r.user_id, r.score, r.generated_at,
              m.mood_id, m.name AS mood_name,
              t.track_id, t.title AS track_title, t.duration_sec,
              t.valence, t.energy, t.tempo_bpm, t.audio_url,
              al.album_id, al.title AS album_title, al.cover_image_url,
              ar.artist_id, ar.name AS artist_name
       FROM recommendation r
       JOIN mood m ON m.mood_id = r.mood_id
       JOIN track t ON t.track_id = r.track_id
       JOIN album al ON al.album_id = t.album_id
       LEFT JOIN (
         SELECT track_id, MIN(artist_id) AS artist_id
         FROM track_artist
         WHERE role = 'main'
         GROUP BY track_id
       ) ta ON ta.track_id = t.track_id
       LEFT JOIN artist ar ON ar.artist_id = ta.artist_id
       WHERE r.user_id = ? AND r.mood_id = ?
         AND r.generated_at = ? AND r.track_id IN (${idMarks})
       ORDER BY r.score DESC, r.rec_id ASC`,
      [userId, moodId, generatedAt, ...trackIds]
    );

    await connection.commit();
    return sendSuccess(res, {
      mood,
      recommendations: stored,
      count: stored.length,
      bloom_filter: bloom.getStats(),
      excluded_previously_heard: history.length,
      history_window_days: recentDays,
      scoring: '1 - normalized Euclidean distance from the mood valence/energy target',
    }, 'Mood-based recommendations generated successfully', 201);
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (_) { /* retain original error */ }
    }
    next(err);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { generateRecommendations };
