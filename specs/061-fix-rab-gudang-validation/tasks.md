# Tasks: Fix RAB and Gudang Validation Display in Regency Verification

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/061-fix-rab-gudang-validation/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`)
- Explicit file paths included in all descriptions.

---

## Phase 1: Setup & Foundational (Data Synchronization & Normalization)

**Purpose**: Core store and state normalization infrastructure for Gudang and RAB verification keys.

- [x] T001 Inspect `StepVerifikasiPekebunDanDokumenProposal.vue` rendering guards in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T002 Update `syncProposalValidations` in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts` to ensure default `PENDING` items for `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`, and `rabDocument` are initialized cleanly

**Checkpoint**: Foundational normalization ready - user story implementation can begin.

---

## Phase 2: User Story 1 - Display Gudang (Storage Area) Validation Section (Priority: P1) 🎯 MVP

**Goal**: Enable display of warehouse address, coordinates, and photo validation cards whenever storage area details or goods packages are loaded.

**Independent Test**: Open `/dinas/verifikasi/kabupaten/22` (or any proposal with storage area details), verify the Gudang validation card renders with interactive Setuju/Tolak controls and photo preview options.

- [x] T003 [US1] Create package string normalization helper `normalizePaketSarpras` and updated `isPupukPaket` computed property in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T004 [US1] Implement `hasStorageArea` computed guard checking both `storage_area` / `gudangSerahTerima` payload presence and normalized package types in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T005 [US1] Replace template guard `v-if="isPupukPaket"` on Gudang validation section with `v-if="hasStorageArea"` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

**Checkpoint**: User Story 1 complete - Gudang validation displays reliably for proposal #22 and all warehouse proposals.

---

## Phase 3: User Story 2 - Display RAB Inspection & Regency RAB Table (Priority: P1)

**Goal**: Ensure RAB inspection cards, proposal RAB summaries, and the editable RAB Kabupaten table display automatically whenever RAB items or budget verification is active.

**Independent Test**: Open `/dinas/verifikasi/kabupaten/22`, verify that the RAB inspection section and RAB Kabupaten table display, edit volume/unit price, and confirm subtotal recalculates dynamically.

- [x] T006 [US2] Create `hasRabContent` computed guard in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` checking for RAB items or RAB files
- [x] T007 [US2] Replace template guard `v-if="getDokumen('RAB_RK')"` on RAB inspection section with `v-if="hasRabContent"` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T008 [US2] Ensure RAB items auto-sync watcher in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` populates `verifikasiStore.rabItems` immediately upon resolving proposal detail

**Checkpoint**: User Story 2 complete - RAB inspection and editing table display and sync cleanly.

---

## Phase 4: Polish & Quality Verification

**Purpose**: Type safety verification and quickstart manual testing.

- [x] T009 [P] Run `vue-tsc -b` type checker in `bpdp-sarpras-kelapa-fe` to verify zero type errors
- [x] T010 [P] Run `npm run build` in `bpdp-sarpras-kelapa-fe` to verify clean Vite production bundle compilation
- [x] T011 Execute manual validation scenarios for proposal #22 in `bpdp-sarpras-kelapa-fe/specs/061-fix-rab-gudang-validation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phase 1)**: No dependencies - can start immediately.
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion.
- **User Story 2 (Phase 3)**: Depends on Phase 1 completion.
- **Polish (Phase 4)**: Depends on completion of user stories.

### Parallel Opportunities

- T009 [P] (`vue-tsc -b`) and T010 [P] (`npm run build`) can run in parallel during verification.

---

## Implementation Strategy

### MVP Scope (User Story 1 & 2)

1. Complete Phase 1 & 2: Gudang display guard fix in `StepVerifikasiPekebunDanDokumenProposal.vue`
2. Complete Phase 3: RAB display guard fix in `StepVerifikasiPekebunDanDokumenProposal.vue`
3. Validate via `quickstart.md` scenarios on `/dinas/verifikasi/kabupaten/22`.
