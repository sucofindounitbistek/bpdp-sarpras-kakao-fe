# Tasks: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Input**: Design documents from `/specs/007-sarpras-step3-pekebun-lahan/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested (per Constitution Principle: no automated tests required)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project initialization needed — feature extends existing pengusulan wizard. Skip setup.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, config, and store extensions that ALL user stories depend on. Must complete before any UI work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Add `LahanDokumenOwnership` interface to `src/types/pengusulan.ts`
- [x] T002 [P] Add `PaketMinimumRule` interface to `src/types/pengusulan.ts`
- [x] T003 [P] Add `Step3ValidationResult` interface to `src/types/pengusulan.ts`
- [x] T004 Add `PAKET_MINIMUM_REQUIREMENTS` static config (11 entries from spec FR-008 table) to `src/lib/pengusulan-persyaratan.config.ts`
- [x] T005 Add `selectedLahanDocs` state (`Ref<Record<string, LahanDokumenOwnership>>`) to `src/stores/pengusulanDraft.ts`
- [x] T006 [P] Add `setLahanDoc` and `removeLahanDoc` actions to `src/stores/pengusulanDraft.ts`
- [x] T007 [P] Add `step3TotalPekebun`, `step3TotalLuasHa`, `step3MinimumRule`, `step3ValidationResult` getters to `src/stores/pengusulanDraft.ts`
- [x] T008 Update `isStep3Valid` getter in `src/stores/pengusulanDraft.ts` to include document ownership check and minimum validation
- [x] T009 Update `setSelectedPekebun`, `setSelectedLahan`, `resetDraft` actions in `src/stores/pengusulanDraft.ts` to manage `selectedLahanDocs` lifecycle

**Checkpoint**: Foundation ready — types, config, and store logic complete. User story implementation can now begin.

---

## Phase 3: User Story 1 — Combined Pekebun-Lahan Inline View (Priority: P1)

**Goal**: Display pekebun and their lahan in a single combined inline view where each pekebun card shows its lahan info inline. Selecting a pekebun auto-selects its lahan. Summary bar shows real-time totals.

**Independent Test**: Open Step 3, verify pekebun cards show lahan info inline, check a pekebun → lahan auto-selected → summary bar updates.

### Implementation for User Story 1

- [x] T010 [US1] Rewrite pekebun list section in `src/views/pengusulan/StepPilihPekebunLahan.vue` to show combined inline view — each pekebun card with inline lahan info (nomorLegalitas, luasLahan, desa/kecamatan)
- [x] T011 [US1] Implement pekebun selection logic in `src/views/pengusulan/StepPilihPekebunLahan.vue`: checking a pekebun auto-selects its lahan and initializes `selectedLahanDocs`; unchecking removes both
- [x] T012 [US1] Add real-time summary bar in `src/views/pengusulan/StepPilihPekebunLahan.vue` showing `step3TotalPekebun` and `step3TotalLuasHa` from store getters
- [x] T013 [US1] Handle edge cases in `src/views/pengusulan/StepPilihPekebunLahan.vue`: empty state (no pekebun registered), "Belum ada lahan" indicator for pekebun without lahan, disabled checkbox for pekebun without lahan

**Checkpoint**: User Story 1 works independently — pekebun-lahan combined view with summary bar.

---

## Phase 4: User Story 2 — Document Ownership Selection per Lahan (Priority: P1)

**Goal**: For each selected lahan, show document ownership fields: dropdown (SHM / Dokumen Lainnya), nomor dokumen input, and conditional jenis dokumen lainnya input.

**Independent Test**: Select a pekebun → verify document ownership fields appear under the lahan → switch to "Dokumen Lainnya" → jenis dokumen input appears → fill fields → data persists in store.

### Implementation for User Story 2

- [x] T014 [US2] Add document ownership fields in `src/views/pengusulan/StepPilihPekebunLahan.vue`: dropdown (SHM / Dokumen Lainnya), nomor dokumen input, conditional jenis dokumen lainnya input — rendered inline under each selected lahan
- [x] T015 [US2] Wire document ownership fields to `setLahanDoc` action in `src/views/pengusulan/StepPilihPekebunLahan.vue` — changes update `selectedLahanDocs` in store reactively
- [x] T016 [US2] Implement document ownership validation in `src/views/pengusulan/StepPilihPekebunLahan.vue`: block submit with toast error if any selected lahan has empty `nomorDokumen` or empty `jenisDokumenLainnya` (when "Dokumen Lainnya" selected)

**Checkpoint**: User Story 2 works — document ownership fields per lahan with validation.

---

## Phase 5: User Story 3 — Minimum Paket Validation (Priority: P1)

**Goal**: Real-time validation of selected pekebun count and total luas against minimum requirements of chosen paket. Status bar with pass/fail indicator, warning messages, and jarak antar kebun note.

**Independent Test**: Select "Ekstensifikasi" in Step 1, select 3 pekebun in Step 3 → verify red warning shows minimum deficit → select more pekebun until ≥20 → verify green status.

### Implementation for User Story 3

- [x] T017 [US3] Add validation status bar in `src/views/pengusulan/StepPilihPekebunLahan.vue` — persistent bar at top of Step 3 content showing: `step3ValidationResult` (pass/fail indicator, message, pekebun deficit, luas deficit)
- [x] T018 [US3] Implement visual states for validation bar in `src/views/pengusulan/StepPilihPekebunLahan.vue`: green (`isValid`), amber/red (not valid), neutral (no minimum — Verifikasi Teknis)
- [x] T019 [US3] Add jarak antar kebun informational note in `src/views/pengusulan/StepPilihPekebunLahan.vue` — shown only when `step3MinimumRule.jarakAntarKebunKm` is non-null
- [x] T020 [US3] Update `handleSubmit` in `src/views/pengusulan/StepPilihPekebunLahan.vue` to use updated `isStep3Valid` (includes document ownership + minimum validation); show detailed error toast for validation failures

**Checkpoint**: User Story 3 works — minimum validation with real-time status bar.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Update preview modal, handle cross-step data reset, and verify end-to-end.

- [x] T021 Update `ProposalPreviewModal.vue` Section 5 (Pekebun & Lahan) in `src/components/pengusulan/ProposalPreviewModal.vue` to show: total pekebun count, total luas, and document ownership info per lahan (jenis + nomor dokumen)
- [x] T022 Handle paket change edge case: when `setPaket` is called with a different paket, reset `selectedPekebunIds`, `selectedLahanIds`, and `selectedLahanDocs` in `src/stores/pengusulanDraft.ts`. Show confirmation toast in `src/views/pengusulan/StepPilihPekebunLahan.vue` (or `StepPaketSarpras.vue`) when returning to Step 1 and changing paket after Step 3 data has been filled.
- [x] T023 Run quickstart.md validation scenarios 1-11 in `specs/007-sarpras-step3-pekebun-lahan/quickstart.md`; verify TypeScript compilation (`npx vue-tsc -b`) and production build (`npm run build`) pass with 0 errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (US1) — document fields are added to the combined tree view.
- **User Story 3 (Phase 5)**: Depends on Phase 2 (store getters) — can partially overlap with US1/US2 but the status bar is added to the same component file.
- **Polish (Phase 6)**: Depends on all user stories complete.

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no story dependencies. Foundation for US2 and US3.
- **User Story 2 (P1)**: After US1 — adds document fields to the tree view built in US1.
- **User Story 3 (P1)**: After US1 — adds validation bar; store getters already in place from Phase 2.

### Within Each User Story

- Store logic before component wiring
- Component structure before inline fields
- Core UI before validation/edge cases

### Parallel Opportunities

- **Phase 2**: T001, T002, T003 (types) can run in parallel. T006, T007 (store actions/getters) can run in parallel after T005.
- **Phase 3-5**: All target the same file (`StepPilihPekebunLahan.vue`), so must be sequential within the component. However, T021 (ProposalPreviewModal) can run in parallel with Phase 3-5.
- **Phase 6**: T022 (store) can run in parallel with T021 (preview modal).

---

## Parallel Example: Foundational Phase

```bash
# Launch all type definitions together:
Task: "Add LahanDokumenOwnership interface to src/types/pengusulan.ts"
Task: "Add PaketMinimumRule interface to src/types/pengusulan.ts"
Task: "Add Step3ValidationResult interface to src/types/pengusulan.ts"

# After T005, launch store actions and getters in parallel:
Task: "Add setLahanDoc and removeLahanDoc actions to src/stores/pengusulanDraft.ts"
Task: "Add step3TotalPekebun, step3TotalLuasHa, step3MinimumRule, step3ValidationResult getters to src/stores/pengusulanDraft.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (types, config, store)
2. Complete Phase 3: User Story 1 (combined tree view)
3. **STOP and VALIDATE**: Test Step 3 with pekebun selection and summary bar
4. Demo if ready

### Incremental Delivery

1. Foundational → Types, config, store ready
2. US1 → Combined pekebun-lahan tree view (MVP!)
3. US2 → Document ownership per lahan
4. US3 → Minimum paket validation
5. Polish → Preview modal update, cross-step reset, verification

### Parallel Team Strategy

With multiple developers:

1. Developer A: Foundational phase (types, config, store) — all Phase 2
2. Once Foundational done:
   - Developer A: StepPilihPekebunLahan.vue (US1, US2, US3 sequentially)
   - Developer B: ProposalPreviewModal.vue (T021) + store paket-change reset (T022)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Single component file (`StepPilihPekebunLahan.vue`) is heavily modified across US1-US3 — tasks must be sequential within that file
- No new npm dependencies, no new backend endpoints
- All validation is client-side; no API calls added
- Store uses `Record<string, LahanDokumenOwnership>` (not `Map`) for Vue 3 reactivity with `ref`