# Phase 5 — Recommendation Intelligence & Finalization

## Scope

Phase 5 adds mood-based recommendation generation using track valence and energy, and a Bloom Filter pre-screen for recently heard tracks. The existing 19-table schema is unchanged. The `recommendation` table stores generated results and `listening_history` remains the source of truth for plays.

## Mood target coordinates

| Mood | Valence | Energy |
|---|---:|---:|
| Calm | 0.35 | 0.20 |
| Energetic | 0.75 | 0.85 |
| Sad | 0.15 | 0.25 |
| Happy | 0.85 | 0.65 |
| Focus | 0.45 | 0.25 |
| Euphoric | 0.90 | 0.95 |
| Nostalgic | 0.35 | 0.35 |
| Optimistic | 0.75 | 0.55 |

These are product-level starting coordinates, not clinical or psychological classifications.

## Scoring

For track features `(v, e)` and mood target `(mv, me)`:

`d = sqrt((v - mv)^2 + (e - me)^2)`

`score = clamp(1 - d / sqrt(2), 0, 1)`

Scores are rounded to six decimal places. Tracks with missing or out-of-range features are ignored. Results sort by score descending, mood confidence descending, and track ID ascending.

## Recently heard track filtering

The look-back window is configured by `RECOMMENDATION_RECENT_DAYS` (default 30; accepted range 1–3650). The query uses `listening_history.played_at` and the database server's current timestamp.

A Bloom Filter is built for the user's distinct track IDs in that window. It is only a pre-filter:

- Bloom negatives are treated as not present in the loaded history set.
- Every Bloom positive is checked against MySQL in batches of at most 500 IDs.
- Only exact MySQL matches are excluded, so Bloom false positives do not hide unheard tracks.
- MySQL remains authoritative; the filter is rebuilt for each request and is never persisted.
- Tracks with NULL, empty, or whitespace-only `audio_url`, or missing valence/energy, are not recommendation candidates.

## API

### `POST /api/recommendations/generate`

Requires JWT authentication.

Request:

```json
{ "mood_id": 1, "limit": 20 }
```

`mood_id` must identify a seeded mood with a configured target. `limit` is an integer from 1 to 50 and defaults to 20.

Response data contains the selected mood, recommendation rows, count, Bloom Filter statistics, the number of distinct recently heard tracks, the history-window length, and a scoring description. Rows are persisted transactionally in the existing `recommendation` table. Existing retrieval and manual-store endpoints remain available.

## Security corrections

- JWT signing and verification require a configured secret of at least 32 bytes; there is no predictable fallback.
- Invalid JWTs return 401.
- Validation errors do not echo request values.
- Database errors are logged server-side; raw SQL messages are not returned to API clients.
- Request body size is capped at 1 MB.

## Verification

Run:

```bash
cd backend
npm test
```

Unit tests cover Bloom Filter behavior, exact verification of Bloom positives, false-positive preservation, batched lookups, mood lookup, score bounds, and deterministic ordering. Route verification checks the generation endpoint and returns a failing process exit code if an assertion fails.

A live MySQL/API integration run and frontend production build must still be performed in the target environment. No schema migration is required for these corrections.
