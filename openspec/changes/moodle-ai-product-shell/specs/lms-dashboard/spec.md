## Purpose

Dashboard LMS con cursos, tareas y calendario filtrable alimentado por datos Moodle del usuario.

## ADDED Requirements

### Requirement: Dashboard shows courses assignments and calendar
The authenticated dashboard SHALL show site summary, enrolled courses, assignments with due dates, and a calendar/agenda view with filters (e.g. course, date range, status).

#### Scenario: User with valid campus token
- **WHEN** the user opens `/dashboard` with valid credentials
- **THEN** the UI MUST load site info and courses without requiring a live Alexa device
