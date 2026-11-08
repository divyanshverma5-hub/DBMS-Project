-- ============================================================================
-- SCRIPT: 00_reset_database_dev_only.sql
-- Project: Music Mood Recommendation System
-- WARNING: DESTRUCTIVE ACTION - DEVELOPMENT ONLY!
-- Completely drops and recreates the music_mood_db database and all objects.
-- DO NOT RUN IN PRODUCTION OR WHEN YOU HAVE UNSAVED DATA.
-- ============================================================================

DROP DATABASE IF EXISTS music_mood_db;

CREATE DATABASE music_mood_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE music_mood_db;

SELECT 'Database music_mood_db has been completely dropped and recreated empty.' AS status;
