require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Test DB connection before starting
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('[SERVER] Cannot reach MySQL. Check your .env and ensure MySQL is running.');
    // We still start the server so health checks can respond, but warn clearly.
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] Music Mood API running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
