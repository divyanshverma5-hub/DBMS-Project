-- ============================================================================
-- SCRIPT 12: QUERY OPTIMIZATION & EXPLAIN ANALYSIS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Demonstrates: Query Execution Plans, EXPLAIN, EXPLAIN ANALYZE,
-- B-Tree Range Scans, and Secondary Index Performance.
-- ============================================================================

USE music_mood_db;

-- ============================================================================
-- EXPERIMENT 1: MOOD VALENCE & ENERGY FILTERING
-- Target Query: Find tracks with valence between 0.60 and 0.90 and energy > 0.70.
-- Optimization: Index `idx_track_valence_energy` covers this filter, replacing
-- a full table scan (ALL) with an index range scan (range).
-- ============================================================================

-- A. Explain standard execution plan
EXPLAIN
SELECT track_id, title, valence, energy, tempo_bpm
FROM track
WHERE valence BETWEEN 0.60 AND 0.90
  AND energy > 0.70;

-- B. Explain with MySQL 8.0 timing and cost tree (EXPLAIN ANALYZE)
EXPLAIN ANALYZE
SELECT track_id, title, valence, energy, tempo_bpm
FROM track
WHERE valence BETWEEN 0.60 AND 0.90
  AND energy > 0.70;

-- ============================================================================
-- EXPERIMENT 2: USER ACTIVITY SORTED CHRONOLOGICALLY
-- Target Query: Fetch most recent listening events for user_id = 2.
-- Optimization: Composite index `idx_listening_history_user_played (user_id, played_at DESC)`
-- enables index lookup with zero filesort required!
-- ============================================================================

EXPLAIN
SELECT listen_id, track_id, played_at, duration_listened_sec
FROM listening_history
WHERE user_id = 2
ORDER BY played_at DESC;

EXPLAIN ANALYZE
SELECT listen_id, track_id, played_at, duration_listened_sec
FROM listening_history
WHERE user_id = 2
ORDER BY played_at DESC;

-- ============================================================================
-- EXPERIMENT 3: USER LATEST RECOMMENDATION LOOKUP
-- Target Query: Retrieve top 5 most recent recommendations for user_id = 1.
-- Optimization: Index `idx_recommendation_user_generated` allows direct range scan.
-- ============================================================================

EXPLAIN
SELECT rec_id, track_id, mood_id, score, generated_at
FROM recommendation
WHERE user_id = 1
ORDER BY generated_at DESC
LIMIT 5;

-- ============================================================================
-- EXPERIMENT 4: INDEX FORCING VS TABLE SCAN (VIVA DEMO)
-- Compare performance using FORCE INDEX vs IGNORE INDEX on track valence.
-- ============================================================================

-- With Index:
EXPLAIN
SELECT track_id, title FROM track FORCE INDEX (idx_track_valence_energy)
WHERE valence > 0.80;

-- Without Index (simulates unindexed query):
EXPLAIN
SELECT track_id, title FROM track IGNORE INDEX (idx_track_valence_energy)
WHERE valence > 0.80;
