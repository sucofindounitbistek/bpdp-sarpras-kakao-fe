# Feature Specification: Revisi Data dan Dokumen Pekebun pada Proposal Usulan

**Feature Branch**: `069-revisi-data-dokumen-pekebun`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "bisa mengoreksi input juga dan nantinya halaman revisi ada di revisi pekebun dan hanya merevisi yang ditolak saja yang ditampilkan juga. data ini juga akan merubah data pekebun yang dari table pekebun"

---

## Clarifications

### Session 2026-09-03
- Q: Bagaimana bentuk tampilan interaksi koreksi data teks dan unggah berkas pengganti untuk setiap anggota pekebun yang ditolak? → A: Option A (Inline Accordion / Expandable Card: Setiap pekebun yang ditolak langsung menampilkan form input koreksi field teks dan dropzone berkas pengganti di dalam kartu pekebun tersebut pada Tab Pekebun & Lahan).
- Q: Bagaimana alur penyimpanan koreksi pekebun tersebut sebelum pengiriman akhir usulan proposal? → A: Option A (Reaktif & Unggah Langsung: Berkas langsung terunggah saat dipilih, input teks reaktif tersimpan di draft, dan seluruh perubahan pekebun dikirim final secara atomik saat klik "Kirim Ulang Usulan Revisi").
- Q: Ketika verifikator hanya menolak berkas scan fisik (tanpa menolak field teks Nama/NIK), apa yang ditampilkan pada kartu pekebun tersebut? → A: Option A (Ketat Sesuai Validasi: Jika hanya berkas yang ditolak, hanya tombol/area unggah berkas baru yang muncul. Field teks hanya muncul jika field tersebut secara eksplisit ditolak verifikator).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tinjauan Penolakan Khusus Data & Dokumen Pekebun (Priority: P1) 🎯 MVP

Sebagai perwakilan Kelembagaan Pekebun (Pemohon) yang proposalnya dikembalikan oleh Verifikator Dinas Kabupaten/Kota dengan catatan ketidaksesuaian pada anggota pekebun, saya ingin membuka Tab Pekebun & Lahan di halaman revisi dan **hanya melihat daftar pekebun yang memiliki catatan penolakan**, sehingga saya dapat fokus memperbaiki item yang bermasalah tanpa terganggu oleh puluhan anggota pekebun lain yang sudah disetujui.

**Why this priority**: Menghilangkan kebingungan pemohon dan mempercepat identifikasi anggota pekebun mana yang perlu diperbaiki dari total daftar CPCL yang diajukan.

**Independent Test**: Login sebagai Pemohon, buka proposal usulan berstatus `REV_FROM_KAB` yang memiliki 10 anggota CPCL (di mana hanya 2 pekebun yang ditolak). Buka Tab Pekebun & Lahan, pastikan sistem hanya menampilkan 2 kartu pekebun yang ditolak, sedangkan 8 pekebun yang disetujui tidak ditampilkan.

**Acceptance Scenarios**:
1. **Given** proposal memiliki 10 anggota pekebun CPCL dan hanya 2 anggota yang memiliki dokumen/field ditolak oleh verifikator, **When** pemohon membuka Tab Pekebun & Lahan di halaman revisi, **Then** sistem hanya menampilkan 2 kartu anggota pekebun yang ditolak tersebut dengan label jumlah perbaikan yang jelas.
2. **Given** seluruh anggota pekebun CPCL telah disetujui oleh verifikator (tidak ada penolakan pada pekebun), **When** pemohon membuka Tab Pekebun & Lahan, **Then** sistem menampilkan informasi bahwa seluruh data dan dokumen pekebun telah sesuai dan tidak ada perbaikan yang diperlukan.

---

### User Story 2 - Koreksi Input Teks dan Unggah Berkas Pengganti yang Ditolak (Priority: P1)

Sebagai perwakilan Kelembagaan Pekebun, saya ingin mengoreksi input data teks (seperti salah ketik Nama, NIK, No KK, Luas Lahan, atau Nomor Surat Legalitas) dan/atau mengunggah berkas scan pengganti (seperti KTP, KK, Surat Kuasa, atau Legalitas Lahan baru) **hanya pada field dan dokumen yang secara spesifik ditolak**, sehingga saya dapat menyelesaikan instruksi perbaikan dari verifikator dengan tepat.

**Why this priority**: Inti dari alur perbaikan data pekebun adalah memberikan fleksibilitas perbaikan menyeluruh: data teks jika verifikator mencatat salah ketik/input, dan dokumen scan jika berkas buram/terpotong/salah format.

**Independent Test**: Pada kartu pekebun yang ditolak karena kesalahan ketik nama dan scan KK buram, verifikasi bahwa pemohon dapat mengedit input teks nama dan mengunggah berkas KK baru. Setelah kedua item diperbaiki, indikator status kartu pekebun berubah menjadi "Telah Diperbarui".

**Acceptance Scenarios**:
1. **Given** verifikator menandai field teks "Nama Lengkap" atau "NIK" sebagai tidak sesuai dengan catatan perbaikan, **When** pemohon membuka kartu pekebun tersebut, **Then** sistem menampilkan form isian teks untuk mengoreksi nama/NIK beserta catatan verifikator di bawah field terkait.
2. **Given** verifikator menandai dokumen scan (misal Scan KK atau Scan Legalitas Lahan) sebagai tidak sesuai, **When** pemohon membuka kartu pekebun tersebut, **Then** sistem menampilkan area unggah berkas baru dan catatan verifikator.
3. **Given** field atau dokumen pekebun telah disetujui oleh verifikator (misal Swafoto dan Surat Kuasa berstatus Sesuai), **When** pemohon melihat kartu pekebun yang ditolak, **Then** field atau dokumen yang disetujui tersebut tidak ditampilkan atau terkunci untuk mencegah perubahan yang tidak perlu.
4. **Given** pemohon selesai mengoreksi seluruh item yang ditolak pada seorang pekebun, **When** data dan berkas baru tersimpan, **Then** status kartu pekebun berubah menjadi "Telah Diperbarui" dan counter sisa item perbaikan berkurang.

---

### User Story 3 - Pengiriman Ulang Revisi & Pembaruan Otomatis Data Master Pekebun (Priority: P2)

Sebagai perwakilan Kelembagaan Pekebun, setelah menyelesaikan seluruh perbaikan data dan dokumen yang ditolak, saya ingin mengirimkan kembali usulan revisi proposal ke Dinas Kabupaten/Kota, dan sistem secara otomatis **menyinkronkan koreksi data teks dan dokumen tersebut ke data master pekebun/lahan**, sehingga data profil pekebun tetap mutakhir dan akurat untuk penggunaan berikutnya.

**Why this priority**: Menjamin konsistensi data (*Single Source of Truth*) agar perbaikan yang dilakukan pemohon pada proposal usulan juga memperbarui basis data anggota kelembagaan pekebun secara otomatis tanpa perlu input ganda di menu master data.

**Independent Test**: Lakukan revisi pada nama pekebun "Ahmad Fauzi" menjadi "Ahmad Fauzi Syah" dan perbarui scan KTP. Kirimkan kembali usulan revisi, lalu buka menu Master Data Pekebun dan periksa apakah profil pekebun terkait telah otomatis terperbarui dengan nama dan dokumen KTP baru.

**Acceptance Scenarios**:
1. **Given** seluruh dokumen dan data pekebun yang ditolak telah berstatus "Telah Diperbarui", **When** pemohon mengklik tombol "Kirim Ulang Usulan", **Then** usulan proposal berhasil dikirim kembali dengan status berubah menjadi verifikasi ulang.
2. **Given** pemohon mengirim ulang revisi dengan koreksi data teks (NIK/Nama/No KK/Alamat/Luas Lahan), **When** pengiriman ulang sukses, **Then** data master profil pekebun dan data lahan terkait di sistem otomatis terperbarui sesuai nilai yang dikoreksi.
3. **Given** pemohon belum menyelesaikan perbaikan pada seluruh item pekebun yang ditolak, **When** pemohon mencoba mengirim ulang proposal, **Then** sistem mencegah pengiriman dan menampilkan peringatan bahwa masih ada item yang belum diperbaiki.

---

## Edge Cases

- **Bagaimana jika pemohon mengoreksi NIK menjadi NIK yang sudah terdaftar pada anggota lain?**
  Sistem harus memvalidasi keunikan NIK secara real-time dan menampilkan pesan error bahwa NIK telah digunakan, serta mencegah pengiriman sebelum NIK valid.
- **Bagaimana jika terdapat perbaikan luas lahan yang berdampak pada total kalkulasi luas usulan?**
  Sistem harus menghitung ulang total luas lahan usulan CPCL secara otomatis saat nilai luas lahan pada salah satu pekebun dikoreksi.
- **Bagaimana jika koneksi terputus saat pemohon mengunggah berkas scan pengganti?**
  Sistem harus menampilkan pesan gagal unggah yang ramah pengguna, mempertahankan data teks yang telah diketik, dan memungkinkan pengunggahan ulang berkas tanpa kehilangan perubahan lain.
- **Bagaimana jika verifikator menolak Surat Keterangan Kepala Desa (Beda Nama)?**
  Sistem harus menampilkan opsi perbaikan Nomor Surat Kades dan area unggah berkas Surat Kades baru pada kartu lahan yang bersangkutan.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyaring dan HANYA menampilkan anggota pekebun yang memiliki catatan penolakan (tidak sesuai) pada Tab Pekebun & Lahan di halaman revisi usulan proposal.
- **FR-002**: Sistem HARUS menyembunyikan anggota pekebun yang seluruh data dan dokumennya telah berstatus disetujui (sesuai) dari daftar perbaikan aktif.
- **FR-003**: Sistem HARUS hanya menampilkan field isian teks atau berkas dokumen yang secara spesifik ditolak oleh verifikator pada setiap kartu pekebun.
- **FR-004**: Sistem HARUS menyertakan catatan ketidaksesuaian dari verifikator tepat pada setiap field teks atau berkas dokumen yang ditolak.
- **FR-005**: Sistem HARUS mengizinkan pemohon mengoreksi isian teks data identitas pekebun (seperti Nama Lengkap, NIK, Nomor KK, Alamat, atau No HP) apabila field tersebut ditolak oleh verifikator.
- **FR-006**: Sistem HARUS mengizinkan pemohon mengoreksi isian teks data lahan pekebun (seperti Luas Lahan, Jenis Hak Legalitas, Nomor Legalitas, Tanggal Penerbitan, atau Nomor Surat Kades Beda Nama) apabila field tersebut ditolak oleh verifikator.
- **FR-007**: Sistem HARUS menyediakan kontrol pengunggahan berkas scan baru (.pdf, .jpg, .png dengan batas ukuran maksimal 5MB) untuk setiap jenis dokumen identitas atau dokumen lahan yang ditolak.
- **FR-008**: Sistem HARUS mengubah status item dan kartu pekebun menjadi "Telah Diperbarui" setelah pemohon selesai mengoreksi field teks dan/atau mengunggah berkas pengganti yang ditolak.
- **FR-009**: Sistem HARUS memperbarui counter jumlah item yang perlu perbaikan secara reaktif ketika item pekebun telah diselesaikan.
- **FR-010**: Sistem HARUS memvalidasi bahwa seluruh field dan dokumen pekebun yang ditolak telah berstatus "Telah Diperbarui" sebelum mengaktifkan tombol pengiriman ulang revisi proposal.
- **FR-011**: Saat pengiriman ulang revisi usulan proposal berhasil diproses, sistem HARUS secara otomatis memperbarui record data master pekebun dan data lahan pada tabel basis data master yang bersangkutan.
- **FR-012**: Sistem HARUS mempertahankan susunan anggota pekebun CPCL usulan tanpa menambah atau menghapus anggota (keanggotaan tetap konsisten dengan usulan awal).

---

### Key Entities

- **Pekebun (Farmer Profile)**: Entitas data induk anggota pekebun yang memuat identitas diri (NIK, Nama Lengkap, No KK, Tempat/Tgl Lahir, Alamat, No HP, Status Pernikahan).
- **Lahan Pekebun (Land Plot)**: Entitas data kebun milik pekebun yang memuat legalitas (Jenis Hak, Nomor Surat, Tanggal Terbit, Luas Lahan, Titik Koordinat Poligon, Surat Kades Beda Nama).
- **Dokumen Identitas Pekebun (Farmer Document)**: Berkas scan pendukung identitas pekebun (Scan KTP, Scan KK, Swafoto, Surat Kuasa).
- **Dokumen Lahan (Land Document)**: Berkas scan pendukung lahan (Scan Legalitas Lahan, Surat Keterangan Kepala Desa).
- **Validasi Dokumen & Field Pekebun (Farmer Validation & Details)**: Rekam jejak hasil pemeriksaan administratif verifikator per-dokumen dan per-field atribut pada pekebun dan lahan beserta status persetujuan dan catatan ketidaksesuaian.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pemohon dapat langsung menemukan seluruh anggota pekebun dan atribut yang bermasalah dalam waktu kurang dari 10 detik tanpa perlu memeriksa satu per satu puluhan anggota yang sudah disetujui.
- **SC-002**: 100% item data teks dan berkas dokumen pekebun yang ditolak memiliki kontrol koreksi yang jelas dan terhubung langsung dengan catatan verifikator.
- **SC-003**: 100% data teks dan dokumen pengganti yang dikoreksi pada proposal usulan tersinkronisasi secara otomatis ke data master pekebun dan lahan saat proposal dikirim ulang.
- **SC-004**: Proposal yang dikirim ulang berhasil kembali berstatus siap diverifikasi ulang oleh Dinas Kabupaten/Kota dengan riwayat penolakan sebelumnya tetap terjaga sebagai referensi verifikator.

---

## Assumptions

- Keanggotaan daftar pekebun CPCL pada usulan proposal bersifat tetap (tidak ada penghapusan atau penambahan orang baru saat revisi).
- Verifikator Dinas Kabupaten/Kota telah mencatat alasan ketidaksesuaian secara spesifik pada tingkat dokumen maupun field saat melakukan verifikasi penolakan.
- Format berkas scan yang didukung adalah PDF dan gambar (JPG/PNG) dengan batas ukuran file maksimal 5MB per dokumen.
- Validasi format data teks standar (seperti format NIK 16 digit numerik dan nomor KK) tetap berlaku saat pemohon melakukan koreksi teks.
