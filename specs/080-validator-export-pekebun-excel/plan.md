# Implementation Plan: Fitur Ekspor Excel Data Pekebun & Lahan untuk Seluruh Validator

**Branch**: `080-validator-export-pekebun-excel` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/080-validator-export-pekebun-excel/spec.md`

## Summary

Menyediakan fitur unduh/ekspor 2 format laporan Excel (Laporan Titik Koordinat & Laporan Profil Pekebun) pada tampilan verifikasi/peninjauan proposal di section pekebun untuk semua peran validator (Kabupaten, Provinsi, Ditjenbun, BPDP). Ekspor di-generate secara efisien di client-side menggunakan generator XML Spreadsheet Excel berstandar industri dengan format teks protektif pada nomor NIK dan KK serta pemetaan sudut poligon 1 baris per titik koordinat.

## Technical Context

**Language/Version**: TypeScript 5.7, Vue 3.5  
**Primary Dependencies**: Vue 3, Pinia, Lucide Vue Next, `@turf/turf` (parsing spasial jika dibutuhkan)  
**Storage**: Client-side reactive stores (`usePengusulanStore`, `usePekebunStore`)  
**Testing**: Vitest (`vitest run`)  
**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Single Page Web Application (Frontend)  
**Performance Goals**: Waktu generasi dan download berkas < 500ms untuk proposal dengan >100 pekebun  
**Constraints**: Tanpa dependensi runtime baru, format NIK/KK tidak boleh terdistorsi jadi scientific notation di MS Excel  
**Scale/Scope**: 2 modul verifikasi utama (`StepVerifikasiPekebunDanDokumenProposal.vue` dan `PratinjauPekebunDanDokumenProposal.vue`), 1 utility exporter (`exportPekebunExcel.ts`), 1 reusable dropdown UI component (`DropdownEksporPekebun.vue`)

## Project Structure

### Documentation (this feature)

```text
specs/080-validator-export-pekebun-excel/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research findings
├── data-model.md        # Data mapping & column specifications
├── contracts/           # Function & Component interfaces
│   └── export-contract.md
├── quickstart.md        # Step-by-step verification guide
├── checklists/
│   └── requirements.md
└── tasks.md             # (To be generated via /speckit-tasks)
```

### Source Code Architecture

```text
bpdp-sarpras-kelapa-fe/
├── src/
│   ├── utils/
│   │   ├── exportPekebunExcel.ts        # [NEW] Generator XML Spreadsheet Excel untuk 2 Laporan
│   │   └── exportPekebunExcel.test.ts   # [NEW] Unit test generator ekspor pekebun
│   ├── components/
│   │   └── verification/
│   │       ├── DropdownEksporPekebun.vue            # [NEW] Reusable export dropdown button
│   │       ├── DropdownEksporPekebun.test.ts        # [NEW] Component unit test
│   │       └── PratinjauPekebunDanDokumenProposal.vue # [MODIFY] Tambah tombol ekspor di toolbar
│   └── views/
│       └── dinas/
│           └── kabupaten/
│               └── StepVerifikasiPekebunDanDokumenProposal.vue # [MODIFY] Tambah tombol ekspor di toolbar B
```

## Implementation Phases

- **Phase 1: Exporter Utility & Logic**:
  - Implementasi generator XML Spreadsheet dengan metadata sheet, header styling, cell data types (`String`, `Number`).
  - Implementasi `exportLaporanTitikKoordinat(context)`.
  - Implementasi `exportLaporanProfilPekebun(context)`.
  - Unit test `exportPekebunExcel.test.ts`.
- **Phase 2: UI Dropdown Component**:
  - Buat `DropdownEksporPekebun.vue` dengan dropdown menu interaktif dan state disabled jika data kosong.
  - Unit test `DropdownEksporPekebun.test.ts`.
- **Phase 3: Integrasi Seluruh Validator**:
  - Integrasikan ke `StepVerifikasiPekebunDanDokumenProposal.vue` (toolbar Sub-bagian B).
  - Integrasikan ke `PratinjauPekebunDanDokumenProposal.vue` (header tabel pekebun untuk Provinsi, Ditjenbun, BPDP).
- **Phase 4: Verifikasi & Test Runner**:
  - Eksekusi `npm run test` untuk memastikan semua unit test lulus dan clean build.
