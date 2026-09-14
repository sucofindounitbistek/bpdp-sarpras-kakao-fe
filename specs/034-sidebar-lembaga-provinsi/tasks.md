# Tasks: Provincial Dinas Institutional Account Sidebar & List View (034-sidebar-lembaga-provinsi)

**Input**: Design documents from `/specs/034-sidebar-lembaga-provinsi/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/lembaga-provinsi-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wording externalization & configuration initialization

- [x] T001 [P] Add institutional accounts wording dictionary (`lembagaProvinsi`) to `src/config/localization.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route registration & sidebar navigation menu update

**⚠️ CRITICAL**: View component routing depends on these foundational navigation updates

- [x] T002 Add route `/dinas/provinsi/lembaga` mapping to `@/views/dinas/provinsi/LembagaProvinsiView.vue` in `src/router/index.ts`
- [x] T003 Import `Building2` icon and add `{ label: 'Lembaga', to: '/dinas/provinsi/lembaga', icon: Building2 }` under `DINAS_PROV` section in `src/composables/useNavigation.ts`

**Checkpoint**: Foundation ready - navigation menu item and route definition registered.

---

## Phase 3: User Story 1 - Access Institutional Accounts List in Provincial Dinas Sidebar (Priority: P1) 🎯 MVP

**Goal**: Enable Provincial Dinas officers to access and view all registered farmer organization accounts (Akun Kelembagaan Pekebun) within their province with real-time search and district filtering.

**Independent Test**: Switch role to `DINAS_PROV`, click "Lembaga" in the sidebar under "DINAS PROVINSI", and verify the view opens displaying summary cards, district filter dropdown, search bar, and data table.

### Implementation for User Story 1

- [x] T004 [US1] Create view component `src/views/dinas/provinsi/LembagaProvinsiView.vue` with KPI summary cards (Total Lembaga, Total Anggota, Total Luas Lahan, Akun Aktif)
- [x] T005 [US1] Implement real-time search bar and district (Kabupaten) dropdown filter in `src/views/dinas/provinsi/LembagaProvinsiView.vue`
- [x] T006 [US1] Render responsive data table displaying farmer organization credentials (Nama Lembaga, Jenis, NIB/SK, District, Ketua/Penanggung Jawab, Member Count, Status) in `src/views/dinas/provinsi/LembagaProvinsiView.vue`

**Checkpoint**: At this point, User Story 1 is fully functional — officers can navigate to and filter institutional accounts.

---

## Phase 4: User Story 2 - View Institutional Account Details & Status (Priority: P2)

**Goal**: Allow Provincial Dinas officers to inspect complete organization profile credentials (address, contacts, legal documents, member summary) via a detail modal.

**Independent Test**: Click "Detail" button on an institutional account row and confirm a detail modal opens presenting complete organization credentials.

### Implementation for User Story 2

- [x] T007 [US2] Implement Account Detail Modal with complete organization credentials in `src/views/dinas/provinsi/LembagaProvinsiView.vue`

**Checkpoint**: User Story 2 complete — full organization inspection available.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T008 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T009 [P] Perform manual quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS view navigation.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 table row action rendering.
- **Polish (Phase 5)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001` can be developed in parallel with router setup.
- `T008` and `T009` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & Phase 2 (Localization, Route & Sidebar).
2. Complete Phase 3 (List view & data table with filters).
3. Validate User Story 1.

### Full Delivery
1. Complete Phase 4 (Organization Detail Modal).
2. Complete Phase 5 (Type safety check with `npx vue-tsc -b`).
