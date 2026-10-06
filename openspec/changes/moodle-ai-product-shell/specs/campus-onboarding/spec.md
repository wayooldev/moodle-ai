## Purpose

Guía al usuario a configurar Moodle URL y wstoken en la primera visita y permite editarlos desde settings.

## ADDED Requirements

### Requirement: First-time campus onboarding
The system SHALL redirect authenticated users without stored Moodle credentials to an onboarding flow to capture Moodle URL and wstoken with a generic URL placeholder.

#### Scenario: First login without credentials
- **WHEN** a signed-in user has no moodle_credentials row
- **THEN** navigation to `/dashboard` MUST redirect to `/onboarding`

### Requirement: Settings entry for campus credentials
The system SHALL expose a header control that opens campus settings to update URL and wstoken after onboarding.

#### Scenario: Update token from settings
- **WHEN** a signed-in user saves new credentials from settings
- **THEN** the system MUST persist encrypted credentials and confirm success
