'use strict';

// Coordinates use the conventional audio-feature space:
// valence: negative (0) -> positive (1); energy: calm (0) -> intense (1).
// These are documented product defaults, not clinical or psychological labels.
const MOOD_TARGETS = Object.freeze({
  calm:       { valence: 0.35, energy: 0.20 },
  energetic:  { valence: 0.75, energy: 0.85 },
  sad:        { valence: 0.15, energy: 0.25 },
  happy:      { valence: 0.85, energy: 0.65 },
  focus:      { valence: 0.45, energy: 0.25 },
  euphoric:   { valence: 0.90, energy: 0.95 },
  nostalgic:  { valence: 0.35, energy: 0.35 },
  optimistic: { valence: 0.75, energy: 0.55 },
});

const MAX_DISTANCE = Math.SQRT2;

function getMoodTarget(moodName) {
  if (typeof moodName !== 'string') return null;
  return MOOD_TARGETS[moodName.trim().toLowerCase()] || null;
}

/**
 * Similarity is one minus normalized Euclidean distance in the valence/energy
 * plane. It is deterministic, bounded to [0, 1], and explainable.
 */
function scoreTrackForMood(track, moodName) {
  const target = getMoodTarget(moodName);
  if (!target) {
    throw new RangeError(`No valence/energy target is configured for mood "${moodName}"`);
  }

  if (track.valence === null || track.valence === undefined
      || track.energy === null || track.energy === undefined) {
    return null;
  }

  const valence = Number(track.valence);
  const energy = Number(track.energy);
  if (!Number.isFinite(valence) || !Number.isFinite(energy)
      || valence < 0 || valence > 1 || energy < 0 || energy > 1) {
    return null;
  }

  const distance = Math.hypot(
    valence - target.valence,
    energy - target.energy
  );
  const score = Math.max(0, Math.min(1, 1 - (distance / MAX_DISTANCE)));

  return Number(score.toFixed(6));
}

function rankTracksForMood(tracks, moodName) {
  return tracks
    .map((track) => ({
      ...track,
      score: scoreTrackForMood(track, moodName),
    }))
    .filter((track) => track.score !== null)
    .sort((a, b) => (
      b.score - a.score
      || Number(b.mood_confidence || 0) - Number(a.mood_confidence || 0)
      || Number(a.track_id) - Number(b.track_id)
    ));
}

module.exports = {
  MOOD_TARGETS,
  getMoodTarget,
  scoreTrackForMood,
  rankTracksForMood,
};
