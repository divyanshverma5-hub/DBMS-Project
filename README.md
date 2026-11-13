# 🎵 Music Mood Recommendation System

A full-stack **Music Mood Recommendation System** built as a DBMS final project. It recommends eligible tracks using mood-specific valence and energy targets, while demonstrating relational database design, stored procedures, triggers, views, transactions, indexing, and role-based access.

## Features

- User registration, login, and Free/Premium account types
- Artist, album, track, genre, and mood browsing
- Mood-based recommendations using normalized Euclidean distance in valence/energy space
- Bloom Filter pre-screening of recently heard tracks, with exact MySQL verification to prevent false-positive exclusions
- Listening history, ratings, follows, and playlists
- Authenticated API and role/privilege demonstration in MySQL
- Recommendation generation persisted to the existing `recommendation` table

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

Create the database and run the schema, procedures, triggers, views, seed scripts, and real-music catalogue migration in the order documented in `database/00_run_all.sql`. In MySQL Workbench, run `database/15_real_music_catalogue.sql` manually after the normal setup scripts if you are not using the CLI runner.

**Important:** `database/04_sample_data.sql` truncates and repopulates the project tables. Do not run it against data you need to keep. `database/00_reset_database_dev_only.sql` is destructive and intended only for a clean development reset. The master setup runner executes `database/15_real_music_catalogue.sql` after the sample-data tests to replace fictional artists/tracks with the requested catalogue. This migration deletes track-dependent demo listening history, ratings, playlist entries, and recommendations; it preserves user accounts, playlist records, follows, mood logs, and the mood taxonomy. Do not rerun `04_sample_data.sql` after applying the real catalogue migration.

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
| `RECOMMENDATION_RECENT_DAYS` | Look-back window for previously heard tracks (default `30`, range 1–3650) |

Never commit `.env` files or real credentials.

## Recommendation behavior

The eight seeded moods have documented product-default valence/energy coordinates in `backend/src/lib/recommendationEngine.js`. These coordinates are tunable examples, not psychological or clinical classifications.

The recommendation API:

1. Loads the authenticated user's distinct listening-history track IDs from the configured recent-history window.
2. Builds an ephemeral Bloom Filter from those IDs.
3. Uses the filter to identify possible history matches.
4. Verifies every Bloom-positive candidate against MySQL, so a Bloom false positive cannot wrongly exclude an unheard track.
5. Scores eligible tracks that have valid valence, energy, and a non-empty audio URL.
6. Persists the ranked batch transactionally in the existing `recommendation` table.

Endpoint: `POST /api/recommendations/generate` (JWT required).

Example body:

```json
{ "mood_id": 1, "limit": 20 }
```

The mood must have a configured target. The limit must be an integer from 1 to 50.

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

The relational model contains 19 tables covering user specialization, music catalogue, moods, track relationships, user activity, playlists, and recommendations. The project includes ER-to-relational mapping, normalization documentation, stored procedures, triggers, views, indexes, and sample analytical queries.

## Documentation

See `documentation/` for the Phase 1–5 design, implementation, API, and testing reports.

## Security

- Passwords are stored as bcrypt hashes.
- JWT signing fails closed when a sufficiently long `JWT_SECRET` is not configured.
- Validation responses do not echo submitted field values.
- Database exception messages are logged server-side and are not returned to clients.
- API queries use parameterized SQL.
- Environment files and credentials must remain out of version control.
