# Tasks: Fix RAB Items Synchronization and Display in Verification Views

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/056-fix-rab-items-sync-and-display/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review RAB data flow and component watchers

- [X] T001 Review `rabItems` watcher in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enhance RAB parsing in Pinia store

- [X] T002 Update `getProposalDetail()` in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts` to check `item.rabs`, `item.rab_items`, `item.rabItems`, and `item.rab_proposals`

---

## Phase 3: User Story 1 - Sync RAB Items to Verifikasi Store and Display in Verification Table (Priority: P1) 🎯 MVP

**Goal**: Populate `verifikasiStore.rabItems` unconditionally when proposal RAB items resolve.

**Independent Test**: Open proposal verification page, verify RAB table displays all RAB items.

### Implementation for User Story 1

- [X] T003 [US1] Remove `verifikasiStore.rabItems.length === 0` guard in `StepVerifikasiPekebunDanDokumenProposal.vue` to sync `rabItems` unconditionally when non-empty

---

## Phase 4: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T004 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004
```
