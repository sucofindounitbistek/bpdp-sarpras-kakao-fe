# Implementation Plan: Land Legal Document Preview in Proposal Submission (033-preview-legalitas-lahan)

**Branch**: `033-preview-legalitas-lahan` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/033-preview-legalitas-lahan/spec.md`

## Summary

This feature adds an in-app document preview for land legal certificates (`scanLegalitasUrl`) directly inside Step 3 of Proposal Submission ("Pilih Pekebun & Lahan"). When users view land items associated with selected Pekebun, clicking "Pratinjau Legalitas" opens the existing `DocumentPreviewModal.vue` component, allowing submitters to verify certificate legibility before submitting proposal applications.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Vue Router, Lucide Vue Next  
**Storage**: Client-side Pinia stores (`pengusulanDraft.ts`, `pekebun.ts`)  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile 375px+ to Desktop 1920px)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Performance Goals**: Instant document modal open (<100ms UI response)  
**Constraints**: Enforce Constitution Principles I-XV (Strict Pinia state, UI/UX Pro Max standards, Wording externalization)  
**Scale/Scope**: 2 files modified (`StepPilihPekebunLahan.vue`, `localization.ts`)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: View component uses `<script setup>`.
- [x] **Principle II (Strict TypeScript)**: Explicit types for document preview payload.
- [x] **Principle III (Pinia State Management)**: Form state read directly from Pinia stores (`usePengusulanDraftStore`, `usePekebunStore`).
- [x] **Principle IV & X (UI/UX Pro Max Standards)**: Reuses styled `DocumentPreviewModal.vue` with Forest Green identity `#066C2A`.
- [x] **Principle VII (Mobile-First Design)**: Touch-friendly targets and responsive modal view.
- [x] **Principle XI (Vue Toaster Standard)**: Error feedback via `useToast()`.
- [x] **Principle XV (Mandatory Wording Externalization)**: Wording externalized in `src/config/localization.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/033-preview-legalitas-lahan/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model specification
├── quickstart.md        # Phase 1 quickstart & manual validation scenarios
└── contracts/
    └── lahan-legalitas-preview-api.md # Component contract for document preview
```

### Source Code Layout

```text
src/
├── config/
│   └── localization.ts       # Central wording dictionary (added lahanPreview section)
└── views/
    └── pengusulan/
        └── StepPilihPekebunLahan.vue # Added openLahanDocPreview handler & modal trigger button
```

**Structure Decision**: Standard Vue 3 application structure within existing project modules.

## Proposed Changes

### Central Configuration Component

#### [MODIFY] [`localization.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
Add `lahanPreview` section under `LOCALIZATION`:
- `previewButton`: "Pratinjau Legalitas"
- `noDocument`: "Belum Ada Dokumen"
- `missingDocToast`: "Dokumen legalitas lahan belum diunggah."
- `modalTitlePrefix`: "Legalitas Lahan"

---

### UI Layer

#### [MODIFY] [`StepPilihPekebunLahan.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepPilihPekebunLahan.vue)
- Add helper method `openLahanDocPreview(lahan: LahanPekebun)` in `<script setup>`.
- Replace the direct `<a :href="lahan.scanLegalitasUrl" target="_blank">` anchor with a styled `<button @click="openLahanDocPreview(lahan)">` button.
- Handle missing documents by rendering a disabled badge if `scanLegalitasUrl` is `#` or empty.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`
- Production build validation: `npm run build`

### Manual Verification
1. Navigate to `/pengusulan/baru`, proceed to Step 3.
2. Expand a selected Pekebun's land details.
3. Click "Pratinjau Legalitas" button on a land parcel.
4. Verify `DocumentPreviewModal` opens displaying the land certificate document.
5. Close modal and verify seamless return to Step 3.
