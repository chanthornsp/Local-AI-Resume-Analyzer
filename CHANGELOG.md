# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-05

### Added
- **Unified Run Script**: Added `start.py` to easily launch both backend and frontend services with a single command (`python start.py`).
- **Job Management**: Implemented full Create, Read, Update, Delete (CRUD) functionality for Job Postings in the UI.
- **AI Settings**: Added Temperature control slider in the Settings page to adjust LLM creativity/consistency.
- **Project Icon**: Added application logo/favicon.

### Fixed
- **Build System**: Resolved build errors in the frontend application.
- **Backend Port**: Fixed binding issues on Windows by defaulting to port 5001.
- **Logging**: Improved console logging for background processes in the runner script.

### Changed
- **Documentation**: Updated README with Quick Start guide.
