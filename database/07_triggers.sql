-- ============================================================================
-- SCRIPT 07: TRIGGERS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Implements Disjoint ISA Specialization & Integrity Auditing
-- ============================================================================

USE music_mood_db;

DROP TRIGGER IF EXISTS trg_free_user_disjoint_check;
DROP TRIGGER IF EXISTS trg_premium_user_disjoint_check;
DROP TRIGGER IF EXISTS trg_playlist_track_position_validate;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- Trigger 1: trg_free_user_disjoint_check
-- Enforces DISJOINT ISA specialization on APP_USER -> FREE_USER / PREMIUM_USER.
-- An attempt to insert into free_user will abort if the user is already premium.
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_free_user_disjoint_check
BEFORE INSERT ON free_user
FOR EACH ROW
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists
    FROM premium_user
    WHERE user_id = NEW.user_id;

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Disjoint ISA violation: user is already registered as a premium user';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- Trigger 2: trg_premium_user_disjoint_check
-- Enforces DISJOINT ISA specialization on APP_USER -> FREE_USER / PREMIUM_USER.
-- An attempt to insert into premium_user will abort if the user is already free.
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_premium_user_disjoint_check
BEFORE INSERT ON premium_user
FOR EACH ROW
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists
    FROM free_user
    WHERE user_id = NEW.user_id;

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Disjoint ISA violation: user is already registered as a free user';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- Trigger 4: trg_playlist_track_position_validate
-- Fallback position validation: Ensures position is positive.
-- Note: Concurrency-safe sequential allocation is handled primarily via
-- sp_add_track_to_playlist using row-level locking on the parent playlist.
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_playlist_track_position_validate
BEFORE INSERT ON playlist_track
FOR EACH ROW
BEGIN
    DECLARE v_max_pos INT UNSIGNED DEFAULT 0;

    IF NEW.position = 0 OR NEW.position IS NULL THEN
        SELECT COALESCE(MAX(position), 0) INTO v_max_pos
        FROM playlist_track
        WHERE user_id = NEW.user_id AND playlist_no = NEW.playlist_no;

        SET NEW.position = v_max_pos + 1;
    END IF;
END$$

DELIMITER ;
