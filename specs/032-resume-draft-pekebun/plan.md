# Implementation Plan: Resuming Saved Draft Pekebun Data (032-resume-draft-pekebun)

**Branch**: `032-resume-draft-pekebun` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/032-resume-draft-pekebun/spec.md`

## Summary

This feature enables users to resume editing previously saved draft Pekebun registrations ("bagaimana untuk melanjutkan pengisian yang simpan draft"). We will extend the Pinia `pekebun` store with draft update and deletion methods, update `PekebunListView.vue` to display a "Lanjutkan Pengisian" action for draft entries, enhance `FormPekebunView.vue` to support loading and resuming drafts via `?draftId=...`, and externalize all wording into `src/config/localization.ts` per Constitution standards.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Pinia, Vue Router, Lucide Vue Next, VeeValidate/Zod  
**Storage**: Client-side Pinia store (`pekebun.ts`) with `pinia-plugin-persistedstate`  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile 375px+ to Desktop 1920px)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Performance Goals**: Instant draft restoration (<200ms form load time)  
**Constraints**: Enforce Constitution Principles I-XV (Strict Pinia encapsulation, Breadcrumbs, Mobile-First, Vue Toast, Wording Externalization)  
**Scale/Scope**: 4 files modified (`localization.ts`, `pekebun.ts`, `FormPekebunView.vue`, `PekebunListView.vue`)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: Form and List views use `<script setup>` SFCs.
- [x] **Principle II (Strict TypeScript & Zod)**: Strict types for `Pekebun` and form data payloads.
- [x] **Principle III (Pinia State Management)**: State changes encapsulated within `usePekebunStore`.
- [x] **Principle IV & X (UI/UX Pro Max & Accessibility)**: Standard buttons, WCAG compliant contrast, Forest Green identity `#066C2A`.
- [x] **Principle VI (Breadcrumb Navigation)**: `Breadcrumb.vue` integrated into views.
- [x] **Principle VII (Mobile-First Design)**: Touch-friendly buttons (min 44px) and responsive layout without horizontal overflow.
- [x] **Principle XI (Vue Toaster Standard)**: `useToast()` notifications for draft save/update/delete actions.
- [x] **Principle XIV (Compact Density)**: Standard input heights (`h-10`) and restrained font sizes (`text-xs md:text-sm`).
- [x] **Principle XV (Mandatory Wording Externalization)**: All copy externalized in `src/config/localization.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/032-resume-draft-pekebun/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & state transition specification
├── quickstart.md        # Phase 1 quickstart & manual validation scenarios
└── contracts/
    └── pekebun-draft-api.md # Interface contract for Pinia store draft methods
```

### Source Code Layout

```text
src/
├── config/
│   └── localization.ts       # Central wording dictionary (added pekebunDraft section)
├── stores/
│   └── pekebun.ts            # Added getDraftById, updateDraftPekebun, updatePekebun, deleteDraftPekebun
└── views/
    └── master-data/
        ├── FormPekebunView.vue # Added draftId query loader & update draft logic
        └── PekebunListView.vue # Added status filter tab & "Lanjutkan Pengisian" action button
```

**Structure Decision**: Standard Vue 3 application structure within existing project modules.

## Proposed Changes

### Central Configuration Component

#### [MODIFY] [`localization.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
Add `pekebunDraft` object under `LOCALIZATION` containing wording for buttons, titles, badges, and toaster messages:
- `resumeDraft`: "Lanjutkan Pengisian"
- `saveDraftSuccess`: "Draft Pekebun berhasil disimpan."
- `updateDraftSuccess`: "Draft Pekebun berhasil diperbarui."
- `deleteDraftSuccess`: "Draft Pekebun berhasil dihapus."
- `submitDraftSuccess`: "Data Pekebun berhasil disimpan."
- `draftBadge`: "Draft"
- `tabAll`: "Semua Pekebun"
- `tabRegistered`: "Terdaftar"
- `tabDraft`: "Draft Pekebun"

---

### Store Layer

#### [MODIFY] [`pekebun.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/pekebun.ts)
Add draft store actions:
- `getDraftById(id: string)`: Return draft record matching ID.
- `updateDraftPekebun(...)`: Update existing draft record fields without removing `isDraft: true`.
- `updatePekebun(...)`: Finalize draft into active Pekebun record (`isDraft: false`).
- `deleteDraftPekebun(id: string)`: Remove draft from `listPekebun`.

---

### UI Views

#### [MODIFY] [`FormPekebunView.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/master-data/FormPekebunView.vue)
- Import `useRoute` and read `route.query.draftId`.
- On `onMounted`, if `draftId` is present, call `store.getDraftById(draftId)` and populate form reactive refs (`identitasData`, `dokumenData`, `lahanDataList`).
- Update `handleSaveDraft()` to check if `editingDraftId` is set: call `store.updateDraftPekebun()` if editing, else `store.saveDraftPekebun()`.
- Update `handleSubmit()` to call `store.updatePekebun()` when finalizing an existing draft.

#### [MODIFY] [`PekebunListView.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/master-data/PekebunListView.vue)
- Add filter tabs: "Semua", "Terdaftar", "Draft Pekebun".
- Render "Lanjutkan Pengisian" (`<Button variant="outline" class="text-amber-700">`) for rows where `isDraft === true`.
- Add click handler for "Lanjutkan Pengisian" that routes to `/master-data/pekebun/tambah?draftId=${pekebun.id}`.
- Add delete draft action with confirmation toast.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`
- Production build validation: `npm run build`

### Manual Verification
1. Create a draft Pekebun from `/master-data/pekebun/tambah` and click "Simpan Draft".
2. On `/master-data/pekebun`, click "Lanjutkan Pengisian" on the newly created draft.
3. Verify all inputs are pre-filled correctly.
4. Complete missing inputs and click "Simpan Pekebun" to finalize.
5. Verify status changes to registered Pekebun.
