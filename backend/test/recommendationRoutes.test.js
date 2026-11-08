'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('mood recommendation generation endpoint is registered', () => {
  const endpoints = [];
  for (const layer of app._router.stack) {
    if (layer.name !== 'router' || !layer.handle.stack) continue;
    const prefix = layer.regexp.source
      .replace('^\\', '')
      .replace('\\/?(?=\\/|$)', '')
      .replace(/\\\//g, '/')
      .replace('^', '')
      .replace('?(/|$)', '')
      .replace('(?=/|$)', '')
      .replace(/\/\?.*$/, '');

    for (const routeLayer of layer.handle.stack) {
      if (!routeLayer.route) continue;
      const method = Object.keys(routeLayer.route.methods)[0].toUpperCase();
      const routePath = routeLayer.route.path === '/' ? '' : routeLayer.route.path;
      endpoints.push(`${method} ${prefix}${routePath}`);
    }
  }

  assert.ok(endpoints.includes('POST /api/recommendations/generate'));
});
