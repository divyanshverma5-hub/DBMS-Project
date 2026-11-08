-- ============================================================================
-- SCRIPT 01: CREATE DATABASE (NON-DESTRUCTIVE)
-- Project: Music Mood Recommendation System (DBMS Final Project)
-- Database: music_mood_db
-- Compatibility: MySQL 8.0 CE
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Note: Non-destructive setup. Does NOT drop existing database or tables.
-- For a full clean wipe & reset, see 00_reset_database_dev_only.sql.
-- ============================================================================

-- Create database with strict Unicode support and accent/case-insensitive collation
CREATE DATABASE IF NOT EXISTS music_mood_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE music_mood_db;

-- Verify database settings
SELECT 
    SCHEMA_NAME AS database_name,
    DEFAULT_CHARACTER_SET_NAME AS character_set,
    DEFAULT_COLLATION_NAME AS collation_name
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'music_mood_db';
