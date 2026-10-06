## Purpose

Chat agente con Gemini Flash gratuito que usa tools Moodle del usuario con rate limiting, anti prompt-injection y observabilidad Langfuse.

## ADDED Requirements

### Requirement: Gemini campus chat with Moodle tools
The system SHALL provide an authenticated chat that uses `gemini-2.0-flash` (or documented free-tier Flash equivalent) and MAY call allowlisted Moodle tools for the current user.

#### Scenario: Ask about courses
- **WHEN** the user asks what courses they have
- **THEN** the agent MUST be able to retrieve enrolled courses via tools and answer without exposing the wstoken

### Requirement: Chat security and observability
Chat endpoints MUST apply rate limiting, resist prompt-injection override attempts via a fixed system policy, and emit Langfuse traces that scrub secrets.

#### Scenario: Rate limit exceeded
- **WHEN** a user exceeds the chat rate limit
- **THEN** the API MUST respond with HTTP 429
