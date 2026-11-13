-- ============================================================================
-- SCRIPT 17: REMOVE RETIRED RATINGS AND RECOMMENDATIONS
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
--
-- Idempotent upgrade step for databases created with an older project schema.
-- Removes the obsolete rating and recommendation features from existing
-- installations. The current schema no longer creates these tables.
--
-- This migration permanently deletes any remaining rating/recommendation data.
-- ============================================================================

USE music_mood_db;

-- The popularity view in older installations depends on the rating table.
-- It is recreated without rating fields by 08_views.sql.
DROP VIEW IF EXISTS v_track_popularity;

-- Remove the trigger before dropping its former target table.
DROP TRIGGER IF EXISTS trg_recommendation_score_validate;

DROP TABLE IF EXISTS recommendation;
DROP TABLE IF EXISTS rating;

SELECT 'Retired rating and recommendation objects removed.' AS migration_status;
