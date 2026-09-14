# Tasks: Integrasi Jumlah Tahap RAB Dinamis per Paket Sarpras (Frontend)

**Feature**: `073-paket-sarpras-tahapan-rab`
**Spec**: [spec.md](spec.md)

## Tasks List

- [X] T001 [P] [US1] Update TypeScript interface `MasterPaketSarpras` in `src/types/masterSarpras.ts` to include `jumlah_tahap: number`
- [X] T002 [US1] Update helper `getRabTahapCount` in `src/types/rab.ts` to consume `jumlah_tahap` from master data with fallback
- [X] T003 [US1] Update `StepRAB.vue` in `src/views/pengusulan/StepRAB.vue` and `RabTable.vue` in `src/components/pengusulan/RabTable.vue` to render dynamic stage columns and map values into `details` (`jumlahTahap1`..`jumlahTahap4`)
- [X] T004 [US1] Implement validation in `StepRAB.vue` ensuring each active stage has at least 1 line item with nominal > 0 before proposal submission
- [X] T005 [P] Run frontend test suite `npm run test` to verify no regressions
