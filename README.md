# 🎵 Music Mood Recommendation System

A full-stack **Music Mood Recommendation System** built as a DBMS Final Project.
The application recommends songs based on user moods using valence and energy characteristics from a carefully normalized relational database.

> **Academic Focus:** This project demonstrates practical DBMS concepts — ER modeling, normalization (1NF → BCNF), stored procedures, triggers, views, window functions, recursive CTEs, transactions, and indexing — in a working application.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Roadmap](#development-roadmap)
- [Database Overview](#database-overview)
- [Documentation](#documentation)

---

## Project Overview

Users can:
- Register and log in (Free or Premium account)
- Browse artists, albums, tracks, and genres
- Select their current mood
- Discover tracks recommended by mood (valence + energy scoring)
- Play music and track listening history
- Create and manage playlists
- Rate songs and follow other users
- Receive personalized recommendations

A **Bloom Filter** (probabilistic data structure) will be implemented in Phase 5 for efficient detection of previously heard tracks.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Database** | MySQL 8.0 (MySQL Workbench 8.0 CE) |
| **Backend** | Node.js + Express.js |
| **Frontend** | React 19 + Vite |
| **Auth** | JWT + bcryptjs |
| **DB Client** | mysql2 (promise-based pool) |
| **Dev Tool** | Google Antigravity |

---

## Project Structure

```
music-mood-recommendation/
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── app.js              # Express app, middleware, routes
│   │   ├── config/
│   │   │   └── db.js           # MySQL connection pool
│   │   └── routes/
│   │       └── health.js       # GET /api/health
│   ├── .env                    # Local env vars (not committed)
│   ├── .env.example            # Template for env vars
│   ├── package.json
│   └── .gitignore
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # Root component (Phase 1: health check UI)
│   │   └── App.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/                   # SQL scripts (populated in Phase 2)
│   └── .gitkeep
│
├── documentation/              # Project docs (populated in Phase 1)
│   └── .gitkeep
│
├── .gitignore                  # Root gitignore
└── README.md                   # This file
```

---

## Prerequisites

Before running this project, ensure you have installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | (bundled with Node) |
| MySQL Server | 8.0 | https://dev.mysql.com/downloads/ |
| MySQL Workbench | 8.0 CE | https://dev.mysql.com/downloads/workbench/ |
| Git | Any | https://git-scm.com |

---

## Quick Start

### 1. Clone / navigate to the project

```bash
cd "d:\Development\DBS Project\music-mood-recommendation"
```

### 2. Set up the backend

```bash
cd backend
npm install

# Copy and fill in your environment variables
copy .env.example .env
# Edit .env with your MySQL credentials and a JWT secret
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Create the MySQL database

In MySQL Workbench (or CLI):

```sql
CREATE DATABASE IF NOT EXISTS music_mood_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Then update `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=music_mood_db
```

### 5. Start the backend

```bash
cd backend
npm run dev
# API available at http://localhost:5000
# Check: http://localhost:5000/api/health
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
# UI available at http://localhost:5173
```

---

## Environment Variables

All sensitive configuration is stored in `backend/.env` (never committed to git).

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(your password)* |
| `DB_NAME` | Database name | `music_mood_db` |
| `JWT_SECRET` | JWT signing secret | *(long random string)* |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Development Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | DB Design + Project Foundation | ✅ **Completed** |
| **Phase 2** | Full DB Implementation (19 BCNF tables, DDL, DML, 20 queries, procedures, triggers, RBAC) | ✅ **Completed** |
| **Phase 3** | Backend REST APIs & Authentication (Express, JWT, mysql2 pool, all 42+ endpoints) | ✅ **Completed** |
| **Phase 4** | Complete Frontend UI (React 19 + Vite dashboard, player, mood selector) | ✅ **Completed** |
| **Phase 5** | Recommendation Engine + Bloom Filter + Integration | ⏳ Future |

---

## Database Overview

The database `music_mood_db` consists of **19 tables** covering:

| Group | Tables |
|-------|--------|
| User Management | `app_user`, `free_user`, `premium_user` |
| Music Catalogue | `artist`, `artist_alias`, `album`, `track`, `genre` |
| Mood Classification | `mood`, `track_mood` |
| Relationships | `track_artist`, `track_genre` |
| User Activity | `user_mood_log`, `listening_history`, `rating`, `user_follow` |
| Playlists | `playlist`, `playlist_track` |
| Recommendations | `recommendation` |

**Key design features:**
- **BCNF-normalized** — all 19 tables verified
- **ISA specialization** — `app_user` → `free_user` / `premium_user` (disjoint, total)
- **Weak entity** — `playlist` with composite PK `(user_id, playlist_no)`
- **Ternary relationship** — `recommendation` (APP_USER × TRACK × MOOD)
- **Recursive relationships** — mood hierarchy, user follow graph
- **Mood scoring** — `valence` (positivity) + `energy` (intensity) on every track

---

## Documentation

| Document | Location |
|----------|----------|
| Phase 1 Database Design Review | `documentation/Phase1-Database-Design-Review.md` |
| Phase 1 Finalized Relational Schema | `documentation/Phase1-Finalized-Schema.md` |
| Phase 2 Complete Database Implementation Report | `documentation/Phase2-Database-Implementation-Report.md` |
| Phase 3 Backend Architecture Documentation | `documentation/Phase3-Backend-Documentation.md` |
| Phase 3 REST API Reference Guide | `documentation/Phase3-API-Reference.md` |
| Phase 3 Verification & Testing Report | `documentation/Phase3-Testing-Report.md` |
| Phase 4 Frontend Architecture Documentation | `documentation/Phase4-Frontend-Documentation.md` |
| Phase 4 Frontend Verification & Testing Report | `documentation/Phase4-Testing-Report.md` |
| ER Diagram (v2) | `documentation/Music_Mood_DB_ER_Diagram_v2.pdf` |
| ER to Relational Mapping | `documentation/Music_Mood_DB_ER_to_Relational_Schema_Mapping.pdf` |
| Functional Dependencies & Normalization | `documentation/Music_Mood_DB_Functional_Dependencies_and_Normalization.pdf` |

---

## Audio Assets & Licensing Notice

The sample audio assets referenced in `track.audio_url` point to openly hosted music files provided under permissive creative licenses (Pixabay Audio License / Creative Commons). These assets allow free non-commercial and academic educational usage. In compliance with project guidelines:
- No audio URLs point to proprietary streaming pages or generic YouTube watch links.
- All URLs point to directly streamable audio streams (`.mp3`).
- Audio columns are strictly nullable to avoid blocking sample data creation when offline.

---

## Security Notes

- **Passwords** are hashed with `bcryptjs` (bcrypt, cost factor ≥ 12). Plain-text passwords are never stored or logged.
- **JWT secrets** must be long random strings (≥ 64 bytes). Never use a predictable value.
- **Environment files** (`.env`) are excluded from git via `.gitignore`.
- **SQL injection** is prevented by using parameterized queries via `mysql2` prepared statements.

---

*DBMS Final Project — Phase 1 & Phase 2 complete.*
