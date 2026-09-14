# Tasks: Active Sidebar & Aligned Breadcrumbs

**Input**: Design documents from `/specs/011-sidebar-active-breadcrumbs/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extract shared navigation config and set up the foundation for dynamic checks.

- [x] T001 Create shared navigation structure composable in `src/composables/useNavigation.ts`
- [x] T002 Update `src/components/ui/Sidebar.vue` to import and use the navigation composable

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core router configuration updates and metadata schema preparation.

- [x] T003 Update type declaration/meta definitions to support `activeMenu` and `title` in `src/router/index.ts`
- [x] T004 Refactor `src/components/ui/Sidebar.vue` to check `route.meta.activeMenu` when determining the active item style.

---

## Phase 3: User Story 1 - Maintain Active Highlight for Sub-Sub-Menus (Priority: P1) 🎯 MVP

**Goal**: Keep corresponding parent menu highlighted when navigating to sub-sub-menus/forms/details.

**Independent Test**: Navigate to `/bpdp/ceki/:id`, `/master-data/pekebun/tambah`, `/dinas/verifikasi/provinsi/:id`, `/pengusulan/baru` and verify the sidebar correctly highlights their logical parent.

### Implementation for User Story 1

- [x] T005 [P] [US1] Configure `activeMenu` meta for BPDPKS detailed pages (`/bpdp/ceki/:id`, `/bpdp/approval/:id`, `/bpdp/finalisasi/:id`) in `src/router/index.ts`
- [x] T006 [P] [US1] Configure `activeMenu` meta for Dinas detailed pages (`/dinas/verifikasi/kabupaten/:id`, `/dinas/verifikasi/provinsi/:id`) in `src/router/index.ts`
- [x] T007 [P] [US1] Configure `activeMenu` meta for Master Data add/tambah pages (`/master-data/pekebun/tambah`, `/pengusulan/baru`) in `src/router/index.ts`
- [x] T008 [P] [US1] Configure `activeMenu` meta for BAST page (`/bpdpks/bast-lpj`) in `src/router/index.ts`

**Checkpoint**: User Story 1 is functional. Navigation to any child path correctly highlights the matching parent sidebar item.

---

## Phase 4: User Story 2 - Breadcrumbs Aligning with Sidebar Titles and Hierarchy (Priority: P2)

**Goal**: Automatically compute dynamic breadcrumbs from route meta matching the sidebar layout structure.

**Independent Test**: Ensure breadcrumbs are properly displayed as `Beranda > Section > Item > Leaf` on all updated pages and match the sidebar wording exactly.

### Implementation for User Story 2

- [x] T009 [US2] Update router configurations to add missing `title` metadata in `src/router/index.ts`
- [x] T010 [US2] Modify `src/components/ui/Breadcrumb.vue` to support dynamic fallback rendering using the route state and the shared navigation helper when `items` prop is omitted.
- [x] T011 [P] [US2] Update `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue` and `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue` to use automatic breadcrumbs.
- [x] T012 [P] [US2] Update `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` and `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue` to use automatic breadcrumbs.
- [x] T013 [P] [US2] Update `src/views/master-data/PekebunListView.vue` and `src/views/master-data/FormPekebunView.vue` to use automatic breadcrumbs.
- [x] T014 [P] [US2] Update `src/views/bpdp/AntreanBpdpView.vue`, `src/views/bpdp/CekiBpdpView.vue`, `src/views/bpdp/ApprovalBpdpView.vue`, and `src/views/bpdp/FinalisasiSkDirutView.vue` to use automatic breadcrumbs.
- [x] T015 [P] [US2] Update remaining views (e.g. `UserManagementView.vue`, `PenyaluranDanaView.vue`, `PelaporanBASTView.vue`, etc.) to use automatic breadcrumbs.

**Checkpoint**: Dynamic breadcrumbs are generated across all core user flows, resolving formatting mismatch.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Formatting checks, validation verification, and build correctness.

- [x] T016 Run build validation using `npm run build` and check TypeScript compilation with `vue-tsc -b`
- [x] T017 Verify visual layout scaling (mobile-first responsive viewports, no clipped text) in both themes
- [x] T018 Execute the `quickstart.md` validation scenarios manually in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion, can be worked on concurrently with User Story 1.
- **Polish (Phase 5)**: Depends on all implementation phases.

### Parallel Opportunities

- Phase 3 setup metadata configs (`T005`, `T006`, `T007`, `T008`) can be implemented in parallel.
- View refactorings in Phase 4 (`T011` through `T015`) can be implemented in parallel.

---

## Parallel Example: User Story 2

```bash
# Update multiple views to dynamic breadcrumbs in parallel
Task: "Update Pekebun view files to use automatic breadcrumbs"
Task: "Update Dinas view files to use automatic breadcrumbs"
Task: "Update BPDP view files to use automatic breadcrumbs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete User Story 1 (Active highlighting config).
3. Validate active highlighting in the browser.

### Incremental Delivery

1. Deploy Active Highlight functionality (P1).
2. Develop and verify Dynamic Breadcrumbs (P2).
3. Polish and do final checkouts.
