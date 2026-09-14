# Research: Resuming Saved Draft Pekebun Data (032-resume-draft-pekebun)

## Problem Statement & Context
The "Tambah Data Pekebun" form already contains a "Simpan Draft" button which persists incomplete forms with `isDraft: true` in the Pinia `pekebun` store (`listPekebun`). However, users currently have no route or UI action to resume editing an existing draft entry (`"bagaimana untuk melanjutkan pengisian yang simpan draft?"`).

## Technical Decisions & Rationale

### 1. Route Strategy for Resuming Drafts
- **Decision**: Reuse `FormPekebunView.vue` registered under `/master-data/pekebun/tambah` with an optional query parameter `?draftId=PKB-xxx` or route parameter `/master-data/pekebun/edit/:id`.
- **Rationale**: Keeps form logic unified in a single wizard component (`FormPekebunView.vue`) without duplicating multi-step form code. When `draftId` or route `id` is present, `FormPekebunView` loads the existing draft from `usePekebunStore().getDraftById(id)` and populates the form reactive state (`identitasData`, `dokumenData`, `lahanDataList`).

### 2. Store Method Extensions in `usePekebunStore`
- **Decision**: Extend `src/stores/pekebun.ts` with:
  1. `getDraftById(id: string): Pekebun | undefined`
  2. `updateDraftPekebun(id: string, identitas, dokumen, lahanList): Pekebun`
  3. `updatePekebun(id: string, identitas, dokumen, lahanList): Pekebun` (converts `isDraft` to `false` when finalized/submitted)
  4. `deleteDraftPekebun(id: string): void`
- **Rationale**: Keeps state manipulation encapsulated strictly inside Pinia per Constitution Principle III. Preserves existing draft IDs instead of creating duplicate records every time a draft is updated.

### 3. List UI Enhancement in `PekebunListView.vue`
- **Decision**:
  - Render an explicit action button **"Lanjutkan Pengisian"** (with icon `FileEdit`) and **"Hapus"** (with icon `Trash2`) for table rows with `isDraft: true`.
  - Provide a filter tab / status filter (`Semua`, `Terdaftar`, `Draft`) so users can isolate draft entries.
  - Clicking "Lanjutkan Pengisian" navigates to `/master-data/pekebun/tambah?draftId=PKB-xxx`.

### 4. Mandatory Wording Externalization
- **Decision**: Add all wording, toast messages, and button labels into `src/config/localization.ts` under a new section `pekebunDraft`.
- **Rationale**: Complies strictly with Constitution Principle XV (Mandatory Localization & Wording Externalization Standard).

## Alternatives Considered
- **Separate View for Editing Draft (`EditPekebunView.vue`)**: Rejected due to code duplication (YAGNI, Principle V). Single form component with `draftId` query prop is simpler and maintainable.
- **Modal-based draft editor**: Rejected because the Pekebun registration is a multi-step wizard with complex file uploads and land polygon inputs, which is optimized for page-level navigation.
