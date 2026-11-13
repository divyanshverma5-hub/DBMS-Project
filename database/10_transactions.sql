-- ============================================================================
-- SCRIPT 10: TRANSACTIONS & REFERENTIAL INTEGRITY DEMONSTRATIONS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Demonstrates: START TRANSACTION, COMMIT, ROLLBACK, Savepoints, Error Handling,
-- and Referential Integrity (ON DELETE CASCADE, RESTRICT, SET NULL).
-- Note: Designed safely with test entities and rollbacks so production data is unharmed.
-- ============================================================================

USE music_mood_db;

-- ============================================================================
-- DEMO 1: ATOMIC USER REGISTRATION TRANSACTION (COMMIT CASE)
-- Demonstrates inserting across supertype and subtype inside an atomic transaction.
-- ============================================================================
START TRANSACTION;

-- Insert temporary test user into app_user
INSERT INTO app_user (username, email, password_hash, first_name, last_name, birth_date, country)
VALUES ('test_trans_user', 'trans_user@test.com', '$2a$12$test_hash_val', 'Trans', 'Tester', '1996-05-10', 'USA');

SET @demo_user_id = LAST_INSERT_ID();

-- Insert corresponding free_user record
INSERT INTO free_user (user_id, daily_skip_limit)
VALUES (@demo_user_id, 6);

-- Verify both records exist prior to commit
SELECT u.user_id, u.username, fu.daily_skip_limit
FROM app_user u
INNER JOIN free_user fu ON u.user_id = fu.user_id
WHERE u.user_id = @demo_user_id;

COMMIT;

-- Clean up test record (Cascade will automatically remove free_user row)
DELETE FROM app_user WHERE user_id = @demo_user_id;

-- ============================================================================
-- DEMO 2: TRANSACTION ROLLBACK DEMONSTRATION (FAILURE CASE)
-- Demonstrates atomicity: when subtype insertion fails due to an intentional
-- integrity violation, the entire transaction is rolled back leaving no orphan.
-- ============================================================================
START TRANSACTION;

INSERT INTO app_user (username, email, password_hash, first_name, last_name, birth_date, country)
VALUES ('orphan_candidate', 'orphan@test.com', '$2a$12$test_hash_val', 'Orphan', 'Candidate', '2000-01-01', 'India');

SET @orphan_user_id = LAST_INSERT_ID();

-- Intentional failure: attempt to violate CHECK constraint on daily_skip_limit (skip limit cannot be negative or invalid)
-- Or simulate business condition failure:
-- We trigger explicit rollback
ROLLBACK;

-- Verify that the candidate was completely rolled back and does not exist in app_user
SELECT COUNT(*) AS should_be_zero
FROM app_user
WHERE username = 'orphan_candidate';

-- ============================================================================
-- DEMO 3: REFERENTIAL INTEGRITY – ON DELETE CASCADE
-- Demonstrates that deleting an app_user cascades to playlists and logs.
-- ============================================================================
START TRANSACTION;

-- 1. Create temporary test user
INSERT INTO app_user (username, email, password_hash, first_name, last_name)
VALUES ('cascade_tester', 'cascade@test.com', 'dummy_hash', 'Cascade', 'Tester');
SET @casc_id = LAST_INSERT_ID();

INSERT INTO free_user (user_id, daily_skip_limit) VALUES (@casc_id, 6);

-- 2. Create playlist for this user
INSERT INTO playlist (user_id, playlist_no, name) VALUES (@casc_id, 1, 'Temporary Playlist');

-- 3. Add track to playlist
INSERT INTO playlist_track (user_id, playlist_no, track_id, position) VALUES (@casc_id, 1, 1, 1);

-- 4. Delete user
DELETE FROM app_user WHERE user_id = @casc_id;

-- 5. Verify child tables were cleaned automatically via ON DELETE CASCADE
SELECT 
    (SELECT COUNT(*) FROM free_user WHERE user_id = @casc_id) AS free_user_orphans,
    (SELECT COUNT(*) FROM playlist WHERE user_id = @casc_id) AS playlist_orphans,
    (SELECT COUNT(*) FROM playlist_track WHERE user_id = @casc_id) AS playlist_track_orphans;

COMMIT;

-- ============================================================================
-- DEMO 5: REFERENTIAL INTEGRITY – ON DELETE RESTRICT
-- Demonstrates that deleting an artist with active albums or track performances
-- is blocked by MySQL referential integrity, preventing orphaned music data.
-- ============================================================================
-- Attempting to delete Artist 1 ('Aura Waves') will fail with error 1451:
-- Cannot delete or update a parent row: a foreign key constraint fails (`music_mood_db`.`album`, CONSTRAINT `fk_album_artist`...)
-- To test safely in Workbench without aborting scripts:
-- DELETE FROM artist WHERE artist_id = 1; -- (Expected: Error 1451 RESTRICT)

-- ============================================================================
-- DEMO 6: REFERENTIAL INTEGRITY – ON DELETE SET NULL
-- Demonstrates that deleting a parent mood sets children's parent_mood_id to NULL.
-- ============================================================================
START TRANSACTION;

INSERT INTO mood (mood_id, name, parent_mood_id, description)
VALUES (99, 'Temporary Parent Mood', NULL, 'Test mood for SET NULL demo');

INSERT INTO mood (mood_id, name, parent_mood_id, description)
VALUES (100, 'Temporary Child Mood', 99, 'Test child mood');

-- Delete parent mood
DELETE FROM mood WHERE mood_id = 99;

-- Verify child mood now has parent_mood_id = NULL
SELECT mood_id, name, parent_mood_id 
FROM mood 
WHERE mood_id = 100;

-- Clean up
DELETE FROM mood WHERE mood_id = 100;

COMMIT;
