-- ============================================================================
-- SCRIPT 14: YOUTUBE CATALOGUE EXPANSION
-- Adds Shreya Ghoshal and Tame Impala with YouTube-backed tracks.
-- Safe to run more than once; existing users, history, playlists and ratings
-- are not deleted or reset.
-- Run after 01_create_database.sql / 02_schema.sql and the sample data.
-- ============================================================================

USE music_mood_db;

-- Add the column only when upgrading an existing database.
SET @youtube_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'track'
      AND COLUMN_NAME = 'youtube_video_id'
);
SET @youtube_column_ddl = IF(
    @youtube_column_exists = 0,
    'ALTER TABLE track ADD COLUMN youtube_video_id VARCHAR(20) NULL AFTER audio_url',
    'SELECT ''youtube_video_id column already exists'' AS migration_status'
);
PREPARE youtube_column_stmt FROM @youtube_column_ddl;
EXECUTE youtube_column_stmt;
DEALLOCATE PREPARE youtube_column_stmt;

START TRANSACTION;

-- 1. ARTISTS
INSERT INTO artist (name, country, debut_year, image_url)
SELECT 'Shreya Ghoshal', 'India', 2002, NULL
WHERE NOT EXISTS (SELECT 1 FROM artist WHERE name = 'Shreya Ghoshal');

INSERT INTO artist (name, country, debut_year, image_url)
SELECT 'Tame Impala', 'Australia', 2007, NULL
WHERE NOT EXISTS (SELECT 1 FROM artist WHERE name = 'Tame Impala');

-- 2. ALBUMS / RELEASES
INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT ar.artist_id, 'Zeher', '2005-03-25', NULL
FROM artist ar
WHERE ar.name = 'Shreya Ghoshal'
  AND NOT EXISTS (
      SELECT 1 FROM album al
      WHERE al.artist_id = ar.artist_id AND al.title = 'Zeher'
  );

INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT ar.artist_id, 'Bajirao Mastani', '2015-12-18', NULL
FROM artist ar
WHERE ar.name = 'Shreya Ghoshal'
  AND NOT EXISTS (
      SELECT 1 FROM album al
      WHERE al.artist_id = ar.artist_id AND al.title = 'Bajirao Mastani'
  );

INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT ar.artist_id, 'Bairi Piya (Single)', '2026-09-28', NULL
FROM artist ar
WHERE ar.name = 'Shreya Ghoshal'
  AND NOT EXISTS (
      SELECT 1 FROM album al
      WHERE al.artist_id = ar.artist_id AND al.title = 'Bairi Piya (Single)'
  );

INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT ar.artist_id, 'Currents', '2015-07-17', NULL
FROM artist ar
WHERE ar.name = 'Tame Impala'
  AND NOT EXISTS (
      SELECT 1 FROM album al
      WHERE al.artist_id = ar.artist_id AND al.title = 'Currents'
  );

INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT ar.artist_id, 'Lonerism', '2012-10-05', NULL
FROM artist ar
WHERE ar.name = 'Tame Impala'
  AND NOT EXISTS (
      SELECT 1 FROM album al
      WHERE al.artist_id = ar.artist_id AND al.title = 'Lonerism'
  );

-- 3. TRACKS
-- youtube_video_id values point to artist / label uploads; playback is embedded
-- from YouTube. Audio files are not downloaded or re-hosted by this project.
INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Agar Tum Mil Jao', 1, 358, 0.18, 0.34, 74, NULL, '5zkXY8pEvtY'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND al.title = 'Zeher'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 1);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Deewani Mastani', 1, 345, 0.78, 0.72, 120, NULL, 'h6lHUn20J5g'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND al.title = 'Bajirao Mastani'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 1);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Bairi Piya', 1, 238, 0.58, 0.42, 92, NULL, 'qJa_WD5mNho'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND al.title = 'Bairi Piya (Single)'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 1);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'The Less I Know the Better', 1, 216, 0.66, 0.74, 117, NULL, 'sBzrzS1Ag_g'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND al.title = 'Currents'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 1);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Let It Happen', 2, 467, 0.62, 0.78, 125, NULL, 'pFptt7Cargc'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND al.title = 'Currents'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 2);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Borderline', 3, 237, 0.72, 0.70, 100, NULL, '2g5xkLqIElU'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND al.title = 'Currents'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 3);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'New Person, Same Old Mistakes', 4, 363, 0.45, 0.58, 113, NULL, '_9bw_VtMUGA'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND al.title = 'Currents'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 4);

INSERT INTO track
    (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, 'Feels Like We Only Go Backwards', 1, 192, 0.40, 0.68, 150, NULL, 'wycjnCCgUes'
FROM album al JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND al.title = 'Lonerism'
  AND NOT EXISTS (SELECT 1 FROM track t WHERE t.album_id = al.album_id AND t.track_no = 1);

-- 4. ARTIST-TRACK RELATIONSHIPS
INSERT IGNORE INTO track_artist (track_id, artist_id, role)
SELECT t.track_id, ar.artist_id, 'main'
FROM track t
JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE (ar.name = 'Shreya Ghoshal' AND t.title IN ('Agar Tum Mil Jao', 'Deewani Mastani', 'Bairi Piya'))
   OR (ar.name = 'Tame Impala' AND t.title IN (
       'The Less I Know the Better', 'Let It Happen', 'Borderline',
       'New Person, Same Old Mistakes', 'Feels Like We Only Go Backwards'
   ));

-- 5. GENRE TAGS (existing genre IDs: 2 Electronic Synth, 3 Indie Pop, 5 Soul & Lo-Fi)
INSERT IGNORE INTO track_genre (track_id, genre_id)
SELECT t.track_id, CASE WHEN ar.name = 'Tame Impala' THEN 2 ELSE 3 END
FROM track t
JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name IN ('Shreya Ghoshal', 'Tame Impala')
  AND t.youtube_video_id IS NOT NULL;

INSERT IGNORE INTO track_genre (track_id, genre_id)
SELECT t.track_id, 5
FROM track t
JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal'
  AND t.youtube_video_id IS NOT NULL;

-- 6. MOOD TAGS (confidence values are curated demo metadata)
INSERT IGNORE INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, 3, 0.94
FROM track t JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND t.title = 'Agar Tum Mil Jao';

INSERT IGNORE INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, 7, 0.90
FROM track t JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND t.title = 'Agar Tum Mil Jao';

INSERT IGNORE INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, 4, 0.92
FROM track t JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Shreya Ghoshal' AND t.title IN ('Deewani Mastani', 'Bairi Piya');

INSERT IGNORE INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, 2, 0.88
FROM track t JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND t.title IN (
    'The Less I Know the Better', 'Let It Happen', 'Borderline',
    'Feels Like We Only Go Backwards'
);

INSERT IGNORE INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, 5, 0.82
FROM track t JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
WHERE ar.name = 'Tame Impala' AND t.title = 'New Person, Same Old Mistakes';

COMMIT;

-- Verification
SELECT ar.name AS artist, COUNT(DISTINCT t.track_id) AS youtube_tracks
FROM artist ar
JOIN album al ON al.artist_id = ar.artist_id
JOIN track t ON t.album_id = al.album_id
WHERE ar.name IN ('Shreya Ghoshal', 'Tame Impala')
GROUP BY ar.artist_id, ar.name
ORDER BY ar.name;
