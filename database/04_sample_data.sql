-- ============================================================================
-- SCRIPT 04: SAMPLE DATA INSERTION (DML)
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Satisfies All FKs, PKs, UKs, and Academic Targets
-- Passwords: All user passwords are set to bcrypt hashes for 'Password123!'
-- Hash: $2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW
-- ============================================================================

USE music_mood_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE playlist_track;
TRUNCATE TABLE playlist;
TRUNCATE TABLE user_follow;
TRUNCATE TABLE listening_history;
TRUNCATE TABLE user_mood_log;
TRUNCATE TABLE track_mood;
TRUNCATE TABLE track_genre;
TRUNCATE TABLE track_artist;
TRUNCATE TABLE track;
TRUNCATE TABLE album;
TRUNCATE TABLE artist_alias;
TRUNCATE TABLE mood;
TRUNCATE TABLE genre;
TRUNCATE TABLE artist;
TRUNCATE TABLE premium_user;
TRUNCATE TABLE free_user;
TRUNCATE TABLE app_user;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. APP_USER (10 Users: 6 Free, 4 Premium)
-- ============================================================================
INSERT INTO app_user (user_id, username, email, password_hash, first_name, last_name, birth_date, country, profile_image_url, joined_at) VALUES
(1,  'alex_smith',   'alex.smith@example.com',   '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Alex',    'Smith',    '1998-04-12', 'USA',     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2025-01-15 10:20:00'),
(2,  'sarah_connor', 'sarah.c@example.com',      '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Sarah',   'Connor',   '2001-08-23', 'Canada',  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2025-02-01 11:45:00'),
(3,  'rohit_sharma', 'rohit.s@example.com',      '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Rohit',   'Sharma',   '1995-11-30', 'India',   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2025-02-10 14:10:00'),
(4,  'elena_rostova', 'elena.r@example.com',     '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Elena',   'Rostova',  '2003-03-18', 'UK',      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '2025-02-14 09:30:00'),
(5,  'kenji_sato',   'kenji.s@example.com',      '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Kenji',   'Sato',     '1999-07-07', 'Japan',   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '2025-02-20 16:55:00'),
(6,  'maya_lin',     'maya.lin@example.com',     '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Maya',    'Lin',      '2002-12-05', 'Germany', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '2025-03-01 18:20:00'),
(7,  'david_becker', 'david.b@example.com',      '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'David',   'Becker',   '1992-05-14', 'USA',     'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '2025-03-05 08:15:00'),
(8,  'ananya_roy',   'ananya.roy@example.com',   '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Ananya',  'Roy',      '2000-09-29', 'India',   'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', '2025-03-10 12:00:00'),
(9,  'lucas_silva',  'lucas.silva@example.com',  '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Lucas',   'Silva',    '1997-01-22', 'Brazil',  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', '2025-03-15 15:40:00'),
(10, 'chloe_dupont', 'chloe.d@example.com',      '$2a$12$e8Yk2uUqB5tNqG55wO6C..XJ7aA9e2V6L1jX0hP1pWqF8iG3jO3eW', 'Chloe',   'Dupont',   '2004-06-11', 'France',  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '2025-03-20 20:10:00');

-- ============================================================================
-- 2. FREE_USER (6 Users: 1, 2, 3, 4, 5, 6)
-- ============================================================================
INSERT INTO free_user (user_id, daily_skip_limit) VALUES
(1, 6),
(2, 6),
(3, 5),
(4, 6),
(5, 4),
(6, 6);

-- ============================================================================
-- 3. PREMIUM_USER (4 Users: 7, 8, 9, 10)
-- ============================================================================
INSERT INTO premium_user (user_id, plan_type, subscribed_on, valid_till) VALUES
(7,  'standard', '2025-03-05', '2026-03-05'),
(8,  'basic',    '2025-03-10', '2025-09-10'),
(9,  'family',   '2025-03-15', '2026-03-15'),
(10, 'standard', '2025-03-20', '2026-03-20');

-- ============================================================================
-- 4. ARTIST (10 Artists)
-- ============================================================================
INSERT INTO artist (artist_id, name, country, debut_year, image_url) VALUES
(1,  'Aura Waves',       'Iceland',        2018, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'),
(2,  'Neon Horizon',     'USA',            2015, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'),
(3,  'Solar Echoes',     'UK',             2012, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300'),
(4,  'Midnight Velvet',  'France',         2020, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'),
(5,  'Pulse Vanguard',   'Germany',        2016, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300'),
(6,  'Lotus Mirage',     'India',          2019, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300'),
(7,  'Echo Drift',       'Australia',      2017, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300'),
(8,  'Komorebi Strings', 'Japan',          2014, 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=300'),
(9,  'Urban Soul Project','Brazil',        2021, 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300'),
(10, 'Luna Serenade',    'Norway',         2013, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300');

-- ============================================================================
-- 5. ARTIST_ALIAS (12 Aliases)
-- ============================================================================
INSERT INTO artist_alias (artist_id, alias) VALUES
(1, 'Aura'),
(1, 'The Iceland Wave'),
(2, 'NH88'),
(2, 'Neon Horizon Collective'),
(3, 'Solar Echo'),
(4, 'M. Velvet'),
(5, 'Pulse VG'),
(5, 'Der Puls'),
(6, 'Mirage Trio'),
(7, 'Echo Drift AU'),
(8, 'Komorebi Quartet'),
(10, 'Luna S.');

-- ============================================================================
-- 6. GENRE (5 Genres)
-- ============================================================================
INSERT INTO genre (genre_id, name) VALUES
(1, 'Ambient & Chill'),
(2, 'Electronic Synth'),
(3, 'Indie Pop'),
(4, 'Neo-Classical'),
(5, 'Soul & Lo-Fi');

-- ============================================================================
-- 7. MOOD (8 Moods in 2-Tier Recursive Hierarchy)
-- Root Moods (parent_mood_id = NULL)
-- Child Moods (parent_mood_id references root)
-- ============================================================================
INSERT INTO mood (mood_id, name, parent_mood_id, description) VALUES
(1, 'Calm',      NULL, 'Peaceful, relaxed, tranquil mental state'),
(2, 'Energetic', NULL, 'High vitality, active, invigorating rhythm'),
(3, 'Sad',       NULL, 'Melancholic, reflective, sorrowful feeling'),
(4, 'Happy',     NULL, 'Uplifting, cheerful, positive vibe'),
(5, 'Focus',     1,    'Sub-mood of Calm: sustained concentration and flow'),
(6, 'Euphoric',  2,    'Sub-mood of Energetic: intense joy, exhilaration and dance'),
(7, 'Nostalgic', 3,    'Sub-mood of Sad: bittersweet longing for the past'),
(8, 'Optimistic',4,    'Sub-mood of Happy: confident, bright outlook on the future');

-- ============================================================================
-- 8. ALBUM (20 Albums)
-- ============================================================================
INSERT INTO album (album_id, artist_id, title, release_date, cover_image_url) VALUES
(1,  1, 'Nordic Horizons',    '2021-05-14', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300'),
(2,  1, 'Glacial Glow',       '2023-11-02', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300'),
(3,  2, 'Retrograde Nights',  '2020-08-20', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300'),
(4,  2, 'Neon Highway 85',    '2022-04-18', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300'),
(5,  3, 'Infinite Celestial', '2019-09-09', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300'),
(6,  3, 'Solarized Dawn',     '2024-01-12', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300'),
(7,  4, 'Midnight in Paris',  '2021-02-14', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300'),
(8,  4, 'Velvet Chamber',     '2023-10-31', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300'),
(9,  5, 'Cyber Kinetics',     '2020-11-25', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300'),
(10, 5, 'Overdrive Protocol', '2023-06-19', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300'),
(11, 6, 'Ganges Breeze',      '2021-03-21', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=300'),
(12, 6, 'Monsoon Ragas',      '2023-07-15', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300'),
(13, 7, 'Pacific Shorelines', '2019-12-01', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300'),
(14, 7, 'Sunburnt Coast',     '2022-08-30', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300'),
(15, 8, 'Tokyo Blossom',      '2020-04-05', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300'),
(16, 8, 'Quiet Rain Falling', '2022-06-22', 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=300'),
(17, 9, 'Ipanema Dusk',       '2022-01-10', 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=300'),
(18, 9, 'Samba & Coffee',     '2023-09-08', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=300'),
(19, 10, 'Fjord Moonlight',   '2021-12-18', 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=300'),
(20, 10, 'Aurora Nocturne',   '2024-02-28', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300');

-- ============================================================================
-- 9. TRACK (50 Tracks, Diverse Valence & Energy)
-- Valence: 0.0 (very negative/sad) to 1.0 (very positive/happy)
-- Energy:  0.0 (calm/chill) to 1.0 (intense/fast)
-- Audio URLs: Directly accessible openly-licensed royalty-free audio files
-- ============================================================================
INSERT INTO track (track_id, album_id, title, track_no, duration_sec, valence, energy, tempo_bpm, audio_url) VALUES
(1,  1, 'Reykjavik Dawn',        1, 245, 0.72, 0.38, 92,  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'),
(2,  1, 'Breeze of the Fjord',   2, 210, 0.65, 0.30, 85,  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'),
(3,  1, 'Glacier Tears',         3, 195, 0.28, 0.25, 76,  'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73e7208d27.mp3'),
(4,  2, 'Midnight Aurora',       1, 230, 0.55, 0.42, 100, 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3'),
(5,  2, 'Frozen Solitude',       2, 280, 0.22, 0.20, 70,  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3'),
(6,  3, 'Cyber Sunset',          1, 215, 0.82, 0.88, 126, 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e307e.mp3'),
(7,  3, 'Arcade Dreamer',        2, 198, 0.89, 0.92, 130, 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769f3659.mp3'),
(8,  3, 'Midnight Runaway',      3, 240, 0.48, 0.75, 118, 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'),
(9,  4, 'Turbo Charged',         1, 205, 0.91, 0.95, 134, 'https://cdn.pixabay.com/download/audio/2023/04/18/audio_6a3014e05b.mp3'),
(10, 4, 'Chasing City Lights',   2, 225, 0.77, 0.82, 122, 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c1c1f516a7.mp3'),
(11, 5, 'Starlight Meditation',  1, 310, 0.60, 0.22, 65,  'https://cdn.pixabay.com/download/audio/2021/11/24/audio_3825838421.mp3'),
(12, 5, 'Nebula Floating',       2, 275, 0.52, 0.28, 72,  'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3'),
(13, 5, 'Black Hole Requiem',    3, 290, 0.18, 0.35, 68,  'https://cdn.pixabay.com/download/audio/2022/04/27/audio_012e873a27.mp3'),
(14, 6, 'Solar Corona',          1, 235, 0.80, 0.70, 115, 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3'),
(15, 6, 'Helios Awakens',        2, 250, 0.85, 0.78, 120, 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_24a132dc1b.mp3'),
(16, 7, 'Cafe de Flore',         1, 185, 0.68, 0.45, 95,  'https://cdn.pixabay.com/download/audio/2022/05/05/audio_1e592e35a1.mp3'),
(17, 7, 'Rain Over Seine',       2, 220, 0.35, 0.32, 80,  'https://cdn.pixabay.com/download/audio/2022/02/07/audio_6590fa1688.mp3'),
(18, 7, 'Boulevard Waltz',       3, 190, 0.74, 0.50, 102, 'https://cdn.pixabay.com/download/audio/2022/11/15/audio_c9769f3659.mp3'),
(19, 8, 'Velvet Echo',           1, 205, 0.40, 0.48, 88,  'https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c5885.mp3'),
(20, 8, 'Shadows of Montmartre', 2, 235, 0.25, 0.38, 78,  'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1808fbf07a.mp3'),
(21, 9, 'Kinetix Overdrive',     1, 210, 0.75, 0.94, 138, 'https://cdn.pixabay.com/download/audio/2023/01/01/audio_884fe92c21.mp3'),
(22, 9, 'Digital Uprising',      2, 195, 0.62, 0.89, 132, 'https://cdn.pixabay.com/download/audio/2022/06/17/audio_c1c1f516a7.mp3'),
(23, 9, 'Binary Beat',           3, 220, 0.70, 0.85, 128, 'https://cdn.pixabay.com/download/audio/2022/09/27/audio_6a3014e05b.mp3'),
(24, 10, 'Speed Limit Zero',     1, 190, 0.88, 0.98, 142, 'https://cdn.pixabay.com/download/audio/2022/12/10/audio_9939f77c30.mp3'),
(25, 10, 'Laser Grid Escape',    2, 205, 0.78, 0.90, 135, 'https://cdn.pixabay.com/download/audio/2023/02/14/audio_3825838421.mp3'),
(26, 11, 'Varanasi Bells',       1, 260, 0.65, 0.35, 75,  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3'),
(27, 11, 'Lotus Pond Calm',      2, 240, 0.70, 0.28, 70,  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'),
(28, 11, 'Desert Sitar',         3, 225, 0.58, 0.62, 105, 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_012e873a27.mp3'),
(29, 12, 'First Drops of Rain',  1, 250, 0.45, 0.40, 82,  'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73e7208d27.mp3'),
(30, 12, 'Thunder and Jasmine',  2, 270, 0.50, 0.55, 96,  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'),
(31, 13, 'Bondi Tide',           1, 215, 0.82, 0.60, 108, 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e307e.mp3'),
(32, 13, 'Golden Hour Coast',    2, 195, 0.88, 0.55, 100, 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769f3659.mp3'),
(33, 14, 'Desert Highway Heat',  1, 230, 0.60, 0.68, 112, 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'),
(34, 14, 'Eucalyptus Wind',      2, 210, 0.55, 0.45, 90,  'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c1c1f516a7.mp3'),
(35, 15, 'Cherry Petals Dance',  1, 180, 0.78, 0.32, 80,  'https://cdn.pixabay.com/download/audio/2021/11/24/audio_3825838421.mp3'),
(36, 15, 'Kyoto Temple Garden',  2, 205, 0.62, 0.25, 68,  'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3'),
(37, 16, 'Rain on Tatami',       1, 240, 0.32, 0.18, 64,  'https://cdn.pixabay.com/download/audio/2022/02/07/audio_6590fa1688.mp3'),
(38, 16, 'Autumn Leaves Falling',2, 215, 0.28, 0.22, 70,  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3'),
(39, 17, 'Bossa Nova Sunset',    1, 220, 0.85, 0.65, 110, 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_24a132dc1b.mp3'),
(40, 17, 'Warm Sands Rio',       2, 200, 0.90, 0.70, 116, 'https://cdn.pixabay.com/download/audio/2022/05/05/audio_1e592e35a1.mp3'),
(41, 18, 'Coffee Beans & Vinyl', 1, 195, 0.76, 0.48, 86,  'https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c5885.mp3'),
(42, 18, 'Lapa Midnight Lounge', 2, 230, 0.64, 0.52, 92,  'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1808fbf07a.mp3'),
(43, 19, 'Nordic Lullaby',       1, 255, 0.45, 0.20, 60,  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3'),
(44, 19, 'Still Pines Whisper',  2, 270, 0.38, 0.18, 58,  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'),
(45, 20, 'Polar Winter Solstice',1, 305, 0.20, 0.24, 62,  'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73e7208d27.mp3'),
(46, 20, 'Dance of the Valkyrie',2, 240, 0.65, 0.75, 124, 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3'),
(47, 4,  'Midnight Driver',      3, 212, 0.70, 0.80, 120, 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e307e.mp3'),
(48, 6,  'Solar Flares',         3, 228, 0.74, 0.72, 114, 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769f3659.mp3'),
(49, 13, 'Surfers Paradise',     3, 208, 0.86, 0.64, 110, 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'),
(50, 17, 'Corcovado Breeze',     3, 218, 0.88, 0.62, 106, 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c1c1f516a7.mp3');

-- ============================================================================
-- 10. TRACK_ARTIST (58 records: Total participation of track satisfied)
-- Includes collaborative tracks with featured and producer roles
-- ============================================================================
INSERT INTO track_artist (track_id, artist_id, role) VALUES
(1, 1, 'main'),   (2, 1, 'main'),   (3, 1, 'main'),   (3, 8, 'featured'),
(4, 1, 'main'),   (5, 1, 'main'),   (6, 2, 'main'),   (7, 2, 'main'),
(8, 2, 'main'),   (8, 5, 'remixer'),(9, 2, 'main'),   (10, 2, 'main'),
(11, 3, 'main'),  (12, 3, 'main'),  (13, 3, 'main'),  (13, 1, 'producer'),
(14, 3, 'main'),  (15, 3, 'main'),  (16, 4, 'main'),  (17, 4, 'main'),
(18, 4, 'main'),  (19, 4, 'main'),  (20, 4, 'main'),  (21, 5, 'main'),
(22, 5, 'main'),  (23, 5, 'main'),  (24, 5, 'main'),  (25, 5, 'main'),
(26, 6, 'main'),  (27, 6, 'main'),  (28, 6, 'main'),  (28, 9, 'featured'),
(29, 6, 'main'),  (30, 6, 'main'),  (31, 7, 'main'),  (32, 7, 'main'),
(33, 7, 'main'),  (34, 7, 'main'),  (35, 8, 'main'),  (36, 8, 'main'),
(37, 8, 'main'),  (38, 8, 'main'),  (39, 9, 'main'),  (40, 9, 'main'),
(41, 9, 'main'),  (42, 9, 'main'),  (43, 10, 'main'), (44, 10, 'main'),
(45, 10, 'main'), (46, 10, 'main'), (46, 5, 'featured'), (47, 2, 'main'),
(47, 4, 'producer'), (48, 3, 'main'), (49, 7, 'main'), (50, 9, 'main'),
(1, 10, 'producer'), (16, 9, 'featured');

-- ============================================================================
-- 11. TRACK_GENRE (66 records: Total participation of track satisfied)
-- Many tracks span multiple genres (e.g. Ambient + Neo-Classical)
-- ============================================================================
INSERT INTO track_genre (track_id, genre_id) VALUES
(1, 1), (1, 4), (2, 1), (3, 1), (3, 4), (4, 1), (4, 2),
(5, 1), (6, 2), (7, 2), (8, 2), (9, 2), (10, 2), (10, 3),
(11, 1), (12, 1), (13, 1), (13, 4), (14, 2), (14, 3),
(15, 2), (15, 3), (16, 3), (16, 5), (17, 3), (17, 5),
(18, 3), (19, 5), (20, 5), (21, 2), (22, 2), (23, 2),
(24, 2), (25, 2), (26, 1), (26, 4), (27, 1), (28, 1), (28, 5),
(29, 1), (30, 1), (31, 3), (32, 3), (33, 3), (34, 1), (34, 3),
(35, 4), (36, 4), (37, 4), (38, 4), (39, 5), (40, 5),
(41, 5), (42, 5), (43, 1), (43, 4), (44, 1), (44, 4),
(45, 1), (45, 4), (46, 2), (46, 4), (47, 2), (48, 2), (48, 3),
(49, 3), (50, 5);

-- ============================================================================
-- 12. TRACK_MOOD (92 records: Rich mood-tagging with confidence scores)
-- ============================================================================
INSERT INTO track_mood (track_id, mood_id, confidence) VALUES
(1, 1, 0.95), (1, 4, 0.70), (1, 5, 0.85),
(2, 1, 0.98), (2, 5, 0.90),
(3, 3, 0.92), (3, 7, 0.80),
(4, 1, 0.75), (4, 5, 0.80),
(5, 3, 0.96), (5, 7, 0.85),
(6, 2, 0.95), (6, 6, 0.90), (6, 4, 0.80),
(7, 2, 0.98), (7, 6, 0.95), (7, 4, 0.90),
(8, 2, 0.80), (8, 7, 0.65),
(9, 2, 0.99), (9, 6, 0.96),
(10, 2, 0.85), (10, 4, 0.82), (10, 8, 0.88),
(11, 1, 0.98), (11, 5, 0.95),
(12, 1, 0.90), (12, 5, 0.88),
(13, 3, 0.95), (13, 7, 0.75),
(14, 4, 0.88), (14, 8, 0.85), (14, 2, 0.78),
(15, 4, 0.92), (15, 8, 0.90), (15, 6, 0.82),
(16, 4, 0.80), (16, 1, 0.75),
(17, 3, 0.85), (17, 7, 0.90),
(18, 4, 0.82), (18, 8, 0.78),
(19, 1, 0.70), (19, 7, 0.75),
(20, 3, 0.90), (20, 7, 0.88),
(21, 2, 0.98), (21, 6, 0.92),
(22, 2, 0.92), (22, 6, 0.85),
(23, 2, 0.88), (23, 5, 0.70),
(24, 2, 0.99), (24, 6, 0.96),
(25, 2, 0.94), (25, 6, 0.88),
(26, 1, 0.95), (26, 5, 0.92),
(27, 1, 0.98), (27, 5, 0.95),
(28, 4, 0.75), (28, 2, 0.70),
(29, 3, 0.80), (29, 7, 0.85),
(30, 1, 0.72), (30, 2, 0.65),
(31, 4, 0.90), (31, 8, 0.88),
(32, 4, 0.95), (32, 8, 0.92), (32, 1, 0.75),
(33, 2, 0.75), (33, 8, 0.70),
(34, 1, 0.80), (34, 5, 0.78),
(35, 1, 0.90), (35, 4, 0.82), (35, 8, 0.80),
(36, 1, 0.96), (36, 5, 0.94),
(37, 3, 0.92), (37, 7, 0.95),
(38, 3, 0.94), (38, 7, 0.96),
(39, 4, 0.92), (39, 8, 0.90),
(40, 4, 0.95), (40, 6, 0.85), (40, 8, 0.92),
(41, 1, 0.85), (41, 5, 0.88),
(42, 1, 0.75), (42, 7, 0.70),
(43, 1, 0.95), (43, 5, 0.90),
(44, 1, 0.98), (44, 5, 0.92),
(45, 3, 0.96), (45, 7, 0.85),
(46, 2, 0.85), (46, 6, 0.80),
(47, 2, 0.82), (48, 4, 0.80), (49, 4, 0.88), (50, 4, 0.90);

-- ============================================================================
-- 13. USER_MOOD_LOG (42 records: Mood logs across various intensities)
-- ============================================================================
INSERT INTO user_mood_log (log_id, user_id, mood_id, intensity, logged_at) VALUES
(1,  1, 1, 4, '2025-03-01 08:30:00'),
(2,  1, 5, 5, '2025-03-02 09:15:00'),
(3,  1, 2, 3, '2025-03-03 18:00:00'),
(4,  1, 4, 4, '2025-03-05 14:20:00'),
(5,  2, 2, 5, '2025-03-01 17:45:00'),
(6,  2, 6, 5, '2025-03-02 22:10:00'),
(7,  2, 4, 4, '2025-03-04 12:00:00'),
(8,  2, 1, 2, '2025-03-06 23:30:00'),
(9,  3, 3, 4, '2025-03-01 21:00:00'),
(10, 3, 7, 5, '2025-03-03 20:30:00'),
(11, 3, 1, 3, '2025-03-04 07:15:00'),
(12, 3, 5, 4, '2025-03-06 10:00:00'),
(13, 4, 4, 5, '2025-03-02 11:30:00'),
(14, 4, 8, 4, '2025-03-03 15:45:00'),
(15, 4, 2, 4, '2025-03-05 19:10:00'),
(16, 4, 6, 5, '2025-03-07 21:40:00'),
(17, 5, 5, 5, '2025-03-01 09:00:00'),
(18, 5, 1, 4, '2025-03-02 14:00:00'),
(19, 5, 3, 3, '2025-03-04 18:30:00'),
(20, 5, 7, 4, '2025-03-06 22:00:00'),
(21, 6, 1, 3, '2025-03-02 08:00:00'),
(22, 6, 4, 4, '2025-03-03 13:20:00'),
(23, 6, 8, 5, '2025-03-05 16:50:00'),
(24, 7, 2, 5, '2025-03-06 07:30:00'),
(25, 7, 6, 4, '2025-03-07 19:00:00'),
(26, 7, 5, 5, '2025-03-08 11:15:00'),
(27, 7, 4, 4, '2025-03-10 17:30:00'),
(28, 8, 3, 5, '2025-03-11 20:00:00'),
(29, 8, 7, 4, '2025-03-12 21:15:00'),
(30, 8, 1, 4, '2025-03-14 08:45:00'),
(31, 8, 5, 5, '2025-03-15 10:30:00'),
(32, 9, 4, 5, '2025-03-16 14:00:00'),
(33, 9, 8, 5, '2025-03-17 16:20:00'),
(34, 9, 2, 4, '2025-03-18 19:40:00'),
(35, 9, 6, 4, '2025-03-19 22:15:00'),
(36, 10, 1, 4, '2025-03-21 09:30:00'),
(37, 10, 5, 5, '2025-03-22 11:00:00'),
(38, 10, 3, 3, '2025-03-23 18:20:00'),
(39, 10, 7, 4, '2025-03-24 21:50:00'),
(40, 1,  6, 5, '2025-03-08 23:00:00'),
(41, 2,  8, 4, '2025-03-09 15:10:00'),
(42, 4,  5, 4, '2025-03-10 10:05:00');

-- ============================================================================
-- 14. LISTENING_HISTORY (125 records: realistic listen durations & skips)
-- Tracks completion rate = (duration_listened_sec / track.duration_sec) * 100
-- ============================================================================
INSERT INTO listening_history (listen_id, user_id, track_id, played_at, duration_listened_sec) VALUES
(1,  1, 1,  '2025-03-01 08:35:00', 245),
(2,  1, 2,  '2025-03-01 08:40:00', 210),
(3,  1, 11, '2025-03-01 08:45:00', 310),
(4,  1, 12, '2025-03-02 09:20:00', 275),
(5,  1, 26, '2025-03-02 09:25:00', 260),
(6,  1, 27, '2025-03-02 09:30:00', 240),
(7,  1, 6,  '2025-03-03 18:05:00', 215),
(8,  1, 7,  '2025-03-03 18:10:00', 198),
(9,  1, 9,  '2025-03-03 18:15:00', 45),  -- Skipped after 45s
(10, 1, 31, '2025-03-05 14:25:00', 215),
(11, 1, 32, '2025-03-05 14:30:00', 195),
(12, 1, 39, '2025-03-05 14:35:00', 220),
(13, 2, 6,  '2025-03-01 17:50:00', 215),
(14, 2, 7,  '2025-03-01 17:55:00', 198),
(15, 2, 9,  '2025-03-01 18:00:00', 205),
(16, 2, 21, '2025-03-02 22:15:00', 210),
(17, 2, 22, '2025-03-02 22:20:00', 195),
(18, 2, 24, '2025-03-02 22:25:00', 190),
(19, 2, 25, '2025-03-02 22:30:00', 205),
(20, 2, 14, '2025-03-04 12:05:00', 235),
(21, 2, 15, '2025-03-04 12:10:00', 250),
(22, 2, 1,  '2025-03-06 23:35:00', 245),
(23, 2, 43, '2025-03-06 23:40:00', 255),
(24, 3, 3,  '2025-03-01 21:05:00', 195),
(25, 3, 5,  '2025-03-01 21:10:00', 280),
(26, 3, 13, '2025-03-01 21:15:00', 290),
(27, 3, 17, '2025-03-03 20:35:00', 220),
(28, 3, 20, '2025-03-03 20:40:00', 235),
(29, 3, 37, '2025-03-03 20:45:00', 240),
(30, 3, 38, '2025-03-03 20:50:00', 215),
(31, 3, 45, '2025-03-03 20:55:00', 305),
(32, 3, 1,  '2025-03-04 07:20:00', 245),
(33, 3, 11, '2025-03-04 07:25:00', 310),
(34, 3, 36, '2025-03-06 10:05:00', 205),
(35, 4, 14, '2025-03-02 11:35:00', 235),
(36, 4, 15, '2025-03-02 11:40:00', 250),
(37, 4, 31, '2025-03-02 11:45:00', 215),
(38, 4, 32, '2025-03-02 11:50:00', 195),
(39, 4, 39, '2025-03-03 15:50:00', 220),
(40, 4, 40, '2025-03-03 15:55:00', 200),
(41, 4, 6,  '2025-03-05 19:15:00', 215),
(42, 4, 7,  '2025-03-05 19:20:00', 198),
(43, 4, 21, '2025-03-07 21:45:00', 210),
(44, 4, 24, '2025-03-07 21:50:00', 190),
(45, 5, 11, '2025-03-01 09:05:00', 310),
(46, 5, 12, '2025-03-01 09:12:00', 275),
(47, 5, 26, '2025-03-01 09:20:00', 260),
(48, 5, 27, '2025-03-01 09:26:00', 240),
(49, 5, 36, '2025-03-01 09:32:00', 205),
(50, 5, 41, '2025-03-02 14:05:00', 195),
(51, 5, 42, '2025-03-02 14:10:00', 230),
(52, 5, 43, '2025-03-02 14:15:00', 255),
(53, 5, 3,  '2025-03-04 18:35:00', 195),
(54, 5, 5,  '2025-03-04 18:40:00', 280),
(55, 5, 37, '2025-03-06 22:05:00', 240),
(56, 5, 38, '2025-03-06 22:10:00', 215),
(57, 6, 1,  '2025-03-02 08:05:00', 245),
(58, 6, 2,  '2025-03-02 08:10:00', 210),
(59, 6, 16, '2025-03-03 13:25:00', 185),
(60, 6, 18, '2025-03-03 13:30:00', 190),
(61, 6, 31, '2025-03-05 16:55:00', 215),
(62, 6, 32, '2025-03-05 17:00:00', 195),
(63, 6, 39, '2025-03-05 17:05:00', 220),
(64, 7, 6,  '2025-03-06 07:35:00', 215),
(65, 7, 7,  '2025-03-06 07:40:00', 198),
(66, 7, 9,  '2025-03-06 07:45:00', 205),
(67, 7, 21, '2025-03-06 07:50:00', 210),
(68, 7, 24, '2025-03-07 19:05:00', 190),
(69, 7, 25, '2025-03-07 19:10:00', 205),
(70, 7, 11, '2025-03-08 11:20:00', 310),
(71, 7, 12, '2025-03-08 11:27:00', 275),
(72, 7, 26, '2025-03-08 11:34:00', 260),
(73, 7, 14, '2025-03-10 17:35:00', 235),
(74, 7, 15, '2025-03-10 17:40:00', 250),
(75, 7, 40, '2025-03-10 17:45:00', 200),
(76, 8, 3,  '2025-03-11 20:05:00', 195),
(77, 8, 5,  '2025-03-11 20:10:00', 280),
(78, 8, 13, '2025-03-11 20:16:00', 290),
(79, 8, 17, '2025-03-12 21:20:00', 220),
(80, 8, 20, '2025-03-12 21:25:00', 235),
(81, 8, 37, '2025-03-12 21:30:00', 240),
(82, 8, 38, '2025-03-12 21:35:00', 215),
(83, 8, 1,  '2025-03-14 08:50:00', 245),
(84, 8, 11, '2025-03-14 08:55:00', 310),
(85, 8, 36, '2025-03-15 10:35:00', 205),
(86, 8, 41, '2025-03-15 10:40:00', 195),
(87, 8, 44, '2025-03-15 10:45:00', 270),
(88, 9, 31, '2025-03-16 14:05:00', 215),
(89, 9, 32, '2025-03-16 14:10:00', 195),
(90, 9, 39, '2025-03-16 14:15:00', 220),
(91, 9, 40, '2025-03-16 14:20:00', 200),
(92, 9, 50, '2025-03-17 16:25:00', 218),
(93, 9, 6,  '2025-03-18 19:45:00', 215),
(94, 9, 7,  '2025-03-18 19:50:00', 198),
(95, 9, 21, '2025-03-19 22:20:00', 210),
(96, 9, 24, '2025-03-19 22:25:00', 190),
(97, 10, 1, '2025-03-21 09:35:00', 245),
(98, 10, 2, '2025-03-21 09:40:00', 210),
(99, 10, 11,'2025-03-22 11:05:00', 310),
(100, 10, 12,'2025-03-22 11:12:00', 275),
(101, 10, 26,'2025-03-22 11:19:00', 260),
(102, 10, 3, '2025-03-23 18:25:00', 195),
(103, 10, 17,'2025-03-23 18:30:00', 220),
(104, 10, 37,'2025-03-24 21:55:00', 240),
(105, 10, 45,'2025-03-24 22:00:00', 305),
(106, 1, 14, '2025-03-06 10:00:00', 235),
(107, 1, 15, '2025-03-06 10:05:00', 250),
(108, 1, 40, '2025-03-06 10:10:00', 200),
(109, 2, 8,  '2025-03-05 16:00:00', 240),
(110, 2, 10, '2025-03-05 16:05:00', 225),
(111, 2, 47, '2025-03-05 16:10:00', 212),
(112, 3, 29, '2025-03-05 21:00:00', 250),
(113, 3, 30, '2025-03-05 21:05:00', 270),
(114, 4, 1,  '2025-03-06 14:00:00', 245),
(115, 4, 2,  '2025-03-06 14:05:00', 210),
(116, 5, 44, '2025-03-07 11:00:00', 270),
(117, 6, 49, '2025-03-07 15:30:00', 208),
(118, 7, 46, '2025-03-08 19:30:00', 240),
(119, 7, 47, '2025-03-08 19:35:00', 212),
(120, 8, 28, '2025-03-16 12:00:00', 225),
(121, 9, 41, '2025-03-20 10:00:00', 195),
(122, 9, 42, '2025-03-20 10:05:00', 230),
(123, 10, 43,'2025-03-25 09:00:00', 255),
(124, 10, 44,'2025-03-25 09:05:00', 270),
(125, 2, 23, '2025-03-03 23:00:00', 220);

-- ============================================================================
-- 16. USER_FOLLOW (18 records: Directed user follow graph, no self-follow)
-- ============================================================================
INSERT INTO user_follow (follower_id, followee_id, followed_at) VALUES
(1, 2, '2025-02-15 11:00:00'),
(1, 3, '2025-02-16 14:30:00'),
(1, 7, '2025-03-06 09:00:00'),
(2, 1, '2025-02-15 12:00:00'),
(2, 7, '2025-03-06 09:15:00'),
(2, 9, '2025-03-16 10:00:00'),
(3, 5, '2025-02-22 17:00:00'),
(3, 8, '2025-03-11 11:00:00'),
(4, 1, '2025-02-18 16:00:00'),
(4, 2, '2025-02-18 16:05:00'),
(4, 9, '2025-03-17 14:00:00'),
(5, 3, '2025-02-25 10:00:00'),
(5, 8, '2025-03-12 15:00:00'),
(6, 1, '2025-03-02 09:00:00'),
(7, 2, '2025-03-06 09:30:00'),
(7, 9, '2025-03-18 11:00:00'),
(8, 3, '2025-03-11 12:00:00'),
(9, 4, '2025-03-18 12:00:00');

-- ============================================================================
-- 17. PLAYLIST (18 Playlists: Weak entity with per-user playlist_no)
-- playlist_no starts at 1 for each user_id
-- ============================================================================
INSERT INTO playlist (user_id, playlist_no, name, created_at, mood_id) VALUES
(1, 1, 'Morning Calm & Focus',   '2025-01-20 09:00:00', 5),
(1, 2, 'Evening Downtempo',      '2025-02-10 20:00:00', 1),
(1, 3, 'Workout Energy',         '2025-02-25 18:00:00', 2),
(2, 1, 'High Energy Beats',      '2025-02-05 15:00:00', 2),
(2, 2, 'Late Night Drive',       '2025-02-20 22:30:00', 6),
(3, 1, 'Rainy Day Melancholy',   '2025-02-12 19:00:00', 3),
(3, 2, 'Nostalgia Express',      '2025-03-01 21:00:00', 7),
(4, 1, 'Sunny Afternoon Pop',    '2025-02-16 13:00:00', 4),
(4, 2, 'Future Optimism',        '2025-03-04 16:00:00', 8),
(5, 1, 'Zen Garden Focus',       '2025-02-22 08:30:00', 5),
(5, 2, 'Deep Sleep Ambient',     '2025-03-05 23:00:00', 1),
(6, 1, 'Coffee Shop Lo-Fi',      '2025-03-02 10:00:00', 1),
(7, 1, 'Cardio & Synthwave',     '2025-03-06 07:00:00', 6),
(7, 2, 'Coding Flow State',      '2025-03-08 10:00:00', 5),
(8, 1, 'Reflective Piano',       '2025-03-11 19:30:00', 3),
(8, 2, 'Breeze & Solitude',      '2025-03-14 08:00:00', 1),
(9, 1, 'Rio Summer Vibes',       '2025-03-16 13:00:00', 4),
(10, 1, 'Nordic Chillout',       '2025-03-21 10:00:00', 1);

-- ============================================================================
-- 18. PLAYLIST_TRACK (74 records: Ordered tracks in playlists)
-- Composite FK = (user_id, playlist_no) references playlist(user_id, playlist_no)
-- ============================================================================
INSERT INTO playlist_track (user_id, playlist_no, track_id, position, added_at) VALUES
-- User 1, Playlist 1 (Morning Calm)
(1, 1, 1,  1, '2025-01-20 09:05:00'),
(1, 1, 2,  2, '2025-01-20 09:06:00'),
(1, 1, 11, 3, '2025-01-20 09:07:00'),
(1, 1, 26, 4, '2025-01-20 09:08:00'),
(1, 1, 27, 5, '2025-01-20 09:09:00'),
-- User 1, Playlist 2 (Evening Downtempo)
(1, 2, 12, 1, '2025-02-10 20:05:00'),
(1, 2, 36, 2, '2025-02-10 20:06:00'),
(1, 2, 43, 3, '2025-02-10 20:07:00'),
(1, 2, 44, 4, '2025-02-10 20:08:00'),
-- User 1, Playlist 3 (Workout)
(1, 3, 6,  1, '2025-02-25 18:05:00'),
(1, 3, 7,  2, '2025-02-25 18:06:00'),
(1, 3, 9,  3, '2025-02-25 18:07:00'),
(1, 3, 21, 4, '2025-02-25 18:08:00'),
-- User 2, Playlist 1 (High Energy Beats)
(2, 1, 6,  1, '2025-02-05 15:05:00'),
(2, 1, 7,  2, '2025-02-05 15:06:00'),
(2, 1, 9,  3, '2025-02-05 15:07:00'),
(2, 1, 21, 4, '2025-02-05 15:08:00'),
(2, 1, 24, 5, '2025-02-05 15:09:00'),
-- User 2, Playlist 2 (Late Night Drive)
(2, 2, 8,  1, '2025-02-20 22:35:00'),
(2, 2, 10, 2, '2025-02-20 22:36:00'),
(2, 2, 23, 3, '2025-02-20 22:37:00'),
(2, 2, 25, 4, '2025-02-20 22:38:00'),
(2, 2, 47, 5, '2025-02-20 22:39:00'),
-- User 3, Playlist 1 (Rainy Day Melancholy)
(3, 1, 3,  1, '2025-02-12 19:05:00'),
(3, 1, 5,  2, '2025-02-12 19:06:00'),
(3, 1, 13, 3, '2025-02-12 19:07:00'),
(3, 1, 17, 4, '2025-02-12 19:08:00'),
(3, 1, 45, 5, '2025-02-12 19:09:00'),
-- User 3, Playlist 2 (Nostalgia)
(3, 2, 20, 1, '2025-03-01 21:05:00'),
(3, 2, 29, 2, '2025-03-01 21:06:00'),
(3, 2, 37, 3, '2025-03-01 21:07:00'),
(3, 2, 38, 4, '2025-03-01 21:08:00'),
-- User 4, Playlist 1 (Sunny Afternoon Pop)
(4, 1, 14, 1, '2025-02-16 13:05:00'),
(4, 1, 15, 2, '2025-02-16 13:06:00'),
(4, 1, 18, 3, '2025-02-16 13:07:00'),
(4, 1, 31, 4, '2025-02-16 13:08:00'),
(4, 1, 32, 5, '2025-02-16 13:09:00'),
-- User 4, Playlist 2 (Future Optimism)
(4, 2, 10, 1, '2025-03-04 16:05:00'),
(4, 2, 39, 2, '2025-03-04 16:06:00'),
(4, 2, 40, 3, '2025-03-04 16:07:00'),
(4, 2, 48, 4, '2025-03-04 16:08:00'),
-- User 5, Playlist 1 (Zen Focus)
(5, 1, 11, 1, '2025-02-22 08:35:00'),
(5, 1, 12, 2, '2025-02-22 08:36:00'),
(5, 1, 26, 3, '2025-02-22 08:37:00'),
(5, 1, 27, 4, '2025-02-22 08:38:00'),
(5, 1, 36, 5, '2025-02-22 08:39:00'),
-- User 5, Playlist 2 (Deep Sleep)
(5, 2, 43, 1, '2025-03-05 23:05:00'),
(5, 2, 44, 2, '2025-03-05 23:06:00'),
(5, 2, 35, 3, '2025-03-05 23:07:00'),
-- User 6, Playlist 1 (Coffee Shop Lo-Fi)
(6, 1, 16, 1, '2025-03-02 10:05:00'),
(6, 1, 41, 2, '2025-03-02 10:06:00'),
(6, 1, 42, 3, '2025-03-02 10:07:00'),
(6, 1, 1,  4, '2025-03-02 10:08:00'),
-- User 7, Playlist 1 (Cardio & Synthwave)
(7, 1, 6,  1, '2025-03-06 07:05:00'),
(7, 1, 7,  2, '2025-03-06 07:06:00'),
(7, 1, 9,  3, '2025-03-06 07:07:00'),
(7, 1, 21, 4, '2025-03-06 07:08:00'),
(7, 1, 24, 5, '2025-03-06 07:09:00'),
-- User 7, Playlist 2 (Coding Flow)
(7, 2, 11, 1, '2025-03-08 10:05:00'),
(7, 2, 23, 2, '2025-03-08 10:06:00'),
(7, 2, 27, 3, '2025-03-08 10:07:00'),
(7, 2, 34, 4, '2025-03-08 10:08:00'),
-- User 8, Playlist 1 (Reflective Piano)
(8, 1, 3,  1, '2025-03-11 19:35:00'),
(8, 1, 5,  2, '2025-03-11 19:36:00'),
(8, 1, 13, 3, '2025-03-11 19:37:00'),
(8, 1, 37, 4, '2025-03-11 19:38:00'),
(8, 1, 38, 5, '2025-03-11 19:39:00'),
-- User 8, Playlist 2 (Breeze & Solitude)
(8, 2, 1,  1, '2025-03-14 08:05:00'),
(8, 2, 2,  2, '2025-03-14 08:06:00'),
(8, 2, 11, 3, '2025-03-14 08:07:00'),
(8, 2, 44, 4, '2025-03-14 08:08:00'),
-- User 9, Playlist 1 (Rio Summer)
(9, 1, 31, 1, '2025-03-16 13:05:00'),
(9, 1, 32, 2, '2025-03-16 13:06:00'),
(9, 1, 39, 3, '2025-03-16 13:07:00'),
(9, 1, 40, 4, '2025-03-16 13:08:00'),
(9, 1, 50, 5, '2025-03-16 13:09:00'),
-- User 10, Playlist 1 (Nordic Chillout)
(10, 1, 1, 1, '2025-03-21 10:05:00'),
(10, 1, 2, 2, '2025-03-21 10:06:00'),
(10, 1, 4, 3, '2025-03-21 10:07:00'),
(10, 1, 43, 4, '2025-03-21 10:08:00'),
(10, 1, 44, 5, '2025-03-21 10:09:00');

