# Feature Specification: Revamp UX Halaman Verifikasi Pekebun

**Feature Branch**: `070-revamp-ux-verifikasi-pekebun`
**Created**: 2026-09-03
**Status**: Specified & Clarified
**Input**: User description: "pada halaman verifikasi pekebun bisa ga ya dibuat agar uxnya mudah dipahami pengguna karena agak sedikit berantakan sepertinya /frontend-design /ui-ux-pro-max /speckit-specify"

---

## Clarifications & Decisions

1. **Tata Letak Workbench**:
   - Split 2 Kolom: Kolom kiri memuat daftar berkas (KTP, KK, Swafoto, Surat Kuasa, Legalitas Lahan, Surat Kades Beda Nama) beserta penampil berkas interaktif (*document viewer* gambar/PDF). Kolom kanan lembar checklist validasi kesesuaian data input pemohon vs berkas scan.
2. **Penempatan Data Sekunder**:
   - Kartu Lipat (*Accordion Collapsible*): Informasi profil lengkap pekebun dan peta satelit poligon lahan ditempatkan di bawah workbench dalam kartu lipat yang rapi sehingga tidak mengalihkan fokus verifikasi berkas namun mudah dibuka saat dibutuhkan.
3. **Navigasi Bilah Bawah (Sticky Action Bar)**:
   - Sticky footer melayang memuat ringkasan status kelayakan dokumen (jumlah Sesuai vs Perlu Perbaikan), tombol **"Kembali ke Usulan"**, dan tombol **"Lanjut ke Pekebun Berikutnya"** (melompat otomatis ke anggota pekebun berikutnya dalam proposal).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Workbench Verifikasi Terpadu (Split Two-Column Layout) (Priority: P1)

Sebagai Verifikator Dinas Kabupaten, saya ingin antarmuka verifikasi pekebun memiliki tata letak terpadu dua kolom (kiri: navigasi berkas & pratinjau dokumen; kanan: lembar verifikasi kesesuaian data & catatan penolakan), sehingga saya dapat langsung membandingkan data input pemohon dengan berkas scan tanpa perlu menggulir (*scroll*) halaman naik-turun berkali-kali.

**Why this priority**:
Tata letak saat ini memisahkan tombol pemilih dokumen di atas, panel periksa di tengah, dan tabel data di paling bawah, menciptakan kebingungan kognitif (*cognitive load*) dan menghambat efisiensi verifikasi ratusan dokumen pekebun.

**Independent Test**:
Dapat diuji dengan membuka halaman `/dinas/verifikasi/kabupaten/:id/pekebun/:cpclId`, memastikan kolom kiri menampilkan daftar berkas dan penampil dokumen aktif, sementara kolom kanan menyajikan form checklist pencocokan data dengan tombol "Sesuai" dan "Tidak Sesuai".

**Acceptance Scenarios**:
1. **Given** Verifikator berada pada halaman verifikasi pekebun, **When** halaman dimuat, **Then** sistem menampilkan layout dua kolom terstruktur dengan penampil berkas (*document viewer*) di sebelah kiri dan form validasi data di sebelah kanan.
2. **Given** Verifikator memilih salah satu dokumen dari daftar berkas (misal: Scan KTP), **When** dokumen diklik, **Then** pratinjau berkas KTP langsung tampil di sisi kiri dan field validasi (Nama Lengkap, NIK) aktif di sisi kanan.
3. **Given** Verifikator memeriksa dokumen lahan (misal: Scan Legalitas Lahan 1), **When** dokumen dipilih, **Then** pratinjau sertifikat/surat lahan tampil di sisi kiri dan field validasi (Jenis Legalitas, Nomor Legalitas, Tanggal Terbit, Luas Lahan) tampil di sisi kanan.

---

### User Story 2 - Indikator Progres & Status Validasi Visual (Priority: P2)

Sebagai Verifikator Dinas Kabupaten, saya ingin melihat ringkasan progres verifikasi (jumlah dokumen selesai, status Sesuai, Tidak Sesuai, atau Belum Diperiksa) secara langsung pada header dan daftar item berkas, sehingga saya tahu persis dokumen mana yang belum diperiksa sebelum kembali ke antrean usulan.

**Why this priority**:
Menghindari risiko dokumen terlewat verifikasi dan memberikan kepastian status menyeluruh (*overview at a glance*).

**Independent Test**:
Dapat diuji dengan mengubah status salah satu field/dokumen menjadi Sesuai atau Tidak Sesuai, dan memverifikasi badge serta indikator progres terbarui secara instan (*real-time*).

**Acceptance Scenarios**:
1. **Given** Pekebun memiliki 5 dokumen persyaratan (KTP, KK, Swafoto, Surat Kuasa, Legalitas Lahan), **When** belum ada yang diverifikasi, **Then** progress header menampilkan status "0/5 Dokumen Terverifikasi" dengan badge status abu-abu pada setiap item.
2. **Given** Verifikator menandai field Nama dan NIK pada KTP sebagai "Sesuai", **When** kedua field disetujui, **Then** badge item KTP berubah menjadi hijau ("Sesuai") dan counter bertambah menjadi "1/5 Terverifikasi".
3. **Given** Verifikator menandai salah satu field Lahan sebagai "Tidak Sesuai", **When** status ditolak, **Then** badge item Lahan berubah menjadi merah ("Perlu Perbaikan") dan counter terhitung selesai dengan indikasi penolakan.

---

### User Story 3 - Sticky Bottom Action Bar & Navigasi Antar-Pekebun (Priority: P3)

Sebagai Verifikator Dinas Kabupaten, saya ingin memiliki tombol aksi navigasi cepat ("Lanjut ke Pekebun Berikutnya" dan "Kembali ke Usulan") pada bilah aksi bawah yang melayang (*sticky action bar*), sehingga saya dapat memeriksa pekebun berikutnya secara berurutan tanpa harus bolak-balik ke halaman antrean usulan.

**Why this priority**:
Mempercepat alur kerja (*verification flow*) saat memproses banyak anggota pekebun dalam satu proposal.

**Independent Test**:
Dapat diuji dengan menekan tombol "Lanjut ke Pekebun Berikutnya" pada sticky bar di bagian bawah, memastikan halaman beralih ke pekebun berikutnya secara mulus.

**Acceptance Scenarios**:
1. **Given** Verifikator selesai memeriksa pekebun ke-1, **When** menekan tombol "Lanjut ke Pekebun Berikutnya", **Then** sistem otomatis berpindah ke rute `/dinas/verifikasi/kabupaten/:id/pekebun/:nextCpclId` dan memuat data pekebun berikutnya.
2. **Given** Pekebun saat ini adalah pekebun terakhir dalam proposal, **When** melihat sticky footer, **Then** tombol "Lanjut ke Pekebun Berikutnya" dinonaktifkan atau digantikan dengan badge "Pekebun Terakhir".
3. **Given** Verifikator berada di posisi gulir mana pun pada halaman, **When** melihat ke bagian bawah layar, **Then** sticky bottom bar tetap terlihat dengan ringkasan status total dan tombol "Kembali ke Usulan".

---

### User Story 4 - Detail Lengkap & Peta Poligon dalam Accordion Collapsible (Priority: P4)

Sebagai Verifikator Dinas Kabupaten, saya ingin data profil lengkap (alamat, tempat/tgl lahir, nomor telepon) dan peta poligon satelit lahan berada dalam kartu lipat di bawah workbench, sehingga tampilan tetap bersih saat verifikasi berkas tetapi detail lengkap dapat diakses dalam satu klik.

**Why this priority**:
Menghindari pemborosan ruang vertikal dan menjaga tata letak workbench tetap fokus pada dokumen.

**Independent Test**:
Dapat diuji dengan mengklik header accordion "Detail Profil Lengkap & Peta Poligon Lahan" untuk membuka/menutup panel rincian.

**Acceptance Scenarios**:
1. **Given** Verifikator membuka halaman verifikasi pekebun, **When** halaman dimuat, **Then** accordion data sekunder dalam keadaan tertutup (*collapsed*) secara default untuk menghemat ruang.
2. **Given** Verifikator ingin memeriksa koordinat dan poligon batas kebun, **When** mengklik accordion, **Then** peta satelit dan detail koordinat terbuka mulus dengan transisi halus.

---

### Edge Cases

- **Berkas belum diunggah oleh pemohon**: Menampilkan *empty state* visual yang jelas (ilustrasi/ikon, pesan "Berkas belum diunggah pemohon") dan menonaktifkan tombol persetujuan sambil mengaktifkan penolakan dengan catatan otomatis.
- **Terdapat banyak lahan (Multi-Lahan)**: Pengelompokan dokumen lahan per petak lahan (Lahan 1, Lahan 2, dst.) dalam tab/accordion terpisah yang rapi di daftar berkas.
- **Layar kecil / Tablet / Mobile (Viewport < 1024px)**: Tata letak bertransisi secara responsif dari 2 kolom menjadi tampilan bertumpuk (*stacked tabs*) dengan tombol switch cepat antara "Lihat Berkas" dan "Periksa Data".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyajikan tata letak dua kolom terpadu (*split workbench*) pada desktop (`lg:` breakpoint ke atas), di mana kolom kiri dialokasikan untuk daftar berkas & pratinjau dokumen, dan kolom kanan dialokasikan untuk pemeriksaan kesesuaian data.
- **FR-002**: Sistem HARUS menampilkan *Header Profil Pekebun* ringkas yang memuat Nama Lengkap, NIK, Nomor KK, Status Pernikahan, serta persentase/jumlah dokumen yang telah selesai diperiksa.
- **FR-003**: Sistem HARUS menampilkan daftar dokumen yang dikelompokkan ke dalam dua kategori jelas:
  1. **Dokumen Identitas Pekebun** (KTP, KK, Swafoto, Surat Kuasa).
  2. **Dokumen Legalitas Lahan** (Legalitas Lahan, Surat Kades Beda Nama per Lahan terdaftar).
- **FR-004**: Setiap item pada daftar berkas HARUS memiliki badge status visual yang reaktif:
  - `Belum Diperiksa` (slate neutral)
  - `Sesuai` (emerald green)
  - `Perlu Perbaikan` (rose red)
- **FR-005**: Kolom penampil berkas (*viewer*) HARUS mendukung pratinjau langsung untuk file gambar (`.jpg`, `.jpeg`, `.png`, `.webp`) dan dokumen PDF (`.pdf`), dilengkapi kontrol perbesar (*zoom/fullscreen modal*) dan unduh berkas.
- **FR-006**: Form validasi pada kolom kanan HARUS menampilkan perbandingan nilai data terdaftar vs tombol aksi persetujuan (*Sesuai / Tidak Sesuai*):
  - KTP: Validasi field Nama Lengkap dan NIK.
  - KK: Validasi field Nomor KK.
  - Swafoto & Surat Kuasa: Validasi dokumen keseluruhan.
  - Legalitas Lahan: Validasi field Jenis Legalitas, Nomor Legalitas, Tanggal Terbit, dan Luas Lahan.
  - Surat Kades: Validasi field Nomor Surat Keterangan Beda Nama.
- **FR-007**: Saat opsi "Tidak Sesuai" dipilih pada suatu field/dokumen, sistem HARUS memunculkan kotak input catatan penolakan (*textarea*) kontekstual dengan placeholder petunjuk alasan penolakan.
- **FR-008**: Sistem HARUS menyediakan tombol navigasi cepat "Dokumen Berikutnya" di bagian bawah form validasi yang otomatis mengarahkan ke dokumen berikutnya yang belum diverifikasi.
- **FR-009**: Sistem HARUS menyediakan bilah aksi bawah (*sticky bottom action bar*) yang memuat:
  - Ringkasan status kelayakan (jumlah Sesuai vs Tidak Sesuai).
  - Tombol "Kembali ke Usulan".
  - Tombol "Lanjut ke Pekebun Berikutnya" (otomatis mendeteksi CPCL berikutnya dalam daftar `pengajuan.dataPekebun`).
- **FR-010**: Seluruh perubahan status validasi dan catatan HARUS tersinkronisasi langsung ke `useVerifikasiKabDraftStore` tanpa memerlukan tombol simpan manual.
- **FR-011**: Data sekunder (profil lengkap identitas, detail agronomi lahan, dan peta satelit poligon kebun) HARUS ditempatkan dalam kartu lipat (*Accordion Collapsible*) di bawah workbench.

---

## Success Criteria *(mandatory)*

1. **Efisiensi Waktu Verifikasi**: Verifikator dapat memeriksa seluruh dokumen pekebun tanpa perlu berpindah posisi scroll halaman naik-turun lebih dari 2 kali per pekebun.
2. **Kejelasan Status**: 100% dokumen yang telah diperiksa memiliki indikator warna status yang jelas di sidebar dokumen secara real-time.
3. **Kepatuhan Responsif**: Antarmuka dapat diakses dengan nyaman di laptop standar (1366x768), desktop layar lebar (1920x1080), maupun tablet (768px - 1024px) tanpa ada elemen yang keluar layar (*zero layout overflow*).
