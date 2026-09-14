# Implementation Plan: Standarisasi Dokumen Persyaratan Dinamis Master Paket Lintas Role

**Branch**: `077-dynamic-package-document-requirements` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/077-dynamic-package-document-requirements/spec.md`

## Summary

Menstandarisasi daftar checklist dokumen persyaratan usulan pemohon di seluruh halaman verifikasi dan pratinjau proposal (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, dan BPDP) agar membaca langsung aturan master paket dinamis (`GET /api/v1/master-sarpras/paket/:code/persyaratan` melalui `masterSarprasStore`), dilengkapi dengan strategi penggabungan dokumen (Union Strategy) agar berkas proposal lama yang kodenya tidak ada di master baru tetap aman ditampilkan sebagai "Dokumen Tambahan/Lainnya".

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.5+ (`<script setup>`)

**Primary Dependencies**: Tailwind CSS, Lucide Vue Next, Pinia (`useMasterSarprasStore`, `usePengusulanStore`), Vue Router

**Storage**: PostgreSQL (`master_paket_dokumen`, `dokumen_proposals`) - Frontend client integration

**Testing**: Vite & TypeScript build validation (`npm run build`) + manual verification in browser

**Target Platform**: Web (Desktop & Mobile responsive)

**Performance Goals**: Cached requirement lookups (`persyaratanMap`), zero redundant network calls, zero layout shift

**Constraints**: Sesuai Constitution FE: bebas redundansi (DRY), desain mobile-first, single modal, kontras warna WCAG AA

**Scale/Scope**:
- `src/lib/dynamicRequirements.ts` (NEW helper/composable for mapping dynamic requirements & proposal documents)
- `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` (MODIFIED: fetch and use dynamic requirements)
- `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` (MODIFIED: sync summary with dynamic requirements)
- `src/views/dinas/provinsi/StepSummaryDanSubmit.vue` (MODIFIED: sync summary with dynamic requirements)
- `src/components/verification/PratinjauPekebunDanDokumenProposal.vue` (MODIFIED: sync proposal preview with dynamic requirements)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Prinsip Konstitusi | Status | Catatan Evaluasi |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | Menggunakan SFC `<script setup lang="ts">` dan composable modular. |
| **II. Strict TypeScript** | PASS | Tipe data `UnifiedProposalDocItem` didefinisikan secara eksplisit. |
| **III. Mandatory Pinia State** | PASS | Memanfaatkan store yang sudah ada (`useMasterSarprasStore`, `usePengusulanStore`). |
| **IV. Modern UI/UX** | PASS | Mempertahankan badge, icon dokumen, dan transisi halus. |
| **V. Anti-Redundancy & DRY** | PASS | Logika mapping master requirements dan dokumen terunggah dipusatkan di `dynamicRequirements.ts`. |
| **VII. Mobile-First Responsive** | PASS | Tampilan card dan tabel dokumen tetap responsif di layar mobile. |
| **X. UI/UX Pro Max** | PASS | Hirarki tipografi tertib, warna primer brand `#066C2A` dipertahankan. |
| **XIV. Compact Information Density** | PASS | Padding dan baris dokumen proporsional tanpa memakan ruang berlebih. |
| **XVI. Single Modal & Sequential UX** | PASS | Modal preview berkas PDF/gambar tetap berfungsi independen. |

## Proposed Changes

### Layer 1: Shared Helper & Composable (`src/lib/dynamicRequirements.ts`)
- Buat file helper `dynamicRequirements.ts` yang mengekspos fungsi:
  - `fetchAndResolveProposalRequirements(paketCode: string, proposalDocuments: any[], masterStore: any): Promise<UnifiedProposalDocItem[]>`
  - Menyatukan daftar syarat dari master dan file terunggah (Union Strategy).

### Layer 2: Dinas Kabupaten Verification (`StepVerifikasiPekebunDanDokumenProposal.vue`)
- Ganti ketergantungan langsung terhadap `PAKET_PERSYARATAN_CONFIG` dengan pemanggilan dynamic requirements.
- Pasang watcher terhadap `pengajuan.jenisSarpras` untuk me-refresh dokumen dinamis.
- Pertahankan form validasi radio (Sesuai/Tolak) dan catatan perbaikan pada setiap item dokumen.

### Layer 3: Dinas Kabupaten & Provinsi Summary (`StepSummaryDanSubmit.vue`)
- Sinkronkan tabel ringkasan berkas usulan dengan dokumen dinamis master paket.

### Layer 4: Shared Preview Component (`PratinjauPekebunDanDokumenProposal.vue`)
- Ganti daftar flat statis berkas pemohon dengan daftar dinamis hasil fetch master paket.

## Verification Plan

### Automated Verification
- Run `npm run build` di `bpdp-sarpras-kelapa-fe` untuk memastikan type check lulus 100%.

### Manual Verification
1. Login sebagai Dinas Kabupaten & buka rincian verifikasi proposal: pastikan dokumen usulan pemohon dimuat dari master paket.
2. Buka tab Pratinjau Dokumen Usulan di Provinsi/Ditjenbun/BPDP: pastikan daftar dokumen sinkron.
3. Uji tombol preview PDF/gambar dan tombol validasi pada setiap dokumen.
