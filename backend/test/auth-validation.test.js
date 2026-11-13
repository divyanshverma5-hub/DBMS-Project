const test = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');
const { registerRules } = require('../src/validators');

async function validateRegistration(overrides = {}) {
  const req = {
    body: {
      username: 'music_user',
      email: 'music.user@example.com',
      password: 'securepass',
      first_name: 'Music',
      last_name: 'User',
      account_type: 'free',
      ...overrides,
    },
    params: {},
    query: {},
    headers: {},
    cookies: {},
  };

  for (const rule of registerRules) {
    await rule.run(req);
  }

  return validationResult(req).array();
}

test('free registration succeeds without a plan_type', async () => {
  const errors = await validateRegistration({ account_type: 'free' });
  assert.deepEqual(errors, []);
});

test('default free registration succeeds when account_type and plan_type are omitted', async () => {
  const errors = await validateRegistration({ account_type: undefined });
  assert.deepEqual(errors, []);
});

test('premium registration still requires a supported plan_type', async () => {
  const errors = await validateRegistration({ account_type: 'premium' });
  assert.ok(errors.some((error) => error.path === 'plan_type'));
});

test('premium registration accepts a supported plan_type', async () => {
  const errors = await validateRegistration({
    account_type: 'premium',
    plan_type: 'standard',
  });
  assert.deepEqual(errors, []);
});
