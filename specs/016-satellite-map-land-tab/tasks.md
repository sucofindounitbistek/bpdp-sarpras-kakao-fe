# Tasks: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Input**: Design documents from `/specs/016-satellite-map-land-tab/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

## Format: `- [x] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup

**Purpose**: Environment verification and feature boundary alignment.

- [x] T001 Verify feature branch `016-satellite-map-land-tab` and dev server execution in repo root

---

## Phase 2: Foundational (New Reusable Component)

**Purpose**: Build reusable `SatelliteMapPreview.vue` Leaflet satellite map component.

**⚠️ CRITICAL**: Must be completed before embedding in DetailPekebunModal.

- [x] T002 [NEW] Create `src/components/ui/SatelliteMapPreview.vue` with Leaflet Esri World Imagery Satellite Tile Layer, polygon overlay (`#066C2A`), markers, info overlay badge, and auto-fitBounds

**Checkpoint**: Component ready for view/modal integration.

---

## Phase 3: User Story 1 & 3 - Detail Pekebun Land Tab Embed (Priority: P1) 🎯 MVP

**Goal**: Embed `<SatelliteMapPreview>` on Tab Lahan in `DetailPekebunModal.vue` so users see interactive satellite map visualization instead of raw text.

**Independent Test**: Open Master Data Pekebun, click Detail Pekebun, switch to Tab Lahan. Verify satellite map renders polygon and auto-centers.

### Implementation for User Story 1 & 3

- [x] T003 [US1] [US3] Embed `<SatelliteMapPreview>` on Tab Lahan in `src/components/master-data/DetailPekebunModal.vue`, replacing raw JSON text display

**Checkpoint**: User Story 1 & 3 complete and independently testable (MVP ready).

---

## Phase 4: User Story 2 - App-Wide Satellite Map Standardization (Priority: P1)

**Goal**: Standardize existing Leaflet maps in form steps to use Satellite Imagery tile layer.

**Independent Test**: Open CPCL or Pekebun land registration form. Verify map displays Satellite imagery.

### Implementation for User Story 2

- [x] T004 [P] [US2] Update Leaflet tile layer to Esri World Imagery Satellite in `src/components/master-data/StepDataLahanPekebun.vue`
- [x] T005 [P] [US2] Update Leaflet tile layer to Esri World Imagery Satellite in `src/views/pengusulan/StepDataCPCL.vue`

**Checkpoint**: User Story 2 complete.

---

## Phase 5: Polish & Type Safety Checks

**Purpose**: Confirm satellite rendering across all map components and verify zero TypeScript compilation errors.

- [x] T006 Run `quickstart.md` validation scenarios and verify zero type check errors with `npx vue-tsc -b`

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Create SatelliteMapPreview.vue)
    ↓
Phase 3 (US1 & US3: Embed SatelliteMapPreview in DetailPekebunModal.vue) 🎯 MVP
    ↓
Phase 4 (US2: Standardize StepDataLahanPekebun.vue & StepDataCPCL.vue to Satellite)
    ↓
Phase 5 (Verification & Type Checks)
```

---

## Implementation Strategy

### MVP First (Phases 1-3)
1. Complete Phase 1 & Phase 2.
2. Embed `SatelliteMapPreview.vue` in `DetailPekebunModal.vue` (MVP!).
3. **Validate MVP**: Switch to Tab Lahan in Detail Pekebun modal to verify satellite map preview.

### Incremental Delivery
1. Add Phase 4 (Update existing form step maps to Satellite).
2. Complete Phase 5 (Validation & type safety check).
