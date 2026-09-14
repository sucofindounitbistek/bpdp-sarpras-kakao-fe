# Feature Specification: Sarpras Kelapa JWT & Single Sign-On (SSO) Integration (Frontend)

**Feature Branch**: `047-jwt-sso-integration`  
**Created**: 2026-08-28  
**Status**: Draft  
**Input**: User description: "implementasi untuk mengintegrasikan JWT dan alur Single Sign-On (SSO) ke dalam bpdp-sarpras-kelapa-be dan bpdp-sarpras-kelapa-fe."

---

## Clarifications

### Session 2026-08-28
- Q: Saat pengguna mengakses aplikasi Sarpras Kelapa secara langsung tanpa sesi aktif, bagaimana penanganannya? → A: Otomatis redirect pengguna ke URL Login Portal BPDP IAM (Option A).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-Click Single Sign-On from IAM Portal (Priority: P1) 🎯 MVP

As an authorized user navigating from the central BPDP IAM portal, I want to click on the "Sarpras Kelapa" application card and be instantly redirected and logged into the Sarpras Kelapa web application without retyping credentials.

**Why this priority**: Seamless user experience across BPDP ecosystem applications; core MVP requirement.

**Independent Test**: Navigate to Sarpras Kelapa with a valid delegated SSO token in the URL query string, confirm that the token is exchanged and the user lands on the dashboard with their profile loaded.

**Acceptance Scenarios**:
1. **Given** a user clicking the Sarpras Kelapa tile in BPDP IAM, **When** they arrive at Sarpras Kelapa with `?token=<delegated_token>`, **Then** Sarpras Kelapa exchanges the token for an access credential, stores the active user session, cleans the URL parameter, and displays the main dashboard.
2. **Given** an unauthenticated direct visit to Sarpras Kelapa, **When** no active session exists, **Then** the application automatically redirects the user to the central BPDP IAM login portal.

---

### User Story 2 - Role-Based Interface and Navigation Restriction (Priority: P1)

As a user with a specific organizational role (Pemohon, Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS, or Surveyor), I want the Sarpras Kelapa interface to reflect my permissions, authorized menus, and operational views accurately based on central IAM claims.

**Why this priority**: Essential to avoid confusion and enforce separation of duties across multi-tier regional and central authorities.

**Independent Test**: Log in with a "Dinas Kabupaten" profile, verify that only Kabupaten menus are shown and regional jurisdiction filters are applied.

**Acceptance Scenarios**:
1. **Given** an exchanged profile with a specific operational role, **When** the application loads, **Then** only navigation menus and action buttons permitted for that role are accessible.
2. **Given** an unauthorized navigation attempt to a restricted route, **When** the router guard triggers, **Then** the user is redirected to an access-denied page.

---

### User Story 3 - Session Expiration & Re-Authentication (Priority: P2)

As a user whose session has expired or become invalid, I want to be automatically guided to re-authenticate through the BPDP IAM portal without losing my workflow context.

**Why this priority**: Protects sensitive operational data while providing a graceful recovery path.

**Independent Test**: Simulate an expired access credential, attempt a protected action, and verify that the user is guided to log in again.

**Acceptance Scenarios**:
1. **Given** an expired session, **When** the frontend detects invalidity (401 response), **Then** client storage is cleared and the user is redirected to the BPDP IAM portal login screen.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Application MUST intercept the `token` URL query parameter on initial load.
- **FR-002**: Application MUST invoke the central identity exchange endpoint to trade the one-time token for an access token and user profile.
- **FR-003**: Application MUST store authenticated session state and user details in client storage.
- **FR-004**: Application MUST automatically append Bearer access credentials to all backend API calls.
- **FR-005**: Application MUST map central IAM role names to application-level permission enums.
- **FR-006**: Application MUST automatically redirect unauthenticated users to the central BPDP IAM login portal.
- **FR-007**: Application MUST clear session state and redirect cleanly on user logout or session expiration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Single Sign-On handoff completes in under 1.5 seconds under normal network conditions.
- **SC-002**: 100% of API communications with the backend carry the authenticated identity token.
- **SC-003**: 0% manual credential re-entry required when navigating between IAM portal and Sarpras Kelapa.
