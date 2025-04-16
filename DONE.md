# DONE.md

## 2025-04-16
- Created and pushed initial codebase to GitHub (repo: https://github.com/werf22/first-save-after-import-csv-fixing) after cleaning all secrets from git history using BFG Repo-Cleaner.
- Ensured .env files are removed and .gitignore is updated for security.
- All project files and progress are now safely versioned and public.
- Documentation, file structure, and project state are fully up to date.
- Migrated backend from SQLite to PostgreSQL (updated .env, main.py, created DB, initialized schema).
- Patched CSV import script and /tasks/import/csv endpoint to clean all integer fields and skip rows missing required fields (name).
- Added deep cleaning utility to ensure no nan/invalid values reach DB.
- Imported real CSV data using minimal CSV with only `name` field, as backend import endpoint fails on optional fields. See README.md for workaround and TODO.
- Added enrichment script `patch_tasks_enrich.py` to automate PATCH updates for all tasks after minimal CSV import. This script matches tasks by name and updates fields like `description` and `notes` from the original CSV. All tasks are now fully enriched in the database as of 2025-04-16.
- All backend tests pass with PostgreSQL as backend (pytest <2s).
- Fixed TaskTable frontend tests: ensured unique filter aria-labels, aligned test expectations with field keys, made filter logic robust and case-insensitive, and resolved TS errors in mock data. All tests now pass under 40 seconds.
- Next: Continue frontend and backend improvements, always update docs and commit to GitHub after each step.
