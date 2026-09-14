# Implementation Plan: Fix Reupload and Removal of SK CPCL Documents in Regency Verification

**Branch**: `060-fix-reupload-sk-cpcl` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/060-fix-reupload-sk-cpcl/spec.md`

## Summary

In the Regency Verification view (`/dinas/verifikasi/kabupaten/:id`), clicking the "Hapus" button on a pre-existing SK CPCL document fails to remove the document because `StepDataCPCL.vue` computes `activeSkCpcl` as `verifikasiStore.skCpcl || getExistingDoc('SK_CPCL')`. Setting `verifikasiStore.skCpcl = null` causes the computed property to fall back to `getExistingDoc('SK_CPCL')`.

To fix this, we introduce explicit document removal tracking in `useVerifikasiKabDraftStore` (`skCpclRemoved`, `beritaAcaraDokumenRemoved`, `beritaAcaraLapanganRemoved`) and update resolution logic in `StepDataCPCL.vue` and `StepSummaryDanSubmit.vue` so that clicking "Hapus" explicitly clears document display and enables fresh re-uploads.

---

## Technical Context

**Language/Version**: TypeScript strict mode (`vue-tsc`), Vue 3 Composition API (`<script setup>`)

**Primary Dependencies**: Vue 3 (`^3.5.x`), Pinia (`^4.0.x`), Lucide Vue Next, Tailwind CSS

**Storage**: Pinia reactive store state with `pinia-plugin-persistedstate` session persistence

**Testing**: `vue-tsc -b` type checking, `vite build` production compilation check, manual quickstart workflow test

**Target Platform**: Desktop & Mobile Web Browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Frontend Web Application (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant reactivity (<50ms) on file removal and dropzone toggle without layout shift (CLS)

**Constraints**: Max file size 5MB; supported MIME types PDF, PNG, JPG; zero native browser alerts (`alert()`, `confirm()`)

**Scale/Scope**: Regency verification workflow components (`StepDataCPCL.vue`, `StepSummaryDanSubmit.vue`, `useVerifikasiKabDraftStore`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Rule I & III (Pinia State & Single Source of Truth)**: Local draft state managed exclusively in `useVerifikasiKabDraftStore`. UI components do not mutate global server entities directly. -> PASS
- **Rule III (Form & Toast Standards)**: Uses `useToast()` notifications for file operations; zero `alert()` or native confirm popups. -> PASS
- **Rule IV (API Contracts & Document Types)**: Preserves `DokumenUpload` schema and `document_type: 'SK_CPCL'` payload mappings. -> PASS
- **Rule VI (Quality Assurance & Type Check)**: Must pass `vue-tsc -b` and `vite build` cleanly. -> PASS
- **Rule VII (Localization Standard)**: All toast messages and UI text externalized in `src/config/localization.ts`. -> PASS

---

## Project Structure

### Documentation (this feature)

```text
bpdp-sarpras-kelapa-fe/specs/060-fix-reupload-sk-cpcl/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ui-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
bpdp-sarpras-kelapa-fe/
└── src/
    ├── stores/
    │   └── verifikasiKabDraft.ts              # Pinia store holding document draft state and removal flags
    ├── views/
    │   └── dinas/
    │       └── kabupaten/
    │           ├── StepDataCPCL.vue           # Step 3: SK CPCL upload & removal UI
    │           └── StepSummaryDanSubmit.vue   # Step 4: Summary & final verification payload builder
    └── config/
        └── localization.ts                    # Centralized wording for toast and button labels
```

**Structure Decision**: Single project frontend module (`bpdp-sarpras-kelapa-fe`).

---

## Design Artifacts Summary

1. **[Research](./research.md)**: Analysis of fallback bug in `getExistingDoc` vs `verifikasiStore` and selection of explicit removal flags.
2. **[Data Model](./data-model.md)**: Pinia store model update, state transition diagram, and actions definition.
3. **[UI Contract](./contracts/ui-contract.md)**: Component props/emits, DOM rendering expectations, and step 4 payload packaging.
4. **[Quickstart Guide](./quickstart.md)**: Verification scenarios for document removal, re-uploading, same-file re-selection, and build checks.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| *None* | Architectural design strictly follows project constitution standards. | N/A |
