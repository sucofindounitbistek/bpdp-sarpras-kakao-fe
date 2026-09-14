# Feature Specification: Remove "Layak / Tidak Layak" Radio Options in BPDP Verifikator View (037-remove-layak-options-bpdp)

**Feature Branch**: `037-remove-layak-options-bpdp`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "BPDP Verifikator yang layak tidak layak apus"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Streamlined BPDP Verification Interface (Priority: P1)

As a BPDP Verifikator officer, when examining proposal verification documents in `CekiBpdpView.vue`, I want the redundant "Layak / Tidak Layak" status selection radio buttons removed from the "Keputusan Kelayakan" section, so that I can directly focus on verifying documents, generating the draft evaluation report, uploading signed documents, and submitting the proposal to BPDP Approval without unnecessary inputs.

**Why this priority**: Simplifies the BPDP verification workflow and eliminates unnecessary input fields.

**Independent Test**: Can be tested by navigating to `/bpdp/ceki/:id` as BPDP Verifikator and inspecting the "Keputusan Kelayakan" action card. The "1. Status Penilaian Kelayakan" radio button group (Layak / Tidak Layak) should no longer be rendered.

**Acceptance Scenarios**:

1. **Given** a BPDP Verifikator is reviewing a proposal at `/bpdp/ceki/:id`, **When** all document items are checked and valid, **Then** the system presents the report generation, upload, and submit actions without rendering the "Layak / Tidak Layak" radio choice section.
2. **Given** the form submission handler, **When** submitting the evaluation report to BPDP Approval, **Then** the system automatically processes the verification without requiring `statusKelayakan` radio input.
3. **Given** a TypeScript build command (`npx vue-tsc -b`), **When** compiling the application, **Then** 0 type errors exist.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the "1. Status Penilaian Kelayakan" radio input group (`Layak` / `Tidak Layak`) from `src/views/bpdp/CekiBpdpView.vue`.
- **FR-002**: System MUST default internal evaluation status to valid/approved when documents pass verification.
- **FR-003**: System MUST preserve all existing document download, upload, and approval modal submission capabilities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 occurrences of "Layak" / "Tidak Layak" radio choices in `CekiBpdpView.vue`.
- **SC-002**: Passing strict TypeScript type check (`npx vue-tsc -b`) with zero errors.

## Assumptions

- Affected view: `src/views/bpdp/CekiBpdpView.vue`.
