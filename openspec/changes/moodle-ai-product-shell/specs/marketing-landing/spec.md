## Purpose

Landing de marketing del producto con CTA de autenticación Clerk y narrativa clara del valor Moodle AI.

## ADDED Requirements

### Requirement: Professional landing with sign-in CTA
The system SHALL present a marketing landing at `/` with brand-forward hero, supporting sections, and a primary call-to-action that starts Clerk sign-in.

#### Scenario: Signed-out visitor
- **WHEN** a signed-out user visits `/`
- **THEN** they MUST see a primary CTA to sign in or sign up and MUST NOT see campus-specific school URLs as defaults
