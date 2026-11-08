-- ============================================================================
-- SCRIPT 05: STORED FUNCTIONS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Computes Derived Attributes dynamically to maintain BCNF (prevent stale redundant data)
-- ============================================================================

USE music_mood_db;

DROP FUNCTION IF EXISTS fn_age;
DROP FUNCTION IF EXISTS fn_play_count;
DROP FUNCTION IF EXISTS fn_track_count;
DROP FUNCTION IF EXISTS fn_total_duration;
DROP FUNCTION IF EXISTS fn_completion_pct;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- Function 1: fn_age(p_user_id)
-- Computes derived attribute APP_USER.age() based on birth_date and current date.
-- Prevents storing age directly, eliminating transitive dependency birth_date -> age.
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_age(p_user_id INT UNSIGNED)
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_birth_date DATE;
    DECLARE v_age INT DEFAULT NULL;

    SELECT birth_date INTO v_birth_date
    FROM app_user
    WHERE user_id = p_user_id;

    IF v_birth_date IS NOT NULL THEN
        SET v_age = TIMESTAMPDIFF(YEAR, v_birth_date, CURDATE());
    END IF;

    RETURN v_age;
END$$

-- ----------------------------------------------------------------------------
-- Function 2: fn_play_count(p_track_id)
-- Computes derived attribute TRACK.play_count() dynamically from listening_history.
-- Prevents update anomalies when new stream events occur.
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_play_count(p_track_id INT UNSIGNED)
RETURNS INT UNSIGNED
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count INT UNSIGNED DEFAULT 0;

    SELECT COUNT(*) INTO v_count
    FROM listening_history
    WHERE track_id = p_track_id;

    RETURN v_count;
END$$

-- ----------------------------------------------------------------------------
-- Function 3: fn_track_count(p_user_id, p_playlist_no)
-- Computes derived attribute PLAYLIST.track_count() for the weak entity PLAYLIST.
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_track_count(p_user_id INT UNSIGNED, p_playlist_no INT UNSIGNED)
RETURNS INT UNSIGNED
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count INT UNSIGNED DEFAULT 0;

    SELECT COUNT(*) INTO v_count
    FROM playlist_track
    WHERE user_id = p_user_id AND playlist_no = p_playlist_no;

    RETURN v_count;
END$$

-- ----------------------------------------------------------------------------
-- Function 4: fn_total_duration(p_user_id, p_playlist_no)
-- Computes derived attribute PLAYLIST.total_duration() in seconds.
-- Joins playlist_track with track to sum duration_sec.
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_total_duration(p_user_id INT UNSIGNED, p_playlist_no INT UNSIGNED)
RETURNS INT UNSIGNED
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total_sec INT UNSIGNED DEFAULT 0;

    SELECT COALESCE(SUM(t.duration_sec), 0) INTO v_total_sec
    FROM playlist_track pt
    INNER JOIN track t ON pt.track_id = t.track_id
    WHERE pt.user_id = p_user_id AND pt.playlist_no = p_playlist_no;

    RETURN v_total_sec;
END$$

-- ----------------------------------------------------------------------------
-- Function 5: fn_completion_pct(p_listen_id)
-- Computes derived attribute LISTENING_HISTORY.completion_pct().
-- Percentage of song listened to: (duration_listened / track_duration) * 100.
-- Caps completion at 100.00%.
-- ----------------------------------------------------------------------------
CREATE FUNCTION fn_completion_pct(p_listen_id INT UNSIGNED)
RETURNS DECIMAL(5,2)
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_listened_sec INT UNSIGNED;
    DECLARE v_track_duration INT UNSIGNED;
    DECLARE v_pct DECIMAL(5,2) DEFAULT 0.00;

    SELECT lh.duration_listened_sec, t.duration_sec
    INTO v_listened_sec, v_track_duration
    FROM listening_history lh
    INNER JOIN track t ON lh.track_id = t.track_id
    WHERE lh.listen_id = p_listen_id;

    IF v_track_duration > 0 THEN
        SET v_pct = ROUND((v_listened_sec / v_track_duration) * 100, 2);
        IF v_pct > 100.00 THEN
            SET v_pct = 100.00;
        END IF;
    END IF;

    RETURN v_pct;
END$$

DELIMITER ;
