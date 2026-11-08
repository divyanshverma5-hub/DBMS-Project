'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const BloomFilter = require('../src/lib/bloomFilter');
const {
  getMoodTarget,
  scoreTrackForMood,
  rankTracksForMood,
} = require('../src/lib/recommendationEngine');

test('Bloom filter recognizes every inserted track identifier', () => {
  const filter = new BloomFilter(100, 0.01);
  const ids = Array.from({ length: 100 }, (_, index) => index + 1);
  ids.forEach((id) => filter.add(id));

  for (const id of ids) assert.equal(filter.has(id), true);
  assert.equal(filter.getStats().inserted_items, 100);
});

test('Bloom filter supports an empty history without matching arbitrary IDs', () => {
  const filter = new BloomFilter(1, 0.01);
  assert.equal(filter.has(42), false);
  assert.equal(filter.getEstimatedFalsePositiveRate(), 0);
});

test('Bloom filter validates sizing parameters', () => {
  assert.throws(() => new BloomFilter(0, 0.01), /positive integer/);
  assert.throws(() => new BloomFilter(10, 1), /between 0 and 1/);
});

test('mood targets are case-insensitive and unknown moods are explicit', () => {
  assert.deepEqual(getMoodTarget('CALM'), { valence: 0.35, energy: 0.2 });
  assert.equal(getMoodTarget('unmapped mood'), null);
});

test('exact mood target receives a perfect recommendation score', () => {
  assert.equal(scoreTrackForMood({ valence: 0.35, energy: 0.2 }, 'Calm'), 1);
});

test('recommendation score is bounded and rejects missing/out-of-range features', () => {
  assert.equal(scoreTrackForMood({ valence: 1, energy: 1 }, 'Sad') >= 0, true);
  assert.equal(scoreTrackForMood({ valence: null, energy: 0.2 }, 'Calm'), null);
  assert.equal(scoreTrackForMood({ valence: 1.2, energy: 0.2 }, 'Calm'), null);
});

test('ranker sorts by mood similarity and uses mood confidence as tie-breaker', () => {
  const ranked = rankTracksForMood([
    { track_id: 3, valence: 0.35, energy: 0.2, mood_confidence: 0.2 },
    { track_id: 2, valence: 0.35, energy: 0.2, mood_confidence: 0.9 },
    { track_id: 1, valence: 0.9, energy: 0.9, mood_confidence: 1 },
  ], 'Calm');

  assert.deepEqual(ranked.map((track) => track.track_id), [2, 3, 1]);
  assert.equal(ranked[0].score, 1);
});
