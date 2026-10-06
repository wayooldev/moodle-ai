## Purpose

Proporciona captura de errores y señales de salud en web y MCP sin filtrar tokens Moodle, API keys ni secretos OAuth a proveedores externos.

## ADDED Requirements

### Requirement: Error reporting for web and MCP
The system SHALL report unhandled errors and failed requests from the web app and MCP server to the configured error monitoring service in production-like environments.

#### Scenario: API route throws
- **WHEN** an authenticated web API route throws an unexpected error
- **THEN** the error MUST be reported to monitoring with request context that excludes secrets

#### Scenario: MCP request handler fails
- **WHEN** an MCP or OAuth handler throws an unexpected error
- **THEN** the error MUST be reported to monitoring without including Bearer tokens, API keys, or wstoken values

### Requirement: Secret scrubbing
The system MUST scrub or never capture values matching Moodle wstokens, `Authorization` headers, `X-Api-Key`, Clerk secrets, encryption keys, and database URLs in monitoring payloads.

#### Scenario: Error includes Authorization header
- **WHEN** an error event would include an `Authorization: Bearer` header
- **THEN** the monitoring payload MUST redact or omit that header value
