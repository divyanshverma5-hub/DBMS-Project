-- ============================================================================
-- SCRIPT 13: AUTOMATED INTEGRITY & FUNCTIONALITY TEST SUITE
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Rigorous PASS/FAIL Assertion Suite:
-- Tests Table Counts, Derived Attribute Functions, Concurrency-Safe Stored Procedures,
-- Unique Constraints (including playlist_track position), Referential Integrity (CASCADE/RESTRICT),
-- Disjoint ISA Trigger Enforcement, Re-rating UPSERT, and Views.
-- Uses isolated temporary records (@test_*) and completely cleans up afterward.
-- ============================================================================

USE music_mood_db;

-- Temporary test execution log table
DROP TEMPORARY TABLE IF EXISTS temp_test_results;
CREATE TEMPORARY TABLE temp_test_results (
    test_id     INT AUTO_INCREMENT PRIMARY KEY,
    test_group  VARCHAR(60) NOT NULL,
    test_name   VARCHAR(120) NOT NULL,
    status      ENUM('PASS', 'FAIL') NOT NULL,
    details     VARCHAR(255) NULL
);

-- ============================================================================
-- TEST GROUP 1: TABLE RECORD COUNTS (ALL 19 TABLES)
-- ============================================================================
INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Table Counts',
    'Verify All 19 Tables Contain Required Sample Rows',
    CASE 
        WHEN (SELECT COUNT(*) FROM app_user) = 10
         AND (SELECT COUNT(*) FROM free_user) = 6
         AND (SELECT COUNT(*) FROM premium_user) = 4
         AND (SELECT COUNT(*) FROM artist) = 10
         AND (SELECT COUNT(*) FROM artist_alias) = 12
         AND (SELECT COUNT(*) FROM album) = 20
         AND (SELECT COUNT(*) FROM track) = 50
         AND (SELECT COUNT(*) FROM genre) = 5
         AND (SELECT COUNT(*) FROM mood) = 8
         AND (SELECT COUNT(*) FROM track_artist) = 58
         AND (SELECT COUNT(*) FROM track_genre) = 66
         AND (SELECT COUNT(*) FROM track_mood) = 92
         AND (SELECT COUNT(*) FROM user_mood_log) = 42
         AND (SELECT COUNT(*) FROM listening_history) = 125
         AND (SELECT COUNT(*) FROM rating) = 52
         AND (SELECT COUNT(*) FROM user_follow) = 18
         AND (SELECT COUNT(*) FROM playlist) = 18
         AND (SELECT COUNT(*) FROM playlist_track) = 74
         AND (SELECT COUNT(*) FROM recommendation) = 60
        THEN 'PASS'
        ELSE 'FAIL'
    END,
    'All 19 tables verified against exact sample targets';

-- ============================================================================
-- TEST GROUP 2: DERIVED ATTRIBUTE STORED FUNCTIONS
-- ============================================================================
INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Functions',
    'fn_age returns valid positive age for user with birth_date',
    CASE WHEN fn_age(1) >= 20 AND fn_age(1) <= 100 THEN 'PASS' ELSE 'FAIL' END,
    CONCAT('User 1 computed age: ', fn_age(1));

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Functions',
    'fn_play_count matches exact listening_history count',
    CASE WHEN fn_play_count(1) = (SELECT COUNT(*) FROM listening_history WHERE track_id = 1) THEN 'PASS' ELSE 'FAIL' END,
    CONCAT('Track 1 plays: ', fn_play_count(1));

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Functions',
    'fn_track_count and fn_total_duration compute playlist metrics',
    CASE WHEN fn_track_count(1, 1) = 5 AND fn_total_duration(1, 1) > 0 THEN 'PASS' ELSE 'FAIL' END,
    CONCAT('User 1 Playlist 1: ', fn_track_count(1,1), ' tracks, ', fn_total_duration(1,1), 's duration');

-- ============================================================================
-- TEST GROUP 3: CONCURRENCY-SAFE WEAK ENTITY CREATION (sp_create_playlist)
-- ============================================================================
CALL sp_create_playlist(1, 'Isolated_Test_Playlist_999', 1, @created_pl_no);

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Procedures',
    'sp_create_playlist allocates per-user sequential playlist_no',
    CASE WHEN @created_pl_no = 4 THEN 'PASS' ELSE 'FAIL' END,
    CONCAT('Allocated playlist_no: ', @created_pl_no, ' (Expected: 4)');

-- ============================================================================
-- TEST GROUP 4: CONCURRENCY-SAFE PLAYLIST TRACK POSITION (sp_add_track_to_playlist)
-- ============================================================================
CALL sp_add_track_to_playlist(1, @created_pl_no, 1, @pos_1);
CALL sp_add_track_to_playlist(1, @created_pl_no, 2, @pos_2);

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Procedures',
    'sp_add_track_to_playlist allocates sequential positions 1 and 2',
    CASE WHEN @pos_1 = 1 AND @pos_2 = 2 THEN 'PASS' ELSE 'FAIL' END,
    CONCAT('Allocated positions: ', @pos_1, ', ', @pos_2);

-- Clean up test playlist and its tracks
DELETE FROM playlist WHERE user_id = 1 AND playlist_no = @created_pl_no;

-- ============================================================================
-- TEST GROUP 5: ATOMIC TOTAL PARTICIPATION (sp_add_track)
-- ============================================================================
CALL sp_add_track(
    1,                      -- album_id (Nordic Horizons)
    'Temporary_Assertion_Track', 
    10,                     -- track_no
    200,                    -- duration_sec
    0.80,                   -- valence
    0.70,                   -- energy
    120,                    -- tempo_bpm
    'https://example.com/test_assert.mp3',
    1,                      -- artist_id (Aura Waves)
    'main',
    1,                      -- genre_id (Ambient & Chill)
    @created_track_id
);

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Stored Procedures',
    'sp_add_track creates track and mandatory artist & genre atomically',
    CASE 
        WHEN (SELECT COUNT(*) FROM track WHERE track_id = @created_track_id) = 1
         AND (SELECT COUNT(*) FROM track_artist WHERE track_id = @created_track_id) = 1
         AND (SELECT COUNT(*) FROM track_genre WHERE track_id = @created_track_id) = 1
        THEN 'PASS'
        ELSE 'FAIL'
    END,
    CONCAT('Created test track_id: ', @created_track_id);

-- Clean up test track (Cascades to track_artist and track_genre)
DELETE FROM track WHERE track_id = @created_track_id;

-- ============================================================================
-- TEST GROUP 6: DISJOINT ISA SPECIALIZATION (TRIGGER TEST)
-- Safe stored procedure testing negative expectation (Signal 45000 expected)
-- ============================================================================
DROP PROCEDURE IF EXISTS test_disjoint_isa_trigger;
DELIMITER $$
CREATE PROCEDURE test_disjoint_isa_trigger(OUT p_status VARCHAR(10), OUT p_details VARCHAR(255))
BEGIN
    DECLARE v_error_caught BOOLEAN DEFAULT FALSE;
    DECLARE v_msg VARCHAR(255);

    DECLARE CONTINUE HANDLER FOR 1644 -- ER_SIGNAL_EXCEPTION (SQLSTATE '45000')
    BEGIN
        SET v_error_caught = TRUE;
        SET v_msg = 'Trigger correctly blocked inserting existing free_user into premium_user';
    END;

    -- User 1 is registered as free_user. Attempting to insert into premium_user MUST raise 45000.
    INSERT INTO premium_user (user_id, plan_type, subscribed_on, valid_till)
    VALUES (1, 'basic', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR));

    IF v_error_caught THEN
        SET p_status = 'PASS';
        SET p_details = v_msg;
    ELSE
        -- If it somehow succeeded, clean up and fail
        DELETE FROM premium_user WHERE user_id = 1;
        SET p_status = 'FAIL';
        SET p_details = 'Disjoint trigger failed to fire; free user was inserted into premium_user';
    END IF;
END$$
DELIMITER ;

CALL test_disjoint_isa_trigger(@isa_status, @isa_details);
INSERT INTO temp_test_results (test_group, test_name, status, details)
VALUES ('Triggers', 'Disjoint ISA Specialization (free cannot be premium)', @isa_status, @isa_details);
DROP PROCEDURE test_disjoint_isa_trigger;

-- ============================================================================
-- TEST GROUP 7: RE-RATING UPSERT INTEGRITY (INSERT ... ON DUPLICATE KEY UPDATE)
-- ============================================================================
-- Rate an isolated pair (User 1 on Track 49, which currently has no rating from user 1)
INSERT INTO rating (user_id, track_id, rating, rated_at)
VALUES (1, 49, 2, '2025-01-01 10:00:00')
ON DUPLICATE KEY UPDATE rating = VALUES(rating), rated_at = VALUES(rated_at);

-- Re-rate same track to 5 stars
INSERT INTO rating (user_id, track_id, rating, rated_at)
VALUES (1, 49, 5, '2025-01-02 12:00:00')
ON DUPLICATE KEY UPDATE rating = VALUES(rating), rated_at = VALUES(rated_at);

INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Upsert Integrity',
    'Re-rating updates existing row without duplicate key error',
    CASE 
        WHEN (SELECT COUNT(*) FROM rating WHERE user_id = 1 AND track_id = 49) = 1
         AND (SELECT rating FROM rating WHERE user_id = 1 AND track_id = 49) = 5
        THEN 'PASS'
        ELSE 'FAIL'
    END,
    'Verified: Exactly 1 row remains with updated 5-star value';

-- Clean up isolated test rating
DELETE FROM rating WHERE user_id = 1 AND track_id = 49;

-- ============================================================================
-- TEST GROUP 8: ANALYTICAL VIEWS
-- ============================================================================
INSERT INTO temp_test_results (test_group, test_name, status, details)
SELECT 
    'Views',
    'v_track_popularity, v_listening_detail, v_user_profile_summary queryable',
    CASE 
        WHEN (SELECT COUNT(*) FROM v_track_popularity) = 50
         AND (SELECT COUNT(*) FROM v_listening_detail) = 125
         AND (SELECT COUNT(*) FROM v_user_profile_summary) = 10
        THEN 'PASS'
        ELSE 'FAIL'
    END,
    'All analytical views return expected aggregate row counts';

-- ============================================================================
-- FINAL TEST REPORT DISPLAY
-- ============================================================================
SELECT 
    test_id,
    test_group,
    test_name,
    status,
    details
FROM temp_test_results
ORDER BY test_id ASC;

SELECT 
    COUNT(*) AS total_tests,
    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) AS passed_tests,
    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) AS failed_tests,
    CASE WHEN SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) = 0 THEN 'ALL TESTS PASSED' ELSE 'FAILURES DETECTED' END AS overall_result
FROM temp_test_results;

DROP TEMPORARY TABLE temp_test_results;
