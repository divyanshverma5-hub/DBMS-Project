# 🎵 Music Mood Player

A full-stack **Music Mood Player** built as a DBMS final project. Browse a music catalogue, discover tracks by mood, play YouTube-linked songs, create playlists, and review listening and mood history, while demonstrating relational database design, stored procedures, triggers, views, transactions, indexing, and role-based access.

## Features

- User registration, login, and Free/Premium account types
- Artist, album, track, genre, and mood browsing
- YouTube-only playback for catalogue tracks with verified video IDs
- Mood-based catalogue discovery and mood-session logging
- Personal playlists with ordered track insertion and removal
- Listening history with actual playback-duration tracking
- Authenticated API and role/privilege demonstration in MySQL

## Technology

| Layer | Technology |
|---|---|
| Database | MySQL 8.0 |
| Backend | Node.js + Express |
| Frontend | React 19 + Vite |
| Authentication | JWT + bcryptjs |
| Database client | mysql2/promise |
| UI components | Material UI |

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MySQL 8.0
- Git

## Quick start

### 1. Configure MySQL

For a fresh setup, use the MySQL CLI runner `database/00_run_all.sql`. In MySQL Workbench, execute the numbered scripts individually in the order listed in that file. The runner first applies `database/17_remove_retired_features.sql` to remove the obsolete rating/recommendation objects from older installations, then applies the demo seed, DBMS verification suite, real-music catalogue, and artist-image scripts.

**Important:** `database/04_sample_data.sql` truncates and repopulates the project tables. Do not run it against data you need to keep. `database/00_reset_database_dev_only.sql` is destructive and intended only for a clean development reset. The master setup runner executes `database/15_real_music_catalogue.sql` after the sample-data tests to replace fictional artists/tracks with the selected catalogue. The retired-feature migration permanently drops the old rating and recommendation tables. The real-catalogue migration deletes track-dependent demo listening history and playlist entries; it preserves user accounts, playlist records, follows, mood logs, and the mood taxonomy. Do not rerun `04_sample_data.sql` after applying the real catalogue migration. Artist image sources and license attributions are listed in `documentation/artist-image-credits.md`.

For a local development database:

```sql
CREATE DATABASE IF NOT EXISTS music_mood_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

The optional authorization script `database/11_authorization.sql` creates a least-privilege backend account, but its password placeholders must be replaced and its host entry must match the machine running the API. For local development, use a dedicated database account where possible rather than the MySQL root account.

### 2. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your database credentials and a unique JWT secret. Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then run:

```bash
npm run dev
```

The API listens on `http://localhost:5000`; the health endpoint is `http://localhost:5000/api/health`.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally listens on `http://localhost:5173`.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | Runtime environment |
| `FRONTEND_URL` | Allowed frontend CORS origin |
| `DB_HOST`, `DB_PORT` | MySQL host and port |
| `DB_USER`, `DB_PASSWORD` | MySQL credentials |
| `DB_NAME` | Database name (default `music_mood_db`) |
| `JWT_SECRET` | Required random signing secret, at least 32 bytes |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |

Never commit `.env` files or real credentials.

## Tests and builds

Backend tests:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```

A live API/database integration check requires a running MySQL server, the schema and seed data, and a correctly configured local `.env`.

## Database overview

The relational model contains 17 tables covering user specialization, music catalogue, moods, track relationships, user activity, and playlists. The SQL suite includes 18 analytical queries plus stored functions, procedures, triggers, views, transactions, indexes, and role-based access control. The project includes ER-to-relational mapping, normalization documentation, stored procedures, triggers, views, indexes, and sample analytical queries.

## Documentation

See `documentation/` for the Phase 1–5 design, implementation, API, and testing reports.

## Security

- Passwords are stored as bcrypt hashes.
- JWT signing fails closed when a sufficiently long `JWT_SECRET` is not configured.
- Validation responses do not echo submitted field values.
- Database exception messages are logged server-side and are not returned to clients.
- API queries use parameterized SQL.
- Environment files and credentials must remain out of version control.
