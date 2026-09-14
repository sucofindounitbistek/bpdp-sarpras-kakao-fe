# Research: Penyelarasan Alur Modul Penyaluran Barang (SOP Swimlane)

## 1. Integrasi Data Proposal Sarpras (Hybrid Mode)
- **Keputusan**: Mendukung *hybrid mode* di mana pekebun dapat memilih proposal eksisting yang berstatus `SK_DIRUT` / `SPKA` untuk mengisi otomatis (*auto-populate*) data kelembagaan, alamat, kontak, dan rincian item preferensi RAB, atau memilih input mandiri.
- **Rasional**: Memastikan kelancaran transisi dari fase pengusulan proposal sebelumnya ke fase penyaluran barang tanpa memblokir skenario input manual khusus.
- **Alternatif yang Dipertimbangkan**: Wajib proposal (ditolak karena membatasi fleksibilitas entry data jika ada berkas proposal historis yang belum terdigitalisasi penuh).

## 2. Struktur Dokumen Kontrak "A" Multi-Item
- **Keputusan**: Menggunakan model *Single Consolidated Contract* (1 Dokumen Kontrak SPK per Permohonan) yang mencakup seluruh item komoditas yang dimenangkan vendor pemenang dengan akumulasi total nilai kontrak.
- **Rasional**: Sesuai dengan Perpres/LKPP pengadaan barang pemerintah paket bantuan terpadu di mana 1 paket permohonan diterbitkan dalam 1 SPK/Kontrak pengadaan.
- **Alternatif yang Dipertimbangkan**: Kontrak terpisah per item barang (ditolak karena meningkatkan kompleksitas administrasi dan tidak umum untuk paket pengadaan tunggal).

## 3. Ruang Lingkup Peran Surveyor
- **Keputusan**: Role SURVEYOR bertindak sebagai *View-Only Antrean Penugasan* & download berkas surat tugas. Validasi administratif dan penyelesaian status akhir alur (`SELESAI`) dikelola terpusat oleh BPDP Teknis.
- **Rasional**: Mengikuti diagram SOP Swimlane di mana pada sub-lane Surveyor dicantumkan *(Belum ada detail proses pada bagian ini di gambar)* dan proses administratif tetap di bawah kendali BPDP Teknis.
- **Alternatif yang Dipertimbangkan**: Full workflow submit BASTP di sisi Surveyor (ditangguhkan ke fase lanjutan ketika detail SOP teknis surveyor telah distandardisasi).

## 4. Modal Terpadu Pengajuan Permohonan & Review RAB (Kelembagaan Pekebun)
- **Keputusan**: Seluruh alur pengajuan dari daftar proposal (Review RAB read-only, Download format surat PDF resmi, Upload berkas PDF bertandatangan, dan Submit) dijalankan dalam satu modal terpadu pada halaman Penyaluran Barang.
- **Rasional**: Menyelaraskan interaksi dengan diagram alir *(flowchart)* secara sekuensial tanpa memaksa pengguna berpindah-pindah rute halaman, serta menjaga data kuantitas barang tetap presisi sesuai SK Dirut/SPKA yang telah disetujui.
- **Alternatif yang Dipertimbangkan**: Form multi-page wizard terpisah (ditolak karena membuat alur pengajuan berbelit-belit mengingat data proposal & RAB sudah final).

## 5. Verifikasi BPDP Teknis & Upload Nota Dinas
- **Keputusan**: Pada modal verifikasi BPDP Teknis, jika keputusan "Tidak", permohonan dikembalikan ke status `DRAFT` (dengan alasan penolakan/revisi). Jika "Ya", form mewajibkan upload berkas PDF **Nota Dinas Direktur Teknis** (maks 5 MB) tanpa membebani input teks nomor/tanggal terpisah, lalu menekan tombol *"Kirim ke BPDP PPK"*.
- **Rasional**: Sesuai swimlane box *"Direktur Teknis Mengirim nota dinas ke PPK sebagai dasar proses pengadaan barang/jasa"*, di mana berkas PDF Nota Dinas menjadi bukti sah instruksi pengadaan ke PPK.

## 6. Review & Disposisi Universal oleh BPDP PPK
- **Keputusan**: Halaman BPDP PPK berfungsi sebagai panel review terpadu (menampilkan dokumen Surat Permohonan Pekebun, tabel RAB, dan berkas Nota Dinas BPDP Teknis) dengan tombol aksi universal *"Kirim ke BPDP ULP"* untuk memindahkan berkas ke antrean ULP.
- **Rasional**: Menyederhanakan tugas PPK sesuai swimlane *"Menerima surat permohonan pengadaan barang/jasa"* dan *"Menginformasikan pengadaan barang kepada ULP"*.

## 7. Pemilihan Penyedia di e-Catalog oleh BPDP ULP (Di Luar Aplikasi)
- **Keputusan**: BPDP ULP menerima tiket berstatus `DISPOSISI_ULP` (Konektor 3), mengubah status menjadi `PROSES_PEMILIHAN_PENYEDIA` saat tender dimulai. Karena proses tender dan penentuan pemenang riil dilakukan pada portal e-catalog LKPP (*di luar aplikasi*), BPDP ULP cukup menekan tombol *"Selesai"* yang memunculkan dialog konfirmasi penyelesaian sebelum mengalirkan tiket ke status `PENETAPAN_PEMENANG` (Konektor 4) menuju BPDP Teknis untuk pembuatan Dokumen Kontrak "A".
- **Rasional**: Selaras 100% dengan anotasi swimlane *"Pemilihan dan Penetapan Pemenang Tender (proses diluar aplikasi) -> Klik selesai"*, membebaskan petugas ULP dari form input duplikatif.

