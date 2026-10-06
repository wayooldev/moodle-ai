## Purpose

Extiende la superficie MCP/Moodle client con calendario y datos de tareas utilizables por dashboard y chat.

## ADDED Requirements

### Requirement: Calendar and assignment tools
The MCP Moodle client SHALL support fetching calendar/action events and assignment due information usable by tools and the web app.

#### Scenario: Calendar range query
- **WHEN** a tool requests events between two timestamps
- **THEN** the client MUST call Moodle calendar APIs or return a structured empty/fallback result without crashing
