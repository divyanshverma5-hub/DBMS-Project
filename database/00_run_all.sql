-- ============================================================================
-- SCRIPT 00: MASTER DATABASE SETUP RUNNER
-- Project: Music Mood Recommendation System
-- Database: music_mood_db
-- Compatibility: MySQL 8.0 CE CLI (Command Line Client)
--
-- IMPORTANT USAGE NOTICE:
-- The `SOURCE` command is a client-side command supported by the MySQL CLI
-- and mysqlsh. It is NOT standard SQL and is NOT supported inside the 
-- graphical MySQL Workbench SQL Editor.
--
-- EXECUTION METHODS:
-- Method A (MySQL CLI / PowerShell):
--   cd "d:\Development\DBS Project\music-mood-recommendation\database"
--   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < 00_run_all.sql
--
-- Method B (MySQL Workbench SQL Editor):
--   Open and execute each file individually in numerical sequence:
--     1.  01_create_database.sql
--     2.  02_schema.sql
--     3.  03_indexes.sql
--     4.  04_sample_data.sql
--     5.  05_functions.sql
--     6.  06_procedures.sql
--     7.  07_triggers.sql
--     8.  08_views.sql
--     9.  09_queries.sql
--     10. 10_transactions.sql
--     11. 11_authorization.sql
--     12. 12_optimization.sql
--     13. 13_test_cases.sql
-- ============================================================================

-- Step 1: Create Database (Non-destructive)
SOURCE 01_create_database.sql;

-- Step 2: Create All 19 BCNF Normalized Relational Tables & Constraints
SOURCE 02_schema.sql;

-- Step 3: Create Secondary Indexes
SOURCE 03_indexes.sql;

-- Step 4: Populate Realistic Sample Data across all 19 Tables
SOURCE 04_sample_data.sql;

-- Step 5: Create Stored Functions (Derived Attributes computation)
SOURCE 05_functions.sql;

-- Step 6: Create Stored Procedures (Atomic multi-table business operations)
SOURCE 06_procedures.sql;

-- Step 7: Create Triggers (Disjoint ISA specialization enforcement)
SOURCE 07_triggers.sql;

-- Step 8: Create Views (Popularity, detail analytics, user summaries)
SOURCE 08_views.sql;

-- Step 9: 20 Production-Grade SQL Queries
SOURCE 09_queries.sql;

-- Step 10: Transactions and Referential Integrity Demonstrations
SOURCE 10_transactions.sql;

-- Step 11: Authorization, Roles & Privilege Controls (DCL)
SOURCE 11_authorization.sql;

-- Step 12: Query Optimization, Index Scanning & EXPLAIN Analysis
SOURCE 12_optimization.sql;

-- Step 13: Run Automated Verification Test Suite (PASS/FAIL Assertions)
SOURCE 13_test_cases.sql;

SELECT '======================================================' AS Status;
SELECT 'COMPLETE MUSIC MOOD DATABASE SUITE DEPLOYED & TESTED!' AS Status;
SELECT '======================================================' AS Status;
