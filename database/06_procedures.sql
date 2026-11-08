-- ============================================================================
-- SCRIPT 06: STORED PROCEDURES
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Implements Atomic Multi-Table Business Transactions & Integrity Rules
-- Concurrency Protection: Uses SELECT ... FOR UPDATE row-level locks
-- ============================================================================

USE music_mood_db;

DROP PROCEDURE IF EXISTS sp_register_user;
DROP PROCEDURE IF EXISTS sp_create_playlist;
DROP PROCEDURE IF EXISTS sp_add_track_to_playlist;
DROP PROCEDURE IF EXISTS sp_add_track;
DROP PROCEDURE IF EXISTS sp_remove_artist_from_track;
DROP PROCEDURE IF EXISTS sp_remove_genre_from_track;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- Procedure 1: sp_register_user
-- Registers an app user and establishes ISA Specialization (disjoint & total).
-- Inserts into app_user and exactly one of free_user or premium_user.
-- Full rollback occurs if either step fails.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_register_user(
    IN  p_username          VARCHAR(30),
    IN  p_email             VARCHAR(100),
    IN  p_password_hash     VARCHAR(255),
    IN  p_first_name        VARCHAR(40),
    IN  p_last_name         VARCHAR(40),
    IN  p_birth_date        DATE,
    IN  p_country           VARCHAR(40),
    IN  p_account_type      ENUM('free', 'premium'),
    IN  p_daily_skip_limit  SMALLINT UNSIGNED, -- for free_user
    IN  p_plan_type         ENUM('basic', 'standard', 'family'), -- for premium_user
    IN  p_valid_months      INT,               -- for premium_user
    OUT p_new_user_id       INT UNSIGNED
)
proc_label: BEGIN
    DECLARE v_user_id INT UNSIGNED;
    DECLARE v_valid_till DATE;

    -- Exit handler for transactional atomicity
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1. Insert into supertype table
    INSERT INTO app_user (username, email, password_hash, first_name, last_name, birth_date, country)
    VALUES (p_username, p_email, p_password_hash, p_first_name, p_last_name, p_birth_date, p_country);

    SET v_user_id = LAST_INSERT_ID();
    SET p_new_user_id = v_user_id;

    -- 2. Insert into appropriate subtype table (Enforcing Total ISA Participation)
    IF p_account_type = 'free' THEN
        INSERT INTO free_user (user_id, daily_skip_limit)
        VALUES (v_user_id, COALESCE(p_daily_skip_limit, 6));

    ELSEIF p_account_type = 'premium' THEN
        IF p_plan_type IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Registration error: premium account requires a valid plan_type';
        END IF;

        SET v_valid_till = DATE_ADD(CURDATE(), INTERVAL COALESCE(p_valid_months, 12) MONTH);

        INSERT INTO premium_user (user_id, plan_type, subscribed_on, valid_till)
        VALUES (v_user_id, p_plan_type, CURDATE(), v_valid_till);
    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registration error: account_type must be either free or premium';
    END IF;

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- Procedure 2: sp_create_playlist
-- Safely generates per-user sequential playlist_no starting from 1.
-- Employs row locking (SELECT ... FOR UPDATE on app_user) to avoid race conditions.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_create_playlist(
    IN  p_user_id     INT UNSIGNED,
    IN  p_name        VARCHAR(100),
    IN  p_mood_id     INT UNSIGNED,
    OUT p_playlist_no INT UNSIGNED
)
BEGIN
    DECLARE v_next_no INT UNSIGNED DEFAULT 1;
    DECLARE v_user_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the user's parent row to serialize concurrent playlist creation for this user
    SELECT COUNT(*) INTO v_user_exists
    FROM app_user
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User not found';
    END IF;

    -- Calculate next playlist number for this specific user
    SELECT COALESCE(MAX(playlist_no), 0) + 1 INTO v_next_no
    FROM playlist
    WHERE user_id = p_user_id;

    -- Insert playlist record
    INSERT INTO playlist (user_id, playlist_no, name, mood_id, created_at)
    VALUES (p_user_id, v_next_no, p_name, p_mood_id, NOW());

    SET p_playlist_no = v_next_no;

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- Procedure 3: sp_add_track_to_playlist
-- Safely adds a track to a playlist with concurrency-safe position allocation.
-- Locks the parent playlist row using SELECT ... FOR UPDATE before determining
-- MAX(position) + 1, completely preventing duplicate position race conditions.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_add_track_to_playlist(
    IN  p_user_id     INT UNSIGNED,
    IN  p_playlist_no INT UNSIGNED,
    IN  p_track_id    INT UNSIGNED,
    OUT p_position    INT UNSIGNED
)
BEGIN
    DECLARE v_next_pos INT UNSIGNED DEFAULT 1;
    DECLARE v_playlist_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the parent playlist row
    SELECT COUNT(*) INTO v_playlist_exists
    FROM playlist
    WHERE user_id = p_user_id AND playlist_no = p_playlist_no
    FOR UPDATE;

    IF v_playlist_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Playlist not found for specified user';
    END IF;

    -- Verify track exists
    IF (SELECT COUNT(*) FROM track WHERE track_id = p_track_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Track not found';
    END IF;

    -- Concurrency-safe calculation of next position
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_pos
    FROM playlist_track
    WHERE user_id = p_user_id AND playlist_no = p_playlist_no;

    -- Insert track with next position
    INSERT INTO playlist_track (user_id, playlist_no, track_id, position, added_at)
    VALUES (p_user_id, p_playlist_no, p_track_id, v_next_pos, NOW());

    SET p_position = v_next_pos;

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- Procedure 4: sp_add_track
-- Enforces total participation of TRACK in performs (track_artist) and
-- classified_as (track_genre) in one atomic transaction.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_add_track(
    IN  p_album_id      INT UNSIGNED,
    IN  p_title         VARCHAR(150),
    IN  p_track_no      TINYINT UNSIGNED,
    IN  p_duration_sec  INT UNSIGNED,
    IN  p_valence       FLOAT,
    IN  p_energy        FLOAT,
    IN  p_tempo_bpm     SMALLINT UNSIGNED,
    IN  p_audio_url     VARCHAR(500),
    IN  p_artist_id     INT UNSIGNED,
    IN  p_artist_role   ENUM('main', 'featured', 'producer', 'remixer'),
    IN  p_genre_id      INT UNSIGNED,
    OUT p_new_track_id  INT UNSIGNED
)
BEGIN
    DECLARE v_track_id INT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Validate that primary artist and genre exist
    IF (SELECT COUNT(*) FROM artist WHERE artist_id = p_artist_id) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add track: specified artist_id does not exist';
    END IF;

    IF (SELECT COUNT(*) FROM genre WHERE genre_id = p_genre_id) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add track: specified genre_id does not exist';
    END IF;

    -- 1. Insert the track
    INSERT INTO track (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url)
    VALUES (p_album_id, p_title, p_track_no, p_duration_sec, p_valence, p_energy, p_tempo_bpm, p_audio_url);

    SET v_track_id = LAST_INSERT_ID();
    SET p_new_track_id = v_track_id;

    -- 2. Associate with mandatory artist (enforces performs total participation)
    INSERT INTO track_artist (track_id, artist_id, role)
    VALUES (v_track_id, p_artist_id, COALESCE(p_artist_role, 'main'));

    -- 3. Associate with mandatory genre (enforces classified_as total participation)
    INSERT INTO track_genre (track_id, genre_id)
    VALUES (v_track_id, p_genre_id);

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- Procedure 5: sp_remove_artist_from_track
-- Protects total participation: prevents deleting the last artist of a track.
-- Concurrency Protection: Locks the parent track row with SELECT ... FOR UPDATE
-- so concurrent removal attempts cannot leave the track with 0 artists.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_remove_artist_from_track(
    IN p_track_id  INT UNSIGNED,
    IN p_artist_id INT UNSIGNED
)
BEGIN
    DECLARE v_artist_count INT DEFAULT 0;
    DECLARE v_track_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the parent track row to serialize artist removals on this track
    SELECT COUNT(*) INTO v_track_exists
    FROM track
    WHERE track_id = p_track_id
    FOR UPDATE;

    IF v_track_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Track not found';
    END IF;

    -- Count existing artists for this locked track
    SELECT COUNT(*) INTO v_artist_count
    FROM track_artist
    WHERE track_id = p_track_id;

    IF v_artist_count <= 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity violation: cannot remove artist; a track must have at least one performing artist';
    END IF;

    DELETE FROM track_artist
    WHERE track_id = p_track_id AND artist_id = p_artist_id;

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- Procedure 6: sp_remove_genre_from_track
-- Protects total participation: prevents deleting the last genre of a track.
-- Concurrency Protection: Locks the parent track row with SELECT ... FOR UPDATE
-- so concurrent removal attempts cannot leave the track with 0 genres.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_remove_genre_from_track(
    IN p_track_id INT UNSIGNED,
    IN p_genre_id INT UNSIGNED
)
BEGIN
    DECLARE v_genre_count INT DEFAULT 0;
    DECLARE v_track_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the parent track row to serialize genre removals on this track
    SELECT COUNT(*) INTO v_track_exists
    FROM track
    WHERE track_id = p_track_id
    FOR UPDATE;

    IF v_track_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Track not found';
    END IF;

    -- Count existing genres for this locked track
    SELECT COUNT(*) INTO v_genre_count
    FROM track_genre
    WHERE track_id = p_track_id;

    IF v_genre_count <= 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity violation: cannot remove genre; a track must have at least one classified genre';
    END IF;

    DELETE FROM track_genre
    WHERE track_id = p_track_id AND genre_id = p_genre_id;

    COMMIT;
END$$

DELIMITER ;
