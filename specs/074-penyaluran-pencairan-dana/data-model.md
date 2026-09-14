# Data Model: Modul Penyaluran & Pencairan Dana

**Status**: Client-simulated (Pinia + localStorage) — lihat [research.md D-1](./research.md). Tipe TypeScript di `src/types/penyaluranDana.ts`; validasi runtime zod di `src/schemas/penyaluranDana.ts`.

## Diagram Relasi (teks)

```text
Proposal (SK_DIRUT_TERBIT, existing pengusulan)
  └─1:N─ PKS3Pihak (1 aktif per proposal)
          ├─1:3─ Komparisi (A.1 KP / A.2 BPDP / A.3 BANK)
          └─1:N─ Pencairan (Permohonan)   [klarifikasi Q1: banyak per proposal]
                   ├─1:N─ PencairanDivisiItem (nilai per divisi; total = Σ computed)
                   ├─1:3─ PencairanTahap (.T1/.T2/.T3; 40/30/30; gate 0.7/1.0)
                   │        ├─1:N─ DokumenPencairan (checklist per tahap)
                   │        ├─1:N─ VerifikasiRantai (PENDOK→VERDOK→QC→PUSAT→STAFF→KADIV)
                   │        ├─1:1─ SuratPersetujuanPencairan
                   │        └─1:1─ TransferEscrow (mock Odoo: SPP + status)
                   └─1:N─ RiwayatPerbaikan (catatan tolak lintas gerbang)
Proposal ─1:1─ PengembalianDana (cabang)
Proposal ─1:1─ PenutupanRekening (gerbang bukti sisa dana → surat → selesai)
```

## Entities

### PKS3Pihak

| Field | Tipe | Keterangan / Validasi |
|-------|------|----------------------|
| id | string | `PKS-<proposalId>` |
| proposalId | string | FK Proposal (status `SK_DIRUT_TERBIT`) |
| noPksKp / noPksBpdp / noPksBank | string? | diisi masing-masing pihak via komparisi |
| status | enum | lihat transisi di bawah |
| jadwalTtd | string (ISO date)? | wajib saat status PENJADWALAN |
| dokumenPksFile | string? | nama file hasil generate (Word-ready HTML `.doc`) |
| suratKuasaFile | string? | upload KP (PDF/JPG, ≤ batas existing) |
| kopSuratB | object | { namaKp, telpKantor, emailKantor, noSkDirut, tglSkDirut, noPks, tglPks, namaKetua, hpKetua } — auto dari profil |

**State transitions**: `DIPROSES → KOMPARISI` (3 komparisi submit) `→ PENJADWALAN` (BPDP set jadwal) `→ DITANDATANGANI` (upload hasil ttd) `→ AKTIF` (konfirmasi). Tidak ada transisi mundur; perbaikan komparisi = re-submit field (waktu submit baru tercatat).

### Komparisi

| Field | Tipe | Keterangan |
|-------|------|-----------|
| pksId | string | FK PKS3Pihak |
| pihak | enum | `A1_KP` \| `A2_BPDP` \| `A3_BANK` |
| payload | object | A.1: noPksKp, legalitas badan hukum (dari profil, read-only + lampiran), penunjukkan ketua; A.2: noPksBpdp, narasi badan hukum BPDP; A.3: noPksBank, narasi bank, **noRekeningKp** (wajib, numeric 10–16 digit) |
| submittedAt | ISO datetime | audit |

### Pencairan (Permohonan)

| Field | Tipe | Validasi |
|-------|------|----------|
| id | string | `PD-<seq>` |
| nomorPermohonan | string | `SRPR-KLPA/DANA/<YYYY>/<NNN>` auto-generate (counter store) |
| proposalId | string | hanya proposal `SK_DIRUT_TERBIT` + PKS `AKTIF` |
| pksId | string | FK |
| jenisPembelian | enum | `PEMBELIAN` \| `REIMBURSEMENT` \| `UMK` |
| peruntukan | enum | `BENEFICIER` \| `OPERASIONAL_KP` |
| divisiItems | PencairanDivisiItem[] | ≥1 divisi; nilai > 0; divisi unik |
| total | number | **computed = Σ divisiItems.nilai** (tidak diinput manual; disimpan hanya pada snapshot persist) |
| rekeningTujuan | object | { namaRekening, nomorRekening (10–16 digit), bankTujuan (pilihan bank seed), skema: `ONLINE_EKSTERNAL`\|`SKN_EKSTERNAL`, alamat, kota, kodepos (5 digit), email } |
| dataGenerated | object | Data A (legalitas) + Data B (kop) + metrik proposal: pagu, luasHektar, saldoPernyataan, sisaSaldo, pemohon/jabatan, tanggal, jumlahPekebun, jumlahKK, tahap, escrow { noRekening, bank } |
| status | enum | `DRAFT` \| `DIAJUKAN` \| `DIPROSES_TAHAP1..3` \| `SELESAI` \| `DIBATALKAN` |
| createdAt / updatedAt | ISO | audit |

**Aturan bisnis**: Σ divisiItems.nilai ≤ sisaSaldo (zod refiner, pesan menampilkan sisa); rekening tujuan ≠ rekening escrow KP → warning (dapat lanjut bila skema memang transfer ke pihak lain? → default: peringatan + konfirmasi, sesuai edge case "memperingatkan/menolak").

### PencairanDivisiItem

| Field | Tipe |
|-------|------|
| divisiId | enum `DIV_01..DIV_10` (Umum, Drainase, Tanah & Geosintetik, Pelebaran Perkerasan & Bahu Jalan, Perkerasan Berbutir & Beton Semen, Perkerasan Aspal, Struktur, Pengembangan Kondisi & Pekerjaan Minor, Pekerjaan Harian, Pemeliharaan Rutin) — konfigurasi seed, bisa disesuaikan |
| nilaiPermohonan | number > 0 (formatRupiah display) |

### PencairanTahap

| Field | Tipe | Validasi |
|-------|------|----------|
| id | string | FK composite |
| pencairanId | string | FK Pencairan |
| tahap | 1 \| 2 \| 3 | — |
| persen | 0.40 \| 0.30 \| 0.30 | — |
| idPenyaluran | string | `<basisKodePermohonan>.T<n>` unik global (mis. `SPKA106260001.T1`) |
| nominal | number | default `total × persen`; BPDP input/konfirmasi; deviasi % ditampilkan & wajib konfirmasi |
| gateProgress | 0.7 (tahap 2) \| 1.0 (tahap 3) \| null (tahap 1) | tombol ajukan locked bila progressMonitoring < gate |
| progressMonitoring | number 0–1 | diisi dari laporan SCI E/G terverifikasi |
| status | enum | lihat transisi |
| escrowInfo | object? | { noSpp, statusPembayaran: `PENDING`\|`PAID`, nominalMasuk, rekeningEscrow, bank, waktu } |

**State transitions**: `TERKUNCI` (gate belum terpenuhi) `→ DIAJUKAN` (KP submit checklist lengkap) `→ VERIF_SCI` `→ VERIF_BPDP` `→ DISETUJUI` (Kadiv Ya; Surat Persetujuan) `→ DITRANSFER` (Bank konfirmasi + escrow PAID). Cabang: `DITOLAK_PERBAIKAN` di gerbang mana pun → kembali `DIAJUKAN` setelah KP submit ulang (riwayat + catatan dipertahankan); `DITOLAK` final (terminal, hanya oleh Kadiv dengan alasan).

### DokumenPencairan

| Field | Tipe |
|-------|------|
| tahapId | string FK |
| jenis | `GENERATED` \| `UPLOAD` |
| tipeDokumen | enum: `SK_DIRUT, PENELITIAN_REKOMTEK, REKOMTEK_CPCL_BA, SURAT_PERMOHONAN, PKS_3PIHAK, KUITANSI, SPTJM, BA_PEMBAYARAN, SURAT_KUASA, RENCANA_PENGGUNAAN_RAB, LAP_PENGGUNAAN, LAP_KEMAJUAN, LAP_MON_SCI, BA_MON, DOK_KEGIATAN, DOK_D, BA, SURAT_TUGAS` |
| fileName / urlSimulasi | string? |
| required | boolean |
| uploadedAt / uploadedBy | audit |

**Checklist template per tahap** (Lampiran A spec): T1 = 3 generated + 7 upload KP; T2 = +PKS pratinjau, SPermohonan/Kuitansi/SPTJM/BA T2, LapPenggunaan T1, LapKemajuan ≥70% (+Dinas), Rencana 30%+RAB, dan SCI: SuratTugas + LapMon E + BA + Dokumentasi; T3 = idem dengan LapPenggunaan T2, LapKemajuan 100%, laporan G. PKS di T2/T3 mode **pratinjau dari T1** (menu upload tetap terbuka bila ada perubahan).

### VerifikasiRantai

| Field | Tipe |
|-------|------|
| tahapId | FK |
| tingkat | enum `PENDOK` \| `VERDOK` \| `QC` \| `SCI_PUSAT` \| `BPDP_STAFF` \| `BPDP_KADIV` |
| hasil | `SESUAI` \| `TIDAK_SESUAI` |
| catatan | string (WAJIB bila TIDAK_SESUAI; opsional bila SESUAI) |
| vpdFile | string? (SCI_PUSAT: Laporan & Lampiran VPD wajib sebelum push ke BPDP) |
| actedAt / actor | audit |

**Urutan wajib**: PENDOK → VERDOK → QC → SCI_PUSAT (upload VPD) → BPDP_STAFF → BPDP_KADIV. Tingkat berikut terkunci sampai sebelumnya `SESUAI`.

### SuratPersetujuanPencairan

| Field | Tipe |
|-------|------|
| tahapId | FK (unik per tahap) |
| nomor | string auto (`SPR-KLPA/DANA/<YYYY>/<NNN>`, format final TBD Ditjenbun) |
| fileName | upload BPDP setelah generate |
| uploadedAt / uploadedBy | audit |

### TransferEscrow

| Field | Tipe |
|-------|------|
| tahapId | FK unik |
| odooSppNo | string mock `SPP-<yyyymmdd>-<seq>` |
| statusPembayaran | `PENDING` \| `PAID` (gangguan integrasi → tetap PENDING + catatan, tidak pernah gagal diam-diam) |
| nominal, rekeningEscrow, bank, waktu | audit/display |

### PengembalianDana

| Field | Tipe |
|-------|------|
| proposalId | FK |
| suratPermohonanFile | upload KP |
| status | `DIAJUKAN` → `DITELITI` → (`DIKEMBALIKAN` loop ⇄ DIAJUKAN) → `SELESAI` |
| hasilPenelitian | catatan BPDP-Teknis |
| suratPemberitahuanFile / skPembatalanFile | generated saat SELESAI |

### PenutupanRekening

| Field | Tipe |
|-------|------|
| proposalId | FK |
| buktiPencairanSisaDanaFile | upload KP — **gerbang** (klarifikasi Q3) |
| gerbangSisaDanaSelesai | boolean (otomatis true saat bukti diunggah) |
| suratPenutupanFile | upload KP (form terbuka hanya setelah gerbang true) |
| status | `DIAJUKAN` → `DITERIMA_BPDP` → `DITERIMA_BANK` → `SELESAI` |

### NotifikasiEvent (simulasi)

| Field | Tipe |
|-------|------|
| id, permohonanId / pksId | FK |
| tipe | `SK_DIRUT_TERBIT, JADWAL_TTD, CATATAN_PERBAIKAN, PERSETUJUAN, PENOLAKAN, DANA_MASUK_ESCROW` |
| targetRole | enum peran penerima |
| payload (judul, pesan) / createdAt | display |

## Validasi Zod (ringkas)

- Wizard step 1: proposalId wajib & eligible; jenisPembelian/peruntukan enum; divisiItems min 1, nilai positive int, Σ ≤ sisaSaldo; nomorRekening 10–16 digit; kodepos 5 digit; email format.
- Komparisi A.3: noRekeningKp wajib numeric.
- Gate nominal: nominal > 0; bila |nominal − total×persen| > 1 rupiah → flag konfirmasi (bukan blokir).
- Upload: ekstensi PDF/JPG/DOCX, ukuran ≤ batas existing modul dokumen; pesan error eksplisit.

## Seed Demo (INITIAL_DEMO_DATA)

2 proposal SK_DIRUT_TERBIT (1 KP Jambi seed existing persona "Koperasi Produsen Kelapa Makmur Jaya"), 1 PKS AKTIF lengkap komparisi, 2 permohonan: satu Tahap 1 DITRANSFER (demonstrasi escrow PAID + tracking penuh), satu DRAFT (untuk demo wizard); 1 bank mitra seed (BCA/BRI) + rekening escrow per KP; laporan monitoring 75% (tahap 2 unlock-able).
