require('dotenv').config();

const { getJwtSecret } = require('./utils/response');
getJwtSecret();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('[SERVER] Cannot reach MySQL. Check backend/.env and ensure MySQL is running.');
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] Music Mood API running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
