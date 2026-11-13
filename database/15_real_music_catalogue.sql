-- ============================================================================
-- SCRIPT 15: REPLACE FICTIONAL SAMPLE MUSIC WITH REAL ARTISTS / TRACKS
-- Run after 04_sample_data.sql (and after the other database setup scripts).
--
-- IMPORTANT DATA EFFECT:
-- This replaces the entire music catalogue. Deleting tracks cascades to their
-- listening_history, playlist_track rows, and track_artist / track_genre /
-- track_mood rows. User accounts, user follows,
-- mood logs, playlist records, and the mood taxonomy are preserved.
--
-- YouTube IDs are populated only where a candidate ID was already available.
-- NULL IDs are intentional placeholders; the app's YouTube-only catalogue
-- queries will hide those tracks until the IDs are verified and filled in.
-- Song metadata (duration/valence/energy/tempo) is demo metadata and should
-- be refined if precise audio analysis is required.
-- Re-running this script replaces this catalogue again (and clears its
-- track-dependent user activity), so back up data first.
-- ============================================================================

USE music_mood_db;

START TRANSACTION;

-- Remove all old tracks first. FK cascades clear track-dependent records.
DELETE FROM track;
DELETE FROM album;
DELETE FROM artist_alias;
DELETE FROM artist;

-- The old seed genres were fictional project placeholders; replace them.
DELETE FROM genre;
INSERT INTO genre (name) VALUES
  ('Bollywood'),
  ('Pop Rock'),
  ('Alternative Rock'),
  ('Grunge'),
  ('Psychedelic Pop');

-- The mood taxonomy is retained. Add the requested real artists.
INSERT INTO artist (name, country, debut_year, image_url) VALUES
  ('Shilpa Rao', 'India', 2006, NULL),
  ('Arijit Singh', 'India', 2005, NULL),
  ('The Beatles', 'United Kingdom', 1960, NULL),
  ('Nirvana', 'United States', 1987, NULL),
  ('Sunidhi Chauhan', 'India', 1996, NULL),
  ('Foo Fighters', 'United States', 1994, NULL),
  ('Shreya Ghoshal', 'India', 2002, NULL),
  ('Tame Impala', 'Australia', 2007, NULL);

-- A catalogue album per artist keeps the schema's required album relationship
-- without pretending every selected track belongs to one studio album.
INSERT INTO album (artist_id, title, release_date, cover_image_url)
SELECT artist_id, 'Selected Singles', NULL, NULL
FROM artist
WHERE name IN (
  'Shilpa Rao', 'Arijit Singh', 'The Beatles', 'Nirvana',
  'Sunidhi Chauhan', 'Foo Fighters', 'Shreya Ghoshal', 'Tame Impala'
);

-- 24 selected tracks: three per requested artist.
-- IDs not yet confirmed are NULL and can be filled after link verification.
INSERT INTO track
  (album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url, youtube_video_id)
SELECT al.album_id, s.title, s.track_no, s.duration_sec, s.valence, s.energy,
       s.tempo_bpm, NULL, s.youtube_video_id
FROM (
  SELECT 'Shilpa Rao' AS artist_name, 'Khuda Jaane' AS title, 1 AS track_no, 314 AS duration_sec, 0.78 AS valence, 0.70 AS energy, 112 AS tempo_bpm, NULL AS youtube_video_id
  UNION ALL SELECT 'Shilpa Rao', 'Ghungroo', 2, 300, 0.86, 0.91, 120, NULL
  UNION ALL SELECT 'Shilpa Rao', 'Chuttamalle', 3, 220, 0.82, 0.78, 108, NULL

  UNION ALL SELECT 'Arijit Singh', 'Channa Mereya', 1, 290, 0.22, 0.55,  82, 'jglVv0JfZUc'
  UNION ALL SELECT 'Arijit Singh', 'Kesariya', 2, 268, 0.78, 0.72, 94, 'g6fnFALEseI'
  UNION ALL SELECT 'Arijit Singh', 'Tum Hi Ho', 3, 262, 0.18, 0.42,  90, NULL

  UNION ALL SELECT 'The Beatles', 'Hey Jude', 1, 431, 0.82, 0.62, 74, NULL
  UNION ALL SELECT 'The Beatles', 'Let It Be', 2, 243, 0.72, 0.48, 72, NULL
  UNION ALL SELECT 'The Beatles', 'Come Together', 3, 259, 0.55, 0.72, 83, NULL

  UNION ALL SELECT 'Nirvana', 'Smells Like Teen Spirit', 1, 301, 0.48, 0.96, 117, 'hTWKbfoikeg'
  UNION ALL SELECT 'Nirvana', 'Come As You Are', 2, 219, 0.42, 0.72, 120, NULL
  UNION ALL SELECT 'Nirvana', 'Lithium', 3, 257, 0.40, 0.90, 123, NULL

  UNION ALL SELECT 'Sunidhi Chauhan', 'Sheila Ki Jawani', 1, 276, 0.91, 0.95, 126, NULL
  UNION ALL SELECT 'Sunidhi Chauhan', 'Kamli', 2, 235, 0.82, 0.92, 128, NULL
  UNION ALL SELECT 'Sunidhi Chauhan', 'Beedi', 3, 275, 0.88, 0.94, 128, NULL

  UNION ALL SELECT 'Foo Fighters', 'Everlong', 1, 250, 0.62, 0.90, 158, NULL
  UNION ALL SELECT 'Foo Fighters', 'The Pretender', 2, 269, 0.58, 0.98, 173, NULL
  UNION ALL SELECT 'Foo Fighters', 'Best of You', 3, 255, 0.72, 0.95, 130, 'h_L4Rixya64'

  UNION ALL SELECT 'Shreya Ghoshal', 'Agar Tum Mil Jao', 1, 358, 0.18, 0.34, 74, '5zkXY8pEvtY'
  UNION ALL SELECT 'Shreya Ghoshal', 'Deewani Mastani', 2, 345, 0.78, 0.72, 120, 'h6lHUn20J5g'
  UNION ALL SELECT 'Shreya Ghoshal', 'Bairi Piya', 3, 238, 0.58, 0.42, 92, 'qJa_WD5mNho'

  UNION ALL SELECT 'Tame Impala', 'The Less I Know the Better', 1, 216, 0.66, 0.74, 117, 'sBzrzS1Ag_g'
  UNION ALL SELECT 'Tame Impala', 'Let It Happen', 2, 467, 0.62, 0.78, 125, 'pFptt7Cargc'
  UNION ALL SELECT 'Tame Impala', 'Borderline', 3, 237, 0.72, 0.70, 100, '2g5xkLqIElU'
) AS s
JOIN artist ar ON ar.name = s.artist_name
JOIN album al ON al.artist_id = ar.artist_id AND al.title = 'Selected Singles';

-- Each selected song is credited to the catalogue artist for this first pass.
INSERT INTO track_artist (track_id, artist_id, role)
SELECT t.track_id, al.artist_id, 'main'
FROM track t
JOIN album al ON al.album_id = t.album_id;

-- Genre classification uses the real catalogue genres inserted above.
INSERT INTO track_genre (track_id, genre_id)
SELECT t.track_id, g.genre_id
FROM track t
JOIN album al ON al.album_id = t.album_id
JOIN artist ar ON ar.artist_id = al.artist_id
JOIN genre g ON g.name = CASE
  WHEN ar.name IN ('Shilpa Rao', 'Arijit Singh', 'Sunidhi Chauhan', 'Shreya Ghoshal') THEN 'Bollywood'
  WHEN ar.name = 'The Beatles' THEN 'Pop Rock'
  WHEN ar.name = 'Nirvana' THEN 'Grunge'
  WHEN ar.name = 'Foo Fighters' THEN 'Alternative Rock'
  WHEN ar.name = 'Tame Impala' THEN 'Psychedelic Pop'
END;

-- Mood tags are derived from the catalogue's demo valence/energy coordinates.
INSERT INTO track_mood (track_id, mood_id, confidence)
SELECT t.track_id, m.mood_id,
       CASE WHEN t.energy >= 0.85 OR t.valence >= 0.80 THEN 0.88 ELSE 0.82 END
FROM track t
JOIN mood m ON m.name = CASE
  WHEN t.valence < 0.35 THEN 'Sad'
  WHEN t.energy >= 0.85 THEN 'Energetic'
  WHEN t.valence >= 0.70 THEN 'Happy'
  ELSE 'Calm'
END;

COMMIT;

-- Verification: should show 8 artists and 3 tracks per artist.
SELECT ar.name AS artist,
       COUNT(DISTINCT t.track_id) AS total_tracks,
       SUM(t.youtube_video_id IS NOT NULL) AS tracks_with_youtube_id
FROM artist ar
LEFT JOIN album al ON al.artist_id = ar.artist_id
LEFT JOIN track t ON t.album_id = al.album_id
GROUP BY ar.artist_id, ar.name
ORDER BY ar.name;
