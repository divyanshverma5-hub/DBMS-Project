const express = require('express');
const cors = require('cors');

// Routers
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const artistsRouter = require('./routes/artists');
const albumsRouter = require('./routes/albums');
const tracksRouter = require('./routes/tracks');
const genresRouter = require('./routes/genres');
const moodsRouter = require('./routes/moods');
const listeningHistoryRouter = require('./routes/listeningHistory');
const ratingsRouter = require('./routes/ratings');
const playlistsRouter = require('./routes/playlists');
const recommendationsRouter = require('./routes/recommendations');

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Mount API Routes ─────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/genres', genresRouter);
app.use('/api/moods', moodsRouter);
app.use('/api/listening-history', listeningHistoryRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/recommendations', recommendationsRouter);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Centralized Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  // SQL/Database exception handling
  if (err.sqlState || err.errno) {
    console.error(`[DB ERROR ${err.errno || ''} - SQLSTATE ${err.sqlState || ''}]:`, err.message);

    // ER_DUP_ENTRY
    if (err.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: 'A duplicate record already exists in the database.',
        detail: err.message,
      });
    }

    // Custom Stored Procedure / Trigger Signal (SQLSTATE 45000)
    if (err.sqlState === '45000') {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Foreign Key Violation (ER_ROW_IS_REFERENCED / ER_NO_REFERENCED_ROW)
    if (err.errno === 1451 || err.errno === 1452) {
      return res.status(400).json({
        success: false,
        message: 'Referential integrity violation: referenced record does not exist or has active dependents.',
      });
    }
  } else {
    console.error('[UNHANDLED SERVER ERROR]:', err);
  }

  const statusCode = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal server error occurred.',
  };

  // Stack trace only in local development
  if (process.env.NODE_ENV === 'development' && !err.sqlState) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
