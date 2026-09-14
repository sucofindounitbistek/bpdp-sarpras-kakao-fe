# Tasks: Integrate Storage Area Notes into StepVerifikasiPekebunDanDokumenProposal

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/051-storage-area-notes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project review and preparation

- [X] T001 Review `StepVerifikasiPekebunDanDokumenProposal.vue` and `verifikasiKabDraft.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core store reactivity and verification key setup

- [X] T002 Ensure reactive handling of storage area verification keys (`gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts`

---

## Phase 3: User Story 1 - Capture & Display Verifier Storage Area Notes (Priority: P1) 🎯 MVP

**Goal**: Allow verifiers to enter, view, and persist feedback notes on storage area items (address, coordinates, photos).

**Independent Test**: Click "Tolak" on a storage area item in `StepVerifikasiPekebunDanDokumenProposal.vue`, type a rejection note, and confirm note is reactively saved in draft store.

### Implementation for User Story 1

- [X] T003 [US1] Add human-readable label mapping for storage area keys (`gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) in `dokumenNotes` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [X] T004 [US1] Render verification notes textarea controls in **Pemeriksaan Gudang Serah Terima** section in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [X] T005 [US1] Bind textarea inputs to `verifikasiStore.getVerification(key).notes` and enforce non-empty note validation on rejection in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 4: User Story 2 - Propagate Storage Area Notes to Verification Summary (Priority: P2)

**Goal**: Propagate storage area notes into rejection summary text and confirmation modals.

**Independent Test**: Submit a rejection with storage area notes, verify confirmation modal displays formatted notes (e.g. `Gudang (Alamat): <note>`).

### Implementation for User Story 2

- [X] T006 [US2] Include formatted storage area notes in `confirmNotes` payload for confirmation modal in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 5: Polish & Quality Gates

**Purpose**: Type check and build verification

- [X] T007 Run `vue-tsc -b` and `vite build` verification in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004 -> T005 -> T006 -> T007
```
