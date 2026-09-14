# Research: Fix Reupload and Removal of SK CPCL Documents in Regency Verification

## Executive Summary

The SK CPCL document removal ("Hapus") issue occurs because `StepDataCPCL.vue` computes `activeSkCpcl` as `verifikasiStore.skCpcl || getExistingDoc('SK_CPCL')`. When a document pre-exists on the server proposal payload (`getExistingDoc`), calling `handleRemoveSkCpcl()` sets `verifikasiStore.skCpcl = null`. As a result, the computed property falls back to `getExistingDoc('SK_CPCL')`, leaving the file visually attached and preventing re-upload.

The same pattern affects `beritaAcaraDokumen` and `beritaAcaraLapangan` in the same step.

---

## Research Findings & Technical Decisions

### Decision 1: Explicit Document Removal Flags in `useVerifikasiKabDraftStore`

- **Decision**: Add explicit removal boolean flags or a sentinel state (`skCpclRemoved`, `beritaAcaraDokumenRemoved`, `beritaAcaraLapanganRemoved`) in `useVerifikasiKabDraftStore`.
- **Rationale**:
  - When the user clicks "Hapus", setting `skCpclRemoved = true` (and `skCpcl = null`) allows `activeSkCpcl` to evaluate to `null` regardless of server pre-existing document records.
  - When a new file is uploaded (`handleSkCpclUpload`), `skCpclRemoved` is reset to `false` and `skCpcl` is populated with the newly selected file.
  - Resetting removal flags when initializing or changing proposal IDs ensures fresh state across proposals.
- **Alternatives Considered**:
  - *Direct Mutation of `pengajuan.documents`*: Rejected because `pengajuan` represents the server entity fetched from backend APIs; draft state should be managed locally in `useVerifikasiKabDraftStore`.
  - *Deleting keys from server object*: Rejected because it mutates cached list data and breaks state rollback if the user cancels verification.

---

### Decision 2: Store Method for Clearing & Resetting Document State

- **Decision**: Expose explicit helper actions on `useVerifikasiKabDraftStore`: `removeSkCpcl()`, `uploadSkCpcl(doc)`, `removeBeritaAcaraDokumen()`, etc.
- **Rationale**: Encapsulating setting `skCpcl = null` and `skCpclRemoved = true` within store actions prevents UI components from duplicating state management logic and ensures consistent resets upon proposal switching or submission.

---

### Decision 3: Document Payload Packaging on Step 4 (Summary & Submit)

- **Decision**: Update `StepSummaryDanSubmit.vue` payload builder to respect `skCpclRemoved` and active document overrides when sending document updates to backend.
- **Rationale**: Ensures that if an existing document was marked removed and replaced with a new file, the submission payload correctly serializes the new `DokumenUpload` under `document_type: 'SK_CPCL'`.

---

## Dependencies & Best Practices

- **Vue 3 Reactivity**: Computed properties MUST evaluate removal flags before falling back to `getExistingDoc(...)`.
- **Toast Notifications**: Maintain standard `useToast()` notifications when actions succeed or fail.
- **File Input Reset**: Ensure the HTML `<input type="file">` element key or value is reset upon removal so selecting the same file triggers `@change`.
