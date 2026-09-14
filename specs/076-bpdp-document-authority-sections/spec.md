# Feature Specification: Section Kategori Sumber & Kewenangan Dokumen BPDP

**Feature Branch**: `076-bpdp-document-authority-sections`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Verifikasi Dokumen BPDP Approval Pada tampilan aplikasi perlu diperjelas sumber dan kewenangan dokumen yang dilakukan pengecekan, apakah merupakan dokumen yang diterbitkan oleh Dinas Kabupaten/Kota, Dinas Provinsi, atau Ditjenbun. (Section kategori pada Role BPDP Approval) dia dibuat per section aja di setiap halaman jadi tugas per rolenya"

## Clarifications

### Session 2026-09-08

- Q: Format Presentasi Visual Section Kewenangan Dokumen → A: Option A - Kartu Section Mandiri (Card-based Sections): Setiap instansi disajikan dalam kartu bordered terpisah dengan header badge instansi, ringkasan kewenangan tugas, counter status kesesuaian, dan daftar dokumen terkait selalu terbuka.
- Q: Penempatan Section Dokumen pada Alur Reguler BPDP Approval → A: Option A - Panel Kanan Ber-section (Compact Hierarchy): Panel utama fokus pada Keputusan Laporan BPDP, sementara panel kanan menyajikan ringkasan 3 section instansi (Kabupaten, Provinsi, Ditjenbun) beserta catatan dan tombol pratinjau.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tampilan Section Dokumen Berdasarkan Kewenangan pada BPDP Approval & Mode Inspeksi (Priority: P1)

Sebagai Kepala Divisi BPDP (BPDP Approval), saya ingin melihat daftar dokumen verifikasi dan inspeksi dikelompokkan secara visual ke dalam section kartu mandiri terpisah berdasarkan instansi penerbit (Dinas Kabupaten/Kota, Dinas Provinsi, Ditjen Perkebunan, dan BPDP), sehingga saya dapat langsung memahami asal-usul dokumen, batas kewenangan instansi terkait, dan penanggung jawab penerbit dokumen saat mengambil keputusan persetujuan atau pengembalian perbaikan.

**Why this priority**: Menghilangkan kebingungan penelaah BPDP atas dokumen usulan yang berasal dari rantai birokrasi multi-tier (Kabupaten -> Provinsi -> Ditjenbun -> BPDP) dan memastikan transparansi tanggung jawab administratif tiap instansi.

**Independent Test**: Buka halaman verifikasi BPDP Approval (`/bpdp/approval/:id`), pindah ke Step 2 (Persetujuan Kelayakan / Mode Inspeksi). Periksa apakah dokumen ditampilkan terbagi rapi dalam 4 section kartu instansi (Dinas Kabupaten/Kota, Dinas Provinsi, Ditjenbun, dan BPDP) beserta badge peran dan ringkasan tugasnya.

**Acceptance Scenarios**:

1. **Given** Pengguna berada pada halaman BPDP Approval Step 2 (Mode Inspeksi atau Regular Mode), **When** Halaman dimuat, **Then** Dokumen terbagi ke dalam kartu section terpisah:
   - Section 1: **Kewenangan Dinas Kabupaten / Kota** (memuat SK CPCL, Berita Acara Verifikasi Dokumen, Berita Acara Lapangan, dan RAB Final).
   - Section 2: **Kewenangan Dinas Provinsi** (memuat Surat Pengantar SK CPCL).
   - Section 3: **Kewenangan Ditjen Perkebunan (Ditjenbun)** (memuat Rekomendasi Teknis / REKOMTEK).
   - Section 4: **Kewenangan Verifikator / Peneliti BPDP** (memuat Laporan Keputusan Hasil Penelitian Rekomtek).
2. **Given** Pengguna melihat salah satu section kewenangan, **When** Section dirender, **Then** Setiap section berupa kartu bordered mandiri dengan header informatif yang memuat label instansi, deskripsi kewenangan/tugas instansi, dan status kelengkapan dokumen di bawah kewenangan tersebut.
3. **Given** Pengguna berada di Mode Inspeksi Dokumen pada BPDP Approval, **When** Menolak salah satu dokumen dalam suatu section, **Then** Tombol aksi penolakan dan input catatan alasan penolakan tetap berfungsi normal di dalam section dokumen terkait.

---

### User Story 2 - Sectioning Kewenangan pada Panel Hasil Penelitian Dokumen Usulan (Priority: P2)

Sebagai Kepala Divisi BPDP (BPDP Approval) pada workflow reguler, saya ingin melihat ringkasan "Hasil Penelitian Dokumen Usulan" di panel kanan dikelompokkan per section instansi/role (Kabupaten, Provinsi, Ditjenbun), sehingga saya dapat langsung melihat catatan hasil telaah peneliti BPDP terhadap masing-masing instansi penerbit dengan hierarki yang rapi dan terpisah dari keputusan laporan utama BPDP di panel kiri.

**Why this priority**: Memudahkan pembacaan cepat (quick scan) ringkasan status 5 dokumen usulan tanpa harus membaca daftar flat yang tercampur aduk, sambil menjaga fokus panel utama pada persetujuan laporan kelayakan BPDP.

**Independent Test**: Pada halaman BPDP Approval workflow reguler (Step 2), periksa kartu "Hasil Penelitian Dokumen Usulan" di panel kanan. Dokumen harus dikelompokkan per tier instansi penerbit dengan status dan catatan penelitinya.

**Acceptance Scenarios**:

1. **Given** Pengguna membuka panel kanan Hasil Penelitian Dokumen Usulan, **When** Data verifikasi dimuat, **Then** Dokumen dikelompokkan ke dalam 3 sub-section instansi: Kabupaten, Provinsi, dan Ditjenbun.
2. **Given** Terdapat dokumen yang ditolak oleh peneliti BPDP pada sub-section tertentu, **When** Pengguna memeriksa sub-section tersebut, **Then** Catatan penolakan tampil jelas di bawah dokumen instansi bersangkutan.
3. **Given** Pengguna berada di panel kiri (utama), **When** Pengguna memeriksa Keputusan Laporan BPDP, **Then** Panel kiri tetap terfokus pada berkas dan keputusan Laporan Hasil Penelitian BPDP tanpa terdistraksi dokumen mentah instansi.

---

### User Story 3 - Keselarasan Section Kewenangan pada Verifikator BPDP (Priority: P3)

Sebagai Verifikator BPDP (BPDP Peneliti), saya ingin daftar dokumen pada halaman Penelitian Dokumen (`/bpdp/ceki/:id`) juga dikelompokkan per section kewenangan instansi penerbit, sehingga seluruh peran di lingkungan BPDP memiliki konsistensi visual dan pemahaman yang sama mengenai rantai kewenangan dokumen.

**Why this priority**: Menjaga konsistensi pengalaman pengguna (UX continuity) antara Verifikator BPDP dan Approval BPDP sesuai prinsip Zero-Redundancy & Single Source of Truth.

**Independent Test**: Buka halaman Penelitian Dokumen Verifikator BPDP (`/bpdp/ceki/:id`) Step 2. Periksa apakah dokumen penelitian tersusun dalam section instansi penerbit.

**Acceptance Scenarios**:

1. **Given** Pengguna berada di halaman Penelitian Dokumen Verifikator BPDP Step 2, **When** Daftar dokumen ditampilkan, **Then** Dokumen dikelompokkan per section kartu instansi: Dinas Kabupaten/Kota (BA Dokumen, BA Lapangan, SK CPCL), Dinas Provinsi (Surat Pengantar), dan Ditjen Perkebunan (REKOMTEK).
2. **Given** Pengguna mengisi validasi dan catatan pada dokumen dalam section tertentu, **Then** Form validasi tetap tersimpan dan terkirim dengan benar ke backend.

---

### Edge Cases

- **Bagaimana jika usulan tidak memiliki berkas lampiran tertentu dari suatu instansi (misal belum diunggah)?**
  Section instansi terkait tetap tampil dengan indikator status kosong / "Belum diunggah", sehingga pengguna mengetahui bahwa dokumen dari instansi tersebut belum tersedia.
- **Bagaimana jika salah satu instansi memiliki lebih dari 1 dokumen yang ditolak?**
  Counter dokumen yang ditolak pada header section instansi tersebut menghitung secara akurat (misal: "2 Dokumen Ditolak") dan seluruh input catatan penolakan tetap independen.
- **Bagaimana jika tampilan dibuka pada layar mobile/tablet?**
  Section instansi tertata secara vertikal dan responsif (mobile-first) tanpa layout shift atau teks yang terpotong.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menampilkan pembagian kelompok dokumen ke dalam kontainer kartu section mandiri terpisah (Card-based Sections) berdasarkan instansi penerbit dan kewenangan pada halaman verifikasi BPDP.
- **FR-002**: Section pembagian dokumen HARUS mencakup minimal 4 kategori kewenangan:
  1. **Dinas Kabupaten / Kota**: SK CPCL, Berita Acara Hasil Penelitian Dokumen, Berita Acara Verifikasi Lapangan, dan RAB Final Kabupaten.
  2. **Dinas Provinsi**: Surat Pengantar SK CPCL.
  3. **Ditjen Perkebunan (Ditjenbun)**: Rekomendasi Teknis (REKOMTEK).
  4. **BPDP (Peneliti / Verifikator)**: Laporan Keputusan Hasil Penelitian Rekomtek (KEPUTUSAN_KELAYAKAN).
- **FR-003**: Setiap kartu section kewenangan HARUS memuat:
  - Header kartu dengan nama instansi/tingkat otoritas (Badge / Tag penanda).
  - Deskripsi ringkas kewenangan atau tugas administratif instansi terkait.
  - Daftar dokumen yang diterbitkan oleh instansi tersebut (selalu terbuka / visible).
  - Ringkasan status verifikasi dokumen dalam section (contoh: "Semua Sesuai", "1 Ditolak", atau jumlah berkas terverifikasi).
- **FR-004**: Sistem HARUS mempertahankan seluruh interaktivitas dokumen yang ada (tombol pratinjau dokumen, unduh berkas, tombol tolak/setuju, serta input catatan perbaikan/penolakan) di dalam masing-masing section.
- **FR-005**: Pengelompokan section dokumen HARUS diterapkan pada:
  - Halaman BPDP Approval (`ApprovalBpdpView.vue`) pada Mode Inspeksi (7 dokumen dalam 4 section kartu mandiri di panel utama).
  - Halaman BPDP Approval (`ApprovalBpdpView.vue`) pada Mode Reguler (panel kanan menyajikan 3 section instansi: Kabupaten, Provinsi, Ditjenbun; panel utama fokus pada section BPDP).
  - Halaman Verifikasi BPDP Verifikator (`CekiBpdpView.vue`) pada Step 2 Penelitian Dokumen (3 section kartu instansi: Kabupaten, Provinsi, Ditjenbun).
- **FR-006**: Sistem HARUS menjaga integrasi data dan payload pengajuan tetap utuh tanpa mengubah kontrak API backend yang telah berjalan.

### Key Entities *(include if feature involves data)*

- **AuthoritySection (Kategori Kewenangan)**:
  - `id`: Pengenal unik kategori instansi (`KABUPATEN`, `PROVINSI`, `DITJENBUN`, `BPDP`).
  - `name`: Nama instansi penerbit (e.g. "Dinas Kabupaten/Kota", "Dinas Provinsi", "Ditjen Perkebunan", "BPDP").
  - `roleTag`: Label peran yang berwenang (e.g. "Dinas Kab/Kota", "Dinas Provinsi", "Ditjenbun Verifikator/Approval", "BPDP Verifikator").
  - `description`: Deskripsi singkat tugas dan kewenangan penerbitan berkas.
  - `documents`: Daftar dokumen yang berada di bawah wewenang instansi tersebut.
- **DocumentItemState**:
  - `key`: Identifikasi dokumen (`rabFinal`, `skCpcl`, `baVerifikasi`, `baVerifikasiLapangan`, `suratPengantarProv`, `rekomtek`, `kelayakan`).
  - `title`: Judul resmi dokumen.
  - `authority`: Referensi ke `AuthoritySection`.
  - `valid`: Status verifikasi (`true` / `false` / `null`).
  - `note`: Catatan perbaikan atau alasan penolakan.
  - `fileUrl`: URL berkas dokumen untuk unduh dan pratinjau.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dokumen verifikasi pada tampilan BPDP Approval dan BPDP Verifikator terpetakan secara jelas ke dalam section kartu instansi penerbit masing-masing tanpa ada dokumen yang tidak terkategori.
- **SC-002**: Pengguna penelaah dapat mengidentifikasi instansi penerbit dokumen dalam waktu kurang dari 3 detik berkat kartu section dan badge visual yang eksplisit.
- **SC-003**: Seluruh fungsi interaksi dokumen (Pratinjau, Setuju/Tolak, Catatan Perbaikan, Pengembalian Multi-Tier) berfungsi 100% sukses tanpa regresi fungsional.
- **SC-004**: Tampilan antarmuka memenuhi standar aksesibilitas dan responsivitas Tailwind CSS sesuai Constitution FE tanpa horizontal overflow di seluruh resolusi layar (desktop, tablet, mobile).

## Assumptions

- Hierarki instansi penerbit dokumen mengacu pada regulasi alur BPDP Sarpras Kelapa:
  - Dinas Kabupaten/Kota menerbitkan SK CPCL, Berita Acara Verifikasi, dan RAB Final.
  - Dinas Provinsi menerbitkan Surat Pengantar SK CPCL.
  - Ditjenbun menerbitkan Rekomendasi Teknis (REKOMTEK).
  - BPDP menerbitkan Laporan Keputusan Hasil Penelitian dan SK Dirut BPDP.
- Tidak diperlukan perubahan skema basis data backend; data dokumen yang tersimpan saat ini sudah memiliki metadata `document_type` dan `validated_by_role` yang memadai untuk dipetakan ke dalam section kewenangan.
