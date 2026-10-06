## Purpose

Define pruebas end-to-end de los flujos críticos de la web (Clerk y BYOK) y un smoke controlado del consent Alexa mientras el linking no esté estable.

## ADDED Requirements

### Requirement: Clerk login and dashboard BYOK e2e
The project SHALL provide Playwright tests that cover signing in with Clerk (test mode or mocked) and saving Moodle credentials from the dashboard with the credentials API stubbed or isolated.

#### Scenario: Authenticated user saves wstoken
- **WHEN** an authenticated test user submits a valid Moodle URL and wstoken on the dashboard
- **THEN** the UI MUST show a success confirmation and the credentials request MUST complete without exposing the token in client-side logs assertions

#### Scenario: Unauthenticated user blocked from dashboard
- **WHEN** an unauthenticated browser session visits `/dashboard`
- **THEN** the user MUST be redirected to Clerk sign-in (or equivalent protected route behavior)

### Requirement: Alexa consent smoke until linking is stable
The project SHALL include a Playwright smoke (or stubbed) test for the Alexa consent page that verifies the page renders for an authenticated user without requiring a live Alexa skill or complete OAuth handshake.

#### Scenario: Consent page renders for signed-in user
- **WHEN** an authenticated test user opens the Alexa consent route with stubbed query params
- **THEN** the page MUST render its primary consent UI without crashing

#### Scenario: Full Alexa OAuth handshake deferred
- **WHEN** the Alexa linking integration is incomplete
- **THEN** e2e MUST NOT require a live Alexa device or production redirect URI to pass CI
