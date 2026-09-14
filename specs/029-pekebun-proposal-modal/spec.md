# Feature Specification: Pekebun Proposal Confirmation Modal

**Feature Branch**: `029-pekebun-proposal-modal`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "I need the ApprovalConfirmationModal to only show up on the pekebun when they are doing the proposal"

## Clarifications

### Session 2026-08-10

- Q: Apakah modal konfirmasi harus dihapus sepenuhnya dari seluruh halaman verifikator lainnya? → A: Tidak, modal konfirmasi harus tetap aktif di halaman verifikator lainnya (Co-existence), serta ditambahkan pada alur pengajuan proposal Pekebun.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tampilkan Modal Konfirmasi pada Pengajuan Proposal Pekebun (Priority: P1) 🎯 MVP

Sebagai Pengurus Lembaga Pekebun, saya ingin melihat modal konfirmasi ketika mengklik "Submit Proposal" agar saya dapat meninjau kembali keputusan pengiriman berkas ke Dinas Kabupaten/Kota dan menghindari pengiriman yang tidak disengaja.

**Why this priority**: Menghindari pengiriman proposal yang tidak disengaja dan memberikan kesempatan terakhir bagi pemohon untuk memverifikasi usulan mereka.

**Independent Test**:
1. Login sebagai role "Lembaga Pekebun (Pemohon)".
2. Masuk ke halaman Form Usulan Baru (`/pengusulan/pengajuan-proposal`).
3. Selesaikan langkah 1 (Paket & Dokumen) dan langkah 2 (RAB).
4. Di langkah 3 (Pekebun & Submit), pilih minimal satu pekebun dan lahan yang memenuhi syarat.
5. Klik tombol "Submit Proposal".
6. Verifikasi bahwa `ApprovalConfirmationModal` muncul dengan rincian yang tepat.
7. Klik "Batal" dan verifikasi modal tertutup tanpa mengirimkan proposal.
8. Klik "Submit Proposal" lagi, lalu klik "Konfirmasi" di modal, dan verifikasi proposal berhasil dikirim (menampilkan toast sukses dan diarahkan kembali ke daftar).

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 3 pengajuan proposal dan telah memilih pekebun & lahan yang valid, **When** mengklik tombol "Submit Proposal", **Then** modal `ApprovalConfirmationModal` ditampilkan.
2. **Given** Modal `ApprovalConfirmationModal` sedang terbuka, **When** Pemohon mengklik tombol "Batal" atau tombol close (X), **Then** modal ditutup dan proposal tidak dikirim.
3. **Given** Modal `ApprovalConfirmationModal` sedang terbuka, **When** Pemohon mengklik tombol "Konfirmasi", **Then** proposal dikirim ke server, loader ditampilkan pada tombol, dan setelah sukses modal ditutup, toast sukses muncul, serta pemohon diarahkan kembali ke halaman utama usulan.

---

### User Story 2 - Koeksistensi Modal Konfirmasi pada Alur Lainnya (Priority: P2)

Sebagai Verifikator (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS) dan Pemohon (Lembaga Pekebun), saya ingin modal konfirmasi tetap aktif pada alur verifikasi masing-masing peran dan juga tersedia ketika mengirim proposal baru.

**Why this priority**: Menjaga konsistensi keamanan transaksi data penting di semua tahapan alur kerja (Kabupaten, Provinsi, Ditjenbun, BPDPKS) sekaligus menambahkan perlindungan baru pada tahap pengajuan oleh Pekebun.

**Independent Test**:
1. Lakukan verifikasi di alur Dinas Kabupaten, Dinas Provinsi, Ditjenbun, dan BPDPKS.
2. Pastikan `ApprovalConfirmationModal` muncul saat verifikator menyetujui atau menolak proposal.
3. Pastikan modal juga muncul di sisi Pekebun saat melakukan submit proposal.

**Acceptance Scenarios**:

1. **Given** Verifikator berada pada alur kerja verifikasi/approval apa pun, **When** melakukan tindakan approval atau reject, **Then** modal `ApprovalConfirmationModal` tetap ditampilkan sebelum aksi dijalankan.

---

### Edge Cases

- **Double-Submission Prevention**: Saat pengguna mengklik "Konfirmasi" di dalam modal, tombol konfirmasi harus dinonaktifkan (disabled) dengan loading spinner untuk mencegah pengiriman ganda ketika koneksi internet lambat.
- **Validasi Ketersediaan Data Lahan**: Jika tidak ada pekebun atau lahan yang dipilih, tombol "Submit Proposal" di Step 3 harus dinonaktifkan sehingga modal konfirmasi tidak dapat dipicu secara tidak sengaja dalam keadaan data kosong.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST mengintegrasikan `ApprovalConfirmationModal` ke dalam halaman pengusulan Step 3 (`StepPilihPekebunLahan.vue`).
- **FR-002**: Tombol "Submit Proposal" pada `StepPilihPekebunLahan.vue` MUST memicu terbukanya modal konfirmasi alih-alih langsung mengirimkan usulan.
- **FR-003**: Modal konfirmasi yang ditampilkan kepada Pekebun MUST memiliki isi pesan/wording yang sesuai dengan konteks pengajuan usulan sarpras (misalnya, menyatakan tindakan pengiriman proposal ke Dinas Kabupaten/Kota).
- **FR-004**: Sistem MUST mempertahankan fungsionalitas `ApprovalConfirmationModal` yang sudah ada pada halaman verifikasi Dinas Kabupaten, Dinas Provinsi, Ditjenbun, dan BPDPKS.
- **FR-005**: Pengiriman proposal yang sesungguhnya ke backend/store MUST hanya dilakukan ketika pengguna mengklik tombol konfirmasi di dalam modal.

### Key Entities *(include if feature involves data)*

- **Proposal/Usulan Draft**: Representasi data draf proposal yang sedang disusun oleh pemohon sebelum dikirimkan ke Dinas Kabupaten.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% pengajuan proposal baru oleh role Lembaga Pekebun dilindungi oleh modal konfirmasi sebelum dikirimkan.
- **SC-002**: Tindakan approval dan penolakan pada seluruh role verifikator (Kabupaten, Provinsi, Ditjenbun, BPDP) tetap menampilkan modal konfirmasi (tidak terganggu oleh penambahan modal di sisi Pekebun).
- **SC-003**: Pengguna dapat membatalkan pengiriman proposal dari modal konfirmasi dan kembali ke alur pengisian tanpa kehilangan draf data yang telah diisi.

## Assumptions

- **A-001**: Komponen `ApprovalConfirmationModal` yang sudah ada di `@/components/approval/ApprovalConfirmationModal.vue` bersifat reusable dan dapat disesuaikan parameter props-nya agar cocok dengan alur pengajuan Pekebun.
- **A-002**: Integrasi modal konfirmasi pada alur pengajuan Pekebun tidak mengubah atau merusak mekanisme `ApprovalConfirmationModal` yang telah terpasang pada alur verifikasi lainnya.
