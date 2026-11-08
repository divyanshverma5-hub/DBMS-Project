# Phase 3 — Backend Architecture & Implementation Documentation

## Music Mood Recommendation System · Node.js & Express.js REST API

---

## 1. Backend Architecture Overview

The backend for the **Music Mood Recommendation System** is built on a clean, scalable Layered MVC (Model-Controller-Route-Service) architectural pattern using **Node.js** and **Express.js**.

It connects directly to the **MySQL 8.0** relational database `music_mood_db` created in Phase 2 using the promise-based `mysql2/promise` connection pool.

### Architectural Directory Structure:
```text
backend/
├── src/
│   ├── config/
│   │   └── db.js               # mysql2 connection pool configuration & testConnection
│   ├── controllers/
│   │   ├── authController.js   # Registration (sp_register_user), login, me, profile, change-password
│   │   ├── userController.js   # User profiles, follow graph management
│   │   ├── artistController.js # Artists catalogue, aliases, and track associations
│   │   ├── albumController.js  # Albums catalogue and tracklists
│   │   ├── trackController.js  # Songs list, audio URLs, valence & energy parameters
│   │   ├── genreMoodController.js # Genres, moods, and Recursive CTE mood hierarchy
│   │   ├── activityController.js  # Listening history, playback completion, and mood session logging
│   │   ├── ratingController.js    # 1-5 star ratings with UPSERT on duplicate key
│   │   ├── playlistController.js  # Weak entity playlists (sp_create_playlist & sp_add_track_to_playlist)
│   │   └── recommendationController.js # DB-facing recommendation retrieval & insertion
│   ├── middleware/
│   │   ├── auth.js             # JWT verification (authenticateToken, optionalAuth)
│   │   └── validate.js         # express-validator request inspector
│   ├── routes/
│   │   ├── health.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── artists.js
│   │   ├── albums.js
│   │   ├── tracks.js
│   │   ├── genres.js
│   │   ├── moods.js
│   │   ├── listeningHistory.js
│   │   ├── ratings.js
│   │   ├── playlists.js
│   │   └── recommendations.js
│   ├── utils/
│   │   └── response.js         # Standard JSON response helpers and JWT token generator
│   ├── validators/
│   │   └── index.js            # express-validator validation chains
│   ├── app.js                  # Express app, CORS, routes mounting & global error handler
│   └── index.js                # Server entry point & startup listener
├── .env.example
├── test_routes.js              # Automated route mounting and verification test suite
└── package.json
```

---

## 2. Security & Database Protection

1. **Authentication**: Stateless JSON Web Tokens (JWT) signed with SHA-256 (`jsonwebtoken`). Payload contains `{ user_id, username, email }`. Expiration defaults to 7 days.
2. **Password Hashing**: Industry-standard **bcryptjs** with 12 salt rounds. Plaintext passwords are never stored, logged, or returned in API responses.
3. **No ID-Spoofing / Context Derivation**: Authenticated actions derive user identity strictly from `req.user.user_id` inside the verified token. URL parameters cannot manipulate another user's playlists, ratings, or listening history.
4. **Parameterized SQL Queries**: 100% of queries use MySQL prepared statements with placeholders (`?`). String concatenation is strictly prohibited, providing complete immunity to SQL Injection attacks.
5. **Database Exception Mapping**: Centralized error handler maps MySQL errors (e.g., Error 1062 Duplicate Entry, Error 1451/1452 Foreign Key Violation, SQLSTATE 45000 Custom Signal) to meaningful HTTP status codes (400, 404, 409) without leaking raw server stack traces.

---

## 3. Database Procedures, Functions & Views Reused

| Database Routine / View | File in DB | Reused in Controller | Business Purpose |
|---|---|---|---|
| `sp_register_user` | `06_procedures.sql` | `authController.register` | Enforces Total & Disjoint ISA Specialization on `app_user` $\rightarrow$ `free_user`/`premium_user`. |
| `sp_create_playlist` | `06_procedures.sql` | `playlistController.createPlaylist` | Concurrency-safe per-user sequential numbering (`playlist_no = MAX() + 1`) via row-locking. |
| `sp_add_track_to_playlist` | `06_procedures.sql` | `playlistController.addTrackToPlaylist` | Row-locking position allocation preventing duplicate positions in a playlist. |
| `fn_age` | `05_functions.sql` | `authController.getMe`, `updateProfile` | Calculates user age dynamically from `birth_date`. |
| `fn_play_count` | `05_functions.sql` | `trackController.getTracks`, `getTrackById` | Dynamically aggregates total streams per song. |
| `fn_track_count` | `05_functions.sql` | `playlistController.getUserPlaylists`, `getPlaylistById` | Computes track count for weak entity playlists. |
| `fn_total_duration` | `05_functions.sql` | `playlistController.getUserPlaylists`, `getPlaylistById` | Computes total playlist duration in seconds. |
| **Recursive CTE** (`mood_tree`) | `09_queries.sql` (Q15) | `genreMoodController.getMoodHierarchy` | Traverses recursive 1:N self-relationship `parent_of` with breadcrumb paths. |

---

## 4. Setup & Running Instructions

1. **Install Dependencies**:
   ```bash
   cd "d:\Development\DBS Project\music-mood-recommendation\backend"
   npm install
   ```
2. **Configure Environment**:
   Ensure `backend/.env` has:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=music_mood_db
   JWT_SECRET=your_long_random_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Run Verification Test Suite**:
   ```bash
   node test_routes.js
   ```
