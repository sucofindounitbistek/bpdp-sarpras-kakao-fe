# UI Contract: Rute & Menu Modul Penyaluran & Pencairan Dana

Kontrak antarmuka pengguna yang diekspos modul ini (SPA existing). Semua rute lazy-loaded, dilindungi `meta.roles` guard `src/router/index.ts`, breadcrumb sesuai hierarki, wording dari `src/config/localization.ts` (section `penyaluranDana`).

## Rute

| Path | View | Peran (meta.roles) | Fungsi |
|------|------|--------------------|--------|
| `/penyaluran-dana/pemohon` | `views/penyaluran-dana/PemohonPencairanView.vue` | `KELEMBAGAAN_PEKEBUN` | List permohonan + statistik (Total, Dalam Proses, Perlu Perbaikan, Dana Masuk) |
| `/penyaluran-dana/pemohon/tambah` | `PemohonWizardPermohonanView.vue` | `KELEMBAGAAN_PEKEBUN` | Wizard 3-step Tambah Permohonan |
| `/penyaluran-dana/pemohon/:id` | `PemohonDetailTrackingView.vue` | `KELEMBAGAAN_PEKEBUN` | Tracking: timeline 6-aktor, progres 40/30/30, saldo escrow, tahap 2/3, pengembalian dana, penutupan rekening |
| `/penyaluran-dana/pks-3-pihak` | `BpdpPks3PihakView.vue` | `BPDP_VERIFIKATOR` | Antrean proposal SK Dirut Terbit → proses → generate PKS → pantau komparisi A.1/A.2/A.3 → penjadwalan TTD → upload hasil ttd |
| `/penyaluran-dana/approval` | `BpdpApprovalPencairanView.vue` | `BPDP_STAFF`, `BPDP_KADIV`, `BPDP_APPROVAL` (fallback akses) | Antrean approval per tahap + VPD → Staff review → Kadiv approve → generate & upload Surat Persetujuan |
| `/penyaluran-dana/verifikasi-dokumen` | `SciVerifikasiDokumenView.vue` | `SURVEYOR_SCI` | Antrean sesuai sub-peran (Pendok→Verdok→QC→Pusat), per dokumen Sesuai/Tidak + catatan, push pusat, upload VPD |
| `/penyaluran-dana/monitoring-lapangan` | `SciMonitoringLapanganView.vue` | `SURVEYOR_SCI` | Surat Tugas, upload laporan E (≥70%) / G (100%) + BA Monitoring + dokumentasi |
| `/penyaluran-dana/bank-mitra` | `BankMitraView.vue` | `BANK_MITRA` | Komparisi A.3 (nomor rekening KP), notifikasi jadwal TTD, konfirmasi Surat Persetujuan → transfer, penutupan rekening |
| `/bpdp/penyaluran` | **redirect** → `/penyaluran-dana/pks-3-pihak` | `BPDP_VERIFIKATOR`, `BPDP_APPROVAL` | Rute stub lama digantikan (stub `views/bpdpks/PenyaluranDanaView.vue` dihapus; referensi `activeMenu` `PelaporanBASTView` disesuaikan) |

## Menu Navigasi (`composables/useNavigation.ts`)

| Section | Peran | Item |
|---------|-------|------|
| MASTER DATA (diperluas) | `KELEMBAGAAN_PEKEBUN` | + "Penyaluran Dana" → `/penyaluran-dana/pemohon` |
| BPDP (VERIFIKATOR) | `BPDP_VERIFIKATOR` | + "PKS 3 Pihak" → `/penyaluran-dana/pks-3-pihak` |
| BPDP (APPROVAL) | `BPDP_KADIV`, `BPDP_APPROVAL` | + "Approval Pencairan" → `/penyaluran-dana/approval` |
| SURVEYOR SCI | `SURVEYOR_SCI` | "Verifikasi Dokumen" + "Monitoring Lapangan" |
| BANK MITRA | `BANK_MITRA` | "Komparisi & Transfer" |

## Kontrak Interaksi Utama (penerimaan per milestone)

1. **Wizard** (KP): Step1 proposal→A/B + jenis pembelian + divisi & nilai per divisi (total read-only computed) + rekening/skema → Step2 unduh/unggah surat permohonan (PDF & Word-ready) + dokumen D + BA → Step3 checklist tahap & "Cek" kelengkapan → submit. Validasi inline vee-validate+zod; error toast; tanpa modal bersarang.
2. **Komparisi** (3 pihak, 3 peran berbeda): form A.1/A.2/A.3 dengan status submit per pihak; PKS status berubah otomatis.
3. **Rantai verifikasi**: kartu tingkat terkunci berantai; keputusan TIDAK SESUAI memaksa catatan; KP melihat "Dikembalikan untuk Perbaikan (catatan)" dan tombol perbaiki.
4. **Gate tahap**: tombol "Ajukan Tahap n" disabled + alasan syarat; nominal default 40/30/30 dapat dikonfirmasi ulang oleh BPDP dengan tampilan % deviasi.
5. **Escrow (mock)**: aksi penyaluran → SPP sintetis + status PENDING→PAID terlihat pada EscrowSaldoCard & tracker.
6. **Tracker**: satu halaman per permohonan menampilkan seluruh kejadian lintas aktor + riwayat perbaikan (SC-007).
