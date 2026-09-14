# Tasks: Integrasi API Master Wilayah IAM pada Pengisian Lahan Pekebun

**Input**: Design documents from `specs/086-integrate-iam-region-api/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/iam-region-api.contract.md`, `quickstart.md`)  
**Feature Branch**: `086-integrate-iam-region-api`  

---

## Phase 1: Setup (Shared Types & Definitions)

**Purpose**: Establish domain models and type interfaces for regional master data and form state.

- [X] T001 Create region domain types (`Province`, `Regency`, `RegionOption`, `RegionState`) in `src/types/region.ts`
- [X] T002 [P] Align `LahanFormData` and region references in `src/types/pekebun.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core HTTP services and Pinia state management that MUST be complete before UI wiring.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Implement `src/services/region.service.ts` with Axios HTTP client pointing to `VITE_IAM_API_URL` (`fetchProvinces`, `fetchRegenciesByProvinceId`)
- [X] T004 Implement Pinia region store `src/stores/region.ts` (`useRegionStore`) with in-memory caching and lookup helpers (`getProvinceName`, `getRegencyName`, `getWilayahNama`)
- [X] T005 Update `src/stores/pekebun.ts` to delegate `getWilayahByParent` and `getWilayahNama` to `useRegionStore` for backward compatibility

**Checkpoint**: Region service and store foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Pemuatan dan Pemilihan Provinsi dari API Master Wilayah IAM (Priority: P1) 🎯 MVP

**Goal**: Operator KP can select from all 38 Indonesian provinces dynamically loaded from IAM (`GET /public/regions/provinces`).

**Independent Test**: Open Pekebun registration wizard, navigate to Step 3 (Data Lahan), click "Tambah Lahan Baru" -> tab "Alamat & Wilayah", and verify that the Provinsi dropdown displays 38 provinces from API IAM with a responsive loading indicator.

### Implementation for User Story 1

- [X] T006 [US1] Bind Provinsi dropdown in `src/components/master-data/StepDataLahanPekebun.vue` to `regionStore.provinces` via `regionStore.loadProvinces()`
- [X] T007 [US1] Implement loading spinner and error handling with retry notification in `src/components/master-data/StepDataLahanPekebun.vue`

**Checkpoint**: User Story 1 is functional - 38 provinces load dynamically from API IAM with 0 mock dependency.

---

## Phase 4: User Story 2 - Pemilihan Kabupaten/Kota Dinamis Berdasarkan Provinsi Terpilih (Priority: P1) 🎯 MVP

**Goal**: Operator KP can select regencies/cities dynamically filtered by the selected province from IAM (`GET /public/regions/regencies?province_id={id}`).

**Independent Test**: Select a province (e.g. "RIAU"), verify that the Kabupaten dropdown becomes enabled and populates with Riau regencies (e.g. "KABUPATEN SIAK"). Changing province resets the kabupaten choice and loads the new regency list.

### Implementation for User Story 2

- [X] T008 [US2] Implement dynamic Kabupaten dropdown binding and API trigger upon province selection in `src/components/master-data/StepDataLahanPekebun.vue`
- [X] T009 [US2] Implement child reset logic (clear kabupaten, kecamatan, desa on province change) and disabled state when no province is chosen in `src/components/master-data/StepDataLahanPekebun.vue`

**Checkpoint**: User Stories 1 & 2 are complete - Province and Regency cascade works end-to-end with API IAM.

---

## Phase 5: User Story 3 - Pengisian Kecamatan dan Desa Fleksibel Berbasis Teks Bebas (Priority: P2)

**Goal**: Operator KP can freely enter Kecamatan and Desa names via text inputs for any location in Indonesia without being blocked by missing master data.

**Independent Test**: Select a province and regency, then enter custom text into Kecamatan (e.g. "Siak") and Desa (e.g. "Kampung Rempak"). Save the land and verify that the card summary displays the complete location hierarchy. Re-edit the land to confirm values rehydrate accurately.

### Implementation for User Story 3

- [X] T010 [US3] Replace Kecamatan `<select>` with standard free-text `<input type="text">` with clear placeholder in `src/components/master-data/StepDataLahanPekebun.vue`
- [X] T011 [US3] Replace Desa `<select>` with standard free-text `<input type="text">` with clear placeholder in `src/components/master-data/StepDataLahanPekebun.vue`
- [X] T012 [US3] Update land card summary display in `src/components/master-data/StepDataLahanPekebun.vue` to format region hierarchy seamlessly for both ID codes and text names
- [X] T013 [US3] Verify draft rehydration and land editing in `src/components/master-data/StepDataLahanPekebun.vue` to ensure province, regency, kecamatan, and desa restore correctly

**Checkpoint**: All user stories functional - complete nationwide land registration workflow enabled.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate cross-module compatibility, strict typing, and production bundle build.

- [X] T014 Ensure cross-component compatibility with `src/views/pengusulan/StepPilihPekebunLahan.vue` and `src/utils/regionHelper.ts`
- [X] T015 Run TypeScript strict typecheck (`npx vue-tsc -b`) and resolve any typing issues
- [X] T016 Run production build (`npm run build`) to ensure clean bundle compilation
- [X] T017 Execute manual validation scenarios defined in `specs/086-integrate-iam-region-api/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (province selection triggers regency cascade).
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities
- T001 and T002 can run in parallel during Setup.
- T010 and T011 (Kecamatan and Desa input conversions) can be developed in tandem.
- T015, T016, and T017 can run in sequence during final validation.

---

## Implementation Strategy

### MVP Scope (User Story 1 & 2)
1. Complete Setup (T001-T002) + Foundational (T003-T005).
2. Implement US1 (T006-T007): 38 Provinces from API IAM.
3. Implement US2 (T008-T009): Regencies filtered by Province from API IAM.
4. Validate MVP: Real nationwide provinces and regencies selectable.

### Incremental Delivery (User Story 3 & Polish)
5. Implement US3 (T010-T013): Free-text Kecamatan and Desa inputs + rehydration.
6. Polish (T014-T017): Cross-component checks, `vue-tsc`, `npm run build`, and quickstart validation.
