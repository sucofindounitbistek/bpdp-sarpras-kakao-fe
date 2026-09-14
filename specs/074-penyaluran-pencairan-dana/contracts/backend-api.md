# Backend API Contract: Penyaluran & Pencairan Dana

**Status**: ⚠️ **CLIENT-SIMULATED — TIDAK ADA BACKEND** (Konstitusi XIII)

## Verifikasi (wajib per Konstitusi XIII)

| Tanggal | Repo diperiksa | Metode | Hasil |
|--------|----------------|--------|-------|
| 2026-09-04 | `../bpdp-sarpras-kelapa-be` (ada di disk) | Pencarian seluruh `*.go`: `pencairan`, `escrow`, `pks-3pihak`, `penyaluran-dana`, `Pencairan` | **0 kecocokan** — tidak ada route, handler, maupun DTO |
| 2026-09-04 | `../bpdp-iam-be` | Peran `BPDP_STAFF`, `BPDP_KADIV`, `SURVEYOR_SCI`, `BANK_MITRA` belum terdaftar | Gap IAM |

**Kesimpulan**: Seluruh modul berjalan sebagai **mockup client-simulated** (Pinia `src/stores/penyaluranDana.ts`, persist localStorage) dengan label jelas pada kode (comment `// CLIENT-SIMULATED: backend belum menyediakan endpoint — lihat specs/074-penyaluran-pencairan-dana/contracts/backend-api.md`) mengikuti konvensi fallback `vendor.service.ts` / `auth.service.ts` / mockup Sarpras (specs/015) dan Penyaluran Barang (specs/045). Frontend **TIDAK** mengarang endpoint palsu; tidak ada HTTP call untuk modul ini.

## Kontrak API Masa Depan (spesifikasi untuk tim backend)

Ditulis di sini sebagai **permintaan kontrak** (bukan hasil inspeksi) mengikuti pola existing `/api/v1` (envelope `{ success, message, data }`, Bearer JWT, upload multipart, validasi tipe/ukuran). Endpoint berikut BARU diimplementasikan frontend setelah diverifikasi ulang langsung ke repo backend per Konstitusi XIII.

| Endpoint | Method | Peran | Keterangan |
|----------|--------|-------|------------|
| `/pks-3pihak/proposal/{id}/process` | POST | BPDP_VERIFIKATOR | Proses dokumen PKS; body: — |
| `/pks-3pihak/{id}/dokumen` | GET | semua pihak | Unduh dokumen PKS (Word-ready) |
| `/pks-3pihak/{id}/komparisi` | POST | KP / BPDP / BANK (role-guarded A.1/A.2/A.3) | Submit komparisi pihak masing-masing |
| `/pks-3pihak/{id}/jadwal-ttd` | POST | BPDP_VERIFIKATOR | Body: jadwalTtd; trigger notifikasi KP & Bank |
| `/pencairan` | POST | KELEMBAGAAN_PEKEBUN | Submit wizard (divisiItems[], rekeningTujuan, dst.) |
| `/pencairan/{id}/tahap/{n}` | GET | semua terkait | Detail tahap + checklist dokumen |
| `/pencairan/{id}/tahap/{n}/dokumen` | POST | KP / SCI | Upload per checklist (multipart) |
| `/pencairan/{id}/tahap/{n}/ajukan` | POST | KELEMBAGAAN_PEKEBUN | Ajukan tahap (server memvalidasi gate) |
| `/verifikasi/{tahapId}` | POST | PENDOK/VERDOK/QC/PUSAT/STAFF/KADIV | Body: hasil, catatan (wajib bila TIDAK_SESUAI) |
| `/verifikasi/{tahapId}/vpd` | POST | SCI_PUSAT | Upload Laporan & Lampiran VPD |
| `/pencairan/{id}/tahap/{n}/surat-persetujuan` | POST | BPDP | Generate + upload Surat Persetujuan |
| `/pencairan/{id}/tahap/{n}/transfer-escrow` | POST | BPDP | Trigger Odoo; balasan: `noSpp`, `statusPembayaran` |
| `/pengembalian-dana` | POST/GET | KP / BPDP_TEKNIS | Upload permohonan, penelitian, dokumen keluaran |
| `/penutupan-rekening` | POST/GET | KP / BPDP / BANK | Gerbang sisa dana + surat penutupan |
| `/pencairan/{id}/tracking` | GET | semua terkait | Timeline gabungan lintas aktor |

### Kontrak integrasi Odoo (escrow)

- **Key**: nomor permohonan / ID Penyaluran (`.T1/.T2/.T3`)
- **Balasan**: `nomor SPP` + `status pembayaran`
- **Failure mode**: integrasi belum siap / gangguan → status `PENDING` + catatan (tidak pernah gagal diam-diam); mode mock untuk dev (pola DUKCAPIL mock)

### Kontrak peran (IAM)

Peran baru yang diminta: `BPDP_VERIFIKATOR` (existing), `BPDP_STAFF`, `BPDP_KADIV`, `SURVEYOR_SCI` (+ sub-peran `pendok|verdok|qc|kantor_pusat` — rekomendasi: 1 peran + field sub-peran), `BANK_MITRA`. Frontend telah menambahkan kode peran di `src/types/role.ts` mengikuti preseden mock PPK/ULP; IAM tinggal mendaftarkan nilai yang sama.

## Syarat real-integrasi (checklist saat backend siap)

1. Verifikasi ulang setiap endpoint langsung ke source `bpdp-sarpras-kelapa-be` (route + DTO + response + middleware) — Konstitusi XIII.
2. Buat `src/services/penyaluranDana.service.ts` sebagai satu-satunya seam HTTP; store berpindah dari seed demo ke service tanpa mengubah komponen (komponen tidak boleh terpengaruh — Prinsip III).
3. Pertahankan perilaku error: propagasi pesan envelope `{message}/{error}` ke Toaster (Prinsip IX).
4. Hapus seed demo & label CLIENT-SIMULATED (dead code elimination — Prinsip V).
