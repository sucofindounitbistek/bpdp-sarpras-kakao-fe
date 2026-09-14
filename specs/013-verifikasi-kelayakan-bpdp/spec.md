# Feature Specification: Verifikasi Kelayakan BPDP

**Feature Branch**: `013-verifikasi-kelayakan-bpdp`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Verifikasi Kelayakan BPDP Verifikator - Konten pemeriksaan kelayakan dokumen, templatenya samain kayak verifikasi dokumen di ditjenbun, tolong dibuatkan component jika perlu"

---

## Background & Context

Modul **Verifikasi Kelayakan** adalah tahapan kerja untuk petugas `BPDP_VERIFIKATOR` dalam memeriksa kelengkapan dan kesesuaian dokumen usulan yang telah mendapatkan Rekomendasi Teknis (Rekomtek) dari Ditjenbun.

Saat ini, halaman `CekiBpdpView.vue` menggunakan komponen `ChecklistDokumen` yang hanya menampilkan daftar dokumen dengan toggle centang (ya/tidak) tanpa catatan ketidaksesuaian dan tanpa tombol tindak lanjut yang granular per-dokumen.

Permintaan ini adalah agar tampilan dan mekanisme verifikasi dokumen di halaman BPDP **mengadopsi pola yang sama** dengan halaman `CekiDitjenbunView.vue` milik Ditjenbun: setiap dokumen memiliki tombol Sesuai dan Tidak Sesuai secara terpisah, beserta kolom catatan yang muncul bila dokumen ditandai tidak sesuai. Pola ini lebih ekspresif dan informatif dibandingkan checkbox biasa.

Selain itu, perlu dibuat **komponen baru yang dapat digunakan ulang** (`VerifikasiDokumenItem`) agar logika tampilan per-dokumen tidak duplikat antar halaman Ditjenbun dan BPDP.

---

## Clarifications

### Session 2026-08-05

- Q: Apakah BPDP_VERIFIKATOR perlu bisa mengembalikan usulan bila dokumen tidak sesuai, dan ke pihak mana? → A: BPDP Verifikator mengembalikan ke Ketua Ditjenbun (APPROVAL_DITJENBUN) bila ada dokumen yang ditandai Tidak Sesuai.
- Q: Apakah setiap dokumen dalam daftar verifikasi BPDP perlu dilengkapi tombol unduh/preview? → A: Hanya item dokumen yang memiliki URL tersedia yang menampilkan tombol unduh (conditional render).

---

## User Scenarios & Testing

### User Story 1 - Pemeriksa Menelaah Dokumen Satu per Satu (Priority: P1)

Sebagai `BPDP_VERIFIKATOR`, saya membuka detail usulan yang berstatus `VERIFIKASI_BPDP`, kemudian memeriksa setiap dokumen lampiran dengan menekan tombol Sesuai atau Tidak Sesuai per dokumen. Bila sebuah dokumen memiliki berkas fisik (URL), saya dapat mengunduhnya. Bila sebuah dokumen ditandai tidak sesuai, saya dapat menuliskan catatan alasan ketidaksesuaiannya.

**Why this priority**: Inti dari fitur ini; tanpa ini verifikasi tidak dapat dilakukan dengan konteks yang jelas.

**Independent Test**: Dapat diuji mandiri dengan membuka halaman `/bpdp/ceki/:id` dan memverifikasi bahwa setiap dokumen memiliki tombol valid/invalid yang bekerja, tombol unduh tampil jika URL tersedia, serta kolom catatan muncul saat dokumen ditandai tidak sesuai.

**Acceptance Scenarios**:

1. **Given** usulan berstatus VERIFIKASI_BPDP, **When** verifikator menekan tombol Sesuai pada dokumen Rekomendasi Teknis Ditjenbun, **Then** tombol Sesuai tampil aktif (warna hijau), tombol Tidak Sesuai tidak aktif, dan kondisi tersimpan secara otomatis.
2. **Given** verifikator menekan Sesuai pada dokumen yang sudah Sesuai, **When** tombol ditekan lagi, **Then** status kembali ke netral (toggle off).
3. **Given** verifikator menekan Tidak Sesuai pada dokumen, **When** Tidak Sesuai aktif, **Then** kolom teks catatan ketidaksesuaian muncul di bawah dokumen tersebut.
4. **Given** dokumen memiliki URL berkas tersedia, **When** halaman dibuka, **Then** tombol unduh dokumen ditampilkan; sebaliknya jika URL kosong, tombol unduh disembunyikan.
5. **Given** kolom catatan terisi dan verifikator mengetik, **When** input terjadi, **Then** catatan tersimpan secara otomatis ke store.
6. **Given** usulan berstatus selain VERIFIKASI_BPDP, **When** halaman dibuka, **Then** semua tombol tidak dapat diklik (readonly), dan status masing-masing dokumen ditampilkan sebagai label teks.

---

### User Story 1b - Pengembalian ke Ketua Ditjenbun (Priority: P1)

Sebagai `BPDP_VERIFIKATOR`, bila saya menemukan satu atau lebih dokumen tidak sesuai setelah menelaah, saya dapat mengirimkan pengembalian usulan ke **Ketua Ditjenbun** (`APPROVAL_DITJENBUN`) disertai catatan alasan, agar pihak Ditjenbun dapat menindaklanjuti perbaikan dokumen.

**Why this priority**: Alur bisnis kritis; tanpa mekanisme ini ketidaksesuaian dokumen tidak dapat ditindaklanjuti oleh pihak yang berwenang.

**Independent Test**: Tandai minimal satu dokumen Tidak Sesuai, isi catatan, lalu tekan tombol Kembalikan ke Ditjenbun. Verifikasi usulan berpindah status kembali ke APPROVAL_DITJENBUN.

**Acceptance Scenarios**:

1. **Given** setidaknya satu dokumen ditandai Tidak Sesuai, **When** panel keputusan ditampilkan, **Then** muncul tombol "Kembalikan ke Ditjenbun" (warna merah/rose) beserta pesan peringatan bahwa ada dokumen tidak sesuai.
2. **Given** verifikator menekan tombol Kembalikan ke Ditjenbun, **When** konfirmasi/modal dikirim, **Then** usulan berpindah status ke APPROVAL_DITJENBUN dan verifikator diarahkan kembali ke halaman antrean.
3. **Given** semua dokumen berstatus Sesuai atau netral, **When** panel keputusan ditampilkan, **Then** tombol kembalikan tidak ditampilkan.

---

### User Story 2 - Pengambilan Keputusan Kelayakan Berdasarkan Hasil Pemeriksaan (Priority: P2)

Setelah semua dokumen diperiksa dan seluruhnya dinyatakan Sesuai, verifikator dapat melanjutkan ke langkah berikutnya: memilih status kelayakan (Layak / Tidak Layak), men-generate dokumen Laporan Kelayakan, mengunggah versi bertanda tangan, dan mengajukan ke Kepala Divisi BPDP.

**Why this priority**: Bergantung pada P1; keputusan kelayakan tidak dapat diambil sebelum semua dokumen diverifikasi.

**Independent Test**: Dapat diuji dengan melengkapi semua validasi Sesuai, lalu mengikuti alur generate, download, upload, ajukan.

**Acceptance Scenarios**:

1. **Given** semua dokumen berstatus Sesuai, **When** panel keputusan ditampilkan, **Then** tampil opsi Layak/Tidak Layak beserta tombol Generate Dokumen Kelayakan.
2. **Given** ada dokumen yang masih netral (belum dicek), **When** panel kanan ditampilkan, **Then** muncul peringatan bahwa masih ada dokumen yang belum diverifikasi.
3. **Given** dokumen kelayakan berhasil di-generate, **When** verifikator mengunggah versi bertanda tangan dan menekan Ajukan, **Then** usulan berpindah ke status APPROVAL_BPDP dan verifikator diarahkan kembali ke halaman antrean.

---

### User Story 3 - Referensi Data Rekomtek Ditjenbun (Priority: P3)

Verifikator perlu melihat referensi Nomor Rekomtek dan unduhan dokumen Rekomtek bertanda tangan dari Ditjenbun sebagai acuan pemeriksaan, tanpa perlu berpindah halaman.

**Why this priority**: Pendukung; meningkatkan efisiensi verifikator tanpa memerlukan navigasi ke luar.

**Independent Test**: Cukup memastikan panel kanan Rujukan Rekomtek Ditjenbun menampilkan nomor rekomtek dan tautan unduh yang benar.

**Acceptance Scenarios**:

1. **Given** usulan memiliki data rekomtek.nomorRekomtek dan rekomtek.signedUrl, **When** halaman dibuka, **Then** nomor rekomtek dan tautan unduh Rekomtek Signed ditampilkan di panel kanan.
2. **Given** data rekomtek tidak tersedia, **When** halaman dibuka, **Then** panel menampilkan teks placeholder tanpa error.

---

### Edge Cases

- Apa yang terjadi bila verifikator menekan Sesuai lalu Tidak Sesuai pada dokumen yang sama? Sistem toggle, hanya satu status yang aktif. Catatan dihapus jika berganti dari Tidak Sesuai ke Sesuai/netral.
- Apa yang terjadi bila simpan otomatis gagal? Tampilkan toast error; kondisi lokal tetap apa adanya.
- Apa yang terjadi bila jumlah dokumen bertambah ke depan? Komponen baru harus bersifat data-driven agar dapat menerima daftar dokumen yang dapat dikonfigurasi dari luar.
- Apa yang terjadi bila verifikator menandai dokumen Tidak Sesuai dan menekan kembalikan tanpa mengisi catatan? Sistem HARUS memvalidasi bahwa setiap dokumen yang ditandai Tidak Sesuai memiliki catatan sebelum pengembalian dapat dikirim.

---

## Requirements

### Functional Requirements

- **FR-001**: Halaman `CekiBpdpView.vue` HARUS menampilkan daftar dokumen kelayakan dengan tombol Sesuai dan Tidak Sesuai per dokumen, menggantikan komponen `ChecklistDokumen` yang ada.
- **FR-002**: Setiap item dokumen HARUS menampilkan kolom textarea catatan ketidaksesuaian bila status dokumen adalah Tidak Sesuai.
- **FR-003**: Penekanan ulang tombol yang sama HARUS mengembalikan status ke netral (toggle behavior), konsisten dengan perilaku di `CekiDitjenbunView.vue`.
- **FR-004**: Perubahan status validasi atau catatan HARUS disimpan secara otomatis ke store (`submitBpdpChecklist`) tanpa tombol Simpan terpisah.
- **FR-005**: Sistem HARUS menampilkan seluruh validasi dalam kondisi readonly bila status usulan bukan `VERIFIKASI_BPDP`.
- **FR-006**: HARUS dibuat komponen baru `VerifikasiDokumenItem.vue` yang mengenkapsulasi UI satu item dokumen dengan tombol Sesuai/Tidak Sesuai, tombol unduh (kondisional jika URL ada), dan textarea catatan, agar dapat digunakan ulang di `CekiDitjenbunView.vue` maupun `CekiBpdpView.vue`.
- **FR-007**: Data state validasi per-dokumen di BPDP HARUS menggunakan struktur yang selaras dengan AsistensiFileValidation (field: valid boolean atau null, note string, url optional string) agar konsisten dengan pola yang sudah ada.
- **FR-008**: Tampilan readonly HARUS menampilkan label teks Sesuai (hijau), Tidak Sesuai (merah), atau Belum dicek (abu) untuk setiap dokumen.
- **FR-009**: Bila setidaknya satu dokumen ditandai Tidak Sesuai, panel keputusan HARUS menampilkan tombol "Kembalikan ke Ditjenbun" dengan target pengembalian ke status `APPROVAL_DITJENBUN`.
- **FR-010**: Sistem HARUS memvalidasi bahwa setiap dokumen bertanda Tidak Sesuai telah diisi catatannya sebelum pengembalian ke Ditjenbun dapat dieksekusi.
- **FR-011**: Setelah pengembalian berhasil, usulan HARUS berpindah ke status `APPROVAL_DITJENBUN` dan verifikator diarahkan kembali ke halaman antrean BPDP.
- **FR-012**: Komponen `VerifikasiDokumenItem.vue` HARUS menampilkan tombol Unduh Dokumen secara kondisional hanya apabila prop url diberikan dan bernilai tidak kosong.

### Key Entities

- **UsulanRekomtek**: Entitas utama; berisi `bpdpChecklist` dan `kelayakan` yang menjadi sumber data halaman ini.
- **BpdpDocValidation** (baru atau adaptasi dari AsistensiFileValidation): Representasi validasi satu dokumen dengan field valid (boolean atau null), note (string), dan opsional url (string).
- **VerifikasiDokumenItem** (komponen Vue baru): Komponen UI presentasional yang menerima props label, valid, note, url (opsional), readonly, dan meng-emit perubahan.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Verifikator dapat menandai seluruh dokumen kelayakan (valid/tidak valid) dalam satu sesi tanpa perlu navigasi ke halaman lain; target waktu penyelesaian verifikasi dokumen tidak lebih dari 3 menit per usulan.
- **SC-002**: Komponen `VerifikasiDokumenItem` dapat digunakan di setidaknya 2 halaman berbeda (`CekiBpdpView` dan `CekiDitjenbunView`) tanpa duplikasi kode logika UI validasi.
- **SC-003**: 100% dokumen yang ditandai tidak sesuai harus memiliki kolom catatan yang tersedia; verifikator tidak dapat mengajukan keputusan atau mengembalikan usulan selama ada dokumen Tidak Sesuai yang catatannya kosong.
- **SC-004**: Perubahan status validasi tersimpan dalam kurang dari 1 detik setelah interaksi (auto-save), tanpa konfirmasi eksplisit dari pengguna.
- **SC-005**: Pengembalian ke Ditjenbun hanya dapat dilakukan bila setidaknya satu dokumen ditandai Tidak Sesuai — tombol tidak muncul bila semua dokumen Sesuai atau netral.

---

## Assumptions

- Role `BPDP_VERIFIKATOR` sudah terdaftar dan guard akses sudah berjalan via `onMounted` check, konsisten dengan pola existing.
- Daftar dokumen yang diverifikasi bersifat tetap untuk saat ini: Rekomendasi Teknis Ditjenbun, SK CPCL, Surat Pengantar Kepala Dinas Provinsi, dan Berita Acara Hasil Verifikasi. Komponen baru harus data-driven untuk memudahkan perubahan ke depan.
- Struktur type `bpdpChecklist` di `UsulanRekomtek` perlu diperbarui dari boolean menjadi `{ valid: boolean | null, note: string, url?: string }` per-dokumen agar mendukung catatan & url per-item; perubahan ini kompatibel ke belakang di sisi mock data.
- Refactor penggunaan `CekiDitjenbunView.vue` untuk menggunakan komponen baru `VerifikasiDokumenItem` adalah bagian dari scope fitur ini (tidak membutuhkan perubahan perilaku, hanya refactor tampilan).
- File URL per-dokumen untuk BPDP diambil dari data `rekomtek.signedUrl` dan `asistensiChecklist` yang sudah ada.
- Mobile support (responsive layout) mengikuti pola grid 1-kolom/3-kolom yang sudah ada di halaman-halaman sejenis.
- Target pengembalian dari BPDP Verifikator adalah `APPROVAL_DITJENBUN` (Ketua Ditjenbun), bukan ke dinas daerah. Store action pengembalian mengikuti pola `kembalikanUsulan` yang sudah ada, dengan tujuan `APPROVAL_DITJENBUN`.
- Modal konfirmasi pengembalian ke Ditjenbun dapat menggunakan kembali `FormPengembalianModal.vue` yang sudah ada, atau dibuat modal baru yang lebih sederhana tanpa opsi pilihan tujuan (karena tujuan sudah tetap: Ketua Ditjenbun).
