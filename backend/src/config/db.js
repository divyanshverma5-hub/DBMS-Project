const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'music_mood_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

/**
 * Tests the MySQL connection. Returns true on success, false on failure.
 * This is called at startup only. Routes use the pool directly.
 */
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] MySQL connection pool established successfully.');
    console.log(`[DB] Connected to: ${process.env.DB_NAME || 'music_mood_db'} @ ${process.env.DB_HOST || 'localhost'}`);
    conn.release();
    return true;
  } catch (err) {
    console.error('[DB] MySQL connection FAILED:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
