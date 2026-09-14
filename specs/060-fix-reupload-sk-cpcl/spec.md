# Feature Specification: Fix Reupload and Removal of SK CPCL Documents in Regency Verification

**Feature Branch**: `060-fix-reupload-sk-cpcl`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "i can't reupload the sk cpcl documents in the http://localhost:5173/dinas/verifikasi/kabupaten/24 if it's been uploaded before. The hapus button doesn't remove the file"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clear and Remove Uploaded SK CPCL Document (Priority: P1)

As a Regency Dinas Verifier (Dinas Kabupaten), when reviewing a proposal verification submission (at `/dinas/verifikasi/kabupaten/:id`), I want the "Hapus" (delete/remove) button to reliably remove the active uploaded SK CPCL document state so that I can remove an incorrect or outdated document.

**Why this priority**: Without the ability to remove a previously attached SK CPCL document, verifiers cannot correct mistake uploads, blocking the proposal verification workflow.

**Independent Test**: Can be fully tested by opening a proposal with an existing SK CPCL document on Step 3, clicking "Hapus", and verifying that the document state is cleared and the dropzone/file input becomes visible and active again.

**Acceptance Scenarios**:

1. **Given** a proposal verification page with a previously uploaded SK CPCL document displayed, **When** the verifier clicks the "Hapus" button, **Then** the active SK CPCL document state is cleared, the file preview/info card is removed, and the document upload dropzone becomes available again.
2. **Given** a cleared SK CPCL document state after clicking "Hapus", **When** the verifier inspects the file input control, **Then** the file input value is reset so selecting the same file or a new file immediately triggers the file selection handler.

---

### User Story 2 - Re-upload Replacement SK CPCL Document (Priority: P1)

As a Regency Dinas Verifier, after removing a previous SK CPCL document, I want to select and upload a new SK CPCL document so that the proposal contains the updated and correct signed SK CPCL file.

**Why this priority**: Re-uploading is mandatory when updating or replacing invalid/outdated SK CPCL files during verification.

**Independent Test**: Can be tested by removing an existing document, selecting a new valid PDF/Image file via the file picker, and verifying that the new file info is attached and ready for submission.

**Acceptance Scenarios**:

1. **Given** the SK CPCL document state has been cleared, **When** the user drops or selects a new valid SK CPCL document, **Then** the system attaches the new file, displays its file metadata and preview option, and enables saving.
2. **Given** a newly attached replacement SK CPCL document, **When** the user submits or saves the verification step, **Then** the new document replaces the previous SK CPCL document in the verification payload.

---

### User Story 3 - Document Operation Feedback & Validation (Priority: P2)

As a Regency Dinas Verifier, I want clear notification feedback when removing a document and strict validation preventing submission without an SK CPCL file.

**Why this priority**: Prevents accidental empty submissions and provides confidence that the file removal action succeeded.

**Independent Test**: Can be tested by removing the SK CPCL file and attempting to submit, verifying that an informative validation message is displayed.

**Acceptance Scenarios**:

1. **Given** a verifier clicks "Hapus" on an SK CPCL document card, **When** the removal action completes, **Then** a toast notification confirms that the SK CPCL document has been removed.
2. **Given** the SK CPCL document has been removed and no replacement file is uploaded, **When** the verifier attempts to advance or submit the verification, **Then** the system prevents submission and alerts the user that an SK CPCL document is required.

---

### Edge Cases

- **Server-Persisted vs Local Draft File**: If the document was previously persisted on the server, clicking "Hapus" MUST clear the local active store reference and mark the step state as requiring a new document; clicking submit with a new file replaces the remote document.
- **Same File Re-selection**: If a user removes a file and selects a file with the exact same file name/path, the file input `change` event MUST fire reliably because the DOM file input element was reset upon removal.
- **Navigation Away After Removal**: If the user removes a file and navigates between verification steps before saving, the unsaved state removal MUST be maintained consistently within the store session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a working "Hapus" (Remove) action for SK CPCL documents on the Regency Verification page (`/dinas/verifikasi/kabupaten/:id`).
- **FR-002**: Clicking "Hapus" MUST clear the active SK CPCL document state in the verifikasi state store and reset the underlying HTML file input element.
- **FR-003**: System MUST allow users to upload a new replacement SK CPCL document after clearing an existing one.
- **FR-004**: System MUST validate that an SK CPCL document is present before permitting final verification step submission.
- **FR-005**: System MUST display visual feedback (toast notification) upon successful document removal and replacement file selection.

### Key Entities *(include if feature involves data)*

- **VerifikasiUsulanState**: Represents the client-side state for proposal verification, containing step data, temporary uploaded files (including `skCpcl`), and existing proposal document references.
- **DokumenProposal (SK_CPCL)**: The document entity representing the signed SK CPCL file attached to a proposal submission, containing file path/URL, document type, and file metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Regency Dinas Verifiers can successfully remove an uploaded SK CPCL file and upload a replacement document without encountering UI lockup or stale file states.
- **SC-002**: Re-uploading an SK CPCL document after removal requires no more than 3 user clicks (Click Hapus -> Pick file -> Save).
- **SC-003**: Zero instances of silent failure where clicking "Hapus" leaves the previous document attached in state.

## Assumptions

- User has authorized access with `DINAS_KAB` or `DINAS_PROV` role to the Regency Verification detail route.
- Allowed document formats (PDF, JPG, PNG) and file size constraints (up to 5MB) apply to replacement uploads.
- Removal action in the step UI updates the active form state; backend document replacement is finalized upon step submission/save.
