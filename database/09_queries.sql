-- ============================================================================
-- SCRIPT 09: 20 COMPREHENSIVE SQL QUERIES
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Academic Requirement: At least 10 queries covering SELECT, WHERE, aggregates,
-- GROUP BY, HAVING, ORDER BY, INNER/LEFT/RIGHT JOINs, subqueries, recursive CTEs,
-- and window functions.
-- Total implemented: 20 meaningful, production-grade queries.
-- ============================================================================

USE music_mood_db;

-- ============================================================================
-- QUERY 1: Basic SELECT, WHERE & ORDER BY
-- Business Question: Find all tracks with high valence (> 0.70) and high energy (> 0.70)
-- suitable for upbeat, euphoric workout sessions, ordered by valence descending.
-- ============================================================================
SELECT 
    track_id,
    title,
    valence,
    energy,
    tempo_bpm,
    duration_sec
FROM track
WHERE valence > 0.70 AND energy > 0.70
ORDER BY valence DESC, energy DESC;

-- ============================================================================
-- QUERY 2: Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
-- Business Question: Calculate global music catalogue metrics across all tracks
-- (total tracks, total playtime in minutes, average/min/max tempo and valence).
-- ============================================================================
SELECT 
    COUNT(*) AS total_tracks,
    ROUND(SUM(duration_sec) / 60, 2) AS total_catalog_minutes,
    ROUND(AVG(tempo_bpm), 1) AS avg_tempo_bpm,
    MIN(tempo_bpm) AS min_tempo_bpm,
    MAX(tempo_bpm) AS max_tempo_bpm,
    ROUND(AVG(valence), 3) AS avg_valence,
    ROUND(AVG(energy), 3)  AS avg_energy
FROM track;

-- ============================================================================
-- QUERY 3: GROUP BY & HAVING
-- Business Question: Identify popular genres that have more than 10 tracks classified,
-- along with their average track duration in seconds.
-- ============================================================================
SELECT 
    g.name AS genre_name,
    COUNT(tg.track_id) AS total_classified_tracks,
    ROUND(AVG(t.duration_sec), 1) AS avg_duration_sec
FROM genre g
INNER JOIN track_genre tg ON g.genre_id = tg.genre_id
INNER JOIN track t ON tg.track_id = t.track_id
GROUP BY g.genre_id, g.name
HAVING COUNT(tg.track_id) >= 10
ORDER BY total_classified_tracks DESC;

-- ============================================================================
-- QUERY 4: INNER JOIN (Multi-Table)
-- Business Question: Retrieve all tracks from the 'Nordic Horizons' album, displaying
-- the artist name, album title, track title, track number, and duration.
-- ============================================================================
SELECT 
    ar.name AS artist_name,
    al.title AS album_title,
    t.track_no,
    t.title AS track_title,
    t.duration_sec,
    t.valence,
    t.energy
FROM track t
INNER JOIN album al ON t.album_id = al.album_id
INNER JOIN artist ar ON al.artist_id = ar.artist_id
WHERE al.title = 'Nordic Horizons'
ORDER BY t.track_no ASC;

-- ============================================================================
-- QUERY 5: LEFT OUTER JOIN
-- Business Question: List all registered users and their current subscription tier.
-- Show NULL/Free for users not present in the premium_user table.
-- ============================================================================
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.country,
    COALESCE(pu.plan_type, 'Free User') AS subscription_plan,
    pu.valid_till
FROM app_user u
LEFT JOIN premium_user pu ON u.user_id = pu.user_id
ORDER BY u.user_id ASC;

-- ============================================================================
-- QUERY 6: RIGHT OUTER JOIN
-- Business Question: Show all moods (including those with few or zero tracks tagged)
-- and count how many tracks are currently tagged under each mood.
-- ============================================================================
SELECT 
    m.mood_id,
    m.name AS mood_name,
    COUNT(tm.track_id) AS total_tagged_tracks
FROM track_mood tm
RIGHT JOIN mood m ON tm.mood_id = m.mood_id
GROUP BY m.mood_id, m.name
ORDER BY total_tagged_tracks DESC, m.name ASC;

-- ============================================================================
-- QUERY 7: Nested Subquery (IN Predicate)
-- Business Question: Find all tracks that have been tagged with the 'Euphoric' mood.
-- ============================================================================
SELECT 
    t.track_id,
    t.title,
    t.valence,
    t.energy
FROM track t
WHERE t.track_id IN (
    SELECT tm.track_id
    FROM track_mood tm
    INNER JOIN mood m ON tm.mood_id = m.mood_id
    WHERE m.name = 'Euphoric'
)
ORDER BY t.valence DESC;

-- ============================================================================
-- QUERY 8: Correlated Subquery
-- Business Question: Find all tracks whose duration is strictly greater than
-- the average duration of tracks in their own album.
-- ============================================================================
SELECT 
    t.track_id,
    t.album_id,
    al.title AS album_title,
    t.title AS track_title,
    t.duration_sec
FROM track t
INNER JOIN album al ON t.album_id = al.album_id
WHERE t.duration_sec > (
    SELECT AVG(inner_t.duration_sec)
    FROM track inner_t
    WHERE inner_t.album_id = t.album_id
)
ORDER BY t.album_id, t.duration_sec DESC;

-- ============================================================================
-- QUERY 9: Top 5 Most Streamed Tracks (Popularity Ranking)
-- Business Question: Determine the top 5 most listened-to tracks across all users,
-- displaying total play count and unique listeners.
-- ============================================================================
SELECT 
    t.track_id,
    t.title AS track_title,
    ar.name AS artist_name,
    COUNT(lh.listen_id) AS total_streams,
    COUNT(DISTINCT lh.user_id) AS unique_listeners
FROM listening_history lh
INNER JOIN track t ON lh.track_id = t.track_id
INNER JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
INNER JOIN artist ar ON ta.artist_id = ar.artist_id
GROUP BY t.track_id, t.title, ar.name
ORDER BY total_streams DESC, unique_listeners DESC
LIMIT 5;

-- ============================================================================
-- QUERY 10: Most Active Users by Total Listening Time
-- Business Question: Identify the top 5 most engaged users based on cumulative
-- listening time in minutes and total stream count.
-- ============================================================================
SELECT 
    u.user_id,
    u.username,
    u.country,
    COUNT(lh.listen_id) AS total_plays,
    ROUND(SUM(lh.duration_listened_sec) / 60, 1) AS total_minutes_listened
FROM app_user u
INNER JOIN listening_history lh ON u.user_id = lh.user_id
GROUP BY u.user_id, u.username, u.country
ORDER BY total_minutes_listened DESC
LIMIT 5;

-- ============================================================================
-- QUERY 11: Mood-Wise Music Statistics
-- Business Question: For each mood, compute average valence, average energy,
-- total user logs recorded, and average logged intensity.
-- ============================================================================
SELECT 
    m.name AS mood_name,
    ROUND(AVG(t.valence), 3) AS avg_track_valence,
    ROUND(AVG(t.energy), 3)  AS avg_track_energy,
    COUNT(DISTINCT uml.log_id) AS user_mood_logs_count,
    ROUND(AVG(uml.intensity), 2) AS avg_logged_intensity
FROM mood m
LEFT JOIN track_mood tm ON m.mood_id = tm.mood_id
LEFT JOIN track t ON tm.track_id = t.track_id
LEFT JOIN user_mood_log uml ON m.mood_id = uml.mood_id
GROUP BY m.mood_id, m.name
ORDER BY user_mood_logs_count DESC;

-- ============================================================================
-- QUERY 12: Highest Rated Tracks (Minimum 3 Ratings)
-- Business Question: Find the highest rated tracks that have received at least 3 ratings,
-- displaying average rating and number of reviews.
-- ============================================================================
SELECT 
    t.track_id,
    t.title AS track_title,
    ar.name AS artist_name,
    ROUND(AVG(r.rating), 2) AS avg_user_rating,
    COUNT(r.rating) AS review_count
FROM rating r
INNER JOIN track t ON r.track_id = t.track_id
INNER JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
INNER JOIN artist ar ON ta.artist_id = ar.artist_id
GROUP BY t.track_id, t.title, ar.name
HAVING COUNT(r.rating) >= 3
ORDER BY avg_user_rating DESC, review_count DESC;

-- ============================================================================
-- QUERY 13: Playlist Statistics for Weak Entity
-- Business Question: Display each user's playlists along with total songs, total playtime,
-- and the themed mood name (if assigned).
-- ============================================================================
SELECT 
    u.username AS owner,
    p.playlist_no,
    p.name AS playlist_name,
    COALESCE(m.name, 'No Mood Theme') AS themed_mood,
    COUNT(pt.track_id) AS total_tracks,
    ROUND(COALESCE(SUM(t.duration_sec), 0) / 60, 1) AS total_duration_minutes
FROM playlist p
INNER JOIN app_user u ON p.user_id = u.user_id
LEFT JOIN mood m ON p.mood_id = m.mood_id
LEFT JOIN playlist_track pt ON p.user_id = pt.user_id AND p.playlist_no = pt.playlist_no
LEFT JOIN track t ON pt.track_id = t.track_id
GROUP BY u.username, p.user_id, p.playlist_no, p.name, themed_mood
ORDER BY u.username, p.playlist_no;

-- ============================================================================
-- QUERY 14: Listening History Analysis with Skip Classification
-- Business Question: Categorize stream sessions for user 'sarah_connor' into
-- 'Skipped', 'Partial Listen', or 'Full Play' based on completion percentage.
-- ============================================================================
SELECT 
    lh.listen_id,
    t.title AS track_title,
    t.duration_sec,
    lh.duration_listened_sec,
    ROUND((lh.duration_listened_sec / t.duration_sec) * 100, 1) AS completion_percentage,
    CASE 
        WHEN lh.duration_listened_sec < 30 THEN 'SKIPPED (<30s)'
        WHEN lh.duration_listened_sec >= t.duration_sec THEN 'FULL PLAY'
        ELSE 'PARTIAL LISTEN'
    END AS playback_outcome,
    lh.played_at
FROM listening_history lh
INNER JOIN app_user u ON lh.user_id = u.user_id
INNER JOIN track t ON lh.track_id = t.track_id
WHERE u.username = 'sarah_connor'
ORDER BY lh.played_at DESC;

-- ============================================================================
-- QUERY 15: Recursive CTE – Mood Hierarchy Traversal
-- Business Question: Display the complete tree hierarchy of moods, showing each mood's
-- level (depth 0 = root, depth 1 = child) and full ancestral breadcrumb path.
-- ============================================================================
WITH RECURSIVE mood_tree AS (
    -- Anchor member: root moods (parent_mood_id IS NULL)
    SELECT 
        mood_id,
        name AS mood_name,
        parent_mood_id,
        0 AS level,
        CAST(name AS CHAR(255)) AS breadcrumb_path
    FROM mood
    WHERE parent_mood_id IS NULL

    UNION ALL

    -- Recursive member: child moods
    SELECT 
        child.mood_id,
        child.name AS mood_name,
        child.parent_mood_id,
        parent.level + 1 AS level,
        CONCAT(parent.breadcrumb_path, ' -> ', child.name) AS breadcrumb_path
    FROM mood child
    INNER JOIN mood_tree parent ON child.parent_mood_id = parent.mood_id
)
SELECT 
    level,
    mood_name,
    breadcrumb_path
FROM mood_tree
ORDER BY level ASC, mood_name ASC;

-- ============================================================================
-- QUERY 16: Recursive CTE – Social Follow Network (Degrees of Separation)
-- Business Question: Traverse the follow graph starting from user 'alex_smith' (user_id = 1)
-- to discover friends and friends-of-friends up to 2 degrees of separation.
-- ============================================================================
WITH RECURSIVE follow_graph AS (
    -- Anchor: Direct followers (Degree 1)
    SELECT 
        follower_id,
        followee_id,
        1 AS degree,
        CAST(CONCAT('alex_smith -> ', u.username) AS CHAR(255)) AS follow_path
    FROM user_follow uf
    INNER JOIN app_user u ON uf.followee_id = u.user_id
    WHERE follower_id = 1

    UNION ALL

    -- Recursive: Followees of followees (Degree 2)
    SELECT 
        uf2.follower_id,
        uf2.followee_id,
        fg.degree + 1 AS degree,
        CONCAT(fg.follow_path, ' -> ', u2.username) AS follow_path
    FROM user_follow uf2
    INNER JOIN follow_graph fg ON uf2.follower_id = fg.followee_id
    INNER JOIN app_user u2 ON uf2.followee_id = u2.user_id
    WHERE fg.degree < 2 AND uf2.followee_id <> 1
)
SELECT DISTINCT 
    degree,
    followee_id,
    follow_path
FROM follow_graph
ORDER BY degree, followee_id;

-- ============================================================================
-- QUERY 17: Window Function – Rank Tracks by Play Count Within Each Genre
-- Business Question: Use DENSE_RANK() to find the top 2 most popular tracks
-- within each music genre.
-- ============================================================================
WITH genre_play_stats AS (
    SELECT 
        g.name AS genre_name,
        t.title AS track_title,
        COUNT(lh.listen_id) AS plays_count,
        DENSE_RANK() OVER (
            PARTITION BY g.genre_id 
            ORDER BY COUNT(lh.listen_id) DESC
        ) AS rank_in_genre
    FROM genre g
    INNER JOIN track_genre tg ON g.genre_id = tg.genre_id
    INNER JOIN track t ON tg.track_id = t.track_id
    LEFT JOIN listening_history lh ON t.track_id = lh.track_id
    GROUP BY g.genre_id, g.name, t.track_id, t.title
)
SELECT 
    genre_name,
    track_title,
    plays_count,
    rank_in_genre
FROM genre_play_stats
WHERE rank_in_genre <= 2
ORDER BY genre_name, rank_in_genre;

-- ============================================================================
-- QUERY 18: Window Function – Cumulative & Running Total of Stream Minutes
-- Business Question: Calculate a running total of minutes listened over time
-- for user 'alex_smith'.
-- ============================================================================
SELECT 
    lh.listen_id,
    lh.played_at,
    t.title AS track_title,
    ROUND(lh.duration_listened_sec / 60, 2) AS session_minutes,
    ROUND(SUM(lh.duration_listened_sec) OVER (
        ORDER BY lh.played_at ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) / 60, 2) AS cumulative_minutes_listened
FROM listening_history lh
INNER JOIN track t ON lh.track_id = t.track_id
WHERE lh.user_id = 1
ORDER BY lh.played_at ASC;

-- ============================================================================
-- QUERY 19: Recommendations Generated for a Specific User with Mood Context
-- Business Question: Retrieve the top personalized recommendations generated for
-- 'sarah_connor' (user_id = 2) when she logged an 'Energetic' or 'Euphoric' mood.
-- ============================================================================
SELECT 
    rec.rec_id,
    u.username,
    t.title AS recommended_track,
    ar.name AS artist_name,
    m.name AS mood_context,
    rec.score AS recommendation_score,
    rec.generated_at
FROM recommendation rec
INNER JOIN app_user u ON rec.user_id = u.user_id
INNER JOIN track t ON rec.track_id = t.track_id
INNER JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
INNER JOIN artist ar ON ta.artist_id = ar.artist_id
INNER JOIN mood m ON rec.mood_id = m.mood_id
WHERE rec.user_id = 2 AND m.name IN ('Energetic', 'Euphoric')
ORDER BY rec.score DESC, rec.generated_at DESC;

-- ============================================================================
-- QUERY 20: Optimization & Index Demonstration (Valence/Energy Spatial Range)
-- Business Question: Recommend songs for a 'Calm & Focused' mental state
-- (Valence between 0.50 and 0.85, Energy between 0.15 and 0.45).
-- Uses idx_track_valence_energy index.
-- ============================================================================
SELECT 
    t.track_id,
    t.title,
    ar.name AS artist_name,
    al.title AS album_title,
    t.valence,
    t.energy,
    t.tempo_bpm
FROM track t
INNER JOIN album al ON t.album_id = al.album_id
INNER JOIN track_artist ta ON t.track_id = ta.track_id AND ta.role = 'main'
INNER JOIN artist ar ON ta.artist_id = ar.artist_id
WHERE t.valence BETWEEN 0.50 AND 0.85
  AND t.energy BETWEEN 0.15 AND 0.45
ORDER BY t.valence DESC, t.energy ASC;
