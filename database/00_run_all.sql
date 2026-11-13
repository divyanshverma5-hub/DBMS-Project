-- ============================================================================
-- DATABASE SETUP RUNNER
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Compatibility: MySQL 8.0 CLI / mysqlsh
--
-- IMPORTANT:
-- SOURCE is a MySQL client command, not SQL. Run this file from the MySQL
-- command-line client. In MySQL Workbench, open and execute each numbered
-- file individually in the order listed below.
--
-- This is a fresh/demo setup. 04_sample_data.sql resets and repopulates the
-- demo tables. 15_real_music_catalogue.sql then replaces the demo catalogue
-- and clears track-dependent activity. Back up data before running on a DB
-- containing user activity.
-- ============================================================================

SOURCE 01_create_database.sql;
SOURCE 02_schema.sql;
SOURCE 17_remove_retired_features.sql;
SOURCE 03_indexes.sql;
SOURCE 04_sample_data.sql;
SOURCE 05_functions.sql;
SOURCE 06_procedures.sql;
SOURCE 07_triggers.sql;
SOURCE 08_views.sql;
SOURCE 09_queries.sql;
SOURCE 10_transactions.sql;
SOURCE 11_authorization.sql;
SOURCE 12_optimization.sql;
SOURCE 13_test_cases.sql;
SOURCE 15_real_music_catalogue.sql;
SOURCE 16_artist_images.sql;

SELECT 'DATABASE SETUP COMPLETE' AS status;
