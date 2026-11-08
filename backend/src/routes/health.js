const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

/**
 * GET /api/health
 * Returns server status and DB connectivity.
 */
router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbMessage = '';

  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    if (rows[0].ok === 1) dbStatus = 'connected';
  } catch (err) {
    dbMessage = err.message;
  }

  res.json({
    success: true,
    server: 'online',
    database: dbStatus,
    ...(dbMessage && { dbError: dbMessage }),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
