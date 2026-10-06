## Purpose

Protege endpoints públicos o costosos del monorepo con límites de tasa distribuidos para reducir abuso de OAuth, credentials y MCP.

## ADDED Requirements

### Requirement: Distributed rate limiting on sensitive routes
The system SHALL apply distributed rate limits to at least: MCP OAuth token endpoint, web OAuth create-code, Moodle credentials save, and MCP tool entrypoint.

#### Scenario: Excess token requests from same client identity
- **WHEN** a client exceeds the configured limit for `/oauth/token` within the window
- **THEN** the server MUST respond with HTTP 429 and MUST NOT issue a new token for that request

#### Scenario: Excess credentials saves
- **WHEN** an authenticated user exceeds the credentials POST limit
- **THEN** the API MUST respond with HTTP 429 and MUST NOT persist a new credential for that request

### Requirement: Limit identity and fail-safe behavior
Rate limits MUST key on a stable client identity (authenticated user id when available, otherwise IP or OAuth client id). Transient limiter backend failures MUST fail closed or open according to a documented policy that prefers protecting token issuance from unbounded abuse.

#### Scenario: Authenticated credentials request
- **WHEN** a signed-in user posts credentials
- **THEN** the limit key MUST include that user's id rather than only a shared IP bucket
