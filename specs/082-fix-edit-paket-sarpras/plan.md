# Implementation Plan: Perbaikan Form Edit Paket Sarpras & Dokumen Wajib/Opsional

**Branch**: `082-fix-edit-paket-sarpras` | **Date**: 2026-09-12 | **Spec**: [specs/082-fix-edit-paket-sarpras/spec.md](spec.md)

**Input**: Feature specification from `/specs/082-fix-edit-paket-sarpras/spec.md`

## Summary

Memperbaiki form modal edit Paket Sarpras pada halaman Master Data (`PaketSarprasListView.vue`) agar field terhidrasi lengkap, menghilangkan input redundan "Label Singkat" sehingga hanya ada satu input utama "Nama Paket" dengan sinkronisasi otomatis `label = name`. Menambahkan fitur konfigurasi sifat dokumen **Wajib vs Opsional** pada Master Dokumen Persyaratan (`DokumenPersyaratanListView.vue`) yang otomatis diwariskan ke relasi dokumen paket sarpras, serta memastikan konsistensi visual badge Wajib/Opsional dan validasi non-blocking untuk dokumen opsional pada proposal di seluruh role.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`<script setup>` SFC)  
**Primary Dependencies**: Pinia 2.x, Lucide Vue Next, Vue Router 4.x, Tailwind CSS, Axios  
**Storage**: Client Pinia Store Cache (`masterSarpras.ts`) terhubung ke REST API Backend  
**Testing**: TypeScript Typecheck (`npm run type-check`), Manual Verification  
**Target Platform**: Web Browser (Desktop & Mobile Responsive)  
**Project Type**: Single-Page Application (Frontend)  
**Performance Goals**: Buka modal edit < 100ms dengan rendering instan dan loading skeleton  
**Constraints**: Mematuhi Konstitusi FE v2.9.0 (Single Source of Truth, Toast Notifications, Mobile-First, Anti-Redundancy)  
**Scale/Scope**: 2 views (`PaketSarprasListView.vue`, `DokumenPersyaratanListView.vue`), 1 Pinia store (`masterSarpras.ts`), 1 service (`masterSarpras.service.ts`), proposal multi-role verification  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: Menggunakan `<script setup>` dengan pemisahan concern yang bersih.
- [x] **Principle II (Strict TypeScript & Schema Validation)**: Menggunakan tipe eksplisit `MasterPaketSarpras`, `MasterDokumenCatalog`, tanpa `any`.
- [x] **Principle III (Pinia State Management)**: Seluruh mutasi CRUD paket & dokumen didelegasikan ke store `masterSarpras`.
- [x] **Principle IV (Modern UI/UX & Feedback)**: Indikator loading, disabled state pada tombol simpan saat submit, dan feedback visual.
- [x] **Principle V (Strict Anti-Redundancy & DRY)**: Menghilangkan input ganda label/nama, memanfaatkan pewarisan sifat dokumen terpusat.
- [x] **Principle VIII (Form Field Validation)**: Validasi real-time yang akurat, dokumen opsional tidak memblokir submit.
- [x] **Principle XI (Vue Toaster Notification)**: Menggunakan `toast.success` dan `toast.error` via `useToast()`.
- [x] **Principle XVI (No Nested Modals)**: Seluruh form dan pesan error ditangani dalam 1 modal yang sama, tanpa popup modal tumpuk.

## Project Structure

### Documentation (this feature)

```text
specs/082-fix-edit-paket-sarpras/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & decisions (Phase 0)
├── data-model.md        # Data models & state interfaces (Phase 1)
├── quickstart.md        # Quickstart validation guide (Phase 1)
├── contracts/           # API interface contracts (Phase 1)
│   └── paket-sarpras.contract.md
├── checklists/          # Requirement checklists
│   └── requirements.md
└── tasks.md             # Tasks for execution (Phase 2 - generated via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── views/
│   └── master-data/
│       ├── PaketSarprasListView.vue        # Perbaikan openEditModal, hapus label singkat, badge dokumen
│       └── DokumenPersyaratanListView.vue  # Tambah input sifat is_wajib & badge tabel
├── stores/
│   └── masterSarpras.ts                    # Tambah support is_wajib pada katalog & relasi paket
├── services/
│   └── masterSarpras.service.ts            # DTO payload support untuk is_wajib
└── types/
    └── masterSarpras.ts                    # Tipe is_wajib pada MasterDokumenCatalog & DokumenPersyaratanItem
```

## Complexity Tracking

*No constitutional violations identified. Standard implementation.*
