'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { filterUnheardCandidates } = require('../src/lib/recommendationHistoryFilter');

test('Bloom positives are checked against the exact history source', async () => {
  const candidates = [{ track_id: 1 }, { track_id: 2 }, { track_id: 3 }];
  const bloom = { has: () => true }; // deliberately models false positives
  const lookedUp = [];
  const result = await filterUnheardCandidates(candidates, bloom, async (ids) => {
    lookedUp.push(...ids);
    return [1, 3]; // only these IDs really occur in the recent history table
  });

  assert.deepEqual(lookedUp, [1, 2, 3]);
  assert.deepEqual(result, [{ track_id: 2 }]);
});

test('Bloom negatives avoid unnecessary exact database lookups', async () => {
  const candidates = [{ track_id: 4 }, { track_id: 5 }];
  const bloom = { has: (id) => id === 4 };
  let lookupCalls = 0;
  const result = await filterUnheardCandidates(candidates, bloom, async (ids) => {
    lookupCalls += 1;
    return ids;
  });

  assert.equal(lookupCalls, 1);
  assert.deepEqual(result, [{ track_id: 5 }]);
});

test('exact lookups are batched to stay below practical SQL parameter limits', async () => {
  const candidates = Array.from({ length: 1200 }, (_, i) => ({ track_id: i + 1 }));
  const bloom = { has: () => true };
  const batchSizes = [];
  const result = await filterUnheardCandidates(candidates, bloom, async (ids) => {
    batchSizes.push(ids.length);
    return ids;
  });

  assert.deepEqual(batchSizes, [500, 500, 200]);
  assert.equal(result.length, 0);
});
