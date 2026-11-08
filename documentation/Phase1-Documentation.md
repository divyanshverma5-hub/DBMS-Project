# Music Mood Recommendation System — Project Documentation

**DBMS Final Project · Phase 1**

---

## 1. Project Overview

The Music Mood Recommendation System is a full-stack web application that connects users with music matched to their current emotional state. The core technical differentiator is a **valence-and-energy scoring engine** that maps musical characteristics to moods, backed by a carefully designed and normalized relational database.

This is primarily a **database-centric** project. The frontend and backend exist to demonstrate and interact with the DBMS concepts implemented in MySQL 8.0.

### Core User Capabilities

| Feature | Description |
|---------|-------------|
| Registration & Auth | Free or Premium account creation with secure password hashing |
| Mood Selection | Users log their current mood with intensity |
| Mood-Based Discovery | Tracks are filtered and scored by valence/energy vs. the selected mood |
| Music Playback | Listening events are recorded to history |
| Playlists | Create, manage, and theme playlists by mood |
| Ratings | Rate tracks 1–5 stars |
| Social | Follow other users; view their activity |
| Recommendations | Personalized track recommendations per mood session |
| Bloom Filter | Probabilistic membership check for previously-heard tracks (Phase 5) |

---

## 2. Functional Requirements

### FR-01: User Management
- FR-01.1: Users can register with a unique username, unique email, and a secure password.
- FR-01.2: Registered users can log in and receive a JWT access token.
- FR-01.3: Every user is classified as Free or Premium (ISA specialization; disjoint, total).
- FR-01.4: Free users have a configurable daily skip limit.
- FR-01.5: Premium users have a plan type and subscription validity period.

### FR-02: Music Catalogue
- FR-02.1: Artists can have multiple aliases.
- FR-02.2: Albums belong to exactly one artist.
- FR-02.3: Tracks belong to exactly one album (singles count as one-track albums).
- FR-02.4: Every track must have at least one performing artist and at least one genre.
- FR-02.5: Tracks carry valence (0–1) and energy (0–1) scores for mood matching.

### FR-03: Mood System
- FR-03.1: Moods are organized in a hierarchy (parent–child tree).
- FR-03.2: Tracks can be tagged with multiple moods with a confidence score.
- FR-03.3: Users can log mood sessions with intensity (1–5).

### FR-04: Listening & Activity
- FR-04.1: Every play event is recorded with timestamp and duration listened.
- FR-04.2: Completion percentage is derived: `(duration_listened / track_duration) × 100`.
- FR-04.3: Users can rate a track once; re-rating overwrites the previous rating.

### FR-05: Playlists
- FR-05.1: Playlists are owned by a user (weak entity with per-user numbering).
- FR-05.2: Playlists can optionally be associated with a mood theme.
- FR-05.3: Tracks in a playlist have an ordered position and an added-at timestamp.

### FR-06: Social
- FR-06.1: Users can follow other users (not themselves).
- FR-06.2: Follow relationships are stored with timestamp.

### FR-07: Recommendations
- FR-07.1: The system generates track recommendations per (user, mood) session.
- FR-07.2: Each recommendation carries a score (0–1) and a generation timestamp (millisecond precision).
- FR-07.3: The same (user, track, mood) combination can be recommended again at a later time.

---

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | All passwords stored as bcrypt hashes (cost factor ≥ 12). No plain-text. |
| NFR-02 | JWT secrets stored only in environment variables; never in source code. |
| NFR-03 | Database credentials stored only in `.env`; excluded from version control. |
| NFR-04 | All SQL executed through parameterized queries to prevent injection. |
| NFR-05 | MySQL connection pool used; not a new connection per request. |
| NFR-06 | CORS configured to allow only the designated frontend origin. |
| NFR-07 | All 19 tables verified in BCNF. |
| NFR-08 | No fake buttons, broken links, or non-functional UI elements. |
| NFR-09 | Light-themed, modern UI (white/off-white backgrounds, clean typography). |
| NFR-10 | Responsive layouts for desktop and mobile. |

---

## 4. Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Database | MySQL | 8.0 | Primary data store |
| DB GUI | MySQL Workbench | 8.0 CE | Schema management, query testing |
| Backend runtime | Node.js | 18+ | JavaScript runtime |
| Backend framework | Express.js | 4.x | REST API server |
| DB driver | mysql2 | 3.x | Async MySQL client with connection pooling |
| Auth — tokens | jsonwebtoken | 9.x | JWT generation and verification |
| Auth — passwords | bcryptjs | 2.x | Password hashing |
| Input validation | express-validator | 7.x | Request body validation |
| Frontend framework | React | 18 | Component-based UI |
| Frontend build | Vite | 5 | Fast HMR dev server + bundler |
| Dev server | nodemon | 3.x | Auto-restart backend on file changes |
| Dev environment | Google Antigravity | — | AI-assisted development |

---

## 5. Database Design Overview

### Design Philosophy

The database is designed to maximize coverage of DBMS course topics while remaining a genuinely useful schema for the application. No table was added solely to increase the count; every table is derived from a legitimate ER construct.

### Key ER Concepts Implemented

| Concept | Implementation |
|---------|---------------|
| Strong entities | 8 entities (app_user, artist, album, track, genre, mood, user_mood_log, listening_history) |
| Weak entity | `playlist` — PK `(user_id, playlist_no)` |
| Composite attribute | `name` → `first_name + last_name` in `app_user` |
| Multivalued attribute | `{alias}` → separate `artist_alias` table |
| Derived attributes | `age()`, `play_count()`, `completion_pct()`, `track_count()`, `total_duration()` |
| ISA specialization | `app_user` → `free_user` / `premium_user` (disjoint, total) |
| Recursive 1:N | Mood hierarchy via `mood.parent_mood_id` |
| Recursive M:N | User follow graph via `user_follow(follower_id, followee_id)` |
| Ternary relationship | `recommendation(user_id, track_id, mood_id)` |
| Total participation | Enforced via NOT NULL FKs + stored procedures |
| Partial participation | Nullable FKs: `mood.parent_mood_id`, `playlist.mood_id` |

### Advanced SQL Features (Phase 2)

| Feature | Usage |
|---------|-------|
| Views | `v_track_popularity`, `v_listening_detail` (completion_pct) |
| Stored functions | `fn_age()`, `fn_play_count()`, `fn_track_count()`, `fn_total_duration()` |
| Stored procedures | `sp_register_user()`, `sp_add_track()`, `sp_remove_artist_from_track()`, `sp_remove_genre_from_track()` |
| Triggers | Disjoint ISA enforcement on `free_user` / `premium_user` |
| Transactions | User registration, track addition |
| Recursive CTEs | Mood hierarchy traversal, follow graph queries |
| Window functions | `RANK()` of tracks within a mood |
| Indexing | Composite indexes on hot query paths |
| Authorization | `GRANT` / `REVOKE` on application DB user |

---

## 6. ER Design Observations

### What Was Reviewed

All four project documents were read and analyzed:
- ER Diagram v2 (Korth-style notation)
- ER to Relational Schema Mapping
- Functional Dependencies and Normalization Report
- Assignment Instructions & Guidelines

### Design Quality Assessment

The existing 19-table design is academically strong. The ER diagram correctly applies all 11 mapping rules (R1–R11). The normalization report's claims are verified — all tables are genuinely in BCNF with correct FDs, candidate keys, and dependency preservation.

### Changes Applied (8 Approved)

| # | Change | Rationale |
|---|--------|-----------|
| 1 | `password_hash VARCHAR(255) NOT NULL` in `app_user` | Required for secure authentication |
| 2 | `UNIQUE(user_id, track_id, mood_id, generated_at)` on `recommendation`; `generated_at DATETIME(3)` | Enforce natural candidate key; ms precision prevents false collisions |
| 3 | Stored procedures for TRACK total participation (not naïve triggers) | Reliable atomic enforcement with proper deletion handling |
| 4 | Stored procedures for ISA total participation | Cannot be enforced declaratively in MySQL |
| 5 | `ON DELETE RESTRICT` on `track_artist.artist_id`, `track_genre.genre_id` | Protects total participation on deletion |
| 6 | `audio_url VARCHAR(500) NULL` in `track` | Required for playback; nullable for sample data |
| 7 | `cover_image_url`, `image_url` in `album`, `artist` (nullable) | Required for UI; nullable for sample data |
| 8 | `profile_image_url VARCHAR(500) NULL` in `app_user` | Required for profile UI; nullable |

---

## 7. Relational Schema Overview

See: **`Phase1-Finalized-Schema.md`** for the complete column-level specification.

Quick summary table:

| Table | PK | Key Constraints |
|-------|----|----------------|
| `app_user` | `user_id` | UK `username`, UK `email`; `password_hash NOT NULL` |
| `free_user` | `user_id` | FK→`app_user`; CASCADE |
| `premium_user` | `user_id` | FK→`app_user`; CHECK `valid_till >= subscribed_on` |
| `artist` | `artist_id` | — |
| `artist_alias` | `(artist_id, alias)` | FK→`artist`; CASCADE |
| `album` | `album_id` | FK→`artist`; RESTRICT |
| `track` | `track_id` | UK`(album_id, track_no)`; CHECK valence/energy 0–1 |
| `genre` | `genre_id` | UK `name` |
| `mood` | `mood_id` | UK `name`; self-ref FK; SET NULL on delete |
| `track_artist` | `(track_id, artist_id)` | FK→`track` CASCADE, →`artist` RESTRICT |
| `track_genre` | `(track_id, genre_id)` | FK→`track` CASCADE, →`genre` RESTRICT |
| `track_mood` | `(track_id, mood_id)` | CHECK confidence 0–1 |
| `user_mood_log` | `log_id` | FK→`app_user` CASCADE; CHECK intensity 1–5 |
| `listening_history` | `listen_id` | FK→`app_user`, `track`; CASCADE both |
| `rating` | `(user_id, track_id)` | CHECK rating 1–5 |
| `user_follow` | `(follower_id, followee_id)` | CHECK `follower <> followee` |
| `playlist` | `(user_id, playlist_no)` | Weak entity; CASCADE on user delete |
| `playlist_track` | `(user_id, playlist_no, track_id)` | Composite FK→`playlist` |
| `recommendation` | `rec_id` | UK`(user_id, track_id, mood_id, generated_at)`; CHECK score 0–1 |

---

## 8. Normalization Review Summary

All 19 tables are verified in **BCNF**:
- **1NF**: Composite attribute flattened; multivalued attribute extracted; no stored derived values.
- **2NF**: No partial dependencies in any composite-key table.
- **3NF**: No transitive dependencies — artist/album/track facts kept in their own tables.
- **BCNF**: Every determinant is a candidate key.
- **Lossless**: Demonstrated via LISTEN_FLAT decomposition (5-step, produces exact tables in schema).
- **Dependency preserving**: All FDs checkable within individual tables.

---

## 9. Five-Phase Development Roadmap

| Phase | Title | Key Deliverables | Status |
|-------|-------|-----------------|--------|
| **1** | DB Design & Foundation | ER review, normalization, schema, project scaffold, environment setup | ✅ Complete |
| **2** | Full DB Implementation | DDL, DML, sample data, queries (10+), views, functions, procedures, triggers, transactions, authorization | 🔜 Next |
| **3** | Backend REST APIs | Auth endpoints, music catalogue APIs, mood/playlist/rating/history/social APIs | ⏳ Future |
| **4** | Frontend UI | Dashboard, library, search, player, mood UI, playlists, profile, history, navigation | ⏳ Future |
| **5** | Intelligence & Finalization | Valence+energy scoring, Bloom Filter, full integration, testing, documentation | ⏳ Future |
