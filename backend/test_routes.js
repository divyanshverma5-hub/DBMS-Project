/**
 * Automated Phase 3 Integration & Route Verification Test Script
 */
const { generateToken, JWT_SECRET } = require('./src/utils/response');
const jwt = require('jsonwebtoken');
const app = require('./src/app');

console.log('====================================================');
console.log('PHASE 3 BACKEND VERIFICATION & TEST SUITE');
console.log('====================================================');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// 1. JWT Generation and Verification
const testUser = { user_id: 1, username: 'alex_smith', email: 'alex.smith@example.com' };
const token = generateToken(testUser);
assert(typeof token === 'string' && token.length > 20, 'JWT generateToken returns signed token string');

const decoded = jwt.verify(token, JWT_SECRET);
assert(decoded.user_id === 1 && decoded.username === 'alex_smith', 'JWT verify extracts exact user payload');

// 2. Extract registered routes accurately from Express router stack
const allEndpoints = [];
app._router.stack.forEach((layer) => {
  if (layer.route) {
    const method = Object.keys(layer.route.methods)[0].toUpperCase();
    allEndpoints.push(`${method} ${layer.route.path}`);
  } else if (layer.name === 'router') {
    let prefix = layer.regexp.source
      .replace('^\\', '')
      .replace('\\/?(?=\\/|$)', '')
      .replace(/\\\//g, '/')
      .replace('^', '')
      .replace('?(/|$)', '')
      .replace('(?=/|$)', '');
    
    // Clean regex artifacts
    prefix = prefix.replace(/\/\?.*$/, '');

    layer.handle.stack.forEach((h) => {
      if (h.route) {
        const method = Object.keys(h.route.methods)[0].toUpperCase();
        const routePath = h.route.path === '/' ? '' : h.route.path;
        allEndpoints.push(`${method} ${prefix}${routePath}`);
      }
    });
  }
});

const requiredEndpoints = [
  'GET /api/health',
  'POST /api/auth/register',
  'POST /api/auth/login',
  'POST /api/auth/logout',
  'GET /api/auth/me',
  'PUT /api/auth/profile',
  'PUT /api/auth/change-password',
  'GET /api/users/:id',
  'POST /api/users/:id/follow',
  'DELETE /api/users/:id/unfollow',
  'GET /api/users/:id/followers',
  'GET /api/users/:id/following',
  'GET /api/artists',
  'GET /api/artists/:id',
  'GET /api/artists/:id/tracks',
  'GET /api/albums',
  'GET /api/albums/:id',
  'GET /api/tracks',
  'GET /api/tracks/:id',
  'GET /api/genres',
  'GET /api/genres/:id/tracks',
  'GET /api/moods',
  'GET /api/moods/hierarchy',
  'GET /api/moods/:id/tracks',
  'POST /api/listening-history/listen',
  'GET /api/listening-history/history',
  'GET /api/listening-history/tracks/:id/summary',
  'POST /api/listening-history/mood-log',
  'GET /api/listening-history/mood-log/history',
  'POST /api/ratings',
  'DELETE /api/ratings/tracks/:trackId',
  'GET /api/ratings/my-ratings',
  'GET /api/ratings/tracks/:trackId',
  'POST /api/playlists',
  'GET /api/playlists',
  'GET /api/playlists/:playlistNo',
  'PUT /api/playlists/:playlistNo',
  'DELETE /api/playlists/:playlistNo',
  'POST /api/playlists/:playlistNo/tracks',
  'DELETE /api/playlists/:playlistNo/tracks/:trackId',
  'GET /api/recommendations',
  'POST /api/recommendations',
];

requiredEndpoints.forEach((ep) => {
  const isRegistered = allEndpoints.includes(ep);
  assert(isRegistered, `Endpoint mounted: ${ep}`);
});

console.log('====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log(totalTests === passedTests ? 'ALL VERIFICATION TESTS PASSED!' : 'FAILURES OCCURRED');
console.log('====================================================');
