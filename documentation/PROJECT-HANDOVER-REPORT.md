# Music Mood Recommendation System — Comprehensive Handover Report

**Document Version:** 1.0.0  
**Audit Timestamp:** 2026-11-08T20:45:00+05:30  
**Target Environment:** Transfer to alternative AI development agent / human engineering team  
**Project Path:** `d:\Development\DBS Project\music-mood-recommendation`  
**Current Milestone Completed:** Phase 1 (Foundation & Design), Phase 2 (MySQL Database Implementation), Phase 3 (Express Backend REST API)  
**Next Milestone:** Phase 4 (Complete React Frontend Development)

---

## 1. Project Overview & Architecture

### 1.1 Purpose & Domain
The **Music Mood Recommendation System** is a university DBMS final project. Its primary purpose is to demonstrate practical, production-level implementation of core and advanced Database Management System (DBMS) concepts taught in academic curricula, while functioning as a modern web application that recommends songs based on emotional mood states mapped to **valence** (positivity/negativity) and **energy** (intensity/vitality).

### 1.2 Technology Stack

| Layer | Component | Version / Specification | Justification / Constraint |
|---|---|---|---|
| **Database** | MySQL Server | 8.0 CE (`MYSQL80` Windows Service) | Primary transactional store; InnoDB engine; strict `utf8mb4` charset and `utf8mb4_unicode_ci` collation. |
| **Database Client** | MySQL Workbench | 8.0 CE | GUI administrative tool for query analysis, visual explains, and DDL execution. |
| **Backend Runtime** | Node.js | v25.5.0 (Windows x64) | Asynchronous JavaScript runtime. |
| **Backend Framework** | Express.js | 4.19.2 | REST API routing and middleware pipeline. |
| **Database Driver** | `mysql2` | 3.9.7 (`mysql2/promise`) | Async connection pooling, prepared statements. |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | JWT 9.0.2 / bcryptjs 2.4.3 | Stateless token auth; 12-round salt hashing. |
| **Input Validation** | `express-validator` | 7.1.0 | Request body, query, and parameter schema enforcement. |
| **Frontend Framework** | React | 19.3.1 | Component-based UI library (installed via Vite). |
| **Frontend Tooling** | Vite | 8.3.6 | Build bundler and HMR dev server. |

### 1.3 High-Level Architecture
```
┌────────────────────────────────────────────────────────┐
│            Frontend (React 19 + Vite)                  │
│       (Current status: Health-check scaffold)          │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (CORS: 5173)
┌───────────────────────────▼────────────────────────────┐
│         Backend Server (Express.js on :5000)           │
│  ├── Routes (11 modules) & Middleware (Auth, Validate) │
│  ├── Controllers (10 domains)                          │
│  └── mysql2/promise Connection Pool                    │
└───────────────────────────┬────────────────────────────┘
                            │ TCP 3306 (Prepared Statements)
┌───────────────────────────▼────────────────────────────┐
│            MySQL 8.0 Database (music_mood_db)          │
│  ├── 19 BCNF-Normalized Relational Tables              │
│  ├── 5 Stored Functions (Derived Attributes)           │
│  ├── 6 Stored Procedures (Atomic Transactions & Locks) │
│  ├── 4 Integrity Triggers (Disjoint ISA, Validators)   │
│  ├── 4 Analytical Views                                │
│  └── 12 Secondary B-Tree Indexes                       │
└────────────────────────────────────────────────────────┘
```

### 1.4 Workspace Directory Structure
```text
D:\Development\DBS Project\
├── DBMS Final Project - Instructions & Guidelines  (1).pdf
├── Music Mood DB ER to Relational Schema Mapping.pdf
├── Music Mood DB Functional Dependencies and Normalization.pdf
├── Music_Mood_DB_ER_Diagram_v2 (2).pdf
└── music-mood-recommendation/
    ├── .gitignore
    ├── README.md
    ├── database/
    │   ├── .gitkeep
    │   ├── 00_reset_database_dev_only.sql
    │   ├── 00_run_all.sql
    │   ├── 01_create_database.sql
    │   ├── 02_schema.sql
    │   ├── 03_indexes.sql
    │   ├── 04_sample_data.sql
    │   ├── 05_functions.sql
    │   ├── 06_procedures.sql
    │   ├── 07_triggers.sql
    │   ├── 08_views.sql
    │   ├── 09_queries.sql
    │   ├── 10_transactions.sql
    │   ├── 11_authorization.sql
    │   ├── 12_optimization.sql
    │   └── 13_test_cases.sql
    ├── backend/
    │   ├── .env
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── test_routes.js
    │   └── src/
    │       ├── app.js
    │       ├── index.js
    │       ├── config/
    │       │   └── db.js
    │       ├── controllers/
    │       │   ├── activityController.js
    │       │   ├── albumController.js
    │       │   ├── artistController.js
    │       │   ├── authController.js
    │       │   ├── genreMoodController.js
    │       │   ├── playlistController.js
    │       │   ├── ratingController.js
    │       │   ├── recommendationController.js
    │       │   ├── trackController.js
    │       │   └── userController.js
    │       ├── middleware/
    │       │   ├── auth.js
    │       │   └── validate.js
    │       ├── routes/
    │       │   ├── albums.js
    │       │   ├── artists.js
    │       │   ├── auth.js
    │       │   ├── genres.js
    │       │   ├── health.js
    │       │   ├── listeningHistory.js
    │       │   ├── moods.js
    │       │   ├── playlists.js
    │       │   ├── ratings.js
    │       │   ├── recommendations.js
    │       │   ├── tracks.js
    │       │   └── users.js
    │       ├── utils/
    │       │   └── response.js
    │       └── validators/
    │           └── index.js
    ├── frontend/
    │   ├── .gitignore
    │   ├── .oxlintrc.json
    │   ├── index.html
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── README.md
    │   ├── vite.config.js
    │   ├── public/
    │   └── src/
    │       ├── App.css
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       └── assets/
    └── documentation/
        ├── .gitkeep
        ├── Music_Mood_DB_ER_Diagram_v2.pdf
        ├── Music_Mood_DB_ER_to_Relational_Schema_Mapping.pdf
        ├── Music_Mood_DB_Functional_Dependencies_and_Normalization.pdf
        ├── Phase1-Documentation.md
        ├── Phase2-Database-Implementation-Report.md
        ├── Phase3-API-Reference.md
        ├── Phase3-Backend-Documentation.md
        ├── Phase3-Testing-Report.md
        └── PROJECT-HANDOVER-REPORT.md (This File)
```

---

## 2. Phase 1 Audit: Design Decisions & Normalization

### 2.1 Scope & Verification Status
- **Verification method**: Direct code and documentation inspection against initial Korth-style university guidelines.
- **Outcome**: The database design comprises **exactly 19 relational tables** mapped from entities, subtypes, weak entities, multivalued attributes, and relationships.

### 2.2 Relational Mapping Rules (R1–R11) Applied
1. **Strong Entities (R1)**: `app_user`, `artist`, `album`, `track`, `genre`, `mood`, `user_mood_log`, `listening_history`.
2. **Weak Entity (R2)**: `playlist` depends on `app_user` through the identifying relationship `owns`. Composite PK is `(user_id, playlist_no)` where `playlist_no` is the discriminator.
3. **Composite Attributes (R3)**: `APP_USER.name` flattened into atomic columns `first_name` and `last_name`.
4. **Multivalued Attributes (R4)**: `ARTIST.{alias}` mapped into separate relation `artist_alias` with composite PK `(artist_id, alias)`.
5. **Derived Attributes (R5)**: `age()`, `play_count()`, `completion_pct()`, `track_count()`, and `total_duration()` are explicitly **not stored** as static table columns; they are computed dynamically via stored functions or views to eliminate transitive update anomalies.
6. **1:N Relationships (R6)**: Foreign key placed on the $N$-side (`album.artist_id`, `track.album_id`, `user_mood_log.user_id`, etc.).
7. **M:N Relationships (R7)**: Separate junction tables with composite primary keys (`track_artist`, `track_genre`, `track_mood`, `rating`, `playlist_track`, `user_follow`).
8. **Recursive Relationships (R8)**:
   - 1:N self-reference: `mood.parent_mood_id` $\rightarrow$ `mood.mood_id`.
   - M:N self-reference: `user_follow` with PK `(follower_id, followee_id)`.
9. **Ternary Relationship (R9)**: `recommendation` connects `app_user`, `track`, and `mood` with surrogate key `rec_id` and natural candidate key `(user_id, track_id, mood_id, generated_at)`.
10. **ISA Specialization (R10)**: `app_user` specialized into `free_user` and `premium_user`. Both share `user_id` as PK and FK to `app_user`.
11. **Total Participation (R11)**: Implemented as `NOT NULL` on single FK columns, combined with transactional procedures.

### 2.3 Normalization Proofs
- **1NF**: All attributes are atomic; multivalued aliases extracted; no repeating groups.
- **2NF**: No partial functional dependencies in any composite-key table:
  - `track_artist`: `role` depends on `(track_id, artist_id)`.
  - `playlist`: `name`, `created_at`, `mood_id` depend on `(user_id, playlist_no)`.
  - `playlist_track`: `position`, `added_at` depend on `(user_id, playlist_no, track_id)`.
  - `rating`: `rating`, `rated_at` depend on `(user_id, track_id)`.
- **3NF & BCNF**: For every non-trivial functional dependency $X \rightarrow Y$, $X$ is a superkey (or candidate key). Album facts reside in `album`, artist facts reside in `artist`, eliminating transitive chains ($track \rightarrow album \rightarrow artist$).

---

## 3. Phase 2 Audit: Complete MySQL Implementation

### 3.1 Schema Definition (`02_schema.sql`)
- **Tables created**: 19 tables.
- **Engine**: InnoDB across all tables.
- **Safety**: Uses non-destructive `CREATE TABLE IF NOT EXISTS`. Destructive operations are isolated in `00_reset_database_dev_only.sql`.
- **Key Constraints**:
  - `uk_app_user_username`, `uk_app_user_email` on `app_user`.
  - `uk_track_album_track_no` on `track(album_id, track_no)`.
  - `uk_playlist_track_position` on `playlist_track(user_id, playlist_no, position)`.
  - `uk_recommendation_natural` on `recommendation(user_id, track_id, mood_id, generated_at)`.
  - `chk_track_valence`, `chk_track_energy` ($[0.0, 1.0]$).
  - `chk_rating_range` ($[1, 5]$), `chk_user_mood_log_intensity` ($[1, 5]$).
  - `chk_user_follow_no_self` (`follower_id <> followee_id`).
  - `chk_premium_user_dates` (`valid_till >= subscribed_on`).

### 3.2 Referential Integrity Matrix
- **`ON DELETE CASCADE`**: Used when child existence is meaningless without parent (`app_user` $\rightarrow$ `free_user`, `premium_user`, `listening_history`, `rating`, `user_mood_log`, `playlist`, `recommendation`; `track` $\rightarrow$ `track_artist`, `track_genre`, `track_mood`, `playlist_track`, `listening_history`, `rating`).
- **`ON DELETE RESTRICT`**: Used to enforce total participation and prevent orphan generation (`album.artist_id`, `track.album_id`, `track_artist.artist_id`, `track_genre.genre_id`).
- **`ON DELETE SET NULL`**: Used for optional associations (`mood.parent_mood_id`, `playlist.mood_id`).

### 3.3 Sample Data Audit (`04_sample_data.sql`)
All 19 tables are populated with realistic data meeting or exceeding assignment requirements:
- `app_user`: 10 rows (6 Free, 4 Premium; bcrypt-hashed passwords for `Password123!`).
- `free_user`: 6 rows (`daily_skip_limit` configured).
- `premium_user`: 4 rows (`plan_type`: basic, standard, family).
- `artist`: 10 rows (International artists with debut years).
- `artist_alias`: 12 rows.
- `album`: 20 rows.
- `track`: 50 rows (Valence range 0.18–0.91, Energy range 0.18–0.98, tempo, royalty-free MP3 URLs).
- `genre`: 5 rows (Ambient, Synth, Indie Pop, Neo-Classical, Lo-Fi).
- `mood`: 8 rows (4 Root: Calm, Energetic, Sad, Happy; 4 Child: Focus, Euphoric, Nostalgic, Optimistic).
- `track_artist`: 58 rows (every track has $\ge 1$ artist; includes featured/producer roles).
- `track_genre`: 66 rows (every track has $\ge 1$ genre; tracks cross genres).
- `track_mood`: 92 rows (confidence scores 0.65–0.99).
- `user_mood_log`: 42 rows (intensity 1–5).
- `listening_history`: 125 rows (realistic durations and skip patterns).
- `rating`: 52 rows (1–5 stars).
- `user_follow`: 18 rows (directed graph, zero self-following).
- `playlist`: 18 rows (weak entity, `playlist_no` starts at 1 per user).
- `playlist_track`: 74 rows (ordered positions 1..N).
- `recommendation`: 60 rows (`DATETIME(3)` millisecond precision timestamps).

### 3.4 Stored Functions (`05_functions.sql`)
All functions are declared `NOT DETERMINISTIC READS SQL DATA` because they query mutable tables and/or clock functions:
1. `fn_age(p_user_id)`: `TIMESTAMPDIFF(YEAR, birth_date, CURDATE())`.
2. `fn_play_count(p_track_id)`: `COUNT(*)` from `listening_history`.
3. `fn_track_count(p_user_id, p_playlist_no)`: `COUNT(*)` from `playlist_track`.
4. `fn_total_duration(p_user_id, p_playlist_no)`: `SUM(duration_sec)` from `playlist_track` $\bowtie$ `track`.
5. `fn_completion_pct(p_listen_id)`: `LEAST(100.0, (duration_listened / track_duration) * 100)`.

### 3.5 Stored Procedures (`06_procedures.sql`)
1. `sp_register_user`: Enforces total ISA specialization in an atomic transaction. Inserts into `app_user` and exactly one subtype table (`free_user` or `premium_user`), rolling back on failure.
2. `sp_create_playlist`: Concurrency-safe sequential numbering. Employs `SELECT ... FOR UPDATE` row locking on `app_user` before allocating `MAX(playlist_no) + 1`.
3. `sp_add_track_to_playlist`: Concurrency-safe position assignment. Employs `SELECT ... FOR UPDATE` on parent `playlist` row before calculating `MAX(position) + 1`.
4. `sp_add_track`: Atomic total participation. Inserts into `track`, `track_artist`, and `track_genre` in a single transaction.
5. `sp_remove_artist_from_track`: Row-locks `track` with `FOR UPDATE` and verifies artist count $> 1$ before deletion, preventing tracks from being left with 0 artists.
6. `sp_remove_genre_from_track`: Row-locks `track` with `FOR UPDATE` and verifies genre count $> 1$ before deletion, preventing tracks from being left with 0 genres.

### 3.6 Triggers (`07_triggers.sql`)
1. `trg_free_user_disjoint_check`: `BEFORE INSERT ON free_user`. Rejects insert with SQLSTATE 45000 if `user_id` exists in `premium_user`.
2. `trg_premium_user_disjoint_check`: `BEFORE INSERT ON premium_user`. Rejects insert with SQLSTATE 45000 if `user_id` exists in `free_user`.
3. `trg_recommendation_score_validate`: `BEFORE INSERT ON recommendation`. Validates score $[0.0, 1.0]$ and sets default timestamp to `NOW(3)`.
4. `trg_playlist_track_position_validate`: `BEFORE INSERT ON playlist_track`. Fallback ensuring position is non-null and positive.

### 3.7 Views (`08_views.sql`)
1. `v_track_popularity`: Aggregates play counts and average user ratings per track.
2. `v_listening_detail`: Computes completion percentage and categorizes plays ('Skipped', 'Partial', 'Full Play').
3. `v_user_profile_summary`: Aggregates subscription tier, stream counts, playlist counts, and follower/following metrics.
4. `v_mood_catalogue_overview`: Analyzes average valence, energy, and tempo per mood tag.

### 3.8 Queries, Transactions, Authorization & Optimization
- **`09_queries.sql`**: 20 comprehensive queries covering basic filters, aggregates, `GROUP BY ... HAVING`, multi-table joins, subqueries, **Recursive CTEs** (Q15 mood hierarchy tree, Q16 social follow network), **Window Functions** (Q17 `DENSE_RANK() OVER`, Q18 `SUM() OVER`), and spatial valence/energy range queries.
- **`10_transactions.sql`**: Concrete demonstrations of atomicity, rollback on failure, `ON DUPLICATE KEY UPDATE` re-rating, and referential cascades (`CASCADE`, `RESTRICT`, `SET NULL`).
- **`11_authorization.sql`**: Role-Based Access Control (`role_music_app_backend`, `role_music_analyst`, `role_music_dba`). Enforces least-privilege access where sensitive structural changes must use stored procedures.
- **`12_optimization.sql`**: Performance tuning with `EXPLAIN` and `EXPLAIN ANALYZE` demonstrating index range scans vs full table scans.
- **`13_test_cases.sql`**: Automated assertion test suite logging explicit `PASS`/`FAIL` to a temporary results table.

---

## 4. Phase 3 Audit: Backend Architecture & REST APIs

### 4.1 Backend Architecture & Middleware
- Express app (`src/app.js`) with global CORS, JSON parsing, URL encoding, 404 handler, and MySQL error mapping.
- **`src/config/db.js`**: `mysql2/promise` connection pool (`connectionLimit: 10`, `timezone: '+00:00'`).
- **`src/middleware/auth.js`**: `authenticateToken` extracts Bearer JWT and attaches `req.user`; `optionalAuth` handles optional viewer context.
- **`src/middleware/validate.js`**: Intercepts `express-validator` failures, returning HTTP 400 with field-level details.
- **`src/utils/response.js`**: Standardized JSON response formatting (`sendSuccess`, `sendError`).

### 4.2 Complete REST API Endpoint Inventory (42 Endpoints)

| Route Group | HTTP Method | Path | Auth Required | Description | Database Mechanism |
|---|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | No | Server & DB pool connectivity | `SELECT 1 AS ok` |
| **Auth** | `POST` | `/api/auth/register` | No | User registration with subtype | `CALL sp_register_user(...)` |
| | `POST` | `/api/auth/login` | No | Authenticate user & get JWT | `SELECT ... WHERE username=? OR email=?` + bcrypt compare |
| | `POST` | `/api/auth/logout` | No | Client-side session termination | Stateless message |
| | `GET` | `/api/auth/me` | **Yes** | Current user details & tier | Queries `app_user`, `free_user`, `premium_user`, `fn_age` |
| | `PUT` | `/api/auth/profile` | **Yes** | Update personal profile | Parameterized `UPDATE app_user` |
| | `PUT` | `/api/auth/change-password` | **Yes** | Change user password | Password verification + bcrypt rehash |
| **Users** | `GET` | `/api/users/:id` | Opt | Public user profile & social stats | Outer joins on `user_follow` and `playlist` |
| | `POST` | `/api/users/:id/follow` | **Yes** | Follow target user | `INSERT INTO user_follow` |
| | `DELETE` | `/api/users/:id/unfollow` | **Yes** | Unfollow target user | `DELETE FROM user_follow` |
| | `GET` | `/api/users/:id/followers` | No | List followers of user | `SELECT ... FROM user_follow` |
| | `GET` | `/api/users/:id/following` | No | List users followed by user | `SELECT ... FROM user_follow` |
| **Artists** | `GET` | `/api/artists` | No | List artists with search/pagination | `SELECT ... FROM artist` with album/track aggregates |
| | `GET` | `/api/artists/:id` | No | Artist details, aliases, albums | Queries `artist`, `artist_alias`, `album` |
| | `GET` | `/api/artists/:id/tracks` | No | Tracks performed by artist | Joins `track`, `track_artist`, `album` |
| **Albums** | `GET` | `/api/albums` | No | List albums with search | Joins `album`, `artist`, `track` aggregates |
| | `GET` | `/api/albums/:id` | No | Album details & tracklist | Queries `album` and ordered tracks (`track_no ASC`) |
| **Tracks** | `GET` | `/api/tracks` | No | Multi-criteria track filtering | Dynamic SQL with filters for valence, energy, genre, mood, tempo |
| | `GET` | `/api/tracks/:id` | No | Track details, artists, moods, ratings | Joins `track`, `album`, `track_artist`, `track_mood`, `rating` |
| **Genres** | `GET` | `/api/genres` | No | List all genres with track counts | `SELECT ... FROM genre` $\bowtie$ `track_genre` |
| | `GET` | `/api/genres/:id/tracks` | No | Tracks in a specific genre | Queries `track` via `track_genre` |
| **Moods** | `GET` | `/api/moods` | No | List moods with parent links | Queries `mood` with self-join on `parent_mood_id` |
| | `GET` | `/api/moods/hierarchy` | No | Full mood hierarchy tree | **Recursive CTE** (`WITH RECURSIVE mood_tree`) |
| | `GET` | `/api/moods/:id/tracks` | No | Tracks tagged with mood | Queries `track_mood` ordered by confidence |
| **Listening** | `POST` | `/api/listening-history/listen` | **Yes** | Record track listening event | `INSERT INTO listening_history` |
| | `GET` | `/api/listening-history/history` | **Yes** | Authenticated user history | Queries `listening_history` with completion percentage |
| | `GET` | `/api/listening-history/tracks/:id/summary` | No | Stream metrics for track | Aggregates play counts & unique listeners |
| | `POST` | `/api/listening-history/mood-log` | **Yes** | Log emotional mood session | `INSERT INTO user_mood_log` |
| | `GET` | `/api/listening-history/mood-log/history` | **Yes** | Authenticated user mood logs | Queries `user_mood_log` $\bowtie$ `mood` |
| **Ratings** | `POST` | `/api/ratings` | **Yes** | Rate/re-rate track | `INSERT ... ON DUPLICATE KEY UPDATE` |
| | `DELETE` | `/api/ratings/tracks/:trackId` | **Yes** | Remove track rating | `DELETE FROM rating` |
| | `GET` | `/api/ratings/my-ratings` | **Yes** | Authenticated user ratings | Queries `rating` for `req.user.user_id` |
| | `GET` | `/api/ratings/tracks/:trackId` | No | Public ratings for track | Computes avg rating and list of reviews |
| **Playlists**| `POST` | `/api/playlists` | **Yes** | Create weak entity playlist | `CALL sp_create_playlist(...)` |
| | `GET` | `/api/playlists` | **Yes** | List user playlists | Queries `playlist`, `fn_track_count`, `fn_total_duration` |
| | `GET` | `/api/playlists/:playlistNo` | **Yes** | Playlist details & tracklist | Queries `playlist` and ordered `playlist_track` |
| | `PUT` | `/api/playlists/:playlistNo` | **Yes** | Update playlist name/mood | Parameterized `UPDATE playlist` |
| | `DELETE` | `/api/playlists/:playlistNo` | **Yes** | Delete playlist | Parameterized `DELETE FROM playlist` |
| | `POST` | `/api/playlists/:playlistNo/tracks` | **Yes** | Add track to playlist | `CALL sp_add_track_to_playlist(...)` |
| | `DELETE` | `/api/playlists/:playlistNo/tracks/:trackId`| **Yes** | Remove track from playlist | Parameterized `DELETE FROM playlist_track` |
| **Recs** | `GET` | `/api/recommendations` | **Yes** | Fetch user recommendations | Queries `recommendation` joined with `track` & `mood` |
| | `POST` | `/api/recommendations` | **Yes** | Store new recommendation record | `INSERT INTO recommendation` with `NOW(3)` |

### 4.3 Testing & Execution Status
- **Test Script**: [`backend/test_routes.js`](file:///d:/Development/DBS%20Project/music-mood-recommendation/backend/test_routes.js)
- **Execution Result**: **44/44 tests passed (100% success)**.
- **Verified items**:
  - JWT token generation and cryptographic payload decoding.
  - Express app loading and router mounting.
  - Registration of all 42 REST endpoints with correct HTTP methods and paths.

---

## 5. Frontend Status Audit

### 5.1 What Currently Exists
- Initialized React 19 SPA scaffold created with Vite 8 (`frontend/package.json`).
- Root component [`frontend/src/App.jsx`](file:///d:/Development/DBS%20Project/music-mood-recommendation/frontend/src/App.jsx) contains only a **Phase 1 API health-check diagnostic widget** that fetches `http://localhost:5000/api/health` and displays server/database connectivity status.
- Build test: `npm run build` executes cleanly (`vite build` creates bundle in `dist/` with 0 errors).

### 5.2 What Is Missing (Phase 4 Scope)
The frontend does not yet contain application views or components:
- No authentication state management (login, registration, JWT storage in localStorage/cookies, session recovery).
- No navigation framework (sidebar, header, breadcrumbs, responsive drawer).
- No music player widget (HTML5 audio stream playback, play/pause, seek bar, volume control, track metadata display).
- No mood selection interface (mood picker with intensity slider).
- No catalog browsing views (artist grid/detail, album cards, track listing tables).
- No playlist management UI (create modal, add-to-playlist dropdown, drag/reorder, delete).
- No user profile or social feed (following/followers list, personal listening stats).
- No search/filter bar for valence, energy, genre, or mood.

---

## 6. Completed Features vs. Planned / Incomplete Features

| Feature Category | Implementation Status | Evidence / Verification |
|---|---|---|
| **Database Schema** | **Completed** | Code inspected: `02_schema.sql` defines all 19 BCNF tables with InnoDB, composite keys, and CHECK constraints. |
| **Sample Data** | **Completed** | Code inspected: `04_sample_data.sql` provides consistent records across all 19 tables. |
| **Stored Routines & Triggers** | **Completed** | Code inspected: `05_functions.sql` (5 functions), `06_procedures.sql` (6 procedures), `07_triggers.sql` (4 triggers). |
| **Analytical Queries & Views** | **Completed** | Code inspected: `08_views.sql` (4 views), `09_queries.sql` (20 queries). |
| **Backend REST APIs** | **Completed** | Code inspected & executed: 42 endpoints in 11 modules; `test_routes.js` passed (44/44). |
| **JWT Authentication & Passwords** | **Completed** | Code inspected & executed: bcrypt 12-round hashing, JWT sign/verify passed in `test_routes.js`. |
| **Frontend UI & Player** | **Pending** (Phase 4) | Only diagnostic health check exists in `frontend/src/App.jsx`. |
| **Bloom Filter** | **Planned** (Phase 5) | Reserved for Phase 5 backend JS implementation per project brief. |
| **Valence/Energy Recommendation Engine** | **Planned** (Phase 5) | DB storage/retrieval endpoints exist; scoring algorithm belongs to Phase 5. |

---

## 7. Known Issues, Limitations & Setup Requirements

### 7.1 Database Setup Prerequisite (Local Machine)
- The MySQL 8.0 Windows service (`MYSQL80`) is installed and running on `localhost:3306`.
- Access requires the local administrator/user MySQL root password, which is machine-specific.
- **Action required by the developer**:
  1. Open MySQL Workbench 8.0 CE.
  2. Connect to the local MySQL instance.
  3. Execute `database/00_run_all.sql` (or scripts `01` through `13` sequentially in the Workbench editor).
  4. Verify that `13_test_cases.sql` produces `ALL TESTS PASSED`.
  5. In `backend/.env`, set `DB_PASSWORD=<your_mysql_password>`.

### 7.2 Source Command Limitation in MySQL Workbench
- The master runner `00_run_all.sql` utilizes the `SOURCE` directive. `SOURCE` is a MySQL Command Line Client (`mysql.exe`) directive; it fails if executed directly in the graphical MySQL Workbench query tab.
- Workbench users must open and execute the numbered scripts (`01_create_database.sql` through `13_test_cases.sql`) sequentially.

### 7.3 Ephemeral Node Modules in Workspace
- The workspace root contains build artifacts from package manager runs (`music-mood-backend@1.0.0`, `nodemon`). These are harmless metadata files that do not interfere with `backend/` or `frontend/`.

---

## 8. Permanent Architectural Decisions (Do Not Alter)

The incoming developer/AI agent must respect the following non-negotiable architectural decisions:

1. **Database is MySQL 8.0**: Do NOT switch to PostgreSQL, MongoDB, SQLite, Prisma, or Sequelize.
2. **19 Tables in BCNF**: The schema must remain exactly 19 tables. Do NOT add dummy tables or collapse relational tables.
3. **Weak Entity `playlist`**: `(user_id, playlist_no)` is a composite primary key. `playlist_no` must be sequential per user. Never replace this with a single surrogate `id`.
4. **Composite Foreign Key**: `playlist_track` must maintain its composite foreign key `(user_id, playlist_no)` referencing `playlist`.
5. **ISA Specialization**: `app_user` specialized into `free_user` and `premium_user` must remain disjoint and total.
6. **No Stored Derived Attributes**: Derived attributes (`age`, `play_count`, `completion_pct`, `track_count`, `total_duration`) must be computed on demand via stored functions or views to preserve BCNF.
7. **Re-rating Behavior**: A user has at most one rating per track. Must use `INSERT ... ON DUPLICATE KEY UPDATE`.
8. **Stateless JWT Security**: The backend must never trust user-supplied `user_id` from client request bodies for authenticated actions; identity must always derive from `req.user.user_id`.
9. **Bloom Filter Belongs to Phase 5**: The Bloom Filter must be implemented in Node.js in Phase 5 for recently played track detection; it must not replace MySQL as the source of truth.
10. **Global UI Requirement**: Bright, modern, light-themed interface. **No fake or non-functional buttons, links, or controls.**

---

## 9. Remaining Work: Roadmap to Project Completion

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: DB Design & Normalization        [COMPLETED] │
├────────────────────────────────────────────────────────┤
│  Phase 2: MySQL Database Implementation    [COMPLETED] │
├────────────────────────────────────────────────────────┤
│  Phase 3: Backend REST APIs                [COMPLETED] │
├────────────────────────────────────────────────────────┤
│  Phase 4: Complete Frontend Development    [NEXT]      │
│   ├── Light-themed design system & layout              │
│   ├── Auth state & JWT token management                │
│   ├── Music Player bar (HTML5 audio)                   │
│   ├── Catalogue browser (Tracks, Albums, Artists)      │
│   ├── Mood Picker UI & session logger                  │
│   ├── Playlist manager (Create, Add, Reorder)          │
│   └── User profile & social follower view              │
├────────────────────────────────────────────────────────┤
│  Phase 5: Intelligence, Integration & Viva [FINAL]     │
│   ├── Valence + Energy recommendation algorithm        │
│   ├── JavaScript Bloom Filter implementation           │
│   ├── End-to-end integration testing                   │
│   └── Screenshots, query documentation & viva prep     │
└────────────────────────────────────────────────────────┘
```

---

## 10. Phase 4 & Phase 5 Readiness Guide

### 10.1 Running the Backend for Frontend Development
To run the backend during Phase 4:
```bash
cd "d:\Development\DBS Project\music-mood-recommendation\backend"
npm run dev
```
Backend runs on `http://localhost:5000` with CORS pre-configured to accept `http://localhost:5173`.

### 10.2 Running the Frontend
To run the frontend dev server:
```bash
cd "d:\Development\DBS Project\music-mood-recommendation\frontend"
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 10.3 API Contract Summary for Phase 4 Frontend
All 42 API endpoints documented in [`Phase3-API-Reference.md`](file:///d:/Development/DBS%20Project/music-mood-recommendation/documentation/Phase3-API-Reference.md) return consistent JSON responses:
```json
{
  "success": true,
  "message": "Descriptive status message",
  "data": { ... }
}
```
Or upon error:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

The handover audit is complete. The project is cleanly structured, architecturally sound, and ready for **Phase 4: Complete Frontend Development**.
