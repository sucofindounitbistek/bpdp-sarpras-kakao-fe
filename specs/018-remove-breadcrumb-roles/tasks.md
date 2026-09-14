# Tasks: Breadcrumb Role Removal & Menu-Only Navigation

**Input**: Design documents from `/specs/018-remove-breadcrumb-roles/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [x] T001 Verify active feature tracking in `.specify/feature.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify router configuration

- [x] T002 Verify route meta definitions in `src/router/index.ts` to ensure compatibility with dynamic path resolution

**Checkpoint**: Foundation ready - Breadcrumb implementation can begin

---

## Phase 3: User Story 1 - Navigasi Breadcrumb Dinamis Tanpa Role (Priority: P1) 🎯 MVP

**Goal**: Update `Breadcrumb.vue` to exclude role-based section titles from the resolved breadcrumb path.

**Independent Test**: Open any page (e.g., Pekebun list) and verify breadcrumbs do not contain section titles like `MASTER DATA`.

### Implementation for User Story 1

- [x] T003 [US1] Remove matchedSectionTitle block from resolvedItems computed logic in `src/components/ui/Breadcrumb.vue`

**Checkpoint**: Component logic is updated. Role headers are hidden on pages without hardcoded arrays.

---

## Phase 4: User Story 2 - Delegasi Views ke Breadcrumb Dinamis (Priority: P2)

**Goal**: Clean up hardcoded breadcrumb arrays and `:items` props from view files to leverage dynamic resolution.

**Independent Test**: Navigate to each modified view page and verify they resolve to correct path menus (e.g., `Beranda > Verifikasi Kelayakan > Detail Usulan` instead of showing `BPDPKS Pusat`).

### Implementation for User Story 2

- [x] T004 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/DashboardView.vue`
- [x] T005 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/ditjenbun/AntreanRekomtekView.vue`
- [x] T006 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/ditjenbun/CekiDitjenbunView.vue`
- [x] T007 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/ditjenbun/ApprovalDitjenbunView.vue`
- [x] T008 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/dinas/ProvVerifikasiView.vue`
- [x] T009 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/dinas/KabVerifikasiView.vue`
- [x] T010 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/bpdp/CekiBpdpView.vue`
- [x] T011 [P] [US2] Remove breadcrumbs binding and unused properties in `src/views/bpdp/ApprovalBpdpView.vue`

**Checkpoint**: All views are converted to dynamic breadcrumbs and unused code is cleaned up.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build confirmation and end-to-end verification

- [x] T012 Type check the project using `vue-tsc -b`
- [x] T013 Build the project to verify production readiness using `npm run build`
- [x] T014 Run all manual verification scenarios documented in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on T001.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
  - Phase 3 (US1: Breadcrumb logic) blocks Phase 4 (US2: Views integration).
- **Polish (Final Phase)**: Depends on all user story completions.

### Parallel Opportunities

- Once Phase 3 (US1) is complete, all tasks in Phase 4 (T004-T011) can run in parallel since they modify independent files.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Modify `Breadcrumb.vue` (T003).
2. Verify pages that already use dynamic breadcrumbs (e.g., master-data form) to ensure section headers are successfully hidden.

### Incremental Delivery

1. Deploy the core Breadcrumb logic.
2. Incrementally clean up view pages and delegate them to dynamic breadcrumbs.
3. Validate and build.
