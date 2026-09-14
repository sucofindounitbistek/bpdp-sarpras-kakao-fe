# Implementation Plan: Section Kategori Sumber & Kewenangan Dokumen BPDP

**Branch**: `076-bpdp-document-authority-sections` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/076-bpdp-document-authority-sections/spec.md`

## Summary

Mengelompokkan seluruh dokumen verifikasi dan inspeksi pada modul BPDP (Approval dan Verifikator) ke dalam section kartu mandiri terpisah (Card-based Sections) berdasarkan instansi penerbit:
1. **Dinas Kabupaten / Kota** (SK Penetapan CPCL, Berita Acara Dokumen, Berita Acara Lapangan, RAB Final)
2. **Dinas Provinsi** (Surat Pengantar SK CPCL)
3. **Ditjen Perkebunan** (Rekomendasi Teknis / REKOMTEK)
4. **BPDP** (Laporan Keputusan Hasil Penelitian Rekomtek)

Setiap section dilengkapi header ber-badge peran instansi, ringkasan kewenangan tugas administratif, status kesesuaian berkas, dan aksi interaktif yang tetap utuh.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.5+ (`<script setup>`)

**Primary Dependencies**: Tailwind CSS, Lucide Vue Next, Pinia, Vue Router

**Storage**: N/A (Frontend presentation state, backend database schema unchanged)

**Testing**: Manual scenario testing via running application + TypeScript compilation check (`npm run build`)

**Target Platform**: Web (Desktop & Mobile responsive)

**Project Type**: Web Application (Frontend Single Page Application)

**Performance Goals**: Instant rendering (<50ms component mount), zero layout shift (CLS 0)

**Constraints**: Sesuai Constitution FE: bebas redundansi (DRY), desain mobile-first, tidak ada modal bertumpuk, kontras warna WCAG AA

**Scale/Scope**: 3 view components terpengaruh (`ApprovalBpdpView.vue`, `CekiBpdpView.vue`, dan shared authority config)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Prinsip Konstitusi | Status | Catatan Evaluasi |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | Menggunakan SFC `<script setup lang="ts">` dan komponen modular. |
| **II. Strict TypeScript** | PASS | Tipe data `AuthorityTier`, `AuthoritySectionMeta`, dan `DocumentValidationItem` didefinisikan secara eksplisit tanpa `any`. |
| **III. Mandatory Pinia State** | PASS | Memanfaatkan store yang sudah ada (`usePengusulanStore`, `useVerifikasiBPDPStore`). |
| **IV. Modern UI/UX** | PASS | Menggunakan curated color tokens Tailwind, badge transparan elegan, dan transisi halus. |
| **V. Anti-Redundancy & DRY** | PASS | Konfigurasi metadata otoritas instansi dipusatkan dalam helper/config tunggal, tidak di-hardcode ganda. |
| **VII. Mobile-First Responsive** | PASS | Layout section bertumpuk rapi secara vertikal pada layar mobile tanpa overflow. |
| **X. UI/UX Pro Max** | PASS | Hirarki tipografi tertib, warna primer brand `#066C2A` dipertahankan, kontras WCAG AA. |
| **XIV. Compact Information Density** | PASS | Padding kartu dan ukuran font proporsional (13px - 14px) tanpa elemen yang memakan ruang berlebih. |
| **XVI. Single Modal & Sequential UX** | PASS | Tidak menambah modal bertumpuk; modal pushback dan preview tetap independen. |
| **XVII. Navbar Horizontal Alignment** | PASS | Seluruh kontainer kartu section tetap berada dalam batas container `px-4 lg:px-6`. |

## Project Structure

### Documentation (this feature)

```text
specs/076-bpdp-document-authority-sections/
├── plan.md              # Rencana implementasi teknis
├── research.md          # Analisis kewenangan instansi & arsitektur UI
├── data-model.md        # Definisi struktur data AuthorityTier & Dokumen
├── quickstart.md        # Panduan verifikasi skenario uji
├── contracts/
│   └── authority-sections.contract.md # Kontrak antarmuka komponen UI
├── checklists/
│   └── requirements.md  # Checklist kualitas spesifikasi
└── spec.md              # Spesifikasi fitur & hasil klarifikasi
```

### Source Code Modifications

```text
src/
├── lib/
│   └── authoritySections.ts          # [NEW] Konfigurasi metadata instansi & mapping dokumen ke authority tier
├── views/
│   └── bpdp/
│       ├── ApprovalBpdpView.vue      # [MODIFY] Implementasi sectioning instansi pada Mode Inspeksi & panel kanan alur reguler
│       └── CekiBpdpView.vue          # [MODIFY] Implementasi sectioning instansi pada Step 2 Penelitian Dokumen BPDP
```

**Structure Decision**: Menempatkan konfigurasi metadata kewenangan instansi di `src/lib/authoritySections.ts` sebagai *Single Source of Truth* agar dapat diimpor langsung oleh `ApprovalBpdpView.vue` dan `CekiBpdpView.vue` tanpa duplikasi kode.

## Complexity Tracking

*Tidak ada pelanggaran konstitusi atau penambahan kompleksitas arsitektur yang memerlukan justifikasi khusus.*
