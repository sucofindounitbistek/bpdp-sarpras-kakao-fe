# Tasks: Pekebun & Lahan Store Integration

**Input**: Design documents from `/specs/001-pekebun-lahan-store-integration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec. Test tasks excluded.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project already initialized. No new dependencies needed. Pinia, Axios, Zod, Vue Router already installed.

> No setup tasks required — all infrastructure exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, API fix, and service layer that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Fix error interceptor in `src/services/api.ts` to read nested `error.response?.data?.error?.message` for API error format `{ error: { code, message } }`
- [x] T002 [P] Create Lahan types in `src/types/lahan.ts` — Lahan interface, LahanDocument interface, PaginationMeta interface matching API contract fields from data-model.md
- [x] T003 [P] Create pekebun service in `src/services/pekebun.service.ts` with methods: getList(params), getById(id), create(formData), update(id, formData), delete(id)
- [x] T004 [P] Create lahan service in `src/services/lahan.service.ts` with methods: getByPekebunId(pekebunId), getById(id), create(formData), update(id, formData), delete(id)

**Checkpoint**: Foundation ready — services and types available for all user stories

---

## Phase 3: User Story 1 - Browse Pekebun List with API Data (Priority: P1) 🎯 MVP

**Goal**: Pekebun list page fetches from API, displays paginated data with search, filter, and draft tabs.

**Independent Test**: Navigate to `/master-data/pekebun`, verify list loads from API, search works, pagination works, delete works, tabs filter by is_draft.

### Implementation for User Story 1

- [x] T005 [US1] Adjust `src/types/pekebun.ts` — add `isDraft`, `kelembagaanId` fields to Pekebun interface; add response mapping helper type for API snake_case to camelCase
- [x] T006 [US1] Replace mock data in `src/stores/pekebun.ts` with API-backed actions: add `fetchPekebunList` (calls pekebunService.getList), add `fetchPekebunById`, add `deletePekebun` (calls pekebunService.delete and removes from list), add `pagination` ref state. Keep `lookupDukcapil`, `getWilayahByParent`, `getWilayahNama`, `isNikRegistered` as mock
- [x] T007 [US1] Update `src/views/master-data/PekebunListView.vue` to call `store.fetchPekebunList` on mount, use `store.pagination` for pagination controls, add "Semua" / "Draft" / "Terdaftar" tab filters with client-side filtering by `isDraft` field, connect delete to `store.deletePekebun`, add visual draft badge on rows

**Checkpoint**: Pekebun list page fully functional with API data, tabs, search, pagination, delete

---

## Phase 4: User Story 2 - Create Pekebun with Lahan (Priority: P1) 🎯 MVP

**Goal**: Form wizard submits pekebun + lahan to API synchronously. Pekebun creates first, then lahan entries use the returned pekebun_id.

**Independent Test**: Navigate to form, fill all 3 steps, submit. Verify `POST /pekebun` called, then `POST /lahan` called for each lahan entry. Redirect to list on success.

### Implementation for User Story 2

- [x] T008 [US2] Create lahan store in `src/stores/lahan.ts` with state (lahanList, isLoading) and actions: `fetchLahanByPekebunId`, `createLahan` (builds FormData from LahanFormData, calls lahanService.create), `deleteLahan`
- [x] T009 [US2] Add API-backed create action in `src/stores/pekebun.ts`: `createPekebunWithLahan` that builds FormData from IdentitasFormData + DokumenFormData (snake_case keys), calls pekebunService.create, then sequentially calls lahanStore.createLahan for each LahanFormData entry using the returned pekebun_id
- [x] T010 [US2] Update `src/views/master-data/FormPekebunView.vue` handleSubmit to call `store.createPekebunWithLahan` instead of mock `addPekebunMulti`. Remove mock `addPekebun`, `addPekebunMulti`, `saveDraftPekebun`, `updateDraftPekebun`, `updatePekebun` from store. Keep `getDraftById` (will be updated in US5)
- [x] T011 [US2] Update `src/components/master-data/StepDataLahanPekebun.vue` to use `useLahanStore` for wilayah data lookup (reuse `getWilayahByParent`/`getWilayahNama` from pekebun store)

**Checkpoint**: Create flow works end-to-end with API. Lahan data submitted after pekebun.

---

## Phase 5: User Story 5 - Simpan Draft via API (Priority: P2)

**Goal**: Draft save calls `POST /pekebun` with `is_draft: true`, then submits lahan entries. Draft appears in "Draft" tab. Resuming a draft loads data from API.

**Independent Test**: Fill form partially, click "Simpan Draft". Verify `POST /pekebun` called with `is_draft: true`, lahan submitted. Draft visible in list's "Draft" tab. Click draft to resume — form loads with API data.

### Implementation for User Story 5

- [x] T012 [US5] Add `saveDraftPekebun` action in `src/stores/pekebun.ts` — same as `createPekebunWithLahan` but sets `is_draft: true` in FormData
- [x] T013 [US5] Add `resumeDraft` action in `src/stores/pekebun.ts` — calls `fetchPekebunById` to get pekebun data, then calls lahan store's `fetchLahanByPekebunId` to get associated lahan, returns both for form population
- [x] T014 [US5] Update `src/views/master-data/FormPekebunView.vue` handleSaveDraft to call `store.saveDraftPekebun`, onMounted to call `store.resumeDraft` when draftId query param present, populate form from resolved API data

**Checkpoint**: Drafts save to API, appear in "Draft" tab, can be resumed from list

---

## Phase 6: User Story 3 - Update Pekebun with Lahan Modifications (Priority: P2)

**Goal**: Editing an existing pekebun calls `PUT /pekebun/:id`, then synchronizes lahan (create new, update existing, delete removed).

**Independent Test**: Open a draft, modify fields, submit. Verify `PUT /pekebun/:id` called with `is_draft: false`. Existing lahan get `PUT /lahan/:id`, new lahan get `POST /lahan`, removed lahan get `DELETE /lahan/:id`.

### Implementation for User Story 3

- [x] T015 [US3] Add `updateLahan` action in `src/stores/lahan.ts` — builds FormData from LahanFormData, calls lahanService.update with lahan id
- [x] T016 [US3] Add `synchronizeLahan` action in `src/stores/lahan.ts` — for each lahan in formData list: if has existing id → PUT, if new (no id) → POST, track deleted lahan ids (existing but not in current form list) → DELETE
- [x] T017 [US3] Add `updatePekebunWithLahan` action in `src/stores/pekebun.ts` — builds FormData from IdentitasFormData + DokumenFormData (only changed fields), calls pekebunService.update with pekebun id, then calls lahanStore.synchronizeLahan
- [x] T018 [US3] Update `src/views/master-data/FormPekebunView.vue` handleSubmit to call `store.updatePekebunWithLahan` when editingDraftId exists, setting `is_draft: false` to finalize. Update onMounted to populate form with existing data for edit mode

**Checkpoint**: Update flow works. Drafts can be finalized. Lahan synchronized correctly.

---

## Phase 7: User Story 4 - View Pekebun Detail with Lahan Data (Priority: P2)

**Goal**: Pekebun detail view fetches pekebun + lahan from API and displays combined data.

**Independent Test**: Open pekebun detail (modal or page). Verify `GET /pekebun/:id` and `GET /lahan?pekebun_id=` are called. Both data displayed together.

### Implementation for User Story 4

- [x] T019 [US4] Add `fetchPekebunDetail` action in `src/stores/pekebun.ts` — calls `fetchPekebunById` then `lahanStore.fetchLahanByPekebunId`, returns combined data
- [x] T020 [US4] Update `src/views/master-data/PekebunListView.vue` detail modal to use `store.fetchPekebunDetail` for loading pekebun + lahan data from API instead of in-memory list lookup

**Checkpoint**: Detail view shows API-fetched pekebun and lahan data

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, edge cases, validation improvements

- [ ] T021 [P] Remove remaining mock data from `src/stores/pekebun.ts` — remove mock `MOCK_WILAYAH`, `MOCK_DUKCAPIL`, hardcoded `listPekebun` default values. Keep mock functions as-is since Dukcapil/Wilayah have no real API
- [ ] T022 [P] Remove `pinia-plugin-persistedstate` persist config from `src/stores/pekebun.ts` since data now comes from API (persist only needed for auth store)
- [ ] T023 Handle edge cases: add loading states to all views, add error toast on API failures, preserve form data on network error, show 404 message for deleted records
- [ ] T024 Run quickstart.md validation scenarios from `specs/001-pekebun-lahan-store-integration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — project already initialized
- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories
- **US1 List (Phase 3)**: Depends on Phase 2. No dependency on other stories
- **US2 Create (Phase 4)**: Depends on Phase 2 + US1 (uses pekebun store). Requires lahan types/service/store
- **US5 Draft (Phase 5)**: Depends on US2 (extends create form with draft flag)
- **US3 Update (Phase 6)**: Depends on US5 (extends form with PUT + lahan sync)
- **US4 Detail (Phase 7)**: Depends on Phase 2 + US1 (uses pekebun store + lahan store)
- **Polish (Phase 8)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — independent
- **US2 (P1)**: Can start after Phase 2 + US1 (needs pekebun store)
- **US5 (P2)**: Depends on US2 (same form view)
- **US3 (P2)**: Depends on US5 (same form view, extends with update)
- **US4 (P2)**: Can start after Phase 2 + US1 (independent of create/edit form, just needs stores)

### Within Each User Story

- Types before services
- Services before stores
- Stores before views
- Core implementation before integration

### Parallel Opportunities

- T002, T003, T004 (Phase 2) can all run in parallel
- T012 + T013 (Phase 5, store actions) can run in parallel
- T015 + T016 (Phase 6, lahan store actions) can run in parallel
- T019 (Phase 7, store action) and T020 (view update) are sequential
- US4 (Phase 7) can start in parallel with US5/US3 (different files)
- T021 + T022 (Phase 8 cleanup) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational tasks together:
Task: "Create Lahan types in src/types/lahan.ts"
Task: "Create pekebun service in src/services/pekebun.service.ts"
Task: "Create lahan service in src/services/lahan.service.ts"
```

## Parallel Example: Phase 5 + Phase 6 Store Actions

```bash
# Store actions within same phase can run in parallel:
Task: "Add saveDraftPekebun action in src/stores/pekebun.ts"
Task: "Add resumeDraft action in src/stores/pekebun.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 2: Foundational (T001-T004)
2. Complete Phase 3: US1 - List (T005-T007)
3. Complete Phase 4: US2 - Create (T008-T011)
4. **STOP and VALIDATE**: List loads from API, create works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Foundational → services ready
2. US1 → List page with API data, tabs, pagination (MVP!)
3. US2 → Create form with pekebun + lahan submission (MVP!)
4. US5 → Draft save/resume
5. US3 → Update/finalize drafts
6. US4 → Detail with API data
7. Polish → Cleanup, error handling

### Parallel Team Strategy

With multiple developers:
1. Team completes Phase 2 together
2. Once Phase 2 done:
   - Developer A: US1 (List) → US4 (Detail)
   - Developer B: After US1 done → US2 (Create) → US5 (Draft) → US3 (Update)
3. Stories integrate at shared store boundary

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Mock Dukcapil and Wilayah functions preserved since no real API endpoints exist for them
- `pinia-plugin-persistedstate` removed from pekebun store since data is now API-backed