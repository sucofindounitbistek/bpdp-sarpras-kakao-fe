# Runbook & Quickstart Guide: Verifikasi Rekomtek & SK Dirut

Panduan ini berisi skenario verifikasi manual langkah demi langkah untuk membuktikan alur kerja peran Ditjenbun dan BPDP berjalan lancar dari awal hingga akhir dengan peran terpisah secara ketat.

## Prasyarat Simulasi (Setup)

1. Pastikan server lokal berjalan: `npm run dev`.
2. Jalankan aplikasi di browser (di `http://localhost:5174`).
3. Gunakan *Role Switcher* di pojok kiri atas untuk menukar peran pengguna aktif dalam sesi simulasi.

---

## Skenario Pengujian Alur End-to-End

### Tahap 1: Verifikator Ditjenbun (Asistensi & Rekomtek)
1. **Aksi**: Ubah peran pengguna ke **DITJENBUN_VERIFIKATOR**.
2. **Navigasi**: Pilih menu **Antrean Rekomtek** melalui Sidebar.
3. **Pemeriksaan**: 
   * Pilih salah satu usulan dengan status `VERIFIKASI_DITJENBUN` (contoh: `USL/2026/07/001`).
   * Klik tombol **Tinjau** untuk masuk ke **Halaman Ceki Ditjenbun**.
   * Periksa dokumen: SK CPCL, Surat Pengantar Provinsi, Data Pekebun, Lahan, Kelembagaan.
4. **Verifikasi Jalur Koreksi (Edge Case)**:
   * Batalkan penandaan checklist pada salah satu dokumen.
   * Klik **Kembalikan untuk Perbaikan**.
   * Di dalam modal, pilih **Dinas Kabupaten/Kota** pada dropdown dan isi alasan ketidaksesuaian: *"Scan SK CPCL buram"* lalu kirim.
   * Pastikan status usulan berubah menjadi `PERBAIKAN_DINAS_KAB` dan notifikasi sukses muncul di pojok kanan atas.
5. **Verifikasi Jalur Sukses**:
   * Kembali ke antrean, buka usulan lain atau usulan yang sama yang berstatus `VERIFIKASI_DITJENBUN`.
   * Tandai semua checklist dokumen sebagai "Sesuai".
   * Pilih Bentuk Bantuan: **Barang** (via radio button).
   * Tekan tombol **Generate Rekomtek**.
   * Setelah tautan muncul, klik **Download Draf Rekomtek** (memastikan berkas PDF terunduh).
   * Ketik nomor rekomtek: `505/DITJENBUN/REKOMTEK/2026`.
   * Unggah file PDF contoh pada kolom **Upload Rekomtek Signed**.
   * Tekan tombol **Ajukan ke Ditjenbun Approval**. Status usulan berubah menjadi `APPROVAL_DITJENBUN`.

---

### Tahap 2: Approval Ditjenbun (Ketua Tim)
1. **Aksi**: Ubah peran pengguna ke **DITJENBUN_APPROVAL**.
2. **Navigasi**: Buka menu **Antrean Rekomtek** -> Buka tab **Menunggu Approval Ketua** -> Pilih usulan dengan status `APPROVAL_DITJENBUN` (contoh: `USL/2026/07/002`).
3. **Pemeriksaan**:
   * Masuk ke **Halaman Ceki Ditjenbun Approval**.
   * Klik **Unduh Rekomtek Bertanda Tangan** untuk memverifikasi dokumen Rekomtek yang sudah ditandatangani.
4. **Aksi Approval**:
   * Tekan tombol **Push ke BPDP Verifikator (Setujui)**.
   * Status usulan harus berubah menjadi `VERIFIKASI_BPDP`.

---

### Tahap 3: Verifikator BPDP (Kelayakan Rekomtek)
1. **Aksi**: Ubah peran pengguna ke **BPDP_VERIFIKATOR**.
2. **Navigasi**: Pilih menu **Verifikasi Kelayakan BPDP** melalui Sidebar.
3. **Pemeriksaan**:
   * Pilih usulan berstatus `VERIFIKASI_BPDP` (contoh: `USL/2026/07/003`) dan klik **Tinjau**.
   * Verifikasi berkas kelengkapan BPDP (Rekomtek, SK CPCL, Surat Pengantar, Berita Acara).
4. **Generate Kelayakan**:
   * Tandai isian form checklist kelayakan di UI.
   * Pilih Status Penilaian Kelayakan: **Layak**.
   * Klik **Generate Dokumen Kelayakan**.
   * Klik **Ajukan Kelayakan ke Kadiv BPDP**. Status usulan berubah menjadi `APPROVAL_BPDP`.

---

### Tahap 4: Approval BPDP (Kadiv BPDP)
1. **Aksi**: Ubah peran ke **BPDP_APPROVAL**.
2. **Navigasi**: Buka menu **Verifikasi Kelayakan BPDP** -> Buka tab **Menunggu Approval Kadiv** -> Pilih usulan dengan status `APPROVAL_BPDP`.
3. **Aksi Approval**:
   * Tinjau kelayakan rekomtek yang diajukan.
   * Tekan tombol **Setuju**.
   * Status usulan berubah menjadi `GENERATE_SK_DIRUT` dan dikirim kembali ke Verifikator BPDP.

---

### Tahap 5: Finalisasi & Penerbitan SK Dirut (Verifikator BPDP)
1. **Aksi**: Ubah peran ke **BPDP_VERIFIKATOR**.
2. **Navigasi**: Buka halaman usulan terkait yang telah berstatus `GENERATE_SK_DIRUT` di bawah tab **SK Dirut & Riwayat Selesai** -> klik **Tinjau**.
3. **Finalisasi**:
   * Klik **Generate SK Dirut** (Sistem memicu download PDF SK Dirut).
   * Ketik nomor keputusan utama.
   * Unggah berkas contoh PDF bertanda tangan di input **Upload SK Dirut**.
   * Tekan **Selesaikan Penerbitan SK Dirut**.
   * Pastikan status usulan bertransisi ke `SELESAI` dan formulir dikunci.
