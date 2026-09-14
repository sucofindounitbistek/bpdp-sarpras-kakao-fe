# Feature Specification: Resuming Saved Draft Pekebun Data (Melanjutkan Pengisian Draft Pekebun)

**Feature Branch**: `032-resume-draft-pekebun`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Tambah Data Pekebun Pekebun Save Draft Button untuk tambah data pekebun sudah ada fiturnya tapi untuk melanjutkan pengisian yang simpan draft gimana"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View & Access Saved Pekebun Drafts (Priority: P1)

As a user (e.g., Kelembagaan / Verifikator / Pengusul Pekebun), I want to see a list of my previously saved draft Pekebun data so that I can easily identify which registrations are incomplete and require further information.

**Why this priority**: Without being able to see saved drafts, users cannot locate their draft entries to resume filling them out.

**Independent Test**: Can be tested independently by logging in, navigating to the Pekebun list or Draft tab, and verifying that entries marked with "Draft" status are displayed with action buttons to resume/continue editing.

**Acceptance Scenarios**:

1. **Given** a user has previously saved one or more Pekebun entries as "Draft", **When** they navigate to the Pekebun Management / Proposal page, **Then** they see a dedicated "Draft" status indicator or "Draft Pekebun" filter tab showing all saved drafts.
2. **Given** a draft Pekebun item in the table/list, **When** the user views the action menu for that row, **Then** a "Lanjutkan Pengisian" (Resume Draft) action button is clearly visible alongside "Hapus Draft" (Delete Draft).

---

### User Story 2 - Resume and Edit Draft Form Data (Priority: P1)

As a user, I want to click "Lanjutkan Pengisian" on a draft entry to re-open the form pre-filled with all previously saved data, so that I can continue filling in remaining fields without losing existing inputs.

**Why this priority**: Core user need — allowing seamless continuation of multi-step or detailed form input without starting from scratch.

**Independent Test**: Save a draft with partial fields filled (e.g., NIK, Nama, Alamat), close or reload the application, click "Lanjutkan Pengisian", and verify all previously entered fields and attached files are accurately restored into the form.

**Acceptance Scenarios**:

1. **Given** a saved draft with partial data (e.g., NIK, basic personal details, but missing document attachments or land details), **When** the user clicks "Lanjutkan Pengisian", **Then** the Pekebun form opens with all stored values populated in their respective form inputs.
2. **Given** the form is re-opened in draft resumption mode, **When** the user updates existing fields or fills in missing required fields, **Then** the user can re-save as draft again or proceed to final submission ("Simpan & Ajukan" / "Kirim").

---

### User Story 3 - Finalize and Submit Resumed Draft (Priority: P2)

As a user, I want to submit a completed draft entry so that it changes status from "Draft" to submitted/in-review status and enters the official Sarpras approval workflow.

**Why this priority**: Draft resumption must lead to successful submission to complete the data entry lifecycle.

**Independent Test**: Complete all required fields on a resumed draft, click "Simpan & Kirim", and verify validation passes, the entry moves out of draft state, and appears under submitted items.

**Acceptance Scenarios**:

1. **Given** a resumed draft form where all mandatory validation rules are satisfied, **When** the user clicks "Simpan & Kirim" (Submit), **Then** the system validates the complete dataset, updates status to submitted, and displays a success notification.
2. **Given** a resumed draft form where mandatory fields are still missing, **When** the user clicks "Simpan & Kirim", **Then** validation errors highlight the missing fields and prevent submission while keeping the draft intact.

---

### Edge Cases

- **Concurrent Editing / Stale Draft**: What happens if the same draft is opened in multiple browser tabs or sessions? The system should save changes cleanly or alert the user if the draft timestamp has changed.
- **Draft Deletion**: What happens when a user deletes a draft? A confirmation prompt must be shown, and deleting the draft permanently removes temporary saved data.
- **Outdated Master Data in Draft**: What happens if referenced master data (e.g., Komoditas, Wilayah Kode) changed while the draft was saved? The form should re-validate options on load and flag any invalid choices.
- **Interrupted File Uploads in Draft**: How are attached documents (KTP, KK, Surat Lahan) handled in draft mode? Drafts should retain uploaded file metadata/urls so users do not have to re-upload previously attached documents.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visible list or filtered view of saved Pekebun drafts under the Pekebun Management module.
- **FR-002**: System MUST display a "Lanjutkan Pengisian" (Resume Draft) action button for each draft entry in the table/list.
- **FR-003**: System MUST open the Pekebun multi-step form when "Lanjutkan Pengisian" is clicked, automatically restoring all previously saved values, including personal details, address information, and uploaded document references.
- **FR-004**: System MUST allow users to iteratively re-save updated drafts using the "Simpan Draft" button without triggering full mandatory validation checks.
- **FR-005**: System MUST enforce complete form validation only when the user chooses to final submit ("Simpan & Kirim").
- **FR-006**: System MUST allow users to discard/delete a draft with a confirmation modal prompt.
- **FR-007**: System MUST update the status from "Draft" to active/submitted once a draft is successfully submitted.

### Key Entities *(include if feature involves data)*

- **Pekebun Draft Entry**: Represents a draft record containing partial or complete Pekebun information (NIK, Nama, Alamat, Kelompok Tani, Documents, Status: `DRAFT`).
- **Form State / Draft Storage**: Data entity storing draft field values, step indicator state, and document attachment URLs associated with the draft session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate and open a saved draft via "Lanjutkan Pengisian" in less than 2 clicks from the main Pekebun table.
- **SC-002**: 100% of previously saved form field values and attached file references are correctly populated when resuming a draft.
- **SC-003**: 95% of users successfully complete and submit saved drafts without needing to re-enter previously saved fields.
- **SC-004**: Zero loss of saved draft data during iterative draft updates.

## Assumptions

- The frontend currently has a local or API mechanism for saving Pekebun draft data ("Save Draft" button exists).
- Drafts are associated with the authenticated user/kelembagaan and can be fetched via API or local draft state index.
- Resuming a draft uses the existing Pekebun modal / multi-step form drawer with pre-loaded state.
