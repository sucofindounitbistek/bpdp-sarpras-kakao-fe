# Implementation Plan: Revamp UX Halaman Verifikasi Pekebun

**Branch**: `070-revamp-ux-verifikasi-pekebun` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

## Summary

Merevamp antarmuka halaman verifikasi detail pekebun (`VerifikasiPekebunDetailView.vue`) dari layout tumpuk yang tidak efisien menjadi **Split Workbench 2 Kolom**:
- **Kolom Kiri**: Navigasi berkas terstruktur (Identitas Pekebun & Legalitas Lahan) dengan badge status reaktif, bersanding dengan Document Viewer (gambar/PDF viewer dengan zoom).
- **Kolom Kanan**: Form verifikasi kesesuaian data input vs berkas scan secara presisi dan cepat.
- **Accordion Collapsible**: Data profil lengkap dan peta poligon satelit ditempatkan di bawah workbench agar tidak membebani ruang vertikal.
- **Sticky Footer Action Bar**: Bilah aksi bawah memuat ringkasan status kelayakan, tombol "Kembali ke Usulan", dan tombol navigasi pintar "Lanjut ke Pekebun Berikutnya".

## Technical Context

**Language/Version**: TypeScript 5.2+, Vue 3 Composition API (`<script setup>`)
**Primary Dependencies**: Tailwind CSS, Pinia, Lucide Vue Next, Leaflet (untuk peta satelit)
**Storage**: Client Pinia Draft Store (`useVerifikasiKabDraftStore`), Backend API verifikasi Kabupaten
**Testing**: `npx vue-tsc -b`, `npm run build`, manual browser testing
**Target Platform**: Desktop & Tablet Web Browsers (Chrome, Edge, Safari, Firefox)
**Project Type**: Vue 3 SPA Frontend
**Performance Goals**: Instant document switching (<50ms), 0 layout overflow blowout, responsive layout down to 768px
**Constraints**: Single source of truth dengan `verifikasiKabDraft.ts` & `verifikasiStore`, WCAG AA accessibility, zero redundant network calls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Vue 3 SFC & `<script setup>`**: Menggunakan Single-File Component standar dengan modular sub-sections.
- [x] **II. Strict TypeScript**: Tidak ada `any` baru; interface tipe `DokumenPekebunRow`, `LahanWithDocs`, `VerificationItem` digunakan secara ketat.
- [x] **III. Pinia State Management**: Menyimpan dan membaca verifikasi field/dokumen dari `useVerifikasiKabDraftStore`.
- [x] **IV. Modern UI/UX Pro Max**: Menggunakan palet Forest Green (`#066C2A`), Tailwind typography scale yang proporsional, border lembut, dan transisi micro-animation.
- [x] **V. Zero Redundancy & DRY**: Menggunakan kembali helper dokumen, utilitas tanggal, dan komponen `SatelliteMapPreview`.
- [x] **VII. Mobile-First & Responsive**: Menggunakan flex/grid responsive (`lg:grid-cols-12`) dengan `min-w-0` untuk menjamin tidak ada layout overflow.

## Project Structure

### Documentation (this feature)

```text
specs/070-revamp-ux-verifikasi-pekebun/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/
└── views/
    └── dinas/
        └── kabupaten/
            └── VerifikasiPekebunDetailView.vue  # Main view to revamp
```

## Implementation Phases

### Phase 0: Research & Component Architecture
- Memetakan seluruh state dokumen dan field yang diverifikasi di `VerifikasiPekebunDetailView.vue`.
- Memastikan struktur `lahanDocs` dan `farmerDocs` dapat dinavigasi dengan ID aktif `selectedDocId`.
- Menyiapkan logika `nextPekebunId` dari proposal `dataPekebun`.

### Phase 1: Header Profil & Split Workbench
- Merancang Header Ringkas: Nama, NIK, No KK, status kawin, dan progress bar `X / Y Dokumen Selesai`.
- Membangun Kolom Kiri:
  - Segmented Document List (KTP, KK, Swafoto, Kuasa, Lahan 1, Lahan 2, dst.) dengan badge status reaktif.
  - Interactive Document Viewer (PDF iframe / image container dengan kontrol zoom & unduh).
- Membangun Kolom Kanan:
  - Dynamic Form Panel sesuai `selectedDoc.documentType`.
  - Field value comparison + action buttons (`Sesuai` / `Tidak Sesuai`).
  - Contextual rejection textarea.
  - Tombol pintasan "Lanjut ke Dokumen Berikutnya".

### Phase 2: Collapsible Accordion & Sticky Bottom Action Bar
- Memindahkan tabel data profil lengkap dan peta satelit poligon ke dalam accordion tertutup rapi.
- Membangun Sticky Bottom Bar:
  - Ringkasan dokumen: Sesuai (hijau), Perlu Catatan (merah), Belum Dicek (abu-abu).
  - Tombol "Kembali ke Usulan".
  - Tombol "Lanjut ke Pekebun Berikutnya".

### Phase 3: Verifikasi & Build Testing
- Menjalankan `npx vue-tsc -b` dan `npm run build`.
- Menguji alur pergantian dokumen dan status penolakan lahan/pekebun.
