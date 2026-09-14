# Tasks: SPKA Numbering Format

**Input**: Design documents from `/specs/038-spka-numbering-format/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Utility helper setup and type definition initialization

- [x] T001 [P] Create SPKA helper library utility in `src/lib/spkaNumbering.ts`
- [x] T002 [P] Define SPKA configuration interface and package code types in `src/types/pengusulan.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core helper logic for SPKA format generation and package code mapping

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `getKodePaketSarpras` helper function mapping all 9 Sarpras package types to single digit strings ('1'..'9') in `src/lib/spkaNumbering.ts`
- [x] T004 Implement `generateSpkaNomor` utility function with date parsing (MM, YY) and zero-padded sequence formatting in `src/lib/spkaNumbering.ts`

**Checkpoint**: Foundation ready - helper module complete for story integration

---

## Phase 3: User Story 1 - Generasi Otomatis Nomor Proposal SPKA (Priority: P1) 🎯 MVP

**Goal**: Generasi otomatis nomor SPKA berbasis kode paket, bulan (MM), tahun (YY), dan urutan (0001-9999) saat proposal baru dibuat.

**Independent Test**: Buat proposal baru dengan jenis paket Ekstensifikasi pada bulan Juni 2026, lalu verifikasi `nomorUsulan` yang dihasilkan adalah `SPKA106260001`.

### Implementation for User Story 1

- [x] T005 [US1] Update `submitPengusulan` action in `src/stores/rekomtek.ts` to call `generateSpkaNomor` during proposal creation
- [x] T006 [US1] Update default mock usulan data in `src/stores/rekomtek.ts` to use standardized SPKA numbering format
- [x] T007 [US1] Ensure `nomorUsulan` display in proposal tracking view `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T008 [US1] Ensure `nomorUsulan` display in proposal creation summary `src/views/pengusulan/FormPengusulanView.vue`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Riset dan Reset Urutan Monthly (Priority: P2)

**Goal**: Penomoran urut 4 digit direset menjadi `0001` setiap pergantian bulan kalender.

**Independent Test**: Buat proposal baru pada bulan yang berbeda dari proposal sebelumnya, lalu pastikan urutan penomoran dimulai kembali dari `0001`.

### Implementation for User Story 2

- [x] T009 [US2] Implement monthly sequence tracker logic (`yearMonth` key check) in `src/stores/rekomtek.ts`
- [x] T010 [US2] Add unit test/validation helper for monthly sequence reset in `src/lib/spkaNumbering.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 work independently and reset monthly.

---

## Phase 5: User Story 3 - Pemetaan 9 Kode Jenis Paket Sarpras (Priority: P3)

**Goal**: Pemetaan lengkap 9 jenis paket Sarpras ke kode digit 1-9.

**Independent Test**: Pilih masing-masing dari 9 jenis paket pada form proposal dan verifikasi digit ke-2 nomor SPKA sesuai kode paket (1..9).

### Implementation for User Story 3

- [x] T011 [US3] Verify and complete 9 package type mappings (`BENIH_PUPUK`, `INTENSIFIKASI`, `ALAT_PASCAPANEN`, `UPH`, `JALAN_PERKEBUNAN`, `TRUK`, `ALSINTAN`, `DRAINASE`, `VERIFIKASI_TEKNIS`) in `src/lib/spkaNumbering.ts`
- [x] T012 [US3] Update package type selectors in `src/components/ui/CascadingPaketSelect.vue` to ensure package codes match SPKA mappings

**Checkpoint**: All 9 Sarpras package types generate valid SPKA numbers.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Document PDF generation updates and build verification

- [x] T013 [P] Update RAB PDF export header to display SPKA nomor usulan in `src/views/pengusulan/StepRAB.vue`
- [x] T014 Run build verification `npm run build` to confirm zero compilation errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 (Foundational) - MVP
- **User Story 2 (P2)**: Starts after Phase 2 (Foundational) - Extends US1
- **User Story 3 (P3)**: Starts after Phase 2 (Foundational) - Extends package mapping coverage

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2 (Setup & Foundational)
2. Complete Phase 3 (User Story 1)
3. Validate User Story 1 independently (`SPKA106260001`)

### Incremental Delivery

1. Complete Setup + Foundational
2. Implement US1 (MVP) -> Test
3. Implement US2 (Monthly Reset) -> Test
4. Implement US3 (9 Package Codes Coverage) -> Test
5. Polish & Verification (`npm run build`)
