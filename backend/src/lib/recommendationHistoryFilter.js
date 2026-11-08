'use strict';

const LOOKUP_BATCH_SIZE = 500;

/**
 * Uses the Bloom Filter as a fast pre-filter, then verifies every positive
 * against an exact MySQL-backed lookup. False positives must never suppress
 * an unheard candidate.
 */
async function filterUnheardCandidates(candidates, bloom, lookupHeardIds) {
  const possibleMatches = candidates.filter((track) => bloom.has(track.track_id));
  const confirmedHeard = new Set();

  for (let offset = 0; offset < possibleMatches.length; offset += LOOKUP_BATCH_SIZE) {
    const batch = possibleMatches.slice(offset, offset + LOOKUP_BATCH_SIZE);
    const ids = batch.map((track) => track.track_id);
    const exactIds = await lookupHeardIds(ids);
    for (const id of exactIds) confirmedHeard.add(Number(id));
  }

  return candidates.filter((track) => !confirmedHeard.has(Number(track.track_id)));
}

module.exports = { filterUnheardCandidates, LOOKUP_BATCH_SIZE };
