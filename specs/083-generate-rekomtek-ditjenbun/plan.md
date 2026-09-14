# Implementation Plan: 1:1 Rekomendasi Teknis (Rekomtek) Ditjenbun PDF Generator

**Branch**: `083-generate-rekomtek-ditjenbun` | **Date**: 2026-09-12 | **Spec**: [specs/083-generate-rekomtek-ditjenbun/spec.md](spec.md)

**Input**: Feature specification from `specs/083-generate-rekomtek-ditjenbun/spec.md`

## Summary

Menggantikan tombol download draf statis `/templates/spek-teknis.pdf` pada antarmuka Verifikator Ditjenbun (`CekiDitjenbunView.vue`) dengan generator draf Rekomtek otomatis yang menghasilkan dokumen PDF 3 halaman presisi 1:1 sesuai standar Kementerian Pertanian Ditjenbun. Solusi menggunakan client-side high-fidelity HTML/CSS print engine dan interactive modal preview viewer yang langsung membaca data proposal aktif, mendukung input manual nomor surat (Opsi 1) dengan fallback nomor draf sementara (`.../PI.400/E/[BULAN]/[TAHUN]`), serta blok TTE BSrE Plt. Dirjenbun lengkap (Option A).

## Technical Context

**Language/Version**: TypeScript 5.7, Vue 3.5 (Composition API, `<script setup>`)  
**Primary Dependencies**: Vite 6, Tailwind CSS 3.4, Lucide Vue Next, Pinia 3  
**Storage**: PostgreSQL (Backend Proposal & RAB DB), Pinia Client Store  
**Testing**: Vitest 3 (`npm run test`), `vue-tsc -b`  
**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari) with standard Print / PDF rendering  
**Project Type**: Single Page Web Application (Frontend Vue 3)  
**Performance Goals**: Waktu pembentukan dokumen dan modal pratinjau < 1.0 detik (target spec < 1.5s)  
**Constraints**: 
- Tata letak harus persis 1:1 dengan dokumen acuan 3 halaman Kementerian Pertanian.
- Tidak boleh ada konten tumpah / melompat antar halaman saat dicetak (`break-after: page;`).
- Asset logo Kementan & BSrE harus berformat vektor tajam pada resolusi cetak 300+ DPI.  
**Scale/Scope**: Modul Ditjenbun (Verifikator & Approval), 1 modal preview, 1 core generator utility, 2 vector assets, 1 test suite.

## Constitution Check

- **YAGNI & Minimalist**: Menggunakan native browser print & DOM preview tanpa menginstal package library raster PDF pihak ketiga yang berat (seperti headless puppeteer atau canvas html2pdf).
- **TypeScript Strictness**: Semua input data Rekomtek memiliki interface ketat (`RekomtekDocumentData`, `RekomtekItemRAB`).
- **Zero Regression**: Alur verifikasi pengusulan dan upload signed file rekomtek yang sudah ada tetap utuh dan berfungsi normal.

## Project Structure

### Documentation (this feature)

```text
specs/083-generate-rekomtek-ditjenbun/
├── spec.md              # Feature specification & clarifications
├── plan.md              # Implementation plan (/speckit-plan command output)
├── research.md          # Technical decisions & rationale
├── data-model.md        # DTO interfaces & state mapping
├── quickstart.md        # Validation scenarios & commands
├── contracts/
│   └── rekomtek-generator.contract.md # Generator function & data interfaces
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code

```text
src/
├── assets/
│   ├── logo-kementan.svg             # [NEW] Official Kementan emblem vector
│   └── logo-bsre.svg                 # [NEW] Official BSrE BSSN emblem vector
├── components/
│   └── ditjenbun/
│       └── RekomtekPreviewModal.vue  # [NEW] 1:1 A4 interactive preview modal
├── utils/
│   ├── rekomtekPdfGenerator.ts       # [NEW] 1:1 3-page HTML & Print Generator
│   └── rekomtekPdfGenerator.test.ts  # [NEW] Vitest unit test suite
└── views/
    └── ditjenbun/
        └── CekiDitjenbunView.vue     # [MODIFY] Integrate Preview & Download buttons
```

## Complexity Tracking

| Component | Risk Level | Mitigation |
| :--- | :--- | :--- |
| **Page Breaking Precision** | Medium | Gunakan kontainer terpisah `.rekomtek-page` dengan ukuran eksplisit A4 (`210mm x 297mm`) dan CSS `break-after: page; page-break-after: always;`. |
| **RAB Items Volume** | Low | Format tabel ringkas butir 8 dengan font 9.5pt agar seluruh item pupuk/pestisida proposal tertampung di Halaman 1 tanpa meluap ke Halaman 2. |
| **Terbilang Rupiah** | Low | Implementasikan fungsi terbilang standar Bahasa Indonesia yang komprehensif hingga skala Miliaran/Triliunan. |
