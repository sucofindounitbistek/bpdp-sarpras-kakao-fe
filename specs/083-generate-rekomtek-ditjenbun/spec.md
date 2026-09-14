# Feature Specification: 1:1 Rekomendasi Teknis (Rekomtek) Ditjenbun PDF Generator

**Feature Directory**: `specs/083-generate-rekomtek-ditjenbun/`  
**Status**: Draft  
**Target Roles**: Ditjenbun Verifikator, Ditjenbun Approval (Ketua Tim)  

---

## 1. Overview & Problem Statement

Pada alur verifikasi tingkat **Ditjenbun (Direktorat Jenderal Perkebunan)**, verifikator bertugas memeriksa kelengkapan usulan dan menerbitkan dokumen **Rekomendasi Teknis (Rekomtek)** yang ditujukan kepada Direktur Utama Badan Pengelola Dana Perkebunan Kelapa Sawit (BPDPKS).

Sebelumnya, tombol *"Download Draf Rekomtek"* pada halaman Verifikasi Usulan Ditjenbun (`CekiDitjenbunView.vue`) hanya mengarahkan ke berkas statis contoh (`/templates/spek-teknis.pdf`). Pengguna membutuhkan generator draf Rekomtek dinamis yang **1:1 presisi** sesuai format resmi Kementerian Pertanian Direktorat Jenderal Perkebunan (dokumen 3 halaman lengkap dengan kop surat, penjajaran 8 butir data usulan, rincian bantuan RAB, klausul kewenangan BPDPKS, blok TTE BSrE, tembusan, dan lembar lampiran SK CPCL & Berita Acara).

---

## Clarifications

### Session 2026-09-12
- Q: Format output apa saja yang ingin disediakan oleh sistem saat verifikator mengklik tombol generate/unduh di antarmuka Ditjenbun? → A: **Option B (PDF 1:1 Langsung)**: Rekomtek sepenuhnya di-generate langsung oleh sistem menjadi dokumen PDF 3 halaman presisi 1:1, dilengkapi viewer pratinjau modal dan unduh PDF instan tanpa membutuhkan proses unduh/edit template Word manual.
- Q: Dari mana nomor Rekomtek didapatkan saat men-generate draf? → A: **Opsi 1 (Input Manual Form / Fallback Draf Sementara)**: Verifikator tetap menginput nomor rekomtek pada form *Penerbitan Rekomtek*. Jika input nomor diisi, nomor tersebut otomatis dicetak ke dokumen PDF. Jika form belum diisi, sistem menyematkan nomor draf sementara dengan format standar Kementan: `.../PI.400/E/[BULAN]/[TAHUN]` (misal: `.../PI.400/E/09/2026`).
- Q: Bagaimana tampilan area Tanda Tangan Elektronik (TTE / QR Code BSrE) pada Draf Rekomtek hasil generate sistem? → A: **Option A (Format Resmi 1:1 Lengkap)**: Blok TTE menampilkan lengkap nama pejabat (Plt. Direktur Jenderal Perkebunan, Heru Tri Widarto, S.Si., M.Sc / NIP 197204121999031004) dan mockup QR Code BSrE resmi Kementerian Pertanian, dengan penanda/watermark status draf agar 1:1 identik dengan dokumen acuan.


---

## 2. User Scenarios & Workflows

### Scenario 1: Verifikator Ditjenbun Men-generate Draf Rekomtek Otomatis
- **Aktor**: Verifikator Ditjenbun.
- **Pre-kondisi**: Proposal berada pada tahap asistensi/verifikasi Ditjenbun (`PROV_SUBMITTED` / `VALIDATED_PROV`).
- **Alur**:
  1. Verifikator membuka halaman detail usulan di `/ditjenbun/ceki/:id`.
  2. Pada panel Card *"Penerbitan Rekomtek"*, verifikator mengisi atau menyetujui Nomor Rekomtek (misal: `124/PI.400/E/08/2026`).
  3. Verifikator mengklik tombol **"Generate Draf Rekomtek"** atau ikon **"Pratinjau Draf"**.
  4. Sistem mengompilasi seluruh data proposal aktif (kelembagaan, badan hukum, alamat, luas areal, jumlah pekebun, lokasi kebun, jenis paket, total nilai RAB, dan rincian alokasi barang/pupuk).
  5. Dokumen PDF 3 halaman berformat 1:1 terbuka di modal pratinjau PDF dan/atau otomatis terunduh dengan nama file terstandar `Draf_Rekomtek_[NOMOR_PROPOSAL].pdf`.

### Scenario 2: Alur Tanda Tangan & Pengajuan Rekomtek
- **Alur**:
  1. Verifikator mengunduh draf Rekomtek hasil generate sistem.
  2. Dokumen diproses melalui sistem persuratan / TTE resmi BSrE.
  3. Berkas PDF Rekomtek yang telah ditandatangani diunggah pada slot input *"Unggah Rekomtek Bertanda Tangan"*.
  4. Verifikator mengklik tombol *"Ajukan ke Approval Ditjenbun"*. Proposal berlanjut ke Ketua Tim Ditjenbun dengan berkas Rekomtek valid yang siap diverifikasi.

---

## 3. Detail Tata Letak Dokumen (1:1 Template Layout Specification)

Dokumen hasil generate harus memiliki 3 halaman terstruktur secara presisi:

### Halaman 1: Badan Surat Utama
1. **Kop Surat Resmi Kementan**:
   - Logo Kementerian Pertanian (sayap & daun emas/kuning berlatar lingkaran hijau) di sisi kiri.
   - Teks rata tengah:
     - `KEMENTERIAN PERTANIAN`
     - `DIREKTORAT JENDERAL PERKEBUNAN`
     - `KANPUS KEMENTERIAN PERTANIAN JALAN HARSONO RM NOMOR 3 GEDUNG C PASAR MINGGU, JAKARTA 12550`
     - `TELEPON (021) 7815380 - 4, FAKSIMILI (021) 7815486 - 7815586`
     - `WEBSITE : https://ditjenbun.pertanian.go.id`
   - Garis pemisah ganda (tebal di atas, tipis di bawah).
2. **Metadata Surat**:
   - Kolom Kiri:
     - `Nomor : [NOMOR_REKOMTEK]`
     - `Sifat : Biasa`
     - `Lampiran : Satu Berkas`
     - `Hal : Rekomendasi Teknis Sarana dan Prasarana Kegiatan [NAMA_PAKET] [NAMA_LEMBAGA] Kabupaten [KABUPATEN] Provinsi [PROVINSI]`
   - Kolom Kanan: `[TANGGAL_SURAT_INDONESIA]` (misal: 29 Agustus 2026).
3. **Tujuan Surat**:
   - `Yth.`
   - `Direktur Utama`
   - `Badan Pengelola Dana Perkebunan Kelapa Sawit (BPDPKS)`
   - `Kementerian Keuangan RI`
   - `di Tempat`
4. **Paragraf Pembuka**:
   - Merujuk surat Kepala Dinas Perkebunan Provinsi (Nomor & Hal surat usulan dinas provinsi) dan Keputusan Direktur Jenderal Perkebunan tentang Pedoman Teknis Sarana dan Prasarana Perkebunan Kelapa Sawit.
5. **Rincian Data 8 Poin**:
   - `1. Nama Kelembagaan : [NAMA_LEMBAGA]`
   - `2. Badan Hukum : [NOMOR_BADAN_HUKUM]`
   - `3. Alamat Kelembagaan : [DESA], [KECAMATAN], [KABUPATEN], [PROVINSI]`
   - `4. Luas Areal : [TOTAL_LUAS_HA] Ha`
   - `5. Jumlah pekebun/KK : [TOTAL_PEKEBUN] Pekebun`
   - `6. Lokasi Kebun : [DESA], [KECAMATAN], [KABUPATEN], [PROVINSI]`
   - `7. Jenis Sarana dan Prasarana : [JENIS_PAKET] dengan nilai sebesar Rp. [TOTAL_RAB],- yang didukung dengan Rincian Anggaran Biaya (RAB)`
   - `8. Rincian Bantuan : [DAFTAR_RINCIAN_BARANG_DARI_RAB]` (misal: Urea sebanyak X Kg, Herbisida sebanyak Y Ltr).
6. **Footer BSrE**:
   - Catatan kaki: *"Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN"*.

### Halaman 2: Klausul Penutup, TTE & Tembusan
1. **Nomor Halaman**: Header tengah `-2-`.
2. **Paragraf Klausul Harga**:
   - Klausul terkait perhitungan harga satuan RAB yang berlaku saat rekomendasi dibuat, dan kewenangan perubahan harga saat penyaluran berada pada BPDPKS.
3. **Paragraf Penutup**:
   - Penyampaian rekomendasi teknis untuk proses lebih lanjut.
4. **Blok Tanda Tangan Elektronik (TTE)**:
   - Sisi kanan:
     - `Ditandatangani secara elektronik oleh`
     - `Plt. Direktur Jenderal Perkebunan,`
     - Placeholder QR Code TTE BSrE + Logo Balai Sertifikasi Elektronik.
     - `[NAMA_PEJABAT_DIRJENBUN]` (default: Heru Tri Widarto, S.Si., M.Sc)
     - `NIP [NIP_PEJABAT]` (default: 197204121999031004)
5. **Tembusan (6 Pihak)**:
   - `1. Menteri Pertanian;`
   - `2. Deputi Bidang Pangan dan Agribisnis, Kementerian Koordinator Bidang Perekonomian;`
   - `3. Direktur Jenderal Perbendaharaan, Kementerian Keuangan;`
   - `4. Kepala Dinas Perkebunan Provinsi [PROVINSI_TERKAIT];`
   - `5. Kepala Dinas Perkebunan dan Peternakan Kabupaten [KABUPATEN_TERKAIT];`
   - `6. Ketua [NAMA_LEMBAGA].`
6. **Footer BSrE**.

### Halaman 3: Lembar Lampiran Surat
1. **Nomor Halaman**: Header tengah `-3-`.
2. **Header Lampiran**:
   - `Lampiran Surat`
   - `Nomor : [NOMOR_REKOMTEK]`
   - `Tanggal : [TANGGAL_SURAT_INDONESIA]`
3. **Daftar Lampiran (2 Butir)**:
   - `1. Keputusan Kepala Dinas Perkebunan Kabupaten [KABUPATEN] Nomor [NOMOR_SK_CPCL] tanggal [TANGGAL_SK_CPCL] tentang Penetapan Calon Penerima dan Calon Lokasi (CP/CL) Anggota [NAMA_LEMBAGA]... (Lampiran 1);`
   - `2. Berita Acara Hasil Verifikasi Dokumen Usulan Kegiatan [NAMA_PAKET] [NAMA_LEMBAGA], Kabupaten [KABUPATEN], Provinsi [PROVINSI] (Lampiran 2).`
4. **Blok TTE Kedua**:
   - Penegasan tanda tangan elektronik pejabat Dirjenbun dengan QR Code BSrE.
5. **Footer BSrE**.

---

## 4. Functional Requirements

- **FR-001**: Sistem menyediakan komponen/modul generator PDF Rekomtek 1:1 yang dapat dijalankan secara instan dari sisi klien (frontend print/PDF) maupun endpoint backend.
- **FR-002**: Sistem memetakan 100% parameter proposal secara dinamis tanpa ada data hardcoded fiktif yang tersisa saat proposal memiliki data riil.
- **FR-003**: Jika data nomor SK CPCL atau surat usulan provinsi belum tersedia dalam proposal, sistem menyediakan fallback format nomor standar yang dapat diedit oleh verifikator.
- **FR-004**: Pada halaman `CekiDitjenbunView.vue`, tombol *"Download Draf Rekomtek"* dan tombol *"Pratinjau"* langsung memicu render template 1:1 tersebut berdasarkan nomor Rekomtek yang sedang diinputkan.
- **FR-005**: Modal pratinjau dokumen memungkinkan verifikator membaca keseluruhan 3 halaman draf sebelum memutuskan untuk mengunduhnya.
- **FR-006**: Rincian Bantuan pada poin 8 secara dinamis mengekstrak baris RAB usulan (volume, satuan, dan nama barang/jasa).

---

## 5. Non-Functional Requirements & Success Criteria

- **SC-001 (Presisi Visual)**: Tata letak, tipografi, ukuran kertas A4, margin, dan posisi elemen dokumen hasil generate 99-100% identik dengan contoh template PDF Kementan.
- **SC-002 (Performa Generate)**: Waktu pembentukan draf Rekomtek dari klik tombol hingga dokumen muncul < 1.5 detik.
- **SC-003 (Kompabilitas Dokumen)**: File PDF yang dihasilkan valid secara format standar PDF/A atau PDF 1.7, dapat dibuka di seluruh viewer (Adobe Acrobat, browser, Foxit), dan siap cetak (print-ready) tanpa terpotong (*no text overflow/clipping*).
- **SC-004 (Kelancaran Alur Kerja)**: Verifikator Ditjenbun tidak perlu membuka aplikasi eksternal (seperti Microsoft Word atau converter online) hanya untuk membuat draf Rekomtek usulan.

---

## 6. Assumptions & Edge Cases

- **Asumsi 1**: Default nama pejabat penandatangan adalah Plt. Direktur Jenderal Perkebunan (*Heru Tri Widarto, S.Si., M.Sc / NIP 197204121999031004*), namun dapat disesuaikan jika konfigurasi pejabat diubah.
- **Asumsi 2**: Jika paket sarpras bukan pupuk/pestisida (misal: Jalan Kebun atau Alat Pascapanen), Poin 7 dan Poin 8 otomatis menyesuaikan nama paket dan rincian komponen RAB yang relevan.
- **Edge Case 1 (RAB memiliki banyak item)**: Jika item RAB melebihi 10 baris, format tabel rincian bantuan butir 8 harus tetap rapi dengan layout multi-kolom atau pembagian ruang yang elegan tanpa memecah halaman 1 secara canggung.
- **Edge Case 2 (Nomor Rekomtek belum diisi)**: Jika verifikator belum mengisi input Nomor Rekomtek saat mengklik generate, sistem otomatis menyematkan nomor draf sementara (misal: `.../PI.400/E/MM/YYYY`) dan menampilkan notifikasi pengingat.
