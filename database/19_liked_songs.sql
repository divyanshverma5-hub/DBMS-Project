-- Migration 19: per-user liked songs library
USE music_mood_db;

CREATE TABLE IF NOT EXISTS liked_songs (
    user_id INT UNSIGNED NOT NULL,
    track_id INT UNSIGNED NOT NULL,
    liked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_liked_songs PRIMARY KEY (user_id, track_id),
    CONSTRAINT fk_liked_songs_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_liked_songs_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_liked_songs_user_liked_at (user_id, liked_at)
) ENGINE=InnoDB;
