# Tasks: Dashboard Workflow Pipeline (Multi-Role)

**Input**: Design documents from `/specs/020-workflow-pipeline-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and localization setup

- [x] T001 [P] Modify `src/config/localization.ts` to add localized strings for the 10 pipeline stages, metrics labels, and section header titles
- [x] T002 [P] Modify `src/stores/metrics.ts` to integrate stage metrics type definitions and base role-mapped simulation records

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Basic component integration placeholder

- [x] T003 Create directory `src/components/dashboard/` to contain the new pipeline components

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Lihat Pipeline Status Berdasarkan Role (Priority: P1) 🎯 MVP

**Goal**: Render a 10-card workflow pipeline dashboard displaying localized stage labels and simulated metrics corresponding to the active role.

**Independent Test**: Switch roles in the application and verify the dashboard successfully renders the pipeline structure with relevant metric values.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create the single-card presentation component in `src/components/dashboard/PipelineCard.vue`
- [x] T005 [P] [US1] Create the initial pipeline orchestrator layout component in `src/components/dashboard/WorkflowPipeline.vue`
- [x] T006 [US1] Modify `src/views/DashboardView.vue` to import and conditionally render `<WorkflowPipeline />` for non-PEMOHON roles
- [x] T007 [US1] Verify that different mock data ranges load correctly when transitioning roles (e.g. Dinas vs BPDPKS)

**Checkpoint**: At this point, User Story 1 is functional with dummy cards rendering metrics.

---

## Phase 4: User Story 2 - Navigasi ke Halaman Proposal dari Card Pipeline (Priority: P2)

**Goal**: Make pipeline cards clickable, triggering page redirects to corresponding proposal tracking, verification, or recomtek queue views.

**Independent Test**: Click each card and verify successful routing. Check that unauthorized pages trigger the proper "Access Denied" view without client-side crashes.

### Implementation for User Story 2

- [x] T008 [US2] Update `src/components/dashboard/PipelineCard.vue` to accept navigation target prop and wire click handler using router
- [x] T009 [US2] Define mapping of stages to actual route targets in `src/components/dashboard/WorkflowPipeline.vue`
- [x] T010 [US2] Verify that navigation clicks direct users to appropriate pages per stage

**Checkpoint**: Card-based navigation handles redirects seamlessly.

---

## Phase 5: User Story 3 - Alur Visual Antar Tahapan dengan Panah Penghubung (Priority: P3)

**Goal**: Add premium UI polish, interactive hovers, looped connection arrows, and mobile-first responsive layout transitions.

**Independent Test**: Verify connection line alignment on desktop and collapse to single column vertical list on mobile.

### Implementation for User Story 3

- [x] T011 [US3] Implement desktop looped layout structure using Tailwind grid classes in `src/components/dashboard/WorkflowPipeline.vue`
- [x] T012 [US3] Add chevron/connector SVG layouts pointing right, left, or down between cards in desktop view
- [x] T013 [US3] Implement mobile CSS overrides for vertical layout collapse and linear connectors
- [x] T014 [US3] Add glassmorphism styling, hover state micro-animations, and active role highlight rings on `src/components/dashboard/PipelineCard.vue`

**Checkpoint**: Loop flows render with premium visual design, arrows, hovers, and responsive scaling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 Verify CSS style compatibility in both Light & Dark modes on `src/components/dashboard/PipelineCard.vue` using `authStore.isDarkMode`
- [x] T016 Run type check using `npm run build` or `vue-tsc` to ensure strict TypeScript compilation passes
- [x] T017 Execute `quickstart.md` validation checklist to confirm full compliance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Stories (Phase 3+)**: All depend on Foundational. Proceed sequentially (US1 -> US2 -> US3).
- **Polish (Phase 6)**: Depends on all user stories completion.

### Parallel Opportunities

- T001 and T002 can be implemented simultaneously.
- T004 and T005 can be drafted in parallel before integration in T006.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup localized names and mock stores.
2. Build layout skeleton and wire DashboardView.vue.
3. Validate dynamic rendering of the 10 stages per role.
