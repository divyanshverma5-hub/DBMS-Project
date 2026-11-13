-- ============================================================================
-- SCRIPT 11: DATABASE AUTHORIZATION, ROLES & PRIVILEGES (DCL)
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Demonstrates: Role-Based Access Control (RBAC), Least-Privilege Architecture,
-- Separation of Duties (DBA vs Backend Application vs Analytics),
-- and Procedure-Encapsulated Integrity Enforcement.
-- ============================================================================

USE music_mood_db;

-- ----------------------------------------------------------------------------
-- 1. CLEANUP PREVIOUS ROLES AND USERS (IF RE-RUNNING)
-- ----------------------------------------------------------------------------
DROP ROLE IF EXISTS 'role_music_app_backend';
DROP ROLE IF EXISTS 'role_music_analyst';
DROP ROLE IF EXISTS 'role_music_dba';

DROP USER IF EXISTS 'music_backend_user'@'localhost';
DROP USER IF EXISTS 'music_analyst_user'@'localhost';
DROP USER IF EXISTS 'music_admin_user'@'localhost';

-- ----------------------------------------------------------------------------
-- 2. CREATE ROLES (RBAC: Role-Based Access Control)
-- ----------------------------------------------------------------------------
-- Role A: Backend Application Service (`role_music_app_backend`)
-- Principle of Least Privilege:
-- - Read access on tables and views.
-- - Direct INSERT/UPDATE/DELETE only on everyday operational activity tables (mood logs, listening history).
-- - Sensitive multi-table structural changes (user registration, track creation, playlist sequencing, artist/genre removal)
--   MUST be executed via stored procedures to prevent bypassing critical integrity constraints!
-- - NEVER granted DDL privileges (CREATE, ALTER, DROP).
CREATE ROLE 'role_music_app_backend';

-- Role B: Business Intelligence / Analyst (`role_music_analyst`)
-- Pure read-only access (SELECT) on tables and views. Cannot write or run procedures.
CREATE ROLE 'role_music_analyst';

-- Role C: Database Administrator (`role_music_dba`)
-- Full administrative control over music_mood_db schema and maintenance.
CREATE ROLE 'role_music_dba';

-- ----------------------------------------------------------------------------
-- 3. GRANT PRIVILEGES TO ROLES
-- ----------------------------------------------------------------------------

-- Role A (Backend Application):
-- (1) Read access across all catalogue and user tables
GRANT SELECT ON music_mood_db.* TO 'role_music_app_backend';

-- (2) DML write access ONLY on direct operational user-activity tables:
GRANT INSERT, UPDATE, DELETE ON music_mood_db.listening_history TO 'role_music_app_backend';
GRANT INSERT, UPDATE, DELETE ON music_mood_db.user_mood_log TO 'role_music_app_backend';
GRANT INSERT, UPDATE, DELETE ON music_mood_db.user_follow TO 'role_music_app_backend';
GRANT INSERT, UPDATE, DELETE ON music_mood_db.playlist_track TO 'role_music_app_backend';

-- (3) EXECUTE on stored procedures & functions:
-- Integrity-critical operations (sp_register_user, sp_add_track, sp_create_playlist, 
-- sp_add_track_to_playlist, sp_remove_artist_from_track, sp_remove_genre_from_track)
-- are executed with procedure security, preventing direct bypass of business rules.
GRANT EXECUTE ON music_mood_db.* TO 'role_music_app_backend';

-- Role B (Analyst):
-- Read-only on data tables and views
GRANT SELECT ON music_mood_db.* TO 'role_music_analyst';

-- Role C (DBA):
-- Full administrative access
GRANT ALL PRIVILEGES ON music_mood_db.* TO 'role_music_dba';

-- ----------------------------------------------------------------------------
-- 4. DEMONSTRATE GRANT & REVOKE (LEAST-PRIVILEGE AUDITING)
-- Example: Temporarily grant DELETE on artist to backend, then revoke it
-- to demonstrate that the application must never delete core catalogue data directly.
-- ----------------------------------------------------------------------------
GRANT DELETE ON music_mood_db.artist TO 'role_music_app_backend';
REVOKE DELETE ON music_mood_db.artist FROM 'role_music_app_backend';

-- ----------------------------------------------------------------------------
-- 5. CREATE USERS (DEMO DEPLOYMENT TEMPLATE)
-- Note: Replace placeholders with strong, vault-managed secrets before production.
-- ----------------------------------------------------------------------------
CREATE USER 'music_backend_user'@'localhost' IDENTIFIED BY 'Set_Your_Backend_Password_Here_123!';
CREATE USER 'music_analyst_user'@'localhost' IDENTIFIED BY 'Set_Your_Analyst_Password_Here_123!';
CREATE USER 'music_admin_user'@'localhost'   IDENTIFIED BY 'Set_Your_Admin_Password_Here_123!';

-- ----------------------------------------------------------------------------
-- 6. ASSIGN ROLES TO USERS & ACTIVATE DEFAULT ROLES
-- ----------------------------------------------------------------------------
GRANT 'role_music_app_backend' TO 'music_backend_user'@'localhost';
SET DEFAULT ROLE 'role_music_app_backend' TO 'music_backend_user'@'localhost';

GRANT 'role_music_analyst' TO 'music_analyst_user'@'localhost';
SET DEFAULT ROLE 'role_music_analyst' TO 'music_analyst_user'@'localhost';

GRANT 'role_music_dba' TO 'music_admin_user'@'localhost';
SET DEFAULT ROLE 'role_music_dba' TO 'music_admin_user'@'localhost';

FLUSH PRIVILEGES;

-- ----------------------------------------------------------------------------
-- 7. VERIFY GRANTED PRIVILEGES
-- ----------------------------------------------------------------------------
SHOW GRANTS FOR 'music_backend_user'@'localhost';
SHOW GRANTS FOR 'music_analyst_user'@'localhost';
SHOW GRANTS FOR 'music_admin_user'@'localhost';
