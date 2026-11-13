-- ============================================================================
-- SCRIPT 02: RELATIONAL SCHEMA DEFINITION (DDL)
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Tables: 17 Relational Tables (All BCNF Verified)
-- Engine: InnoDB
-- Note: Uses CREATE TABLE IF NOT EXISTS to prevent accidental dropping of existing tables.
-- For a destructive clean reinstall, see 00_reset_database_dev_only.sql.
-- ============================================================================

USE music_mood_db;

-- ============================================================================
-- GROUP 1: USER MANAGEMENT & ISA SPECIALIZATION
-- ============================================================================

-- Table 1: app_user (Strong Entity, Supertype)
-- Flattened composite attribute: name -> (first_name, last_name)
-- Candidate Keys: user_id (PK), username (UK), email (UK)
-- Derived attribute: age() computed on demand via fn_age(user_id)
CREATE TABLE IF NOT EXISTS app_user (
    user_id           INT UNSIGNED AUTO_INCREMENT,
    username          VARCHAR(30)  NOT NULL,
    email             VARCHAR(100) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    first_name        VARCHAR(40)  NOT NULL,
    last_name         VARCHAR(40)  NOT NULL,
    birth_date        DATE         NULL,
    country           VARCHAR(40)  NULL,
    profile_image_url VARCHAR(500) NULL,
    joined_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_app_user PRIMARY KEY (user_id),
    CONSTRAINT uk_app_user_username UNIQUE (username),
    CONSTRAINT uk_app_user_email UNIQUE (email)
) ENGINE=InnoDB;

-- Table 2: free_user (ISA Subtype: Disjoint, Total)
-- Inherits PK from app_user
CREATE TABLE IF NOT EXISTS free_user (
    user_id          INT UNSIGNED      NOT NULL,
    daily_skip_limit SMALLINT UNSIGNED NOT NULL DEFAULT 6,
    CONSTRAINT pk_free_user PRIMARY KEY (user_id),
    CONSTRAINT fk_free_user_app_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_free_user_skip_limit CHECK (daily_skip_limit >= 0)
) ENGINE=InnoDB;

-- Table 3: premium_user (ISA Subtype: Disjoint, Total)
-- Inherits PK from app_user
CREATE TABLE IF NOT EXISTS premium_user (
    user_id       INT UNSIGNED                       NOT NULL,
    plan_type     ENUM('basic', 'standard', 'family') NOT NULL,
    subscribed_on DATE                               NOT NULL,
    valid_till    DATE                               NOT NULL,
    CONSTRAINT pk_premium_user PRIMARY KEY (user_id),
    CONSTRAINT fk_premium_user_app_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_premium_user_dates CHECK (valid_till >= subscribed_on)
) ENGINE=InnoDB;

-- ============================================================================
-- GROUP 2: MUSIC CATALOGUE
-- ============================================================================

-- Table 4: artist (Strong Entity)
CREATE TABLE IF NOT EXISTS artist (
    artist_id   INT UNSIGNED AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    country     VARCHAR(40)  NULL,
    debut_year  SMALLINT     NULL,
    image_url   VARCHAR(500) NULL,
    CONSTRAINT pk_artist PRIMARY KEY (artist_id),
    CONSTRAINT chk_artist_debut_year CHECK (debut_year IS NULL OR (debut_year >= 1800 AND debut_year <= 2100))
) ENGINE=InnoDB;

-- Table 5: artist_alias (Multivalued Attribute: {alias} mapped per R4)
-- Composite PK = (artist_id, alias)
CREATE TABLE IF NOT EXISTS artist_alias (
    artist_id INT UNSIGNED NOT NULL,
    alias     VARCHAR(100) NOT NULL,
    CONSTRAINT pk_artist_alias PRIMARY KEY (artist_id, alias),
    CONSTRAINT fk_artist_alias_artist FOREIGN KEY (artist_id)
        REFERENCES artist (artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 6: album (Strong Entity with 1:N FK from releases)
-- Total participation in releases: artist_id is NOT NULL
CREATE TABLE IF NOT EXISTS album (
    album_id        INT UNSIGNED AUTO_INCREMENT,
    artist_id       INT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    release_date    DATE         NULL,
    cover_image_url VARCHAR(500) NULL,
    CONSTRAINT pk_album PRIMARY KEY (album_id),
    CONSTRAINT fk_album_artist FOREIGN KEY (artist_id)
        REFERENCES artist (artist_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 7: track (Strong Entity with 1:N FK from contains)
-- Two Candidate Keys: track_id (PK), and (album_id, track_no) (UK)
-- Derived attribute: play_count() computed on demand
CREATE TABLE IF NOT EXISTS track (
    track_id     INT UNSIGNED      AUTO_INCREMENT,
    album_id     INT UNSIGNED      NOT NULL,
    title        VARCHAR(150)      NOT NULL,
    track_no     TINYINT UNSIGNED  NOT NULL,
    duration_sec INT UNSIGNED      NOT NULL,
    valence      FLOAT             NULL,
    energy       FLOAT             NULL,
    tempo_bpm    SMALLINT UNSIGNED NULL,
    audio_url    VARCHAR(500)      NULL,
    youtube_video_id VARCHAR(20)   NULL,
    CONSTRAINT pk_track PRIMARY KEY (track_id),
    CONSTRAINT uk_track_album_track_no UNIQUE (album_id, track_no),
    CONSTRAINT fk_track_album FOREIGN KEY (album_id)
        REFERENCES album (album_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_track_valence CHECK (valence IS NULL OR (valence >= 0.0 AND valence <= 1.0)),
    CONSTRAINT chk_track_energy CHECK (energy IS NULL OR (energy >= 0.0 AND energy <= 1.0)),
    CONSTRAINT chk_track_duration CHECK (duration_sec > 0)
) ENGINE=InnoDB;

-- Table 8: genre (Strong Entity)
-- Candidate Keys: genre_id (PK), name (UK)
CREATE TABLE IF NOT EXISTS genre (
    genre_id INT UNSIGNED AUTO_INCREMENT,
    name     VARCHAR(40)  NOT NULL,
    CONSTRAINT pk_genre PRIMARY KEY (genre_id),
    CONSTRAINT uk_genre_name UNIQUE (name)
) ENGINE=InnoDB;

-- Table 9: mood (Strong Entity with 1:N Recursive Relationship: parent_of)
-- Candidate Keys: mood_id (PK), name (UK)
-- Partial participation on 1-side: parent_mood_id is NULL for root moods
CREATE TABLE IF NOT EXISTS mood (
    mood_id        INT UNSIGNED AUTO_INCREMENT,
    name           VARCHAR(40)  NOT NULL,
    parent_mood_id INT UNSIGNED NULL,
    description    VARCHAR(200) NULL,
    CONSTRAINT pk_mood PRIMARY KEY (mood_id),
    CONSTRAINT uk_mood_name UNIQUE (name),
    CONSTRAINT fk_mood_parent FOREIGN KEY (parent_mood_id)
        REFERENCES mood (mood_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- GROUP 3: RELATIONSHIP JUNCTION TABLES (M:N)
-- ============================================================================

-- Table 10: track_artist (M:N Relationship: performs)
-- Relationship attribute: role
-- Total participation of track: managed atomically via sp_add_track; RESTRICT protects deletion
CREATE TABLE IF NOT EXISTS track_artist (
    track_id  INT UNSIGNED                                         NOT NULL,
    artist_id INT UNSIGNED                                         NOT NULL,
    role      ENUM('main', 'featured', 'producer', 'remixer')      NOT NULL DEFAULT 'main',
    CONSTRAINT pk_track_artist PRIMARY KEY (track_id, artist_id),
    CONSTRAINT fk_track_artist_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_track_artist_artist FOREIGN KEY (artist_id)
        REFERENCES artist (artist_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 11: track_genre (M:N Relationship: classified_as)
-- Total participation of track: managed atomically via sp_add_track; RESTRICT protects deletion
CREATE TABLE IF NOT EXISTS track_genre (
    track_id INT UNSIGNED NOT NULL,
    genre_id INT UNSIGNED NOT NULL,
    CONSTRAINT pk_track_genre PRIMARY KEY (track_id, genre_id),
    CONSTRAINT fk_track_genre_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_track_genre_genre FOREIGN KEY (genre_id)
        REFERENCES genre (genre_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 12: track_mood (M:N Relationship: tagged_with)
-- Relationship attribute: confidence (0.0 to 1.0)
CREATE TABLE IF NOT EXISTS track_mood (
    track_id   INT UNSIGNED NOT NULL,
    mood_id    INT UNSIGNED NOT NULL,
    confidence FLOAT        NOT NULL DEFAULT 1.0,
    CONSTRAINT pk_track_mood PRIMARY KEY (track_id, mood_id),
    CONSTRAINT fk_track_mood_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_track_mood_mood FOREIGN KEY (mood_id)
        REFERENCES mood (mood_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_track_mood_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0)
) ENGINE=InnoDB;

-- ============================================================================
-- GROUP 4: USER ACTIVITY & SOCIAL
-- ============================================================================

-- Table 13: user_mood_log (Strong Entity from gives and describes 1:N)
CREATE TABLE IF NOT EXISTS user_mood_log (
    log_id    INT UNSIGNED     AUTO_INCREMENT,
    user_id   INT UNSIGNED     NOT NULL,
    mood_id   INT UNSIGNED     NOT NULL,
    intensity TINYINT UNSIGNED NOT NULL,
    logged_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_mood_log PRIMARY KEY (log_id),
    CONSTRAINT fk_user_mood_log_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_mood_log_mood FOREIGN KEY (mood_id)
        REFERENCES mood (mood_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_user_mood_log_intensity CHECK (intensity >= 1 AND intensity <= 5)
) ENGINE=InnoDB;

-- Table 14: listening_history (Strong Entity from streams and listened_to 1:N)
-- Derived attribute: completion_pct() computed dynamically via v_listening_detail
CREATE TABLE IF NOT EXISTS listening_history (
    listen_id             INT UNSIGNED AUTO_INCREMENT,
    user_id               INT UNSIGNED NOT NULL,
    track_id              INT UNSIGNED NOT NULL,
    played_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_listened_sec INT UNSIGNED NOT NULL,
    CONSTRAINT pk_listening_history PRIMARY KEY (listen_id),
    CONSTRAINT fk_listening_history_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_listening_history_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_listening_history_duration CHECK (duration_listened_sec >= 0)
) ENGINE=InnoDB;

-- Table 15: user_follow (Recursive M:N Relationship: follows)
-- Roles: follower_id, followee_id
CREATE TABLE IF NOT EXISTS user_follow (
    follower_id INT UNSIGNED NOT NULL,
    followee_id INT UNSIGNED NOT NULL,
    followed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_follow PRIMARY KEY (follower_id, followee_id),
    CONSTRAINT fk_user_follow_follower FOREIGN KEY (follower_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_follow_followee FOREIGN KEY (followee_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_user_follow_no_self CHECK (follower_id <> followee_id)
) ENGINE=InnoDB;

-- ============================================================================
-- GROUP 5: PLAYLISTS & WEAK ENTITY
-- ============================================================================

-- Table 16: playlist (Weak Entity identifying on app_user via owns)
-- Composite PK = (user_id, playlist_no)
-- playlist_no is discriminator (partial key), generated per-user via sp_create_playlist
-- Derived attributes: track_count(), total_duration()
CREATE TABLE IF NOT EXISTS playlist (
    user_id     INT UNSIGNED NOT NULL,
    playlist_no INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mood_id     INT UNSIGNED NULL,
    CONSTRAINT pk_playlist PRIMARY KEY (user_id, playlist_no),
    CONSTRAINT fk_playlist_user FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_playlist_mood FOREIGN KEY (mood_id)
        REFERENCES mood (mood_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 17: playlist_track (M:N Relationship: includes)
-- Composite PK = (user_id, playlist_no, track_id)
-- Composite FK references weak entity's composite PK (user_id, playlist_no)
CREATE TABLE IF NOT EXISTS playlist_track (
    user_id     INT UNSIGNED NOT NULL,
    playlist_no INT UNSIGNED NOT NULL,
    track_id    INT UNSIGNED NOT NULL,
    position    INT UNSIGNED NOT NULL,
    added_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_playlist_track PRIMARY KEY (user_id, playlist_no, track_id),
    CONSTRAINT uk_playlist_track_position UNIQUE (user_id, playlist_no, position),
    CONSTRAINT fk_playlist_track_playlist FOREIGN KEY (user_id, playlist_no)
        REFERENCES playlist (user_id, playlist_no)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_playlist_track_track FOREIGN KEY (track_id)
        REFERENCES track (track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_playlist_track_position CHECK (position > 0)
) ENGINE=InnoDB;

