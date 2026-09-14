# Phase 0 Research: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

## Research Overview
Fitur ini bertujuan untuk menyelaraskan alur verifikasi penolakan Dokumen Fisik RAB oleh Verifikator Dinas Kabupaten/Kota dan penyajian tinjauan (overview read-only) serta pengunggahan ulang Dokumen Fisik RAB Bertandatangan oleh Kelembagaan Pekebun (Pemohon).

---

## 1. Penolakan Dokumen RAB di Sisi Verifikasi Dinas Kabupaten

### Keputusan (Decision)
- Verifikator Dinas Kabupaten memeriksa dokumen fisik RAB bertandatangan (`RAB_PROPOSAL` / `RAB_RK`).
- Penolakan dicatat melalui `validasi_dokumen_proposals` dengan `is_valid: false` dan `notes` wajib diisi.
- Pengembalian usulan proposal mengubah status ke `REV_FROM_KAB` (Perlu Perbaikan / Revisi Kabupaten).

### Rationale
- Penolakan difokuskan pada keabsahan dokumen fisik (tanda tangan, stempel basah, kejelasan scan) bukan perubahan kuantitas item baris RAB.
- Memanfaatkan mekanisme `validasi_dokumen_proposals` yang sudah ada untuk standardisasi validasi berkas.

### Alternatif yang Ditolak
- *Validasi per-baris item tabel RAB*: Ditolak karena verifikator dinas kabupaten menilai keabsahan dokumen fisik RAB secara keseluruhan, dan struktur item di sistem sudah di-input sejak tahap awal pengusulan.

---

## 2. Penyajian Tab RAB pada Halaman Revisi Kelembagaan Pekebun

### Keputusan (Decision)
- **Banner Penolakan**: Menampilkan catatan penolakan verifikator spesifik untuk dokumen RAB (`categorized_rejections` dengan `category: 'RAB'`).
- **Tabel Rincian RAB (Overview)**: Memasang komponen `RabTable.vue` dalam mode `:readonly="true"` (hanya lihat, tanpa aksi tambah/edit/hapus baris).
- **Cetak/Unduh Format Dokumen RAB (PDF)**: Menyediakan tombol "Cetak / Unduh RAB (PDF)" agar pemohon dapat mencetak format fisik resmi yang memuat rincian tabel overview dan kolom tanda tangan.
- **Unggah Berkas Baru**: Form unggah dokumen PDF/Gambar untuk file Dokumen RAB Bertandatangan baru.
- **Sinkronisasi Dua Arah (Single Source of Truth)**: Berkas yang diunggah di Tab RAB otomatis memperbarui status berkas RAB di Tab Dokumen Proposal menjadi "Telah Diperbarui".

### Rationale
- Menghilangkan ambiguitas bagi pemohon sehingga jelas bahwa data item usulan tidak berubah, pemohon hanya perlu melengkapi dan mengunggah kembali dokumen fisik yang sah.
- Mencegah inkonsistensi data anggaran dan menghapus overhead pelacakan state modifikasi baris di store (`updatedRabItemsMap`).

### Alternatif yang Ditolak
- *Mengizinkan edit baris item RAB di halaman revisi*: Ditolak sesuai keputusan bahwa revisi hanya pada tingkat dokumen fisik pengganti.
- *Memisahkan dokumen RAB di Tab RAB tanpa sinkronisasi ke Tab Dokumen Proposal*: Ditolak karena melanggar prinsip *Single Source of Truth* (Principle V Constitution).

---

## 3. Integrasi Backend (Revisi Detail & Resubmit Proposal)

### Keputusan (Decision)
- **`GET /api/v1/proposals/:id/revisi-detail`**:
  - Memetakan dokumen yang ditolak dengan `document_type` seperti `RAB_PROPOSAL`, `RAB_RK`, atau `RAB` ke `CategorizedRejectionItemResponse` dengan `category: "RAB"`, `target_key: "rab-signed"`.
- **`POST /api/v1/proposals/:id/resubmit`**:
  - Memproses `updated_documents` (termasuk dokumen RAB yang baru) untuk mengganti `file_id` di `dokumen_proposals`.
  - Mengubah status usulan proposal kembali ke `SUBMITTED`.
  - Data `rab_items` dan `total_anggaran` pada usulan tetap konsisten dan tidak dimutasi.

### Rationale
- Penanganan seragam dengan seluruh dokumen usulan proposal lainnya.
- Menjaga keutuhan transaksi database dan audit log perubahan dokumen usulan.
