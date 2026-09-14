# Tasks: Rename Nomor Resi to Nomor Proposal

**Input**: Design documents from `/specs/010-rename-resi-to-proposal/`

**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Manual testing only.

## Phase 1: Renaming in Pengusulan Module

- [ ] T001 [US1] Rename visual Nomor Resi wording in `src/views/pengusulan/TrackingPengusulanView.vue`
- [ ] T002 [US2] Rename Nomor Resi success notification wording in `src/views/pengusulan/StepPilihPekebunLahan.vue`

---

## Phase 2: Renaming in Dinas & Ditjenbun Verification Modules

- [ ] T003 [US1] Rename Nomor Resi table header wording in `src/views/ditjenbun/PenetapanPlenoView.vue`
- [ ] T004 [US1] Rename Nomor Resi table header wording in `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue`
- [ ] T005 [US1] Rename Nomor Resi header label wording in `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`
- [ ] T006 [US1] Rename Nomor Resi table header wording in `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`
- [ ] T007 [US1] Rename Nomor Resi header label wording in `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`

---

## Phase 3: Validation & Build Check

- [ ] T008 Run type checking and production build check `npm run build` to verify compatibility
