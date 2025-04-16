# Cerulík AI Task Manager

## Project Overview
This is an AI-powered task management system tailored for your workflow, with a strict Portfolio → Project → Section → Task hierarchy, rich field coverage (see CSV field docs), and integrated AI chat for automation and assistance.

## Current State (2025-04-16)
- **Backend:**
    - FastAPI + SQLModel (SQLite for dev)
    - All CRUD endpoints for tasks and lookups (Portfolio, Project, Section, Priority, Tag)
    - Robust filtering, sorting, pagination on all exposed fields
    - CSV import/export fully round-trip tested
    - HTTP Basic Auth on all endpoints
    - All backend tests pass (pytest <2s)
    - **Task model and API are now 100% synced to CSV field spec and documentation.**
    - **Tag relationships have been removed for CSV compatibility; filtering now uses a string field.**
    - **PATCH endpoint added for partial task updates.**
- **Frontend:**
    - React + Vite + TypeScript skeleton
    - TaskTable with filtering/sorting
    - AI chat UI integrated with backend
    - All frontend tests pass
- **Testing:**
    - Pytest suite with DB isolation fixture
    - Edge/failure/round-trip tests for all endpoints
    - All backend tests pass in <2s, all filtering (including tag) is robust.
- **Data Migration:**
    - `backend/scripts/parse_csv_to_db.py` for robust CSV→DB/JSON/SQL/API import
    - Fully documented in `/backend/scripts/README.md`

## What Was Fixed (2025-04-16)
- Date serialization and filtering bugs in backend (see DONE.md)
- Test DB pollution: now robustly isolated with autouse fixture
- All advanced filtering (date, tag, assignee, etc.) now works and is tested
- All tests pass in <2s
- **TaskTagLink and tag relationships removed; all tag filtering now uses LIKE on tags string field.**
- **PATCH endpoint for tasks implemented.**

## Where We Ended
- System is robust and ready for real data import and advanced feature work
- All tests (backend/frontend) pass
- Awaiting real CSV and lookup data for full import
- Next: Set up Git repo, finalize documentation, and continue with advanced frontend filtering, AI chat, subtask management, and advanced automation
- **Check TASK.md and DONE.md for latest progress and next steps**

## How to Continue
1. Set up Git repository if not done.
2. Import real CSV and lookup data using migration script.
3. Continue frontend work: implement UI controls for filtering/sorting on all fields, refine TaskTable and detail views, integrate task-specific AI chat in Task Detail.
4. Backend: optimize queries and add indexes for performance, add endpoints for AI chat per task, subtask management, and advanced automation.
5. Update documentation as new features are added.
6. Check TASK.md, README.md, and DONE.md for latest progress and next steps.

## References
- See `TASK.md` for full roadmap and what’s done/what’s next
- See `DONE.md` for detailed changelog
- See `csv_field_documentation.md` and `csv_input_form_documentation.md` for field definitions and mapping
- See `/backend/scripts/README.md` for migration tooling

---

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
