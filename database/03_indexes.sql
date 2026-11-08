-- ============================================================================
-- SCRIPT 03: SECONDARY INDEXES & OPTIMIZATIONS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- ============================================================================

USE music_mood_db;

-- 1. Index on track valence and energy for mood score range scanning and spatial matching
CREATE INDEX idx_track_valence_energy ON track (valence, energy);

-- 2. Index on track album_id to accelerate join with album and artist
CREATE INDEX idx_track_album_id ON track (album_id);

-- 3. Composite Index on listening_history for user activity sorted by played_at
-- Optimizes: SELECT * FROM listening_history WHERE user_id = ? ORDER BY played_at DESC
CREATE INDEX idx_listening_history_user_played ON listening_history (user_id, played_at DESC);

-- 4. Index on listening_history track_id to accelerate play_count() calculations & track popularity joins
CREATE INDEX idx_listening_history_track ON listening_history (track_id);

-- 5. Composite Index on recommendation for fetching user's latest recommendations
-- Optimizes: SELECT * FROM recommendation WHERE user_id = ? ORDER BY generated_at DESC
CREATE INDEX idx_recommendation_user_generated ON recommendation (user_id, generated_at DESC);

-- 6. Composite Index on recommendation by mood for top-rated recommendations per mood
CREATE INDEX idx_recommendation_mood_score ON recommendation (mood_id, score DESC);

-- 7. Index on track_mood mood_id to accelerate mood-based song lookups
CREATE INDEX idx_track_mood_mood ON track_mood (mood_id, confidence DESC);

-- 8. Index on user_mood_log user_id and logged_at for personal mood timeline analysis
CREATE INDEX idx_user_mood_log_user_time ON user_mood_log (user_id, logged_at DESC);

-- 9. Index on rating track_id to accelerate average track rating aggregates
CREATE INDEX idx_rating_track ON rating (track_id, rating);

-- 10. Index on user_follow followee_id to accelerate follower count and reverse lookup queries
CREATE INDEX idx_user_follow_followee ON user_follow (followee_id);

-- 11. Index on playlist_track track_id to quickly find all playlists containing a track
CREATE INDEX idx_playlist_track_track ON playlist_track (track_id);

-- 12. Index on album release_date for newest releases filtering
CREATE INDEX idx_album_release_date ON album (release_date DESC);
