# Feature Specification: Penolakan Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

**Feature Branch**: `068-tolak-dokumen-rab-revisi`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "tolong implementasikan untuk fitur tolak Dokumen RAB pada Dinas Kabupaten/Kota dan di halaman Revisi pada halaman Kelembagaan Pekebun yang dimana revisi hanya dokumen saja jadi ketika Dinas Kabupaten/Kota menolak RAB yang ditolak Dokumen saja nah nantinya di halaman Revisi Pekebun dia meminta untuk upload kembali RAB nya dan untuk Table RAB dari pekebun boleh ditampilkan sebagai overview."

## Clarifications

### Session 2026-09-02

- **Q: Sinkronisasi Status Dokumen RAB antara Tab RAB dan Tab Dokumen Proposal** → **A:** Otomatis tersinkronisasi (Option A: Pengunggahan berkas Dokumen RAB baru di Tab RAB secara otomatis memperbarui dokumen terkait di Tab Dokumen Proposal menjadi berstatus "Telah Diperbarui", sehingga mematuhi prinsip Single Source of Truth).
- **Q: Penanganan Tampilan Verifikasi Ulang pada Dinas Kabupaten setelah Revisi Dikirim** → **A:** Tampilkan Dokumen RAB baru yang siap diverifikasi ulang, dengan tetap menyertakan riwayat catatan penolakan sebelumnya sebagai referensi verifikator (Option A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Penolakan Dokumen RAB oleh Verifikator Dinas Kabupaten/Kota (Priority: P1)

Sebagai Verifikator Dinas Kabupaten/Kota, saya ingin dapat memeriksa dan menolak Dokumen Fisik RAB Bertandatangan yang tidak memenuhi syarat keabsahan dengan memberikan catatan alasan penolakan, lalu mengembalikan usulan proposal ke Kelembagaan Pekebun untuk dilakukan perbaikan berkas.

**Why this priority**: Menjadi pintu utama verifikasi administrasi di tingkat daerah untuk memastikan keabsahan dokumen fisik RAB (tanda tangan pengurus, stempel basah lembaga, kejelasan dokumen) sebelum usulan diteruskan ke tingkat berikutnya.

**Independent Test**: Dapat diuji secara independen dengan login sebagai Dinas Kabupaten, membuka detail verifikasi proposal, memilih status "Tolak" pada Dokumen RAB Bertandatangan, mengisi catatan penolakan, dan menekan tombol "Kembalikan (Revisi)". Proposal berpindah status ke revisi pemohon dan catatan penolakan tersimpan.

**Acceptance Scenarios**:

1. **Given** Verifikator Dinas Kabupaten membuka halaman verifikasi berkas proposal yang memuat Dokumen RAB Bertandatangan, **When** verifikator memeriksa berkas dan menemukan ketidaksesuaian (misal stempel lembaga belum ada), **Then** verifikator dapat memilih opsi "Tolak" pada Dokumen RAB dan mengisi kolom catatan penolakan.
2. **Given** Verifikator telah menandai Dokumen RAB sebagai ditolak dengan catatan yang valid, **When** verifikator menekan tombol "Kembalikan (Revisi)" dan mengonfirmasi pengembalian, **Then** sistem menyimpan status penolakan dokumen beserta catatannya, mengubah status proposal menjadi `REV_FROM_KAB` (Perlu Perbaikan / Revisi Kabupaten), dan mengarahkan verifikator kembali ke daftar antrean.
3. **Given** Verifikator menandai Dokumen RAB sebagai ditolak namun membiarkan kolom catatan penolakan kosong, **When** verifikator mencoba mengembalikan proposal, **Then** sistem mencegah pengembalian dan menampilkan peringatan bahwa catatan penolakan wajib diisi.

---

### User Story 2 - Peninjauan Overview RAB & Upload Ulang Dokumen RAB oleh Kelembagaan Pekebun (Priority: P1)

Sebagai Pengurus Kelembagaan Pekebun (Pemohon), saya ingin membuka halaman revisi proposal pada Tab RAB untuk melihat catatan penolakan dari Dinas Kabupaten, melihat ringkasan (overview) tabel rincian RAB yang sudah diajukan secara read-only, mengunduh/mencetak dokumen jika perlu, dan mengunggah kembali Dokumen RAB Bertandatangan yang baru.

**Why this priority**: Memfasilitasi pemohon untuk memahami alasan penolakan berkas RAB, memastikan data barang/anggaran yang diusulkan tetap utuh dan jelas sebagai referensi, serta memungkinkan pengunggahan ulang berkas pengganti yang sah tanpa merusak struktur anggaran sistem.

**Independent Test**: Dapat diuji secara independen dengan login sebagai Kelembagaan Pekebun, membuka proposal berstatus revisi, beralih ke Tab RAB, memverifikasi ringkasan tabel RAB bersifat read-only, mengunduh PDF format RAB, dan mengunggah berkas PDF Dokumen RAB baru hingga status penolakan berubah menjadi "Telah Diperbarui".

**Acceptance Scenarios**:

1. **Given** Pemohon membuka halaman Revisi Proposal untuk usulan yang dikembalikan oleh Dinas Kabupaten, **When** pemohon memilih Tab "Rencana Anggaran Biaya (RAB)", **Then** sistem menampilkan banner penolakan khusus RAB dengan catatan penolakan dari Verifikator Dinas Kabupaten, menampilkan tabel rincian item RAB dalam mode tinjauan (overview read-only), dan menampilkan form unggah dokumen RAB baru bertandatangan.
2. **Given** Pemohon berada di Tab RAB halaman revisi, **When** pemohon menekan tombol "Cetak / Unduh RAB (PDF)", **Then** sistem meng-generate dan mengunduh berkas format surat resmi RAB lengkap dengan rincian tabel barang dan tempat tanda tangan agar dapat dicetak dan ditandatangani.
3. **Given** Pemohon telah memiliki berkas pindaian dokumen RAB yang telah dibubuhi stempel/tanda tangan basah yang sah, **When** pemohon memilih file (PDF/gambar) pada bagian unggah dokumen RAB baru, **Then** sistem memvalidasi ukuran serta format berkas, mengunggah berkas baru, dan memperbarui indikator status dokumen di Tab RAB maupun Tab Dokumen Proposal menjadi "Telah Diperbarui".

---

### User Story 3 - Pengiriman Ulang Revisi Proposal & Verifikasi Ulang oleh Dinas Kabupaten (Priority: P2)

Sebagai Pengurus Kelembagaan Pekebun dan Verifikator Dinas Kabupaten, kami ingin alur pengiriman ulang revisi proposal berlangsung mulus di mana pemohon dapat mengirimkan berkas yang telah diperbaiki, dan verifikator dapat memeriksa berkas baru dengan riwayat catatan revisi sebelumnya tetap tersedia sebagai referensi.

**Why this priority**: Menuntaskan siklus perbaikan usulan sehingga alur kerja pengajuan bantuan sarpras dapat dilanjutkan ke tahap verifikasi berikutnya secara transparan dan akuntabel.

**Independent Test**: Dapat diuji dengan menyelesaikan semua perbaikan dokumen yang ditolak (termasuk Dokumen RAB), lalu menekan tombol "Kirim Ulang Usulan". Proposal kembali berstatus `SUBMITTED`, muncul kembali di antrean verifikasi Dinas Kabupaten dengan berkas baru dan riwayat catatan revisi sebelumnya.

**Acceptance Scenarios**:

1. **Given** Seluruh dokumen yang ditolak (termasuk Dokumen RAB) telah diunggah ulang dan berstatus "Telah Diperbarui", **When** pemohon menekan tombol "Kirim Ulang Usulan Revisi", **Then** sistem mengupdate relasi dokumen usulan dengan berkas baru, mengembalikan status proposal menjadi `SUBMITTED`, menampilkan notifikasi sukses, dan mengarahkan pemohon ke halaman Tracking Proposal.
2. **Given** Terdapat minimal 1 dokumen yang ditolak (misalnya Dokumen RAB) yang belum diunggah berkas penggantinya, **When** pemohon melihat tombol aksi, **Then** tombol "Kirim Ulang Usulan Revisi" dalam kondisi non-aktif (disabled) dan sistem menampilkan counter jumlah item yang masih perlu perbaikan.
3. **Given** Usulan yang telah direvisi dibuka kembali oleh Verifikator Dinas Kabupaten, **When** verifikator memeriksa bagian Pemeriksaan RAB, **Then** sistem menyajikan berkas Dokumen RAB baru yang siap di-preview serta menampilkan riwayat catatan penolakan sebelumnya sebagai referensi pembanding.

---

### Edge Cases

- **Berkas yang Diunggah Melebihi Batas Ukuran**: Jika pemohon mengunggah berkas pengganti Dokumen RAB dengan ukuran lebih dari batas maksimal (5MB), sistem menolak berkas dan menampilkan pesan peringatan yang jelas.
- **Format Berkas Tidak Sesuai**: Jika pemohon mengunggah berkas di luar format yang diizinkan (selain PDF, JPG, PNG), sistem menolak berkas secara langsung sebelum proses pengiriman.
- **Proposal Tidak Memiliki Dokumen RAB Lama**: Jika pada usulan awal belum terunggah dokumen fisik RAB, halaman revisi tetap menyediakan form unggah agar pemohon dapat melengkapinya.
- **Koneksi Terputus Saat Pengunggahan Berkas**: Jika terjadi kegagalan jaringan saat mengunggah dokumen baru, sistem menampilkan pesan error dan mempertahankan tampilan overview sehingga pengguna dapat mencoba mengunggah ulang tanpa kehilangan progres.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan kontrol verifikasi persetujuan/penolakan (Setuju / Tolak) khusus untuk "Dokumen RAB Ditandatangani" pada modul verifikasi Dinas Kabupaten/Kota.
- **FR-002**: Sistem MUST mewajibkan pengisian catatan alasan penolakan apabila Verifikator menandai Dokumen RAB sebagai "Tolak".
- **FR-003**: Sistem MUST menyimpan catatan validasi penolakan Dokumen RAB ke dalam sistem dan mengubah status usulan proposal menjadi `REV_FROM_KAB` saat Verifikator mengonfirmasi pengembalian revisi.
- **FR-004**: Sistem MUST menampilkan status usulan yang memerlukan perbaikan kepada Kelembagaan Pekebun pada daftar tracking dan halaman revisi usulan.
- **FR-005**: Halaman Revisi Kelembagaan Pekebun MUST menyediakan Tab khusus "Rencana Anggaran Biaya (RAB)" yang menampilkan catatan penolakan verifikator terkait dokumen RAB.
- **FR-006**: Tab RAB pada Halaman Revisi MUST menampilkan Tabel Rincian RAB yang diajukan pemohon sebagai ringkasan (Overview) bersifat Read-Only (hanya lihat, tanpa mutasi baris data).
- **FR-007**: Tab RAB pada Halaman Revisi MUST menyediakan fungsi cetak/unduh format dokumen RAB (PDF) berdasarkan rincian overview barang yang telah ada.
- **FR-008**: Tab RAB pada Halaman Revisi MUST menyediakan area unggah berkas pengganti Dokumen RAB Bertandatangan dengan validasi tipe file (PDF, JPG, PNG) dan batas ukuran (maksimal 5MB).
- **FR-009**: Pengunggahan berkas Dokumen RAB baru di Tab RAB MUST secara otomatis memperbarui status Dokumen RAB di Tab Dokumen Proposal menjadi "Telah Diperbarui" (Single Source of Truth).
- **FR-010**: Sistem MUST memvalidasi bahwa seluruh dokumen yang ditolak telah diperbarui sebelum mengizinkan pemohon mengirim ulang revisi proposal.
- **FR-011**: Saat revisi proposal dikirim ulang, sistem MUST memperbarui tautan berkas Dokumen RAB pada proposal dengan berkas baru dan mengembalikan status proposal menjadi `SUBMITTED`.
- **FR-012**: Pada saat proposal yang telah direvisi dibuka kembali oleh Verifikator Dinas Kabupaten, sistem MUST menampilkan berkas Dokumen RAB baru bersama dengan riwayat catatan penolakan sebelumnya sebagai referensi verifikasi.

---

### Key Entities

- **Proposal Sarpras**: Entitas utama usulan bantuan sarpras yang memuat informasi kelembagaan, paket bantuan, total pagu anggaran, dan status alur verifikasi (`SUBMITTED`, `REV_FROM_KAB`, dll).
- **Dokumen Proposal (RAB)**: Berkas fisik pendukung usulan resmi bertipe RAB (`RAB_PROPOSAL` / `RAB_RK`) yang ditandatangani oleh pihak kelembagaan pemohon.
- **Validasi Dokumen Proposal**: Catatan hasil verifikasi administratif per-dokumen proposal yang mencatat status keabsahan (valid/tidak valid), catatan verifikator, serta peran pemeriksa (Dinas Kabupaten).
- **RAB Proposal & Rincian Item**: Data terstruktur rencana anggaran biaya yang berisi daftar rincian barang bantuan (uraian, volume, satuan, harga per unit, subtotal) yang ditampilkan sebagai ringkasan (overview) bagi pemohon.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Verifikator Dinas Kabupaten dapat menyelesaikan penolakan dokumen RAB beserta catatan penolakannya dalam waktu kurang dari 30 detik.
- **SC-002**: Kelembagaan Pekebun dapat langsung melihat catatan penolakan spesifik pada Tab RAB dalam waktu 1 kali klik setelah membuka halaman revisi.
- **SC-003**: 100% data rincian item barang pada overview tabel RAB tampil akurat dan konsisten sesuai usulan awal tanpa terjadi perubahan nominal total anggaran sistem.
- **SC-004**: Kelembagaan Pekebun dapat menyelesaikan proses cetak ulang, tanda tangan, dan pengunggahan berkas baru Dokumen RAB hingga sukses terkirim ulang dalam satu alur kerja yang mulus.
- **SC-005**: 0% inkonsistensi data anggaran (total pagu anggaran proposal tetap terjaga konsistensinya selama proses revisi dokumen).

---

## Assumptions

- Penolakan pada tahap verifikasi Dinas Kabupaten/Kota difokuskan pada keabsahan dokumen fisik RAB bertandatangan, bukan perubahan struktur kuantitas/harga item per-baris.
- Rincian item barang dan pagu total anggaran yang telah diisi saat pengusulan awal tetap dijadikan dasar acuan dan ditampilkan sebagai ringkasan (overview read-only).
- Berkas yang diunggah ulang oleh pemohon menggantikan referensi berkas fisik dokumen proposal lama yang ditolak.
- Infrastruktur penyimpanan berkas dan autentikasi pengguna menggunakan layanan yang sudah berjalan pada sistem Sarpras Kelapa.
