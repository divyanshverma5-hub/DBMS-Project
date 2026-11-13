'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');
const { addTrackToPlaylistRules } = require('../src/validators');

async function validatePlaylistTrackRequest(req) {
  await Promise.all(addTrackToPlaylistRules.map((rule) => rule.run(req)));
  return validationResult(req);
}

test('playlist track route validates the camelCase playlistNo path parameter', async () => {
  const req = {
    params: { playlistNo: '2' },
    body: { track_id: '80' },
  };

  const result = await validatePlaylistTrackRequest(req);
  assert.equal(result.isEmpty(), true);
});

test('playlist track route rejects invalid playlist and track identifiers', async () => {
  const req = {
    params: { playlistNo: 'not-a-number' },
    body: { track_id: '0' },
  };

  const result = await validatePlaylistTrackRequest(req);
  assert.equal(result.isEmpty(), false);
  assert.equal(result.array().length, 2);
});
