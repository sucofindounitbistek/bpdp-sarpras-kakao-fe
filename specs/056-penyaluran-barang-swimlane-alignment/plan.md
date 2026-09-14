# Implementation Plan: Penyelarasan Alur Modul Penyaluran Barang (SOP Swimlane)

**Branch**: `056-penyaluran-barang-swimlane-alignment` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/056-penyaluran-barang-swimlane-alignment/spec.md`

## Summary

Mengimplementasikan dan menyelaraskan alur end-to-end Modul Penyaluran Barang Sarpras Kelapa sesuai dengan SOP Swimlane (Kelembagaan Pekebun, BPDP Teknis, BPDP PPK, BPDP ULP, dan Surveyor). Pendekatan teknis mengadopsi model antarmuka modular di frontend (Vue 3, Pinia persistent state, Lucide icons, Tailwind CSS) dengan fokus khusus pada:
1. **Kelembagaan Pekebun**: Modal terpadu review preferensi RAB (dengan kolom terpisah *Nama Barang* dan *Varietas*), generator PDF Surat Permohonan resmi, upload berkas bertandatangan, dan tombol kirim ke BPDP Teknis.
2. **BPDP Teknis (Konektor 1 -> 2)**: Pemeriksaan berkas surat permohonan pekebun. Jika **Tidak**, permohonan dikembalikan ke status `DRAFT` beserta catatan perbaikan; jika **Ya**, form mewajibkan upload berkas PDF **Nota Dinas Direktur Teknis** dan menekan tombol *"Kirim ke BPDP PPK"*.
3. **BPDP PPK (Konektor 2 -> 3)**: Review berkas Surat Permohonan & Nota Dinas BPDP Teknis, serta aksi tombol universal *"Kirim ke BPDP ULP"* untuk meneruskan mandat pengadaan ke antrean ULP.
4. **BPDP ULP (Konektor 3 -> 4)**: Mengubah status menjadi *"Proses Pemilihan Penyedia"* saat proses tender e-catalog dimulai di luar aplikasi, dan tombol aksi *"Selesai"* (dengan dialog konfirmasi penyelesaian) untuk mengalirkan tiket ke antrean Dokumen Kontrak BPDP Teknis (`PENETAPAN_PEMENANG`).
5. **BPDP Teknis & Surveyor (Konektor 4 -> 5)**: Input lengkap 10 atribut Dokumen Kontrak (disematkan langsung di panel detail permohonan di bawah tabel RAB tanpa modal bertumpuk) dengan tombol *"Proses Pelaksanaan Kontrak"* yang mengubah status ke `PROSES_PELAKSANAAN_KONTRAK`.

## Technical Context

**Language/Version**: TypeScript 5+, Vue 3.4+  
**Primary Dependencies**: Vue Router, Pinia, Tailwind CSS, Lucide Vue Next, jsPDF / HTML Canvas  
**Storage**: Pinia persistent reactive store  
**Testing**: Manual End-to-End Simulation, Quickstart guide validation (`quickstart.md`)  
**Target Platform**: Modern Web Browsers (Chrome/Edge/Firefox)  
**Project Type**: Web Application (Frontend Mockup Architecture)  
**Performance Goals**: Halaman interaktif responsif (< 100ms render), download template surat PDF < 1 detik  
**Constraints**: Zero breaking change pada modul pengusulan CPCL eksisting, kepatuhan 100% terhadap 10 poin Dokumen Kontrak "A"  
**Scale/Scope**: 5 Role UI Views, 1 Central Pinia Store, 4 Modal Dialogs, 6 Workflow Statuses  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Modular Architecture**: Isolasi view dan komponen penyaluran barang di `src/views/penyaluran-barang/` dan `src/components/penyaluran-barang/`.
- [x] **Separation of Concerns**: Pinia Store mengelola state alur independen tanpa mengotori store CPCL / Pekebun lain.
- [x] **Standardized DTO & Contracts**: Definisi tipe data di `src/types/penyaluranBarang.ts` dan API contracts di `contracts/penyaluran-barang-api.md`.
- [x] **Zero Unjustified Violations**: Tidak ada pelanggaran arsitektural.

## Project Structure

### Documentation (this feature)

```text
specs/056-penyaluran-barang-swimlane-alignment/
├── spec.md              # Feature specification & clarifications
├── plan.md              # This implementation plan
├── research.md          # Phase 0 architectural & design decisions
├── data-model.md        # Entity definitions & state machine transitions
├── quickstart.md        # Runnable end-to-end validation guide
├── checklists/          # Requirements & quality validation checklist
└── contracts/           # Interface contracts & API specifications
    └── penyaluran-barang-api.md
```

### Source Code Mapping

```text
bpdp-sarpras-kelapa-fe/
├── src/
│   ├── components/penyaluran-barang/
│   │   ├── DisposisiPpkModal.vue             # Modal review berkas & disposisi ke ULP
│   │   ├── DokumenKontrakModal.vue           # Modal input 10 atribut Dokumen Kontrak "A"
│   │   ├── ItemRabFormTable.vue              # Tabel preferensi RAB (Kolom terpisah Nama Barang & Varietas)
│   │   ├── PenyaluranTimelineTracker.vue     # Timeline visual tracker status tahapan
│   │   ├── SuratTugasSurveyorModal.vue       # Modal penerbitan surat tugas surveyor
│   │   ├── TenderUlpModal.vue                # Modal input pemenang tender e-catalog
│   │   └── VerifikasiTeknisModal.vue         # Modal Cek Iya/Tidak, Upload Nota Dinas, Kirim ke PPK / Kembalikan ke Draft
│   ├── stores/
│   │   └── penyaluranBarang.ts               # Pinia store state management
│   ├── types/
│   │   └── penyaluranBarang.ts               # TypeScript interfaces & enums
│   ├── utils/
│   │   └── permohonanPdfGenerator.ts         # Generator format surat permohonan pengadaan (PDF)
│   └── views/penyaluran-barang/
│       ├── BpdpPpkBarangView.vue             # Antrean & panel review BPDP PPK
│       ├── BpdpUlpBarangView.vue             # Antrean & pemilihan penyedia BPDP ULP
│       ├── BpdpVerifikatorBarangView.vue     # Antrean verifikasi & kontrak BPDP Teknis
│       ├── PekebunFormPermohonanView.vue     # Form pengajuan permohonan
│       ├── PekebunPermohonanBarangView.vue   # Halaman daftar proposal & modal pengajuan terpadu
│       └── SurveyorBarangView.vue            # Antrean monitoring penugasan Surveyor
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| *None* | Arsitektur mengikuti modul reference standard | Tidak ada kompleksitas ekstra |
