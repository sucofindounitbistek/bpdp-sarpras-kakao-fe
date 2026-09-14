# Implementation Plan: Penambahan Kolom Tanggal dan Tahun Terbit Rekomtek pada Ekspor Data Ditjenbun & Excel Pekebun

**Branch**: `084-export-pekebun-rekomtek-date` | **Date**: 2026-09-14 | **Spec**: [`specs/084-export-pekebun-rekomtek-date/spec.md`](spec.md)

**Input**: Feature specification from [`specs/084-export-pekebun-rekomtek-date/spec.md`](spec.md)

---

## Summary

Menambahkan kolom **`Tanggal Terbit Rekomtek`** dan **`Tahun Terbit Rekomtek`** pada seluruh jalur penarikan data dan ekspor tabular Ditjenbun, khususnya pada kedua berkas spreadsheet Excel data pekebun:
1. **Laporan Titik Koordinat**: Berkembang dari 14 kolom menjadi **16 kolom**, di mana kolom tanggal dan tahun terbit Rekomtek disisipkan sebelum koordinat spasial (`Latitude` & `Longitude`).
2. **Laporan Profil Pekebun**: Berkembang dari 10 kolom menjadi **12 kolom**, di mana kolom tanggal dan tahun terbit Rekomtek disisipkan di akhir tabel setelah `Luas Lahan (Ha)`.
3. **Data Hasil Penarikan Usulan Ditjenbun**: Penambahan informasi tanggal dan tahun terbit Rekomtek pada fungsi ekspor rekapitulasi usulan proposal (`exportProposal.ts` untuk CSV dan PDF).
4. **Penyimpanan Tanggal Otomatis**: Memastikan timestamp tanggal terbit tersimpan otomatis ke dalam state usulan saat verifikator Ditjenbun melakukan aksi generate draf Rekomtek.

---

## Technical Context

**Language/Version**: TypeScript 5.3+, Vue 3.4+ (`<script setup>`)  
**Primary Dependencies**: Vite, Pinia, Lucide Vue Next, Tailwind CSS, Native XML Spreadsheet Engine  
**Storage**: Pinia reactive store cache, Browser memory Blob download, localStorage (token/session)  
**Testing**: Manual scenario verification, TypeScript strict validation (`vue-tsc -b`), build validation (`npm run build`)  
**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari), Microsoft Excel, Google Sheets, LibreOffice Calc  
**Project Type**: Single-Page Application (SPA) Frontend  
**Performance Goals**: Waktu generate dan unduh berkas spreadsheet < 2 detik untuk proposal dengan ribuan baris koordinat  
**Constraints**: Zero runtime error jika data Rekomtek kosong (fallback `-`), tanpa dependensi library eksternal baru yang berat  
**Scale/Scope**: 4 modul file utama di frontend:
- `src/utils/exportPekebunExcel.ts` (Core XML generation logic)
- `src/utils/exportProposal.ts` (CSV & PDF proposal export logic)
- `src/components/verification/DropdownEksporPekebun.vue` (UI description update)
- `src/views/ditjenbun/CekiDitjenbunView.vue` (Generate date persistence trigger)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Vue 3 & Component-Driven)**: ✅ PASS. Komponen SFC dan utilitas modular digunakan sesuai standar.
- **Principle II (Strict TypeScript & Schema Validation)**: ✅ PASS. Tipe data `ExportPekebunContext` dan helper fungsi memiliki interface TypeScript eksplisit.
- **Principle III (Pinia State Management)**: ✅ PASS. State usulan dan hasil generate dikelola melalui Pinia store (`rekomtek`, `verifikasiDitjenbun`, `pengusulan`).
- **Principle IV (Modern UI/UX)**: ✅ PASS. Dropdown dan styling sel spreadsheet rapi dan konsisten.
- **Principle V (Zero Redundancy & DRY)**: ✅ PASS. Fungsi resolusi tanggal `resolveRekomtekDateInfo` dipusatkan di utilitas, tidak diduplikasi inline.
- **Principle X (UI/UX Pro Max Standard)**: ✅ PASS. Menggunakan warna brand `#066C2A` dan teks kontras tinggi.
- **Principle XIV (Compact Information Density)**: ✅ PASS. Teks deskripsi dropdown ringkas dan proporsional.

---

## Project Structure

### Documentation (this feature)

```text
specs/084-export-pekebun-rekomtek-date/
├── spec.md              # Feature specification & clarifications
├── plan.md              # Implementation plan (this file)
├── research.md          # Research findings & architectural decisions
├── data-model.md        # Extended entities & spreadsheet output mapping
├── quickstart.md        # Manual verification runbook & test scenarios
├── contracts/
│   └── export-rekomtek-contract.md # Signatures & header contracts
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── utils/
│   ├── exportPekebunExcel.ts      # [MODIFY] Tambah kolom Rekomtek (16 kolom & 12 kolom)
│   ├── exportProposal.ts          # [MODIFY] Tambah kolom Rekomtek pada ekspor proposal
│   └── exportPekebunExcel.test.ts # [MODIFY] Update pengujian unit header & row format
├── components/
│   └── verification/
│       └── DropdownEksporPekebun.vue # [MODIFY] Update label jumlah kolom (16 & 12)
└── views/
    └── ditjenbun/
        └── CekiDitjenbunView.vue  # [MODIFY] Simpan tanggal rekomtek saat generate draf
```

**Structure Decision**: Seluruh penyesuaian terlokalisasi di lapisan utilitas spreadsheet, komponen dropdown ekspor, dan view verifikasi Ditjenbun tanpa memecah arsitektur yang sudah ada.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | Arsitektur zero-violation | Seluruh implementasi menggunakan pola bawaan yang telah teruji di proyek |
