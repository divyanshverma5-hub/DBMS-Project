-- ============================================================================
-- SCRIPT 08: VIEWS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- ============================================================================

USE music_mood_db;

DROP VIEW IF EXISTS v_track_popularity;
DROP VIEW IF EXISTS v_listening_detail;
DROP VIEW IF EXISTS v_user_profile_summary;
DROP VIEW IF EXISTS v_mood_catalogue_overview;

-- ----------------------------------------------------------------------------
-- View 1: v_track_popularity
-- Combines track details, artist, album, and total stream count.
-- Demonstrates LEFT JOINs, aggregate functions (COUNT, AVG), and GROUP BY.
-- ----------------------------------------------------------------------------
CREATE VIEW v_track_popularity AS
SELECT 
    t.track_id,
    t.title AS track_title,
    t.duration_sec,
    t.valence,
    t.energy,
    t.tempo_bpm,
    al.title AS album_title,
    ar.name  AS primary_artist,
    COUNT(DISTINCT lh.listen_id) AS total_plays,
FROM track t
INNER JOIN album al ON t.album_id = al.album_id
LEFT JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
LEFT JOIN artist ar ON ta.artist_id = ar.artist_id
LEFT JOIN listening_history lh ON t.track_id = lh.track_id
GROUP BY t.track_id, t.title, t.duration_sec, t.valence, t.energy, t.tempo_bpm, al.title, ar.name;

-- ----------------------------------------------------------------------------
-- View 2: v_listening_detail
-- Detailed listening events with derived completion percentage:
-- (duration_listened_sec / duration_sec) * 100
-- ----------------------------------------------------------------------------
CREATE VIEW v_listening_detail AS
SELECT 
    lh.listen_id,
    u.user_id,
    u.username,
    t.track_id,
    t.title AS track_title,
    t.duration_sec AS full_duration_sec,
    lh.duration_listened_sec,
    ROUND(LEAST(100.00, (lh.duration_listened_sec / t.duration_sec) * 100), 2) AS completion_pct,
    CASE 
        WHEN lh.duration_listened_sec < 30 THEN 'Skipped (< 30s)'
        WHEN lh.duration_listened_sec >= t.duration_sec THEN 'Full Play (100%)'
        ELSE 'Partial Listen'
    END AS listen_status,
    lh.played_at
FROM listening_history lh
INNER JOIN app_user u ON lh.user_id = u.user_id
INNER JOIN track t ON lh.track_id = t.track_id;

-- ----------------------------------------------------------------------------
-- View 3: v_user_profile_summary
-- Summarizes user account tier, total listens, playlists created, and follow stats.
-- Demonstrates multi-table outer aggregation.
-- ----------------------------------------------------------------------------
CREATE VIEW v_user_profile_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.country,
    u.joined_at,
    CASE 
        WHEN pu.user_id IS NOT NULL THEN CONCAT('Premium (', pu.plan_type, ')')
        WHEN fu.user_id IS NOT NULL THEN 'Free'
        ELSE 'Unassigned'
    END AS subscription_tier,
    COUNT(DISTINCT lh.listen_id) AS stream_count,
    COUNT(DISTINCT p.playlist_no) AS playlists_count,
    COUNT(DISTINCT uf_following.followee_id) AS following_count,
    COUNT(DISTINCT uf_followers.follower_id) AS followers_count
FROM app_user u
LEFT JOIN free_user fu ON u.user_id = fu.user_id
LEFT JOIN premium_user pu ON u.user_id = pu.user_id
LEFT JOIN listening_history lh ON u.user_id = lh.user_id
LEFT JOIN playlist p ON u.user_id = p.user_id
LEFT JOIN user_follow uf_following ON u.user_id = uf_following.follower_id
LEFT JOIN user_follow uf_followers ON u.user_id = uf_followers.followee_id
GROUP BY u.user_id, u.username, u.email, full_name, u.country, u.joined_at, subscription_tier;

-- ----------------------------------------------------------------------------
-- View 4: v_mood_catalogue_overview
-- Analyzes track counts, average valence, and average energy per mood tag.
-- ----------------------------------------------------------------------------
CREATE VIEW v_mood_catalogue_overview AS
SELECT 
    m.mood_id,
    m.name AS mood_name,
    parent.name AS parent_mood_name,
    COUNT(DISTINCT tm.track_id) AS tagged_tracks_count,
    ROUND(AVG(t.valence), 3) AS avg_valence,
    ROUND(AVG(t.energy), 3)  AS avg_energy,
    ROUND(AVG(t.tempo_bpm), 1) AS avg_tempo_bpm
FROM mood m
LEFT JOIN mood parent ON m.parent_mood_id = parent.mood_id
LEFT JOIN track_mood tm ON m.mood_id = tm.mood_id
LEFT JOIN track t ON tm.track_id = t.track_id
GROUP BY m.mood_id, m.name, parent.name;
