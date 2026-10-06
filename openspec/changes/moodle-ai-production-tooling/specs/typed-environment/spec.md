## Purpose

Garantiza que web y MCP arranquen o construyan solo con variables de entorno válidas, tipadas y separadas entre públicas y secretas.

## ADDED Requirements

### Requirement: Web environment validation at build and runtime
The system SHALL validate required web environment variables before the Next.js application builds or serves traffic, distinguishing public (`NEXT_PUBLIC_*`) from secret values.

#### Scenario: Missing required Clerk secret
- **WHEN** `CLERK_SECRET_KEY` is absent or empty at build or server start
- **THEN** the web app MUST fail fast with a clear validation error naming the missing variable

#### Scenario: Public variables available to client
- **WHEN** the web app loads in the browser
- **THEN** only explicitly public variables SHALL be exposed to client bundles

### Requirement: MCP environment validation at boot
The MCP server SHALL validate required environment variables at process boot and MUST refuse to listen if validation fails.

#### Scenario: Missing encryption key
- **WHEN** `TOKEN_ENCRYPTION_KEY` is missing at MCP boot
- **THEN** the process MUST exit (or throw before listen) with an error identifying the missing variable

#### Scenario: Valid configuration allows start
- **WHEN** all required MCP variables pass validation
- **THEN** the server SHALL proceed to bind its HTTP port
