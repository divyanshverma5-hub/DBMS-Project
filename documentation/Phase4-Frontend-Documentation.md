# Phase 4 — Complete Frontend Architecture & Implementation Documentation

## Music Mood Recommendation System · React 19 + Vite 8 + Material UI

---

## 1. Frontend Architecture & Directory Structure

The frontend for the **Music Mood Recommendation System** is built as a Single Page Application (SPA) utilizing **React 19**, **Vite 8**, and **Material UI (MUI)**. It adopts a modular, domain-driven structure that interfaces cleanly with the existing 42+ Express REST endpoints without altering database schemas or backend contracts.

### Architectural Layout:
```text
frontend/src/
├── components/
│   ├── common/
│   │   ├── EmptyState.jsx        # Standardized empty records placeholder with actions
│   │   ├── ErrorState.jsx        # Server / DB error card with retry mechanism
│   │   ├── LoadingState.jsx      # Spinner with descriptive context
│   │   └── ProtectedRoute.jsx    # Client-side session and auth guard
│   ├── music/
│   │   ├── AddToPlaylistDialog.jsx # Modal to add song to existing or new playlist
│   │   ├── AlbumCard.jsx         # Card displaying cover artwork, title, artist
│   │   ├── ArtistCard.jsx        # Artist avatar, debut, origin, and albums count
│   │   ├── MoodCard.jsx          # Interactive mood tile with valence/energy color tint
│   │   └── TrackListItem.jsx     # Song item with play toggle, ratings, and playlist action
│   ├── navigation/
│   │   ├── Navbar.jsx            # Top app bar, instant search input, and profile dropdown
│   │   └── Sidebar.jsx           # Responsive drawer navigation & subscription tier badge
│   └── player/
│       └── MusicPlayer.jsx       # Fixed bottom audio player with scrubber, volume, and playback metrics
├── context/
│   ├── AuthContext.jsx           # Stateless JWT lifecycle, user profile state, session restoration
│   └── PlayerContext.jsx         # HTML5 audio player state, queue management, listening duration tracker
├── layouts/
│   └── MainLayout.jsx            # Shell coordinating Sidebar, Navbar, Page views, and Music Player
├── pages/
│   ├── HomePage.jsx              # Discovery hub, mood entry points, featured artists, popular tracks
│   ├── ExplorePage.jsx           # Multi-criteria track search & valence/energy range filters
│   ├── MoodsPage.jsx             # Mood taxonomy, Recursive CTE hierarchy tree (Q15), mood logger
│   ├── ArtistsPage.jsx           # Artists catalogue search and grid
│   ├── ArtistDetailPage.jsx     # Artist biography, aliases (multivalued attribute), discography
│   ├── AlbumsPage.jsx            # Studio albums catalogue and search
│   ├── AlbumDetailPage.jsx      # Album tracklist ordered by track_no
│   ├── PlaylistsPage.jsx         # Weak entity playlist manager (sp_create_playlist)
│   ├── PlaylistDetailPage.jsx   # Ordered tracks (sp_add_track_to_playlist), track deletion
│   ├── HistoryPage.jsx           # Stream completion percentages (fn_completion_pct) & mood sessions
│   ├── RatingsPage.jsx           # Interactive 1-5 star ratings with SQL UPSERT semantics
│   ├── RecommendationsPage.jsx   # Stored ternary recommendations (APP_USER × TRACK × MOOD)
│   ├── ProfilePage.jsx           # Profile editing, password change, ISA specialization details, followers
│   ├── UserProfilePage.jsx       # Public user profile with follow/unfollow social graph
│   ├── LoginPage.jsx             # Authentication form supporting username or email
│   └── RegisterPage.jsx          # Registration form handling total ISA subtype specialization
├── services/
│   ├── api.js                    # Native Fetch API wrapper injecting JWT Bearer tokens
│   ├── authService.js            # Auth endpoints (login, register, me, profile, password)
│   ├── trackService.js           # Catalogue querying, stream history, and mood logging
│   ├── artistService.js          # Artist discography and alias relationships
│   ├── albumService.js           # Album catalogue and ordered tracklists
│   ├── genreMoodService.js       # Genres, moods, and Recursive CTE hierarchy
│   ├── playlistService.js        # Stored-procedure backed playlist operations
│   ├── ratingService.js          # Track ratings and public rating breakdowns
│   ├── userService.js            # Social graph follow/unfollow and public profiles
│   └── recommendationService.js  # Database recommendation retrieval
├── utils/
│   └── formatters.js             # Time duration, timestamp, and percentage formatting
├── theme.js                      # Custom Material UI bright light theme
├── App.jsx                       # React Router v7 routes definition and context provider tree
├── index.css                     # Global reset, typography, and custom scrollbars
└── main.jsx                      # Vite entry point
```

---

## 2. Bright Modern Light Theme Design System

The application strictly implements a **Bright Modern Light Theme** avoiding dark-only, excessive gradient, or administrative dashboard aesthetics:
- **Base Background**: Clean, high-legibility off-white (`#f8fafc`).
- **Surface Cards**: Pure white (`#ffffff`) with subtle 1px border (`#e2e8f0`) and soft elevation on hover.
- **Brand Accents**: Vibrant indigo/violet (`#6366f1`) and soft pink (`#ec4899`).
- **Typography**: Crisp, responsive system sans-serif font stack with high-contrast text (`#0f172a` primary, `#64748b` secondary).
- **Mood Color Palettes**: Individual semantic tints mapped to the 8 mood states (Calm = Sky Blue, Energetic = Amber, Happy = Sunburst Yellow, Focus = Violet, Euphoric = Magenta, Sad = Slate, Nostalgic = Terracotta, Optimistic = Emerald).

---

## 3. Persistent Audio Player & Listening Analytics

Implemented in [`src/context/PlayerContext.jsx`](file:///C:/Users/public/DBMS-Project/frontend/src/context/PlayerContext.jsx) and rendered via [`src/components/player/MusicPlayer.jsx`](file:///C:/Users/public/DBMS-Project/frontend/src/components/player/MusicPlayer.jsx):
1. **Physical HTML5 Audio Playback**: Controls real audio streams from `track.audio_url`.
2. **Audio Availability Validation**: Disables playback and communicates clear user warnings if `audio_url` is missing or invalid.
3. **Playback Scrubbing & Volume**: Smooth seek bar with duration counters and volume adjustment with mute toggle.
4. **Strict Listening History Compliance**:
   - Accumulates genuine listening seconds using audio time-delta tracking.
   - When tracks complete or the user skips after listening for $\ge 3$ seconds, calls `POST /api/listening-history/listen`.
   - Never records full plays merely because playback commenced.
   - Computes derived `completion_pct` via backend stored functions and categorizes streams into *Full Play*, *Partial*, or *Skipped (<30s)*.

---

## 4. Academic Relational Database Concept Integration

| Academic Relational Concept | Database Construct | Frontend Page / Component | User Experience |
|---|---|---|---|
| **Weak Entity Set** | `playlist (user_id, playlist_no)` | `PlaylistsPage.jsx` & `PlaylistDetailPage.jsx` | Sequential playlist numbering generated per user via `sp_create_playlist` without client-side manual index calculation. |
| **Composite Foreign Key** | `playlist_track (user_id, playlist_no, track_id)` | `TrackListItem.jsx` & `AddToPlaylistDialog.jsx` | Unique track positions managed safely by backend stored procedure `sp_add_track_to_playlist`. |
| **ISA Specialization (Total & Disjoint)** | `app_user` $\rightarrow$ `free_user` / `premium_user` | `RegisterPage.jsx` & `ProfilePage.jsx` | Total participation selected during registration; profile displays daily skip limits for Free users or plan validity for Premium users. |
| **Recursive 1:N Relationship** | `mood (mood_id, parent_mood_id)` | `MoodsPage.jsx` | Dual-view toggle displaying visual mood grid and the **Recursive CTE hierarchy tree** (Query 15). |
| **Multivalued Attribute** | `artist_alias {alias}` | `ArtistDetailPage.jsx` | Renders alias chips dynamically associated with the 1NF decomposed relation. |
| **Derived Attributes** | `age()`, `play_count()`, `completion_pct()` | `ProfilePage.jsx`, `TrackListItem.jsx`, `HistoryPage.jsx` | Displays dynamically computed attributes calculated by stored functions (`fn_age`, `fn_play_count`, `fn_completion_pct`). |
| **SQL UPSERT Semantics** | `INSERT ... ON DUPLICATE KEY UPDATE` | `RatingsPage.jsx` & `TrackListItem.jsx` | Submitting a 1–5 star rating updates existing ratings seamlessly without primary key conflicts. |
| **Ternary Relationship** | `recommendation (user_id, track_id, mood_id)` | `RecommendationsPage.jsx` | Displays pre-stored recommendation records with millisecond candidate key precision (`DATETIME(3)`). |

---

## 5. Development & Running Instructions

### Prerequisites
- Node.js v18+ and npm v9+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Application will run at http://localhost:5173
```

### Production Build
```bash
cd frontend
npm run build
# Compiles production distribution to frontend/dist/
```
