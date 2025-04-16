# FILE_STRUCTURE_DOCUMENTATION.md

## 2025-04-16 (cont’d)
- All dependencies and tests verified as up to date and passing (see DONE.md for details).
- TaskFilter tests added for all filterable fields (see __tests__/TaskFilter.test.tsx).
- CSVControls UI now provides feedback and has full test coverage (see __tests__/CSVControls.test.tsx).
- Project ready for next feature or automation step.

## 2025-04-16
- Initial codebase pushed to GitHub (https://github.com/werf22/first-save-after-import-csv-fixing) after full secret cleanup from git history.
- .env and sensitive files are now gitignored and excluded from all commits.
- Documentation, structure, and conventions are up to date.
- All future changes must be documented here and in README.md, TASK.md, and DONE.md.
- To continue: follow the structure, conventions, and update documentation after every step.

This document provides a comprehensive overview of the file and directory structure of the Cerulík AI Task Manager project. It details every file and folder, their locations, and their purposes, so you always know where to find what you need.

---

## Project Root

- `.DS_Store` — macOS system file, can be ignored.
- `.env` — Environment variables for backend (API keys, DB URIs, etc.).
- `.pytest_cache/` — Pytest's cache directory, contains test run state.
- `.snapshots/` — Stores config and sponsor snapshots for project or automation tools.
- `.windsurfrules` — Project-specific automation and AI rules.
- `DONE.md` — Changelog and record of completed tasks.
- `FILE_STRUCTURE_DOCUMENTATION.md` — This documentation file.
- `PLANNING.md` — Project planning, architecture, and roadmap.
- `README.md` — Main project overview and setup instructions.
- `TASK.md` — Task list, progress log, and status.
- `TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv` — Example CSV for task import/export, defines all task fields.
- `__init__.py` — Marks the root as a Python package (can be empty).
- `__pycache__/` — Python bytecode cache directory (auto-generated, can be ignored).
- `app.log` — Backend log output.
- `backend/` — Contains backend scripts, logs, and data import/export tools.
- `csv_field_documentation.md` — Full documentation of all CSV/database fields.
- `csv_input_form_documentation.md` — Documentation for all input form fields.
- `csv_to_import.csv` — Example or working CSV for task import.
- `csv_to_import_full_semicolon.csv` — Variant of import CSV, semicolon separated.
- `csv_to_import_minimal.csv` — Minimal example CSV for import.
- `csv_to_import_semicolon.csv` — Another semicolon-separated CSV variant.
- `frontend/` — Contains all frontend (React+Vite) source code, assets, and tests.
- `init_db.py` — Script to initialize or reset the database.
- `main.py` — FastAPI backend entrypoint (runs the API server).
- `models.py` — SQLModel and Pydantic models for all entities (Task, Portfolio, etc.).
- `requirements.txt` — Python backend dependencies.
- `tests/` — Backend test suite, test database, and logs.

---

## backend/
- `app.log` — Log output for backend scripts and imports.
- `tasks_parsed.json` — JSON export of parsed tasks from CSV import script.
- `tasks_parsed.sql` — SQL export of parsed tasks (for DB import).
- `scripts/` — Scripts for CSV import/export and migration:
    - `README.md` — Documentation for backend migration/import scripts.
    - `parse_csv_to_db.py` — Main script to parse CSV files and import task data into the backend/database. Handles field mapping, lookups, and validation.
    - `tasks_parsed.json` — Output: parsed tasks as JSON from the import script.

---

## frontend/
- `.env` — Environment variables for the frontend (API URLs, etc.).
- `.gitignore` — Files/folders to ignore in version control for the frontend.
- `README.md` — Frontend-specific documentation and setup instructions.
- `dist/` — Production build output (auto-generated, can be ignored in development).
- `eslint.config.js` — ESLint configuration for code quality.
- `index.html` — Main HTML entrypoint for the React app.
- `jest.config.cjs` — Jest configuration for frontend testing.
- `jest.setup.js` — Setup file for Jest (test environment).
- `node_modules/` — Node.js dependencies (auto-generated, do not edit manually).
- `package-lock.json` — Exact dependency versions for npm.
- `package.json` — NPM/Yarn package manifest (dependencies, scripts, metadata).
- `public/` — Static assets (e.g., icons, images).
- `src/` — Main frontend source code (see below).
- `tests/` — Frontend test files (Jest, React Testing Library).
- `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`, `tsconfig.tsbuildinfo` — TypeScript configuration files.
- `vite.config.ts` — Vite build and dev server configuration.

### frontend/src/
- `App.css` — Main app CSS.
- `App.tsx` — Main React app entrypoint.
- `index.css` — Global CSS.
- `main.tsx` — React/Vite bootstrap.
- `vite-env.d.ts` — Vite/TypeScript environment types.
- `assets/` — Static assets for frontend.
- `components/` — All main React components (see below).
- `__tests__/` — Unit tests for frontend components.
- `pages/` — Page-level React components (e.g., Home page).

#### frontend/src/components/
- `AIChat.tsx` — AI chat UI component.
- `CSVControls.tsx` — Controls for CSV import/export.
- `Layout.tsx` — Main layout/wrapper component.
- `Login.tsx` — Login form.
- `Notification.tsx` — Notification UI.
- `Sidebar.tsx` — Sidebar navigation.
- `TaskCreate.tsx` — Task creation form.
- `TaskDetail.tsx` — Detailed task view.
- `TaskFilter.tsx` — Task filtering controls.
- `TaskForm.tsx` — Task form (edit/create).
- `TaskRow.tsx` — Table row for a single task.
- `TaskTable.tsx` — Main task table/grid.
- `TreeSidebar.tsx` — Sidebar with hierarchical navigation.

#### frontend/src/__tests__/
- `Notification.test.tsx`, `TaskForm.test.tsx`, `TaskRow.test.tsx`, `TaskTable.test.tsx` — Unit tests for major components.

#### frontend/src/pages/
- `Home.tsx` — Home page component.

#### frontend/tests/
- `Home.test.tsx`, `Layout.test.tsx`, `Sidebar.test.tsx`, `TaskCreate.test.tsx`, `TaskDetail.test.tsx`, `TreeSidebar.test.tsx` — Integration and unit tests for frontend pages/components.

---

## tests/
- `.pytest_cache/` — Pytest cache for backend tests.
- `__init__.py` — Marks as Python package.
- `__pycache__/` — Python bytecode cache for tests.
- `app.log` — Log output from test runs.
- `tasks.db` — SQLite test database (auto-created for tests).
- `test_api.py` — Pytest backend API tests (CRUD, filtering, etc.).

---

## Miscellaneous
- `.DS_Store` — macOS file browser metadata (ignore)
- `.pycache__` — Python bytecode cache (ignore)
- `.snapshots/` — Automation/config snapshots:
    - `config.json`, `readme.md`, `sponsors.md` — Config and sponsor data for automation or documentation tools.

---

## Where to Find What

- **Backend API:** `main.py`, `models.py`, `backend/scripts/`
- **Backend now uses PostgreSQL by default.**
- **CSV import/export and all endpoints are robust to invalid data and tested with PostgreSQL.**
- **Frontend UI:** `frontend/src/components/`, `frontend/src/App.tsx`
- **Database Models:** `models.py`
- **CSV Import/Export:** `backend/scripts/parse_csv_to_db.py`, `TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv`
- **Tests:** `tests/test_api.py`, `frontend/src/__tests__/`, `frontend/tests/`
- **Project Tasks/Progress:** `TASK.md`, `DONE.md`
- **Field Documentation:** `csv_field_documentation.md`, `csv_input_form_documentation.md`
- **Setup/Planning:** `README.md`, `PLANNING.md`

---

For any new code, tests, or documentation, follow the conventions and folder structure outlined above. For details on each field or endpoint, see the respective markdown documentation files or code comments.
