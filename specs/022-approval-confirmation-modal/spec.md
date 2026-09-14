# Feature Specification: Modal Konfirmasi Pengiriman Approval

**Feature Branch**: `022-approval-confirmation-modal`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "i need every time when it's going up the approval of the proposal, a modal shows up to confirm sending to the next step of the approval"

---

## Clarifications

### Session 2026-08-06

- Q: Informasi proposal apa yang harus ditampilkan di modal konfirmasi? → A: Hanya jenis tindakan + tahap tujuan (tanpa info proposal spesifik)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Konfirmasi Sebelum Meneruskan Approval ke Tahap Berikutnya (Priority: P1)

Setiap approver (Ditjenbun, BPDP, Dinas Kab/Kota, Dinas Provinsi) yang akan meneruskan proposal ke tahap approval berikutnya akan melihat modal konfirmasi. Modal ini menampilkan ringkasan tindakan yang akan dilakukan (misalnya "Setujui dan teruskan ke tahap selanjutnya") dan meminta konfirmasi eksplisit sebelum tindakan dieksekusi.

**Why this priority**: Ini adalah inti dari fitur — mencegah kesalahan pengiriman approval yang tidak disengaja dan memberikan kesempatan terakhir bagi approver untuk membatalkan tindakan.

**Independent Test**: Login sebagai approver, buka halaman approval mana pun, klik tombol untuk meneruskan approval, dan verifikasi bahwa modal konfirmasi muncul sebelum tindakan dieksekusi.

**Acceptance Scenarios**:

1. **Given** approver berada di halaman approval dan semua dokumen telah disetujui, **When** approver menekan tombol "Setujui" / "Teruskan", **Then** modal konfirmasi muncul dengan informasi ringkasan tindakan dan tombol "Konfirmasi" serta "Batal".
2. **Given** modal konfirmasi terbuka, **When** approver menekan tombol "Batal" atau menutup modal (klik di luar / tombol X), **Then** modal tertutup dan tidak ada perubahan pada status proposal.
3. **Given** modal konfirmasi terbuka, **When** approver menekan tombol "Konfirmasi", **Then** modal tertutup, tindakan approval dieksekusi, dan sistem menampilkan notifikasi sukses.

---

### User Story 2 - Konfirmasi Sebelum Mengembalikan Proposal (Penolakan) (Priority: P2)

Ketika approver memutuskan untuk menolak atau mengembalikan proposal ke tahap sebelumnya, modal konfirmasi muncul untuk memastikan bahwa approver benar-benar ingin mengembalikan proposal tersebut. Modal menampilkan ringkasan alasan penolakan (jika diisi) dan langkah yang akan dikembalikan.

**Why this priority**: Mencegah pengembalian proposal yang tidak disengaja, yang dapat mengganggu alur kerja dan menyebabkan kebingungan.

**Independent Test**: Login sebagai approver, pilih "Tolak" pada proposal, dan verifikasi bahwa modal konfirmasi muncul sebelum tindakan pengembalian dieksekusi.

**Acceptance Scenarios**:

1. **Given** approver telah memilih "Tolak" dan mengisi catatan penolakan, **When** approver menekan tombol "Kembalikan", **Then** modal konfirmasi muncul menampilkan ringkasan: tujuan pengembalian, catatan penolakan, dan tombol "Konfirmasi Kembalikan" serta "Batal".
2. **Given** modal konfirmasi pengembalian terbuka, **When** approver menekan "Batal", **Then** modal tertutup dan approver kembali ke halaman approval tanpa perubahan.
3. **Given** modal konfirmasi pengembalian terbuka, **When** approver menekan "Konfirmasi Kembalikan", **Then** proposal dikembalikan ke tahap sebelumnya dan notifikasi sukses muncul.

---

### User Story 3 - Konsistensi Modal di Seluruh Halaman Approval (Priority: P3)

Modal konfirmasi yang sama digunakan di seluruh halaman approval: Approval Ditjenbun, Approval BPDP, Verifikasi Ditjenbun (CekiDitjenbun), dan Verifikasi BPDP (CekiBpdp). Desain, wording, dan perilaku modal konsisten di semua halaman tersebut.

**Why this priority**: Memastikan pengalaman pengguna yang seragam di seluruh modul approval.

**Independent Test**: Buka setiap halaman approval dan verifikasi bahwa modal konfirmasi yang muncul memiliki tampilan dan perilaku yang identik.

**Acceptance Scenarios**:

1. **Given** approver berada di halaman Approval Ditjenbun, **When** menekan tombol "Setujui Rekomtek", **Then** modal konfirmasi muncul dengan desain yang sama seperti di halaman approval lainnya.
2. **Given** approver berada di halaman Verifikasi Ditjenbun (CekiDitjenbun), **When** menekan tombol verifikasi dokumen, **Then** modal konfirmasi muncul dengan wording yang sesuai konteks namun format dan perilaku yang sama.

---

### Edge Cases

- Apa yang terjadi jika approver menekan tombol konfirmasi berkali-kali dengan cepat? Sistem harus men-disable tombol konfirmasi setelah klik pertama untuk mencegah duplikasi pengiriman.
- Apa yang terjadi jika koneksi jaringan terputus saat konfirmasi dikirim? Modal harus tetap terbuka dan menampilkan pesan error, memungkinkan approver untuk mencoba lagi.
- Apa yang terjadi jika status proposal sudah berubah oleh approver lain saat modal sedang terbuka? Sistem harus menampilkan pesan error yang sesuai dan menutup modal.
- Bagaimana tampilan modal pada perangkat mobile? Modal harus responsif dan tidak menyebabkan overflow horizontal pada viewport mobile 375px.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menampilkan modal konfirmasi setiap kali approver akan meneruskan proposal ke tahap approval berikutnya, sebelum tindakan benar-benar dieksekusi.
- **FR-002**: Sistem HARUS menampilkan modal konfirmasi setiap kali approver akan mengembalikan/menolak proposal ke tahap sebelumnya, sebelum tindakan benar-benar dieksekusi.
- **FR-003**: Modal konfirmasi HARUS menampilkan informasi ringkasan tindakan yang akan dilakukan, terbatas pada: jenis tindakan (setujui/kembalikan), nama tahap tujuan, dan catatan (jika ada). Tidak perlu menampilkan informasi spesifik proposal (ID, nama pekebun, dsb) karena approver sudah berada di halaman detail proposal yang bersangkutan.
- **FR-004**: Modal konfirmasi HARUS menyediakan tombol "Konfirmasi" dan "Batal", serta dapat ditutup melalui tombol "X" atau klik di luar area modal.
- **FR-005**: Tombol konfirmasi pada modal HARUS di-disable setelah klik pertama untuk mencegah duplikasi pengiriman (double submission).
- **FR-006**: Sistem HARUS menampilkan indikator loading pada tombol konfirmasi saat permintaan sedang diproses.
- **FR-007**: Jika terjadi error saat pengiriman (network error, status konflik), modal HARUS tetap terbuka dan menampilkan pesan error yang sesuai.
- **FR-008**: Modal konfirmasi HARUS digunakan secara konsisten di seluruh halaman approval: Approval Ditjenbun, Approval BPDP, Verifikasi Ditjenbun (CekiDitjenbun), dan Verifikasi BPDP (CekiBpdp).
- **FR-009**: Seluruh teks pada modal konfirmasi (judul, deskripsi, label tombol, pesan error) HARUS dieksternalisasi ke file konfigurasi lokalisasi.
- **FR-010**: Modal konfirmasi HARUS responsif dan mendukung tampilan mobile (viewport 375px) tanpa horizontal overflow.
- **FR-011**: Modal konfirmasi HARUS mendukung tema gelap (dark mode) sesuai dengan konvensi tema aplikasi.

### Key Entities

- **ApprovalConfirmationModal**: Komponen modal yang menampilkan ringkasan tindakan approval dan meminta konfirmasi pengguna. Atribut: jenis tindakan (approve/reject), tahap tujuan, catatan, status loading, status error.
- **ApprovalAction**: Tindakan approval yang akan dikonfirmasi. Atribut: tipe (setujui/kembalikan), proposal ID, tahap asal, tahap tujuan, catatan opsional.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% aksi penerusan atau pengembalian proposal pada halaman approval memunculkan modal konfirmasi sebelum eksekusi.
- **SC-002**: Modal konfirmasi muncul dan merespons dalam waktu < 100ms setelah tombol aksi ditekan.
- **SC-003**: Tidak terjadi duplikasi pengiriman approval meskipun tombol konfirmasi ditekan berulang kali (0% double submission).
- **SC-004**: Pengguna dapat membatalkan tindakan dari modal konfirmasi dan kembali ke halaman approval tanpa efek samping.
- **SC-005**: Modal konfirmasi tampil dengan benar pada viewport mobile 375px tanpa horizontal overflow.

---

## Assumptions

- Tombol aksi approval (Setujui/Tolak/Teruskan/Kembalikan) sudah tersedia di halaman approval yang ada (ApprovalDitjenbunView, ApprovalBpdpView, CekiBpdpView, CekiDitjenbunView).
- Alur approval yang ada saat ini: approver menekan tombol aksi dan tindakan langsung dieksekusi. Fitur ini menyisipkan langkah konfirmasi di antaranya.
- Komponen modal yang sudah ada di proyek (seperti DocumentPreviewModal) dapat dijadikan referensi untuk membangun modal konfirmasi ini.
- Catatan/alasan penolakan sudah diisi oleh approver sebelum modal konfirmasi pengembalian muncul, sesuai dengan standar yang ada di fitur 014-setuju-tolak-approval-ui.
- Role approver yang relevan mencakup: DITJENBUN_APPROVAL, BPDP_APPROVAL, DITJENBUN_VERIFIKATOR (CekiDitjenbun), BPDP_VERIFIKATOR (CekiBpdp).