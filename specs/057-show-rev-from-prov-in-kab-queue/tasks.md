# Tasks: Show Proposals with REV_FROM_PROV Status in QueueVerifikasiKabView

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/057-show-rev-from-prov-in-kab-queue/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review status fetching and badge variant mapping

- [X] T001 Review `onMounted` and `getBadgeVariant` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update store proposal fetching in queue view

- [X] T002 Update `onMounted()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` to call `store.fetchProposals()` without status restriction

---

## Phase 3: User Story 1 - Display Proposals in REV_FROM_PROV Status in Dinas Kabupaten Queue (Priority: P1) 🎯 MVP

**Goal**: Render proposals with `REV_FROM_PROV` status in Kabupaten verification queue.

**Independent Test**: Load queue view, verify proposals in status `REV_FROM_PROV` render with warning badge style.

### Implementation for User Story 1

- [X] T003 [US1] Add `REV_FROM_PROV` status mapping to `getBadgeVariant()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`

---

## Phase 4: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T004 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004
```
