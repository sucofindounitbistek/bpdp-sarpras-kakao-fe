# Feature Specification: Rename Wording Nomor Resi to Nomor Proposal

**Feature Branch**: `010-rename-resi-to-proposal`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "jangan pake nomor resi lagi tapi pake Nomor Proposal jika ada wording nomor resi tolong ganti ke Nomor Proposal"

---

## Specification Details

Rename all visual, user-facing wordings of "Nomor Resi", "No. Resi", "No Resi", or "Resi:" to "Nomor Proposal", "No. Proposal", "No Proposal", or "Proposal:" respectively across all frontend screens, table headers, form placeholders, toasts, and breadcrumbs.

### Important Constraint

- To maintain API compatibility and codebase structural integrity, **do NOT rename code variables, properties, types, or store state attributes** (such as `.nomorResi` or `nomorResi` parameter). Only modify the user-facing text strings/labels rendered in HTML templates or shown in toast alerts.

---

## User Scenarios & Testing

### User Story 1: Tracking and Table Headers (Priority: P1)
As a user (Pekebun, Dinas, BPDP, or Ditjenbun), when I view dashboards or queues, I want to see the column header "Nomor Proposal" instead of "Nomor Resi", so that terms are consistent with standard project terminology.

**Acceptance Scenarios**:
1. **Given** the user is on the Tracking Proposal page, **When** they view the proposal list table, **Then** they see "Nomor Proposal" in the header column.
2. **Given** the user is on Dinas Kabupaten, Dinas Provinsi, or Ditjenbun Pleno pages, **When** they view the evaluation lists, **Then** the table header says "Nomor Proposal".

### User Story 2: Form submission and notifications (Priority: P1)
As a Pekebun, when I submit a new proposal, I want the success alert to display my "Nomor Proposal" instead of "Nomor Resi", so that I have clear documentation.

**Acceptance Scenarios**:
1. **Given** the user submits Step 3 of the proposal wizard, **When** it succeeds, **Then** the toast alert message says: `Pengajuan berhasil dikirimkan! Nomor Proposal: [Nomor]`.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST replace "Nomor Resi", "No. Resi", and "Resi" UI labels with "Nomor Proposal", "No. Proposal", and "Proposal" in all Vue views and components.
- **FR-002**: Technical properties, TS interfaces, and Pinia store properties named `nomorResi` MUST NOT be modified.

## Success Criteria

- **SC-001**: 100% of user-facing UI labels containing "Resi" are replaced with "Proposal".
- **SC-002**: Frontend builds successfully without any broken imports or references.
