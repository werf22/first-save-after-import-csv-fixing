# TASK

## 2025-04-16 (cont’d)
- Verified and installed all backend/frontend dependencies.
- Ran backend and frontend tests (all pass, see DONE.md for details).
- Extended TaskForm to support AI suggestions for Portfolio, Project, Section, and Tags (dropdowns/inputs + accept-suggestion for each)
- Added/updated tests for all new AI suggestion fields (all pass <4s)
- All core features (AI suggestions in TaskForm, per-task AI chat in TaskDetail) are now implemented and fully tested.
- Codebase, documentation, and tests are up to date (see README.md, DONE.md).
- Next: Deployment or further enhancements as needed.

Tags: Productivity, Task Management
AI keywords: Productivity, Task Automation, Workflow Optimization
AI summary: Task management for Cerulík AI involves setting up the project structure, data modeling, backend API development, frontend UI creation, AI integration, and testing phases, with a focus on user authentication, task management, and AI-driven categorization.
Parent item: KÓD Potrebné (https://www.notion.so/K-D-Potrebn-1d675c7df218801dbe7dddc173b8cd28?pvs=21)

# TASK List: Cerulík AI Task Manager (MVP - Initial Phase)

## Phase 0: Setup & Foundation (P1 - Highest)

- [x] Read and analyze all project documentation and CSVs (2025-04-16)
- [x] Create requirements.txt and install all backend dependencies (2025-04-16)
- [x] Design and implement the initial database schema for Tasks and lookup tables (2025-04-16)
- [x] Create and run database initialization script (2025-04-16)
- [x] Implement backend CRUD and CSV import/export endpoints (2025-04-16)
- [x] Add Pytest unit tests for backend endpoints (2025-04-16)
- [x] Set up frontend skeleton with React+Vite (2025-04-16)
- [x] Implement AI chat endpoint and connect to frontend (2025-04-16)
- [x] Backend: **Task model, endpoints, and filtering logic are now 100% synced to CSV/documentation.** (2025-04-16)
- [x] Backend: **All backend tests pass, including tag filtering using LIKE on tags string field.** (2025-04-16)
- [x] Backend: **PATCH endpoint for tasks implemented.** (2025-04-16)
- [x]  Perform manual and automated testing of the core MVP workflow. **Filtering/sorting on exposed fields now robust and fully tested.** (2025-04-16)
- [x]  Fixed Task API response to include all foreign key fields and pass all backend tests (2025-04-16)
- [x]  Setup Git Repository (GitHub, repo: https://github.com/werf22/first-save-after-import-csv-fixing) (2025-04-16)
- [x] Migrate backend from SQLite to PostgreSQL (2025-04-16)
- [x] Patch CSV import and backend to robustly clean data and skip invalid rows (2025-04-16)
- [x] All backend tests pass with PostgreSQL (2025-04-16)
- [x] Fix TaskTable frontend test failures due to ambiguous filter aria-labels and mock API mismatches (2025-04-17)
- [x] Real CSV data imported using minimal CSV with only `name` field (2025-04-16)
- [x] All tasks enriched with description and notes using PATCH and `patch_tasks_enrich.py` (2025-04-16)
- [ ] Backend CSV import endpoint does not support optional fields (description, notes, etc.)—see README.md for workaround and TODO
- [ ]  Choose and setup Frontend framework (React/Vue). Create initial project structure.
- [ ]  Choose and setup Backend framework (Python - Flask/Django). Create initial project structure.
- [ ]  Setup PostgreSQL database (local instance for development).
- [ ]  Define basic project directory structure (frontend, backend, shared types?).
- [ ]  Setup development environment and CI pipeline.
- [ ]  Import real CSV and lookup data using migration script.
- [ ]  Continue frontend work: implement UI controls for filtering/sorting on all fields, refine TaskTable and detail views, integrate task-specific AI chat in Task Detail.
- [ ]  Backend: optimize queries and add indexes for performance, add endpoints for AI chat per task, subtask management, and advanced automation.
- [ ]  Update documentation as new features are added.
- [ ]  Refine UI/UX based on initial usage.

### Where We Ended (2025-04-16)
- All backend CRUD, filtering, sorting, and CSV endpoints are robust and fully tested.
- All date serialization and filtering issues resolved (see DONE.md).
- All backend and frontend tests pass.
- Real CSV and lookup data import is ready and scripts are in place.
- GitHub repository is set up, history cleaned of secrets, and codebase is public: https://github.com/werf22/first-save-after-import-csv-fixing
- Documentation, file structure, and security are up to date.

### How to Continue
- Next step: Continue frontend work (UI controls for filtering/sorting, TaskTable refinement, AI chat in Task Detail)
- Backend: Import real CSV/lookup data, optimize queries, add endpoints for AI chat and automation.
- Always commit and push to GitHub for version tracking.
- Update documentation after each step in TASK.md, README.md, DONE.md, and FILE_STRUCTURE_DOCUMENTATION.md
- All secrets must remain out of git history. Use .env for local secrets only.
- All requirements and dependencies must be installed as needed.
- Follow project conventions and structure as described in documentation.

# ===
# SESSION LOG: 2025-04-16

## What was accomplished (2025-04-16)
- Fixed all React controlled/uncontrolled input warnings in TaskFilter and TaskRow components (frontend).
- Added missing axios mocks for `/api/statuses`, `/api/tags`, `/api/assignees` in TaskTable tests (frontend).
- Corrected TaskRow tests to mock PATCH (not PUT) for updates (frontend).
- Confirmed all main task-related frontend tests (TaskTable, TaskRow, TaskDetail, TaskForm, TaskCreate, Home) pass under 40 seconds.
- Resolved React "act(...)" warning in Home.test.tsx by wrapping render in act().
- All backend and frontend tests pass with no warnings or errors.

## Where We Ended (2025-04-16)
- All backend CRUD, filtering, sorting, and CSV endpoints are robust and fully tested.
- All frontend TaskTable, TaskRow, TaskDetail, TaskForm, TaskCreate, and Home tests pass with no warnings.
- Awaiting real CSV and lookup data for full import.
- Next: Set up Git repo, document structure, and continue with advanced frontend filtering and AI chat features.

## How to Continue
- Set up Git repository if not done.
- Import real CSV and lookup data using migration script.
- Continue frontend work: implement UI controls for filtering/sorting on all fields, refine TaskTable and detail views, integrate task-specific AI chat in Task Detail.
- Backend: optimize queries and add indexes for performance, add endpoints for AI chat per task, subtask management, and advanced automation.
- Update documentation as new features are added.
- Check TASK.md, README.md, and DONE.md for latest progress and next steps.

# ===
