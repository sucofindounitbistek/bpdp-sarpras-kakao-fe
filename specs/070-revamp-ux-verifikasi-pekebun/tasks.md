# Tasks: Revamp UX Halaman Verifikasi Pekebun

**Input**: Design documents from `/specs/070-revamp-ux-verifikasi-pekebun/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`

## Format: `[ID] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: Belongs to user story (US1, US2, US3, US4)

---

## Phase 1: Setup & Foundational

**Purpose**: Core state mapping, progress counters, and navigation prerequisites

- [x] T001 [P] Map and verify all document types, lahan groups, and field verifications in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T002 [P] Implement computed helpers for verification progress (`totalDocs`, `verifiedDocs`, `approvedDocs`, `rejectedDocs`) and next pekebun resolution (`nextCpclId`, `hasNextPekebun`) in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`

---

## Phase 2: User Story 1 - Workbench Verifikasi Terpadu (Priority: P1) 🎯 MVP

**Goal**: Split 2-column workbench: left column document selector & viewer, right column data cross-check form

- [x] T003 [US1] Redesign page header into a clean profile card (Nama, NIK, No KK, status kawin) with inline progress bar in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T004 [US1] Implement Left Column: Document selector with categorized sections (Identitas Pekebun & Legalitas Lahan) and status indicators in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T005 [US1] Implement Left Column: Interactive Document Viewer (PDF embed / image container with zoom and full modal preview trigger) in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T006 [US1] Implement Right Column: Data validation card displaying applicant inputs vs document fields with `[Sesuai]` and `[Tidak Sesuai]` action buttons in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T007 [US1] Implement Right Column: Contextual rejection textarea with smooth transition and "Dokumen Berikutnya" shortcut button in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`

---

## Phase 3: User Story 2 - Indikator Progres & Status Validasi Visual (Priority: P2)

**Goal**: Real-time visual feedback across document list items and header counter

- [x] T008 [US2] Connect dynamic badge colors (`bg-emerald-50 text-emerald-700`, `bg-rose-50 text-rose-700`, `bg-slate-100 text-slate-500`) to `docStatus(doc)` in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T009 [US2] Ensure header progress bar and completion tally reflect live changes as fields/documents are validated in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`

---

## Phase 4: User Story 3 - Sticky Bottom Action Bar & Navigasi Antar-Pekebun (Priority: P3)

**Goal**: Fixed bottom action bar with summary stats, return to proposal, and quick next pekebun jump

- [x] T010 [US3] Implement sticky bottom action bar (`fixed bottom-0 z-30`) with summary pill (Sesuai, Perlu Catatan, Belum Dicek) in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T011 [US3] Implement navigation handlers for "Kembali ke Usulan" (`goBack()`) and "Lanjut ke Pekebun Berikutnya" (`goToNextPekebun()`) in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`

---

## Phase 5: User Story 4 - Detail Lengkap & Peta Poligon dalam Accordion Collapsible (Priority: P4)

**Goal**: Clean vertical layout by placing secondary tables & satellite map in an accordion

- [x] T012 [US4] Move full identity fields and multi-lahan agronomic details into a collapsible accordion card below the workbench in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [x] T013 [US4] Integrate `SatelliteMapPreview` within the collapsible accordion for coordinate inspection without cluttering primary view in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`

---

## Phase 6: Polish & Verification

**Goal**: Production build validation and visual polish

- [x] T014 Execute TypeScript compiler check `npx vue-tsc -b` and fix any type discrepancies
- [x] T015 Run `npm run build` and verify bundle build succeeds with exit code 0
- [x] T016 Document UX revamp in `walkthrough.md`
