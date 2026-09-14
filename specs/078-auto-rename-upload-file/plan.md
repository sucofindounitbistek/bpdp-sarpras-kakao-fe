# Implementation Plan: Standardized Auto-Rename for File Uploads

**Branch**: `078-auto-rename-upload-file` | **Date**: 2026-09-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/078-auto-rename-upload-file/spec.md`

## Summary

Menstandarisasi nama berkas yang diunggah oleh seluruh peran (Pemohon, Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS, dan Penyalur) di seluruh alur aplikasi Sarpras Kelapa menggunakan konvensi baku:
```text
[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]
```
Pendekatan teknis menggunakan *client-side file proxy reconstruction* via modul utilitas terpusat `src/utils/fileNaming.ts` dan integrasi langsung ke komponen `src/components/ui/FileUpload.vue` serta form unggah berkas. Saat berkas dipilih, objek `File` baru dengan nama standar langsung dibentuk, disajikan di antarmuka pratinjau dalam < 100ms, dan dikirim ke backend tanpa memerlukan perubahan skema database karena backend secara alami menyimpan nama dari header multipart client (`header.Filename`).

---

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.5+ (`<script setup>`)

**Primary Dependencies**: Tailwind CSS, Lucide Vue Next, Pinia (`usePengusulanStore`, `useAuthStore`, `usePekebunStore`), Vue Router

**Storage**: PostgreSQL (`file_uploads` table via backend `bpdp-sarpras-kelapa-be`) & MinIO/S3 object storage

**Testing**: Vite & TypeScript build validation (`npm run build`) + manual verification in browser

**Target Platform**: Web (Desktop & Mobile responsive)

**Performance Goals**: File renaming & preview rendering latency < 100ms on file selection, zero layout shifts, zero redundant network calls

**Constraints**: Sesuai Konstitusi FE: Prinsip V (Anti-Redundancy & DRY), Prinsip VII (Mobile-First), Prinsip VIII (Form Validation), Prinsip X (UI/UX Pro Max), Prinsip XI (Vue Toaster)

**Scale/Scope**:
- `src/utils/fileNaming.ts` (NEW: centralized sanitization & renaming utility)
- `src/components/ui/FileUpload.vue` (MODIFIED: integrate auto-rename props & file reconstruction)
- `src/views/pengusulan/StepUploadDokumen.vue` (MODIFIED: pass documentLabel & context to FileUpload)
- `src/views/pengusulan/StepPaketSarpras.vue` (MODIFIED: pass subLabel for warehouse photos)
- `src/views/pengusulan/StepRAB.vue` (MODIFIED: pass documentLabel for RAB upload)
- `src/views/pemohon/RevisiProposalView.vue` (MODIFIED: auto-rename on revision upload)
- `src/views/ditjenbun/CekiDitjenbunView.vue` (MODIFIED: auto-rename on Rekomtek upload)
- `src/views/bpdp/CekiBpdpView.vue` & `FinalisasiSkDirutView.vue` (MODIFIED: auto-rename on SK Dirut upload)
- `src/views/bpdpks/PelaporanBASTView.vue` (MODIFIED: auto-rename on BAST upload)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Prinsip Konstitusi | Status | Catatan Evaluasi |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | Logika enkapsulasi di SFC `<script setup lang="ts">` dan modul utilitas murni. |
| **II. Strict TypeScript** | PASS | Interface `FileNamingContext` dan `StandardizedFileResult` bertipe ketat tanpa `any`. |
| **III. Mandatory Pinia State** | PASS | Konteks proposal dan kelembagaan bersumber dari store resmi (`usePengusulanStore`, `useAuthStore`). |
| **IV. Modern UI/UX** | PASS | Nama berkas standar langsung disajikan dengan visual yang rapi, transisi halus, dan warna emerald yang harmonis. |
| **V. Anti-Redundancy & DRY** | PASS | Logika sanitasi dan standarisasi nama berkas dipusatkan 100% pada `src/utils/fileNaming.ts`. Tidak ada logika rename yang ditulis berulang di komponen. |
| **VII. Mobile-First Responsive** | PASS | Komponen `FileUpload.vue` memotong nama panjang secara responsif (`truncate`) agar tidak merusak tampilan mobile (375px). |
| **VIII. Form Validation** | PASS | Validasi tipe berkas dan ukuran berkas tetap berjalan ketat sebelum pengunggahan. |
| **IX. API Error Response Fidelity** | PASS | Seluruh status error dari backend tetap dipropagasi utuh ke Vue Toaster. |
| **X. UI/UX Pro Max** | PASS | Tipografi tertib (`text-xs`, `text-sm`, `font-semibold`), WCAG AA compliant. |
| **XI. Vue Toaster** | PASS | Notifikasi sukses/gagal unggah tetap menggunakan `useToast()`. |
| **XIII. Backend Contract Verification** | PASS | Sudah diverifikasi langsung pada source code Go `internal/file/service.go`. Backend menerima `header.Filename` dari browser secara langsung. |

---

## Project Structure

### Documentation (this feature)

```text
specs/078-auto-rename-upload-file/
├── spec.md              # Feature specification & clarification log
├── plan.md              # Implementation plan (this file)
├── research.md          # Research findings & architectural decisions
├── data-model.md        # Context interface, entity, & lifecycle flow
├── contracts/           # API contract & component prop interfaces
│   └── file-naming-api.contract.md
├── quickstart.md        # Step-by-step verification guide
└── checklists/
    └── requirements.md  # Requirements quality checklist (100% PASS)
```

### Source Code Impact (Repository: `bpdp-sarpras-kelapa-fe`)

```text
src/
├── utils/
│   └── fileNaming.ts                            # [NEW] Centralized naming & sanitization helper
├── components/
│   └── ui/
│       └── FileUpload.vue                       # [MODIFIED] Auto-rename support & standardized preview
└── views/
    ├── pengusulan/
    │   ├── StepUploadDokumen.vue                # [MODIFIED] Standard naming context on proposal docs
    │   ├── StepPaketSarpras.vue                 # [MODIFIED] Sub-label naming for warehouse photos
    │   └── StepRAB.vue                          # [MODIFIED] Standard naming context on RAB upload
    ├── pemohon/
    │   └── RevisiProposalView.vue               # [MODIFIED] Standard naming context on revision upload
    ├── ditjenbun/
    │   └── CekiDitjenbunView.vue                # [MODIFIED] Standard naming context on Rekomtek upload
    ├── bpdp/
    │   ├── CekiBpdpView.vue                     # [MODIFIED] Standard naming context on review docs
    │   └── FinalisasiSkDirutView.vue            # [MODIFIED] Standard naming context on SK Dirut upload
    └── bpdpks/
        └── PelaporanBASTView.vue                # [MODIFIED] Standard naming context on BAST upload
```

---

## Proposed Changes

### Layer 1: Core Utility (`src/utils/fileNaming.ts`) [NEW]
- Buat modul `src/utils/fileNaming.ts` dengan fungsi utama:
  - `sanitizeToken(token: string, maxLength?: number): string`: Menghapus karakter berbahaya (`/ \ : * ? " < > | % #`), mengonversi spasi menjadi tanda hubung (`-`), dan memotong panjang jika melebihi batas.
  - `formatStandardFileName(file: File, context: FileNamingContext): StandardizedFileResult`: Merangkai `[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]`, menerapkan fallback `DRAFT` jika nomor proposal belum terbit, dan mengembalikan instance objek `File` baru.

### Layer 2: UI Component Enhancement (`src/components/ui/FileUpload.vue`) [MODIFIED]
- Tambahkan props opsional: `documentLabel`, `subLabel`, `proposalNumber`, `institutionName`, `autoRename`.
- Pada method `handleFileChange`:
  - Jika `autoRename` aktif (default true) dan metadata tersedia, panggil `formatStandardFileName`.
  - Simpan dan tampilkan nama berkas standar pada pratinjau `selectedFile`.
  - Emit event `file-selected` dengan objek `File` yang telah ter-rename.

### Layer 3: Views Integration (All Roles) [MODIFIED]
- **Pemohon**:
  - `StepUploadDokumen.vue`: Teruskan `documentLabel` (misal: "Proposal-Usulan", "KTP", "KK", "Akta-Lembaga") dan nama kelembagaan dari store ke `FileUpload`.
  - `StepPaketSarpras.vue`: Teruskan `documentLabel="Foto-Gudang"` dengan `subLabel="Depan"` dan `subLabel="Dalam"`.
  - `StepRAB.vue`: Teruskan `documentLabel="RAB-Usulan"`.
  - `RevisiProposalView.vue`: Terapkan standarisasi penamaan pada berkas revisi yang diunggah ulang.
- **Verifikator Multi-Tingkat**:
  - `CekiDitjenbunView.vue`: Teruskan `documentLabel="Rekomtek"`, nomor usulan, dan nama kelembagaan.
  - `CekiBpdpView.vue` & `FinalisasiSkDirutView.vue`: Teruskan `documentLabel="SK-Dirut"`.
  - `PelaporanBASTView.vue`: Teruskan `documentLabel="BAST"`.

---

## Verification Plan

### Automated Verification
- Run `npm run build` di direktori `bpdp-sarpras-kelapa-fe` untuk memverifikasi type safety TypeScript dan kebersihan build bundle.

### Manual Verification
1. Uji unggah berkas draf pengusulan baru -> amati nama berubah menjadi `[Nama-File]_DRAFT_[Nama-Kelembagaan].[ext]`.
2. Uji unggah berkas proposal aktif -> amati nama berubah menjadi `[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]`.
3. Uji unggah foto gudang -> amati nama menyertakan sub-label `Foto-Gudang-Depan_...` dan `Foto-Gudang-Dalam_...`.
4. Uji berkas verifikator dan BAST -> pastikan dokumen yang diunduh mempertahankan nama standar.
