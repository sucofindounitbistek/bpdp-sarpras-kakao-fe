# Implementation Plan: Integrasi Penyaluran Barang dari Proposal Selesai & Penghapusan Form Tambah Manual

**Branch**: `feat/penyaluran-barang` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/050-penyaluran-from-proposal/spec.md`

## Summary

Mengintegrasikan modul Penyaluran Barang Pekebun agar datanya secara otomatis diturunkan dari proposal pengusulan sarpras yang telah berstatus `SELESAI`, menghapus tombol serta alur pembuatan form permohonan manual mandiri ("Buat Permohonan Baru"), dan menyediakan mekanisme aksi konfirmasi *"Ajukan Penyaluran"* bagi pekebun untuk mengalirkan item draft ke antrean verifikasi teknis BPDP.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Vue 3.5+ (`<script setup>`)
**Primary Dependencies**: Pinia, Vue Router, Lucide Vue Next, Tailwind CSS
**Storage**: Pinia Store with `pinia-plugin-persistedstate` (localStorage)
**Target Platform**: Modern Web Browsers (Desktop & Mobile Responsive)
**Project Type**: Single Page Web Application (Vite)
**Constraints**: Zero layout shift, full dark/light theme harmony, strict TypeScript types.

## Constitution Check

- [x] Vue 3 `<script setup>` SFC with composables and Pinia store
- [x] Strict TypeScript interfaces (no `any`)
- [x] Reusable component decoupling
- [x] Toast notifications for user feedback (no native `alert`)
- [x] Compact information density & restrained typography
- [x] Responsive layout (mobile-first)

## Project Structure

### Documentation (this feature)

```text
specs/050-penyaluran-from-proposal/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research & architectural decisions
├── data-model.md        # Entity definitions and state machine
├── quickstart.md        # Manual verification test cases
└── contracts/           # Store & UI contracts
    └── penyaluran-proposal-contract.md
```

### Source Code Changes

```text
src/
├── types/
│   └── penyaluranBarang.ts                       # Update entity with proposalId & draft status
├── stores/
│   └── penyaluranBarang.ts                       # Add proposal auto-sync & ajukanPenyaluran action
├── views/
│   └── penyaluran-barang/
│       └── PekebunPermohonanBarangView.vue       # Remove 'Buat Permohonan Baru', add 'Ajukan Penyaluran'
└── router/
    └── index.ts                                  # Redirect /penyaluran-barang/pemohon/tambah
```

## Implementation Phases

### Phase 0: Research & Alignment (Done)
- Menetapkan model hubungan proposal selesai (`SELESAI`) dengan penyaluran barang.
- Menentukan state machine transisi `DRAFT` -> `MENUNGGU_VERIFIKASI_TEKNIS`.

### Phase 1: Data Model & Contracts (Done)
- Pembuatan `data-model.md`, `contracts/`, dan `quickstart.md`.

### Phase 2: Implementation Tasks (Next via `/speckit-tasks` & `/speckit-implement`)
1. **Types & Store**:
   - Perbarui [penyaluranBarang.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/types/penyaluranBarang.ts) untuk mendukung status `DRAFT` dan `proposalId`.
   - Implementasikan fungsi sinkronisasi proposal selesai dan aksi `ajukanPenyaluran` di [penyaluranBarang.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/penyaluranBarang.ts).
2. **UI Updates**:
   - Hapus tombol "Buat Permohonan Baru" di [PekebunPermohonanBarangView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/penyaluran-barang/PekebunPermohonanBarangView.vue).
   - Tambahkan tombol aksi "Ajukan Penyaluran" untuk baris dengan status `DRAFT`.
   - Perbarui pesan empty state agar edukatif bagi pekebun.
3. **Routing**:
   - Atur redirect rute `/penyaluran-barang/pemohon/tambah` di [router/index.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/router/index.ts).
4. **Verification**:
   - Jalankan `vue-tsc --noEmit` dan `npm run test` untuk validasi kualitas kode.
