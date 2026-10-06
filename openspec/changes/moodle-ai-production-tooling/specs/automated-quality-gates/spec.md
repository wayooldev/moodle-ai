## Purpose

Asegura que cada PR ejecute puertas de calidad automáticas y que la lógica pura del monorepo tenga pruebas unitarias reproducibles con Vitest.

## ADDED Requirements

### Requirement: CI quality workflow
The repository SHALL provide a GitHub Actions workflow that runs on pull requests targeting `dev` and `main` and that executes lint, TypeScript check for the web app, unit tests, and web production build.

#### Scenario: Pull request opened to main
- **WHEN** a pull request targets `main`
- **THEN** the quality workflow MUST run and MUST fail the check if lint, typecheck, unit tests, or web build fail

#### Scenario: MCP image workflow remains independent
- **WHEN** only MCP paths change on `main`
- **THEN** the existing GHCR image workflow MAY still run independently of the quality workflow

### Requirement: Unit tests for crypto and OAuth helpers
The project SHALL include Vitest coverage for AES-GCM encrypt/decrypt roundtrips and for pure OAuth helper behaviors that do not require a live Alexa device.

#### Scenario: Encrypt decrypt roundtrip
- **WHEN** unit tests run with a fixed `TOKEN_ENCRYPTION_KEY`
- **THEN** decrypting a freshly encrypted secret MUST return the original plaintext

#### Scenario: Invalid ciphertext rejected
- **WHEN** unit tests attempt to decrypt tampered ciphertext
- **THEN** decryption MUST fail without returning partial plaintext
