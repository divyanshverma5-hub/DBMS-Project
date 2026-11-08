# Phase 5 — Recommendation Intelligence & Finalization

## Scope

Phase 5 adds the two deferred features from the project requirements:

1. Mood-based recommendation generation using the track's valence and energy features.
2. A Bloom Filter membership check to screen out tracks already present in the authenticated user's listening history.

The implementation does not change the existing 19-table relational schema. The `recommendation` table remains the persistent record of generated results; `listening_history` remains the authoritative record of plays.

## Mood target coordinates

Valence represents musical positivity (0–1); energy represents intensity (0–1). The engine uses these documented defaults:

| Mood | Target valence | Target energy |
|---|---:|---:|
| Calm | 0.35 | 0.20 |
| Energetic | 0.75 | 0.85 |
| Sad | 0.15 | 0.25 |
| Happy | 0.85 | 0.65 |
| Focus | 0.45 | 0.25 |
| Euphoric | 0.90 | 0.95 |
| Nostalgic | 0.35 | 0.35 |
| Optimistic | 0.75 | 0.55 |

These are product-level starting coordinates for the eight moods already seeded in `mood`. They are not clinical or psychological classifications.

## Scoring algorithm

For a track with valence `v` and energy `e`, and mood target `(mv, me)`, the Euclidean distance is:

`d = sqrt((v - mv)^2 + (e - me)^2)`

The normalized similarity score is:

`score = 1 - d / sqrt(2)`

The result is clamped to `[0, 1]` and rounded to six decimal places. A track exactly at the mood target scores 1. Tracks missing either audio feature are not eligible. Results sort by score descending, then the track's `track_mood.confidence` for the selected mood, then track ID for deterministic ordering.

## Bloom Filter

`backend/src/lib/bloomFilter.js` implements a dependency-free Bloom Filter using a bit buffer and SHA-256-derived double hashing. Its default target false-positive probability is 1%.

For every generation request, the API loads the user's distinct `listening_history.track_id` values from MySQL, builds a fresh filter, and inserts each ID. Candidate tracks for which `filter.has(track_id)` is true are screened out before scoring.

- A Bloom Filter can produce false positives (an unheard track can be screened out).
- It does not produce false negatives for IDs inserted into that same filter.
- The filter is ephemeral and rebuilt for each request, so it cannot become stale across application instances.
- MySQL remains the source of truth; no listening-history records are replaced or deleted.
- Filter sizing and estimated false-positive rate are returned as diagnostic metadata.

## API

### `POST /api/recommendations/generate`

Requires the existing JWT authentication middleware.

Request:

```json
{
  "mood_id": 1,
  "limit": 20
}
```

`mood_id` is required. `limit` defaults to 20 and is clamped to 1–50.

The response data includes:
- `mood`
- `recommendations` with track, artist, album, score, and generated timestamp
- `count`
- `bloom_filter` sizing and estimated false-positive statistics
- `excluded_previously_heard`
- `scoring` description

Generated rows are inserted into `recommendation` in a single transaction with a millisecond-precision timestamp. Existing `GET /api/recommendations` and `POST /api/recommendations` routes are retained for compatibility.

## Frontend integration

The Recommendations page now allows a signed-in user to select a mood and generate a ranked batch. It displays the returned recommendations and Bloom Filter diagnostic summary. The existing stored-recommendation list and playback controls remain in place.

## Tests and verification

Pure unit tests cover Bloom Filter insertion/membership and input validation, mood target lookup, exact-match scoring, invalid feature handling, score ordering, and deterministic tie-breaking.

Run:

```bash
cd backend
npm test
```

The backend route-verification script also checks that `POST /api/recommendations/generate` is mounted.

A live MySQL/API integration test still requires a locally configured `music_mood_db` and valid backend `.env`. The ZIP's `.env` must not be committed or shared; configure credentials locally from `.env.example`.
