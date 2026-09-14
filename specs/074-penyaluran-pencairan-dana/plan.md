# Implementation Plan: Modul Penyaluran & Pencairan Dana (SARPRAS Kelapa)

**Branch**: `074-penyaluran-pencairan-dana` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/074-penyaluran-pencairan-dana/spec.md`

## Summary

Modul **Penyaluran & Pencairan Dana** mengelola alur dana SARPRAS pasca-SK Dirut: PKS 3 Pihak (komparisi A.1/A.2/A.3), pengajuan pencairan ber-wizard (nilai **per divisi** → total auto-generate), penyaluran bertahap 40/30/30 ke rekening escrow dengan gate kemajuan ≥70%/100%, rantai verifikasi SCI (Pendok→Verdok→QC→Pusat) + approval BPDP (Staff→Kadiv), transfer Bank Mitra, pengembalian dana, dan penutupan rekening.

**Pendekatan teknis (hasil riset)**: Backend sibling `bpdp-sarpras-kelapa-be` **belum memiliki endpoint pencairan/pks/escrow sama sekali** (diverifikasi langsung ke repo, lihat [contracts/backend-api.md](./contracts/backend-api.md)). Sesuai Konstitusi XIII dan keputusan klarifikasi ("FE only for now"), modul dibangun sebagai **mockup client-simulated** penuh mengikuti preseden modul Penyaluran Barang (spec 045): data demo di Pinia store (+ persistensi localStorage), UI/UX final-grade, tanpa menyentuh modul lain. Peran baru ditambahkan ke peta peran & navigasi mengikuti preseden BPDP_PPK/BPDP_ULP/SURVEYOR.

## Technical Context

**Language/Version**: TypeScript 5.7.3 (strict) + Vue 3.5.13 (`<script setup>` SFC)

**Primary Dependencies**: Vite 6, Pinia 3.0.1 + pinia-plugin-persistedstate 4.2, vue-router 4.5, axios 1.18 (via `src/services/api.ts`), zod 3.24 + vee-validate 4.15 (`@vee-validate/zod`), Tailwind CSS 3.4.17 + tailwindcss-animate, radix-vue, lucide-vue-next, dayjs, @vueuse/core

**Storage**: Client-simulated — Pinia store dengan `pinia-plugin-persistedstate` (localStorage); TIDAK ada backend storage (tidak ada endpoint; lihat contracts)

**Testing**: `npm run test` = `vitest run --passWithNoTests`. Konstitusi: unit test OTOMATIS tidak diwajibkan dan tidak diperluas; verifikasi via typecheck strict + walkthrough manual (quickstart.md) + review

**Target Platform**: Browser (web app responsif mobile-first 375px → desktop)

**Project Type**: web-app (frontend Vue SPA; fase mockup client-simulated)

**Performance Goals**: Standar aplikasi existing — skeleton loading tanpa CLS, lazy route/component, tidak ada layout shift saat ganti peran

**Constraints**: `vue-tsc -b && vite build` HARUS lolos; semua wording ter-eksternalisasi di `src/config/localization.ts`; warna primer `#066C2A`; alignment container `mx-4 lg:mx-6` (desktop) / `mx-3` (mobile); tanpa `alert()/confirm()/prompt()`; tanpa modal bersarang

**Scale/Scope**: 8 view baru + ±8 komponen domain + 1 store + tipe & schema + generator dokumen HTML→PDF; 4 peran baru (BPDP_STAFF, BPDP_KADIV, SURVEYOR_SCI, BANK_MITRA)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Prinsip | Status | Cara dipenuhi |
|---|---------|--------|---------------|
| I | Vue 3 SFC komponen-driven | ✅ PASS | Views `src/views/penyaluran-dana/`, komponen presentational `src/components/penyaluran-dana/`, logic di store |
| II | TS strict + Zod | ✅ PASS | `src/types/penyaluranDana.ts`, `src/schemas/penyaluranDana.ts` (wizard + komparisi), tanpa `any` |
| III | Pinia tunggal, tanpa API di komponen | ✅ PASS | `src/stores/penyaluranDana.ts` (client-simulated + persisted); tidak ada fetch di komponen |
| IV | Tailwind + tema gelap/terang | ✅ PASS | Design token existing, dual-theme semua komponen |
| V | Anti-redundansi / DRY | ✅ PASS | `formatRupiah`/`formatDate` dari `src/utils/exportProposal.ts` (JANGAN duplikasi inline seperti preseden lama); badge status mapper & label dokumen terpusat; reuse `ui/*` (Button, Card, Modal, Skeleton, Breadcrumb, Toast) |
| VI | Breadcrumb | ✅ PASS | `Breadcrumb.vue` di setiap view/sub-halaman sesuai hierarki rute |
| VII | Mobile-first responsif | ✅ PASS | Default mobile 375px, prefix `sm:/md:/lg:`, target sentuh 44x44px |
| VIII | Validasi form real-time | ✅ PASS | vee-validate + zod (nilai divisi > 0, rekening, email/kodepos, gate nominal) |
| IX | Fidelitas error backend | ✅ N/A (fase mock) | Tidak ada API nyata; kesalahan validasi/disimpan via Toaster; kontrak error dituang di contracts untuk fase integrasi |
| X | ui-ux-pro-max + WCAG AA + `#066C2A` | ✅ PASS | Ikuti design system existing |
| XI | Toaster only | ✅ PASS | `useToast()` / `ToastContainer.vue`; tanpa dialog native |
| XII | Lazy loading + Skeleton | ✅ PASS | Route lazy import; `Skeleton.vue` untuk list/tracker/wizard |
| XIII | Verifikasi kontrak backend | ✅ PASS (terverifikasi) | Repo `bpdp-sarpras-kelapa-be` diinspeksi 2026-09-04: **tidak ada** route/handler pencairan/escrow/pks-3pihak → modul jalan sebagai client-simulated berlabel jelas, temuan terdokumentasi di `contracts/backend-api.md` (pola `vendor.service.ts`/`auth.service.ts`) |
| XIV | Densitas informasi kompak | ✅ PASS | Font 13–14px, kontrol `h-9/h-10`, padding `p-4–p-6` |
| XV | Eksternalisasi wording | ✅ PASS | Semua copy baru di `src/config/localization.ts` (section `penyaluranDana`) |
| XVI | Tanpa modal bersarang | ✅ PASS | Wizard pakai transisi step in-page/in-modal; aksi sekunder inline/dedicated route |
| XVII | Alignment navbar | ✅ PASS | `mx-4 lg:mx-6` / `mx-3` konsisten dengan floating navbar |
| — | Security (SSO/JWT, guard) | ✅ PASS | Rute baru via `meta.roles` + guard existing `src/router/index.ts`; sesi via authStore/interceptor existing |
| — | Quality workflow | ✅ PASS | `npm run build` (vue-tsc + vite) wajib hijau; unit test tidak diperluas |

**Hasil gate: TIDAK ADA pelanggaran** — semua prinsip terpenuhi oleh desain. Re-check pasca-Phase 1: tetap PASS (tidak ada keputusan desain yang melanggar; lihat research.md D-6 tentang format Word).

## Project Structure

### Documentation (this feature)

```text
specs/074-penyaluran-pencairan-dana/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── ui-routes.md
│   └── backend-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── penyaluranDana.ts                  # entity, enum status, tipe dokumen (single source of truth)
│   └── role.ts                            # + ROLE_DETAILS_MAP: BPDP_STAFF, BPDP_KADIV, SURVEYOR_SCI, BANK_MITRA
├── schemas/
│   └── penyaluranDana.ts                  # zod: wizard permohonan, komparisi, gate nominal, rekening
├── stores/
│   └── penyaluranDana.ts                  # Pinia client-simulated + persisted (pola penyaluranBarang.ts)
├── views/
│   └── penyaluran-dana/
│       ├── PemohonPencairanView.vue               # KP: list + statistik (Total/Dalam Proses/Perlu Perbaikan/Dana Masuk)
│       ├── PemohonWizardPermohonanView.vue         # KP: wizard 3-step Tambah Permohonan
│       │   ├── WizardStep1DataPembelian.vue        #   proposal→A/B generate, jenis, divisi+nilai→total, rekening+skema
│       │   ├── WizardStep2Dokumen.vue              #   unduh/unggah surat permohonan, dokumen D, BA
│       │   └── WizardStep3TahapChecklist.vue       #   checklist per tahap, ID Penyaluran .T1
│       ├── PemohonDetailTrackingView.vue          # KP: timeline 6-aktor, 40/30/30, saldo escrow, tahap 2/3 + pengembalian + penutupan
│       ├── BpdpPks3PihakView.vue                  # BPDP Verifikator: antrean, proses, generate PKS, A.2, penjadwalan
│       ├── BpdpApprovalPencairanView.vue          # BPDP Staff/Kadiv: antrean approval, Surat Persetujuan
│       ├── SciVerifikasiDokumenView.vue           # SCI: antrean Pendok/Verdok/QC/Pusat + VPD
│       ├── SciMonitoringLapanganView.vue          # SCI: surat tugas, laporan E (≥70%) / G (100%)
│       └── BankMitraView.vue                      # Bank: komparisi A.3, konfirmasi transfer, penutupan rekening
├── components/
│   └── penyaluran-dana/
│       ├── PencairanTimelineTracker.vue   # timeline gabungan lintas aktor (pola PenyaluranTimelineTracker barang)
│       ├── TahapProgressBar.vue           # progres 40/30/30 + gate lock indicator
│       ├── DivisiNilaiTable.vue           # 10 divisi, input nilai per divisi, total computed (read-only)
│       ├── KomparisiPanel.vue             # form A.1 / A.2 / A.3 (per pihak)
│       ├── DokumenChecklistTahap.vue      # checklist generated vs upload per tahap (Lampiran A)
│       ├── VerifikasiRantaiPanel.vue      # keputusan Sesuai/Tidak + catatan wajib (pola Satker)
│       ├── EscrowSaldoCard.vue            # saldo escrow & status pembayaran (mock Odoo)
│       └── RiwayatPerbaikanList.vue       # riwayat "Dikembalikan untuk Perbaikan (catatan)"
├── utils/
│   └── pencairanDocsGenerator.ts          # generator HTML→print PDF: Surat Permohonan, PKS 3 Pihak, BA, Surat Kuasa (template surat kuasa); reuse formatRupiah dari exportProposal.ts
├── config/
│   └── localization.ts                    # + section `penyaluranDana` (semua label/status/toast)
├── composables/
│   └── useNavigation.ts                   # + NavSection per peran baru; item "Penyaluran Dana" untuk KP
└── router/
    └── index.ts                           # + rute /penyaluran-dana/* (meta.roles, activeMenu, lazy import)
```

**Structure Decision**: Single Vue app existing — modul mengikuti pola direktori modul Penyaluran Barang (views/<modul>/, components/<modul>/, stores/penyaluranDana.ts, types/penyaluranDana.ts). Rute stub lama `/bpdp/penyaluran` (`views/bpdpks/PenyaluranDanaView.vue`) digantikan: redirect ke `/penyaluran-dana/pks-3-pihak` dan stub dihapus (eliminasi dead code, Prinsip V); `activeMenu` referensi lama disesuaikan.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Tidak ada pelanggaran konstitusi — tabel tidak berlaku.
