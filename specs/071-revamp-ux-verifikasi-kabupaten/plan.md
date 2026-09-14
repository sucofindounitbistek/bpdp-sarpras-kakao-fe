# Implementation Plan: Revamp UX Halaman Verifikasi Usulan Kabupaten (Accordion System)

**Branch**: `071-revamp-ux-verifikasi-kabupaten` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

## Summary

Mengubah antarmuka verifikasi usulan tingkat kabupaten pada komponen `StepVerifikasiPekebunDanDokumenProposal.vue` dari susunan vertikal memanjang tanpa batas yang jelas menjadi **Sistem Accordion Modular Terstandarisasi**:
1. **Modul 1: Peta Spasial & Analisis Poligon Overlap Lahan** (`VerificationOverlapMap`).
2. **Modul 2: Verifikasi Calon Pekebun & Calon Lahan (CPCL)** (Ringkasan kuota pekebun, upload foto udara, navigasi ke workbench pekebun).
3. **Modul 3: Verifikasi Berkas Proposal & Kelembagaan** (Pemeriksaan berkas wajib/opsional, aksi cepat *Setujui Semua*, modal verifikasi berkas).
4. **Modul 4: Pemeriksaan Gudang Serah Terima** (Kondisional: hanya tampil jika relevan dengan paket sarpras).
5. **Modul 5: Verifikasi & Rekonsiliasi Rencana Anggaran Biaya (RAB)** (Stepper penyelarasan, download CSV, upload bertandatangan, tabel RAB interaktif).
6. **Bilah Kontrol Global**: Ringkasan kelayakan menyeluruh dan tombol pintasan *"Buka Semua"* / *"Tutup Semua"*.

## Technical Context

**Language/Version**: TypeScript 5.2+, Vue 3 Composition API (`<script setup>`)  
**Primary Dependencies**: Tailwind CSS, Pinia, Lucide Vue Next, Leaflet (di dalam `VerificationOverlapMap`)  
**State Stores**: `useVerifikasiKabDraftStore` (status dokumen & field), `usePengusulanStore` (data usulan aktif)  
**Testing**: `npx vue-tsc -b`, `npm run build`, manual browser testing  
**Target Platform**: Desktop & Tablet Web Browsers  
**Design System**: Tailwind tokens, Emerald `#066C2A` theme, WCAG AA contrast, Micro-animations pada toggle accordion  

## Constitution Check

- [x] **I. Vue 3 Composition API**: Penulisan bersih di `StepVerifikasiPekebunDanDokumenProposal.vue` dengan ref reaktif.
- [x] **II. Strict TypeScript**: Seluruh properti dan helper memiliki tipedata aman tanpa `any` liar.
- [x] **III. Pinia State Persistence**: Memanfaatkan computed getter dari `verifikasiStore` untuk menghitung tally status reaktif tiap modul.
- [x] **IV. Responsive & Fluid Grid**: Mendukung tampilan layar dari 768px hingga 1920px tanpa overflow.
- [x] **V. Zero Layout Breakage**: Mempertahankan seluruh logika modal, sync API, dan payload approval/rejection eksisting.

## Project Structure

### Documentation (Feature 071)

```text
specs/071-revamp-ux-verifikasi-kabupaten/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md
```

### Source Code Touched

```text
src/
└── views/
    └── dinas/
        └── kabupaten/
            └── StepVerifikasiPekebunDanDokumenProposal.vue  # Main step view to revamp into accordion modules
```

## Implementation Phases

### Phase 0: Research & State Mapping
- Analisis state tally status untuk setiap modul:
  - Modul 1 (Peta): Jumlah poligon aktif & status overlap.
  - Modul 2 (CPCL): Hitungan pekebun `Sesuai`, `Tidak Sesuai`, `Belum Diverifikasi`.
  - Modul 3 (Berkas): Hitungan berkas `Sesuai`, `Tidak Sesuai`, `Belum Diverifikasi`, serta kelengkapan berkas wajib.
  - Modul 4 (Gudang): Status 4 parameter gudang (Alamat, Koordinat, Tampak Depan, Tampak Dalam).
  - Modul 5 (RAB): Status dokumen RAB dan progres 4-tahap penyelarasan.

### Phase 1: Accordion Shell & Header Standardization
- Definisikan state reaktif untuk mengontrol ekspansi modul:
  - `activeSections = ref({ map: false, pekebun: true, dokumen: true, gudang: false, rab: false })`
- Buat fungsi pembantu:
  - `toggleSection(key: string)`
  - `expandAll()`
  - `collapseAll()`
- Desain Card & Header seragam:
  - Icon squircle berlatar lembut
  - Title & subtitle
  - Badge tally status reaktif
  - Smooth rotating chevron indicator (`transition-transform duration-200`)

### Phase 2: Refactor & Encapsulate Content into Modules
- Pindahkan masing-masing komponen ke dalam body accordion pembungkusnya:
  - Bungkus `VerificationOverlapMap` dalam Modul 1.
  - Bungkus tabel pekebun & foto udara dalam Modul 2.
  - Bungkus tabel berkas proposal & banner paket dalam Modul 3.
  - Bungkus form pemeriksaan gudang dalam Modul 4 (dengan `v-if="hasStorageArea"`).
  - Bungkus 4-step stepper RAB & `RabTable` dalam Modul 5.

### Phase 3: Verification & Build
- Jalankan typecheck `npx vue-tsc -b` dan perbaiki jika ada tipe yang tidak cocok.
- Jalankan `npm run build` untuk memverifikasi bundling produksi.
- Update `walkthrough.md`.
