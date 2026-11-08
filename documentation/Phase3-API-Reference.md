# Phase 3 — REST API Reference Guide

## Music Mood Recommendation System

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Send header `Authorization: Bearer <token>` for protected endpoints.

---

### 1. Health Check
- `GET /health` — Check server & MySQL database pool connectivity.

---

### 2. Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user. Fields: `username`, `email`, `password`, `first_name`, `last_name`, `birth_date`, `country`, `account_type` (`free`/`premium`), `plan_type`. |
| `POST` | `/auth/login` | No | Authenticate user. Fields: `login` (username or email), `password`. Returns user object & JWT. |
| `POST` | `/auth/logout` | No | Client-side session logout. |
| `GET` | `/auth/me` | **Yes** | Get current authenticated user profile, age, and subscription tier. |
| `PUT` | `/auth/profile` | **Yes** | Update user fields (`first_name`, `last_name`, `country`, `profile_image_url`, `birth_date`). |
| `PUT` | `/auth/change-password` | **Yes** | Change password (`old_password`, `new_password`). |

---

### 3. Users & Social Follow (`/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | Opt | View public profile of a user (including follower/following counts, is_following flag). |
| `POST` | `/users/:id/follow` | **Yes** | Follow target user. Cannot follow oneself. |
| `DELETE` | `/users/:id/unfollow` | **Yes** | Unfollow target user. |
| `GET` | `/users/:id/followers` | No | List followers of user. |
| `GET` | `/users/:id/following` | No | List users followed by user. |

---

### 4. Artists (`/artists`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/artists` | No | List artists with pagination & search (`?search=&limit=20&offset=0`). |
| `GET` | `/artists/:id` | No | Detailed artist profile, aliases (`artist_alias`), and albums. |
| `GET` | `/artists/:id/tracks` | No | All tracks performed by artist with role (`main`, `featured`, etc.). |

---

### 5. Albums (`/albums`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/albums` | No | List albums with search & track count. |
| `GET` | `/albums/:id` | No | Detailed album information with ordered tracklist. |

---

### 6. Tracks (`/tracks`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/tracks` | No | List tracks with multi-criteria filtering: `search`, `artist_id`, `album_id`, `genre_id`, `mood_id`, `min_valence`, `max_valence`, `min_energy`, `max_energy`, `sort_by`, `limit`, `offset`. |
| `GET` | `/tracks/:id` | No | Detailed track info with performing artists, genres, tagged moods with confidence, and avg rating. |

---

### 7. Genres & Moods (`/genres`, `/moods`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/genres` | No | List all 5 music genres with track counts. |
| `GET` | `/genres/:id/tracks` | No | Tracks classified under specified genre. |
| `GET` | `/moods` | No | List all 8 moods with parent relationships. |
| `GET` | `/moods/hierarchy` | No | **Recursive CTE** mood hierarchy displaying levels and breadcrumbs. |
| `GET` | `/moods/:id/tracks` | No | Tracks tagged with specified mood ordered by confidence. |

---

### 8. Listening History & Mood Logs (`/listening-history`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/listening-history/listen` | **Yes** | Record play event (`track_id`, `duration_listened_sec`). Returns derived `completion_pct`. |
| `GET` | `/listening-history/history` | **Yes** | Fetch authenticated user's chronological stream history. |
| `GET` | `/listening-history/tracks/:id/summary` | No | Aggregated stream metrics for track. |
| `POST` | `/listening-history/mood-log` | **Yes** | Log emotional state session (`mood_id`, `intensity` 1–5). |
| `GET` | `/listening-history/mood-log/history` | **Yes** | Fetch authenticated user's past mood logs. |

---

### 9. Ratings (`/ratings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ratings` | **Yes** | Rate a track 1–5 stars. Implements **UPSERT** (`INSERT ... ON DUPLICATE KEY UPDATE`). |
| `DELETE` | `/ratings/tracks/:trackId` | **Yes** | Remove current user's rating for track. |
| `GET` | `/ratings/my-ratings` | **Yes** | Get all ratings submitted by current user. |
| `GET` | `/ratings/tracks/:trackId` | No | Public ratings breakdown and reviews for track. |

---

### 10. Playlists (`/playlists`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/playlists` | **Yes** | Create playlist. Calls `sp_create_playlist` (concurrency-safe per-user sequential numbering). |
| `GET` | `/playlists` | **Yes** | List authenticated user's playlists with track counts & total duration. |
| `GET` | `/playlists/:playlistNo` | **Yes** | Get playlist details with ordered tracklisting. |
| `PUT` | `/playlists/:playlistNo` | **Yes** | Rename or change mood theme of playlist. |
| `DELETE` | `/playlists/:playlistNo` | **Yes** | Delete playlist. Enforces ownership check. |
| `POST` | `/playlists/:playlistNo/tracks` | **Yes** | Add track. Calls `sp_add_track_to_playlist` (row-locked position allocation). |
| `DELETE` | `/playlists/:playlistNo/tracks/:trackId` | **Yes** | Remove track from playlist. |

---

### 11. Recommendations (`/recommendations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/recommendations` | **Yes** | Fetch recommended tracks for authenticated user, with optional `?mood_id=`. |
| `POST` | `/recommendations` | **Yes** | Store new recommendation record with `DATETIME(3)` millisecond precision. |
