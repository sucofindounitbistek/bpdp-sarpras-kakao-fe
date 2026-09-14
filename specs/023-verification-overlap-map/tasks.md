# Tasks: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Input**: Design documents from `/specs/023-verification-overlap-map/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested. Manual verification via quickstart.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create directory structure

- [x] T001 Install `@turf/turf` dependency via `npm install @turf/turf`
- [x] T002 Create `src/components/verification/` directory if it does not exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core component and localization that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create `VerificationOverlapMap.vue` in `src/components/verification/VerificationOverlapMap.vue`. Implement: Leaflet map initialization with Esri World Imagery satellite tiles, `L.polygon` rendering for active polygons (blue: `#2563EB`, opacity 0.3, weight 3) and other proposal polygons (red: `#DC2626`, opacity 0.2, weight 2), `L.control` custom legend at bottomright with two entries ("Proposal Sedang Diverifikasi" / "Proposal Lain"), `bindPopup` on red polygons showing proposal number + name, `fitBounds` on active polygon on mount, `parseCoordinatePolygon` integration from `src/lib/coordinatePolygon.ts`, collapsible section wrapper with `ChevronDown`/`ChevronUp` icons (default collapsed), cleanup on unmount. Follow styling from contracts/VerificationOverlapMap.md.
- [x] T004 [P] Add `verificationMap` section to `src/config/localization.ts` with all keys: `sectionTitle`, `toggleOpen`, `toggleClose`, `legendActive`, `legendOther`, `noPolygon`, `noOtherProposals`. Reference values from data-model.md.

**Checkpoint**: Foundation ready - `VerificationOverlapMap` component with map, polygons, legend, and collapsible wrapper exists. User story integration can begin.

---

## Phase 3: User Story 1 - Peta Global dengan Poligon Biru dan Merah (Priority: P1) 🎯 MVP

**Goal**: Verifikator melihat peta satelit dengan poligon biru (proposal aktif) dan poligon merah (proposal lain) pada halaman verifikasi utama.

**Independent Test**: Login sebagai `DITJENBUN_VERIFIKATOR`, buka `/ditjenbun/rekomtek/ceki/:id`, expand section peta, verifikasi poligon biru dan merah muncul dengan legend.

### Implementation for User Story 1

- [x] T005 [US1] Integrate `VerificationOverlapMap` in `src/views/ditjenbun/CekiDitjenbunView.vue`. Import component, compute `activePolygons` from `activeUsulan.pekebunList` by parsing `koordinatPoligon`, compute `nearbyProposals` from `useRekomtekStore().listUsulan` filtered by geographic radius (50km from active centroid) and polygon data existence, add collapsible section between validation card and LogStatusUsulan.
- [x] T006 [P] [US1] Integrate `VerificationOverlapMap` in `src/views/bpdp/CekiBpdpView.vue`. Import component, compute `activePolygons` from `activeUsulan.pekebunList` by parsing `koordinatPoligon`, compute `nearbyProposals` from `useRekomtekStore().listUsulan` filtered by geographic radius (50km from active centroid) and polygon data existence, add collapsible section between validation card and LogStatusUsulan.

**Checkpoint**: Peta global dengan poligon biru/merah dan legend berfungsi di CekiDitjenbunView dan CekiBpdpView.

---

## Phase 4: User Story 2 - Legend, Overlap Detection, dan Daftar Tumpang Tindih (Priority: P2)

**Goal**: Peta menampilkan legend yang jelas dan mendeteksi tumpang tindih lahan antar proposal, menampilkan daftar overlap dengan luas area irisan.

**Independent Test**: Buka peta pada proposal yang memiliki tumpang tindih, verifikasi legend, daftar overlap muncul dengan info proposal + luas irisan.

### Implementation for User Story 2

- [x] T007 [US2] Add overlap detection logic to `src/components/verification/VerificationOverlapMap.vue`. Import `intersect` and `area` from `@turf/turf`, create `computeOverlaps()` function that iterates over active polygons vs other proposal polygons, calls `turf.intersect(polyA, polyB)`, converts area from m² to hectares, returns `OverlapInfo[]`. Handle edge cases: invalid polygon data, no intersection, self-intersection.
- [x] T008 [US2] Add overlap results list UI to `src/components/verification/VerificationOverlapMap.vue`. Below the map, render a card with heading "Tumpang Tindih Terdeteksi" when overlaps exist, listing each overlap entry with proposal number, proposal name, overlap area (Ha), and overlap percentage. Show empty state when no overlaps detected. Add localization keys: `overlapTitle`, `overlapCount`, `overlapArea`, `overlapPercentage`.

**Checkpoint**: Overlap detection and results list works. Verifikator dapat melihat daftar proposal yang tumpang tindih dengan luas irisan.

---

## Phase 5: User Story 3 - Konsistensi di Seluruh Halaman Verifikasi (Priority: P3)

**Goal**: Peta global tersedia di semua halaman verifikasi Dinas Kab/Kota dan Dinas Provinsi dengan tampilan dan perilaku yang sama.

**Independent Test**: Buka halaman verifikasi Dinas Kab/Kota dan Dinas Provinsi, expand section peta, verifikasi tampilan identik dengan CekiDitjenbun/CekiBpdp.

### Implementation for User Story 3

- [x] T009 [P] [US3] Integrate `VerificationOverlapMap` in `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`. Import component, compute `activePolygons` from proposal pekebun data, compute `nearbyProposals` from store, add collapsible section below pekebun verification cards.
- [x] T010 [P] [US3] Integrate `VerificationOverlapMap` in `src/views/dinas/provinsi/StepVerifikasiPekebun.vue`. Import component, compute `activePolygons` from proposal pekebun data, compute `nearbyProposals` from store, add collapsible section below pekebun verification cards.
- [x] T011 [P] [US3] Integrate `VerificationOverlapMap` in `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`. Import component, compute polygon data, add collapsible section within the wizard step content area.
- [x] T012 [P] [US3] Integrate `VerificationOverlapMap` in `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`. Import component, compute polygon data, add collapsible section within the wizard step content area.

**Checkpoint**: All 6 verification pages (CekiDitjenbun, CekiBpdp, StepVerifikasiPekebunDanDokumen, StepVerifikasiPekebun, DetailVerifikasiKab, DetailVerifikasiProv) use the same `VerificationOverlapMap` component.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and final quality checks

- [x] T013 Run quickstart.md validation scenarios across all verification pages to verify end-to-end behavior
- [x] T014 Run `npx vue-tsc -b --noEmit` to verify TypeScript strict mode compliance and resolve any type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2). Can run in parallel with US1 (enhances the same component, different code paths)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2). Fully independent from US1/US2 (different files)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent from US1 (enhances component with different features)
- **User Story 3 (P3)**: Can start after Foundational - Independent from US1/US2 (different files entirely)

### Within Each User Story

- T005 and T006 (US1) can run in parallel (different files)
- T007 depends on T003 (same component file), T008 depends on T007
- T009-T012 (US3) can all run in parallel (different files)

### Parallel Opportunities

- T003 and T004 can run in parallel (different files)
- T005 and T006 can run in parallel (different files within US1)
- T009, T010, T011, T012 can all run in parallel (different files within US3)
- US1, US2, US3 can all start in parallel after Foundational (US2 modifies same component as T003 but US1/US3 are in different files)

---

## Parallel Example: User Story 3

```bash
# After Foundational phase complete, launch all 4 integrations together:
Task: "Integrate in src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue"
Task: "Integrate in src/views/dinas/provinsi/StepVerifikasiPekebun.vue"
Task: "Integrate in src/views/dinas/kabupaten/DetailVerifikasiKabView.vue"
Task: "Integrate in src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - component + localization)
3. Complete Phase 3: User Story 1 (map + polygons on 2 main pages)
4. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Component ready
2. Add User Story 1 → Map with polygons works → Deploy/Demo (MVP!)
3. Add User Story 2 → Overlap detection + list works → Deploy/Demo
4. Add User Story 3 → All 6 pages consistent → Deploy/Demo
5. Polish → Typecheck + validation → Final

### Parallel Team Strategy

With 2 developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 + US2 (CekiDitjenbun/CekiBpdp + overlap detection in component)
   - Developer B: US3 (all 4 Dinas verification pages)
3. Both complete independently → Polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `VerificationOverlapMap` component is the single reusable component for all 6 pages
- US2 enhances the same component created in T003 - must be done sequentially
- Overlap detection uses `@turf/turf` for accurate geometric intersection calculation
- Geographic radius filter (50km) uses Haversine formula from centroid of active polygon
- Polygon data is parsed from `koordinatPoligon` string using existing `parseCoordinatePolygon()` from `src/lib/coordinatePolygon.ts`