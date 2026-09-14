# Feature Specification: Modal Konfirmasi Penolakan & Revisi Verifikasi Dinas Kabupaten Berformat Tabel Terkelompok (PKD/CAR Style)

**Feature Branch**: `075-kabupaten-rejection-confirmation-modal`

**Created**: 2026-09-07

**Status**: Draft

**Input**: "For the kabupaten I need to have a different confirmation modal than the current ApprovalConfirmationModal. The format is going to be a table similar to the attached pdf. But we don't need the formality, just need the rejection to be grouped. Let's discuss what you understand first before going through"

---

## Clarifications

### Session 2026-09-07

- **Q1: Penyajian Data Penolakan Pekebun**: Bagaimana menampilkan beberapa item penolakan yang berasal dari satu pekebun yang sama? → **A:** Dikelompokkan berdasarkan nama pekebun (row-span / grup per-pekebun), mencantumkan setiap dokumen/kolom yang ditolak beserta catatannya (Option A).
- **Q2: Catatan Tambahan dalam Modal**: Apakah modal menyediakan input textarea catatan tambahan? → **A:** Mengikuti modal konfirmasi yang ada saat ini (tampilan tabel ringkasan bersifat read-only berdasarkan data verifikasi yang ditolak, tanpa textarea input tambahan).
- **Q3: Trigger Points & Alur Konfirmasi**: Kapan modal ini ditampilkan? → **A:** Mengikuti trigger konfirmasi pengembalian revisi di tingkat Kabupaten saat verifikator menekan tombol "Kembalikan ke Pemohon (Revisi)" ketika terdapat item yang ditolak.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tinjauan Tabel Penolakan Terkelompok Saat Pengembalian Usulan oleh Dinas Kabupaten (Priority: P1)

Sebagai Verifikator Dinas Kabupaten, saat saya memutuskan untuk mengembalikan berkas usulan proposal ke Kelembagaan Pemohon untuk direvisi, saya ingin melihat dialog konfirmasi yang menyajikan seluruh rincian item penolakan dalam bentuk tabel yang terkelompok rapi (Dokumen Kelembagaan & Usulan serta Data/Dokumen Pekebun & Lahan), sehingga saya dapat memverifikasi kembali kelengkapan catatan perbaikan sebelum berkas dikirim.

**Why this priority**: Memastikan verifikator memiliki gambaran utuh dan terstruktur mengenai seluruh kekurangan data usulan (layaknya format PKD/CAR) tanpa format birokrasi berlebihan sebelum mengubah status usulan ke tahap revisi pemohon.

**Independent Test**:
1. Login sebagai Dinas Kabupaten dan buka proposal yang sedang diverifikasi.
2. Tolak satu atau lebih dokumen proposal (misal: RAB, Surat Permohonan, atau Foto Gudang) disertai catatan penolakan.
3. Tolak satu atau lebih data/dokumen pekebun (misal: NIK, Scan KTP, atau SHM Lahan) disertai catatan penolakan.
4. Klik tombol "Kembalikan ke Pemohon (Revisi)".
5. Periksa bahwa modal konfirmasi menampilkan dua tabel terpisah:
   - Tabel A: Dokumen Usulan & Kelembagaan (`No`, `Nama Dokumen`, `Keterangan Penolakan`).
   - Tabel B: Data & Dokumen Pekebun/Lahan (`No`, `Nama Pekebun`, `Jenis Dokumen / Objek`, `Keterangan Penolakan`), di mana nama pekebun yang sama terkumpul dalam satu grup.
6. Klik tombol "Konfirmasi Kembalikan" dan pastikan proposal tersimpan dengan status `REV_FROM_KAB` dan seluruh payload validasi terkirim ke backend.

**Acceptance Scenarios**:

1. **Given** Verifikator berada pada langkah verifikasi berkas dan telah menolak sejumlah item, **When** verifikator menekan tombol "Kembalikan ke Pemohon (Revisi)", **Then** sistem menampilkan modal konfirmasi penolakan khusus kabupaten dengan format tabel terkelompok.
2. **Given** Terdapat penolakan pada Dokumen Proposal (RAB, Surat Pernyataan, dll.) atau Area Penyimpanan/Gudang, **When** modal terbuka, **Then** item-item tersebut ditampilkan pada Bagian "Data dan Dokumen Usulan & Kelembagaan".
3. **Given** Terdapat penolakan pada beberapa dokumen/field dari pekebun yang sama (misal: KTP dan SHM Lahan milik satu pekebun), **When** modal terbuka, **Then** Bagian "Data dan Dokumen Pekebun & Lahan" menyajikan baris yang dikelompokkan berdasarkan nama pekebun tersebut.
4. **Given** Verifikator menekan tombol "Batal", **When** modal ditutup, **Then** verifikator kembali ke halaman verifikasi tanpa terjadi pengiriman status ke backend.
5. **Given** Verifikator menekan tombol "Kembalikan ke Pemohon (Revisi)", **When** proses pengiriman berjalan, **Then** tombol menampilkan indikator loading spinner dan menonaktifkan klik ganda hingga proses sinkronisasi dan pengalihan rute selesai.

---

### Edge Cases

- **Hanya Ada Penolakan Dokumen Proposal (Tanpa Penolakan Pekebun)**: Tabel Dokumen Usulan & Kelembagaan tampil dengan data lengkap, sedangkan bagian Data Pekebun menampilkan informasi bahwa tidak ada catatan penolakan pada data pekebun / tidak dimunculkan tabel kosong yang membingungkan.
- **Hanya Ada Penolakan Data Pekebun (Tanpa Penolakan Dokumen Proposal)**: Tabel Data Pekebun tampil dengan data terkelompok, sedangkan bagian Dokumen Usulan menyesuaikan dengan elegan.
- **Nama Pekebun Panjang atau Catatan Penolakan Ekstensif**: Kolom keterangan penolakan membungkus teks (*word-wrap*) secara fleksibel tanpa merusak tata letak tabel modal. Modal mendukung *scroll vertical* internal jika daftar penolakan sangat panjang.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan komponen modal konfirmasi penolakan khusus untuk Dinas Kabupaten (`KabupatenRevisiConfirmationModal`) yang menggantikan `ApprovalConfirmationModal` pada alur penolakan usulan.
- **FR-002**: Modal konfirmasi MUST menyajikan data penolakan yang terkelompok ke dalam dua tabel utama:
  1. **Dokumen Usulan & Kelembagaan**: Memuat penolakan berkas persyaratan proposal, RAB, dan verifikasi fisik area penyimpanan/gudang.
  2. **Data & Dokumen Pekebun & Lahan**: Memuat penolakan data administratif pekebun (NIK, KTP, KK) serta dokumen legalitas dan data spasial lahan (SHM, Surat Beda Nama, Titik Koordinat).
- **FR-003**: Tabel Data & Dokumen Pekebun & Lahan MUST mengelompokkan item penolakan berdasarkan nama pekebun, sehingga beberapa item penolakan untuk pekebun yang sama tersaji dalam satu kesatuan baris/grup yang jelas.
- **FR-004**: Tabel penolakan pada modal MUST bersifat *read-only* yang bersumber langsung dari status dan catatan verifikasi di `verifikasiKabDraftStore`.
- **FR-005**: Modal konfirmasi MUST menyediakan tombol aksi standar:
  - Tombol **Batal** (`variant="outline"`) untuk menutup dialog tanpa aksi mutasi.
  - Tombol **Kembalikan ke Pemohon** (`variant="danger"`) yang mengeksekusi pengiriman payload validasi dan mengubah status proposal menjadi `REV_FROM_KAB`.
- **FR-006**: Modal konfirmasi MUST menangani *loading state* dan mencegah pengiriman berulang (*duplicate submit*) saat proses simpan sedang berlangsung.
- **FR-007**: Tampilan modal MUST responsif dengan batas tinggi maksimal dan *overflow-y auto* agar nyaman dilihat pada berbagai resolusi layar.

---

### Key Entities

- **Rejected Proposal Document**: Objek data berisi identitas dokumen persyaratan usulan, nama dokumen, dan catatan penolakan verifikator.
- **Rejected Pekebun Item**: Objek data berisi nama pekebun, NIK, jenis dokumen/field yang ditolak (misal: Scan KTP, Nomor SHM, Luas Lahan), dan catatan penolakan verifikator.
- **Grouped Pekebun Rejection**: Kumpulan item penolakan yang telah diagregasikan per-pekebun untuk keperluan penyajian tabel bertingkat (*grouped rows*).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% item yang berstatus `REJECTED` pada sesi verifikasi Kabupaten terangkum secara akurat ke dalam tabel modal tanpa ada item/catatan yang hilang.
- **SC-002**: Verifikator dapat meninjau seluruh rekapitulasi penolakan dengan format tabel terstruktur dalam waktu kurang dari 5 detik.
- **SC-003**: Modal dapat dibuka dan ditutup dengan waktu respon di bawah 100ms tanpa kelambatan render antarmuka.
- **SC-004**: Tidak ada perubahan pada alur payload backend (eksekusi sinkronisasi validasi petani, lahan, dokumen proposal, dan pembaruan status proposal tetap bekerja 100% konsisten).

---

## Assumptions

- Penolakan dokumen dan data pekebun telah diverifikasi dan diberi catatan pada langkah verifikasi sebelum tombol konfirmasi ditekan.
- Modal ini digunakan khusus pada alur penolakan/pengembalian revisi (`actionType === 'reject'`) di Dinas Kabupaten.
- Alur persetujuan/pengajuan ke Provinsi tetap menggunakan modal konfirmasi pengajuan yang ada.
