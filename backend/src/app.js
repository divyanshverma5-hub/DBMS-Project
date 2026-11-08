const express = require('express');
const cors = require('cors');

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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  if (err.sqlState || err.errno) {
    console.error(`[DB ERROR ${err.errno || ''} - SQLSTATE ${err.sqlState || ''}]`, err.message);

    if (err.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: 'A record with the same unique value already exists.',
      });
    }

    if (err.sqlState === '45000') {
      return res.status(400).json({
        success: false,
        message: 'The request violates a database business rule.',
      });
    }

    if (err.errno === 1451 || err.errno === 1452) {
      return res.status(400).json({
        success: false,
        message: 'Referential integrity violation: check the referenced records.',
      });
    }
  } else {
    console.error('[UNHANDLED SERVER ERROR]', err);
  }

  const statusCode = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;
  const response = {
    success: false,
    message: statusCode >= 500
      ? 'An unexpected server error occurred.'
      : (err.publicMessage || err.message || 'The request could not be completed.'),
  };

  if (process.env.NODE_ENV === 'development' && statusCode >= 500 && !err.sqlState) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
