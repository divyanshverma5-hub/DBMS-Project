-- ============================================================================
-- SCRIPT 18: DAILY SKIP TRACKING
-- Free-account skips are counted per UTC day and reset at 00:00 UTC.
-- ============================================================================

USE music_mood_db;

CREATE TABLE IF NOT EXISTS user_skip_history (
    skip_id    BIGINT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    track_id   INT UNSIGNED NOT NULL,
    skipped_at DATETIME NOT NULL,
    CONSTRAINT pk_user_skip_history PRIMARY KEY (skip_id),
    CONSTRAINT fk_user_skip_history_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_skip_history_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_skip_history_user_date (user_id, skipped_at)
) ENGINE=InnoDB;

SELECT 'Daily skip tracking is ready.' AS migration_status;
