# Implementation Plan: Verifikasi Rekomtek dan SK Dirut (Ditjenbun & BPDP)

**Branch**: `005-rekomtek-bpdp-ditjenbun` | **Date**: 2026-07-31 | **Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/005-rekomtek-bpdp-ditjenbun/spec.md)

**Input**: Feature specification from `/specs/005-rekomtek-bpdp-ditjenbun/spec.md`

## Summary

Mengimplementasikan modul verifikasi dan persetujuan usulan sarpras kakao untuk empat peran yang dipisah secara ketat di tingkat otorisasi rute dan visualisasi tab antrean:
* `DITJENBUN_VERIFIKATOR` (Asistensi Dokumen & Draf Rekomtek)
* `DITJENBUN_APPROVAL` (Persetujuan Rekomtek Ketua Tim)
* `BPDP_VERIFIKATOR` (Penilaian Kelayakan & SK Dirut)
* `BPDP_APPROVAL` (Persetujuan Kelayakan Kadiv)

Rute diamankan secara penuh melalui navigasi guard global, dan tombol penukaran peran (*Role Switcher*) di pojok kiri atas serta menu simulasi profil diperbarui untuk menampilkan empat pilihan peran baru secara reaktif.

## Technical Context

**Language/Version**: TypeScript 5.x | Vue 3.x (SFC composition API dengan `<script setup>`)

**Primary Dependencies**: Tailwind CSS, Pinia, Vue Router, VeeValidate, Zod, Axios

**Storage**: Pinia store state (`rekomtek.ts`) terintegrasi dengan backend API (disimulasikan/mockup di frontend menggunakan data lokal yang presisi jika backend belum siap)

**Testing**: Manual verification terstruktur sesuai Konstitusi (tidak menggunakan automated unit tests)

**Target Platform**: Responsive Web Browser (Mobile & Desktop compatible)

**Project Type**: Frontend Web Application

**Performance Goals**: Waktu rendering awal halaman < 1s, respon transisi status usulan instan, waktu respon pemicuan unduh file < 3s

**Constraints**:
* Mengikuti AA WCAG contrast ratios.
* Base body font size `13px` - `14px`, section headers `15px` - `18px`.
* Tinggi form input dan button standar `36px` - `40px` (h-9 hingga h-10) dengan `rounded-lg` (8px).
* Breadcrumb navigasi wajib di setiap menu utama.
* Tidak boleh memakai native dialog browser (`alert`, `confirm`). Notifikasi harus melalui `useToast()`.

**Scale/Scope**: ~12 UI views/pages/components yang mencakup 4 peran pengguna terpisah secara penuh.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Vue 3 SFC & Composition)**: Ya, seluruh komponen baru ditulis menggunakan `<script setup>` dan TypeScript.
- **Principle II (TypeScript Strict & Schema Validation)**: Ya, model data, type props, dan form schema divalidasi menggunakan Zod dan TypeScript strict mode.
- **Principle III (Pinia Store Discipline)**: Ya, semua state usulan dan operasi API dibungkus di dalam Pinia store `src/stores/rekomtek.ts`.
- **Principle IV & X (Modern UI/UX, Color, Contrast)**: Ya, menggunakan Tailwind CSS, brand color `#066C2A` (Forest Green), font-medium/semibold (no font-bold), dan layout hemat ruang (compact density).
- **Principle V (YAGNI)**: Ya, solusi dibuat seminimal mungkin tanpa library eksternal berlebih.
- **Principle VI (Breadcrumb Navigation)**: Ya, menyertakan komponen `<Breadcrumb />` pada halaman detail verifikasi dan antrean usulan.
- **Principle VII (Mobile-First / Responsive)**: Ya, layout tabel, formulir checklist, dan dashboard responsif (tidak overflow secara horizontal di mobile).
- **Principle VIII (Form Validation)**: Ya, form alasan pengembalian, nomor rekomtek, dan checklist kelayakan divalidasi client-side sebelum aksi pengiriman.
- **Principle IX (API Error Response Fidelity)**: Ya, error API diteruskan secara transparan melalui toast notifications.
- **Principle XI (Vue Toaster Standard)**: Ya, menggunakan `useToast()` dari pustaka toaster yang ada.
- **Principle XII (Lazy Loading & Skeleton)**: Ya, views dan modal berat menggunakan dynamic imports dan skeleton loaders standar (`Skeleton.vue`).
- **Principle XIII (Backend Contract Verification)**: Ya, rancangan endpoint diidentifikasi dan didokumentasikan di `contracts/ui-contract.md`. Mock data disimulasikan sesuai struktur DTO nyata.
- **Principle XIV (Compact Information Density)**: Ya, input `h-9`/`h-10`, tombol `rounded-lg`, typography font base `13px`-`14px`, padding `p-4` - `p-6` agar senada dengan navbar.

*Status: **PASSED***

## Project Structure

### Documentation (this feature)

```text
specs/005-rekomtek-bpdp-ditjenbun/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (Decisions & rationales)
├── data-model.md        # Phase 1 output (TypeScript interfaces & states)
├── quickstart.md        # Phase 1 output (Validation scenario runbook)
└── contracts/
    └── ui-contract.md   # Phase 1 output (Component props, events, & API payload structures)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── rekomtek/
│       ├── ChecklistDokumen.vue      # Reusable checklist untuk Ditjenbun & BPDP
│       ├── FormPengembalianModal.vue # Modal pengembalian dengan dropdown tujuan dan alasan
│       └── LogStatusUsulan.vue       # Riwayat perubahan status usulan
├── views/
│   ├── ditjenbun/
│   │   ├── AntreanRekomtekView.vue   # Dashboard antrean usulan Ditjenbun (Verifikator vs Approval)
│   │   ├── CekiDitjenbunView.vue     # Halaman asistensi berkas dan verifikasi Ditjenbun (Verifikator)
│   │   └── ApprovalDitjenbunView.vue  # Halaman verifikasi oleh Ketua Tim Ditjenbun (Approval)
│   └── bpdp/
│       ├── AntreanBpdpView.vue       # Dashboard antrean usulan BPDP (Verifikator vs Approval)
│       ├── CekiBpdpView.vue          # Halaman pemeriksaan rekomtek dan dokumen kelayakan (Verifikator)
│       ├── ApprovalBpdpView.vue      # Halaman persetujuan kelayakan oleh Kadiv (Approval)
│       └── FinalisasiSkDirutView.vue # Halaman generate & upload SK Dirut oleh Verifikator BPDP (Verifikator)
├── stores/
│   └── rekomtek.ts                   # Pinia store untuk alur verifikasi rekomtek
├── router/
│   └── index.ts                      # Konfigurasi rute & navigasi guard peran
```

**Structure Decision**: Single project layout. Seluruh views baru diletakkan di bawah subfolder `views/ditjenbun` dan `views/bpdp`. Komponen reusable pendukung diletakkan di `components/rekomtek/`.

## Complexity Tracking

*Tidak ada pelanggaran terhadap Konstitusi proyek.*
