# Feature Specification: Multi-Tier Pushback Revision Notes Display & Synchronization via `validasi_dokumen_proposals`

**Feature Branch**: `067-sync-pushback-revision-notes`  
**Created**: 2026-09-01  
**Status**: Ready for Planning & Implementation  
**Input**: User description: "manfaatkan bulkProposalDocumentValidations dan getProposalDocumentValidations dan menyimpan notes di table validasi_dokumen_proposal di setiap tahap agar catatan revisi dari BPDP Verifikator dan Approval muncul di komponen yang sudah ada tanpa merombak halaman"

---

## 1. Overview & Context

Saat BPDP Verifikator atau BPDP Approval melakukan *pushback* (pengembalian usulan multi-tier), catatan alasan penolakan dokumen harus disimpan ke tabel resmi **`validasi_dokumen_proposals`** menggunakan `bulkProposalDocumentValidations` (payload memuat `dokumen_proposal_id`, `is_valid: false`, `notes`, dan `validated_by_role`).

Ketika usulan dibuka kembali di instansi penerima perbaikan (Dinas Kabupaten/Kota pada `DetailVerifikasiKabView.vue`, Dinas Provinsi pada `DetailVerifikasiProvinsiView.vue`, Ditjenbun pada `CekiDitjenbunView.vue`, atau BPDP pada `CekiBpdpView.vue`):
1. Halaman memanggil **`getProposalDocumentValidations({ proposal_id })`** untuk mengambil seluruh riwayat validasi dari tabel `validasi_dokumen_proposals`.
2. State store menyinkronkan data catatan tersebut ke komponen pemeriksaan dokumen yang sudah ada tanpa mengubah atau merombak kode halaman terkait.
3. Menghubungkan pemetaan alias tipe dokumen (`BA_VERIFIKASI` ➔ `berita-acara-dokumen`, `BA_VERIFIKASI_LAPANGAN` ➔ `berita-acara-lapangan`, `SK_CPCL` ➔ `sk-cpcl`, `RAB_FINAL` ➔ `rabDocument`, `SURAT_PENGANTAR_SK_CPCL` ➔ Surat Pengantar Provinsi) sehingga kotak catatan merah yang sudah ada otomatis terisi catatan penolakan dari BPDP.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - BPDP Menyimpan Catatan Penolakan ke `validasi_dokumen_proposals` (Priority: P1)

Sebagai **BPDP Approval / Verifikator**, ketika saya menolak satu atau beberapa dokumen (misal Berita Acara, SK CPCL, atau Rekomtek) dan mengembalikan usulan (*pushback*), sistem menyimpan catatan penolakan per-dokumen ke tabel backend `validasi_dokumen_proposals` dengan `dokumen_proposal_id` yang valid.

**Why this priority**: Menjadi sumber data utama bagi seluruh instansi penerima pengembalian usulan.

**Independent Test**:
- Lakukan penolakan pada dokumen `BA_VERIFIKASI` di usulan ID `101`.
- Eksekusi tombol pushback.
- Pastikan request payload `POST /api/v1/proposal-document-validations/bulk` memuat `dokumen_proposal_id` yang sesuai dan tersimpan sukses di database.

**Acceptance Scenarios**:
1. **Given** Dokumen Berita Acara (ID: 103) ditolak dengan catatan "Format tanda tangan belum lengkap", **When** Tombol pushback dikonfirmasi, **Then** API `/api/v1/proposal-document-validations/bulk` dipanggil dengan `dokumen_proposal_id: 103`, `is_valid: false`, `notes: 'Format tanda tangan belum lengkap'`, dan `validated_by_role: 'BPDP_APPROVAL'`.

---

### User Story 2 - Dinas Kabupaten Membaca & Menampilkan Catatan Penolakan BPDP (Priority: P1)

Sebagai **Verifikator Dinas Kabupaten/Kota**, ketika membuka usulan yang dikembalikan oleh BPDP (status `REV_FROM_PROV`), komponen kotak catatan penolakan merah yang sudah ada di bawah Dokumen Berita Acara, SK CPCL, dan RAB otomatis menampilkan catatan yang ditulis oleh BPDP.

**Why this priority**: Memastikan verifikator kabupaten langsung mengetahui bagian berkas mana yang perlu diunggah ulang tanpa mencari-cari di log.

**Independent Test**:
- Buka usulan `101` di `/dinas/verifikasi/101`.
- Pastikan kotak catatan penolakan merah di `StepDataCPCL.vue` langsung menampilkan teks penolakan Berita Acara dari BPDP.

**Acceptance Scenarios**:
1. **Given** Dokumen `BA_VERIFIKASI` ditolak oleh BPDP, **When** Dinas Kabupaten membuka halaman verifikasi, **Then** Kotak catatan penolakan merah pada komponen Berita Acara menampilkan teks catatan penolakan tersebut.

---

### User Story 3 - Dinas Provinsi & Ditjenbun Membaca Catatan Penolakan BPDP (Priority: P2)

Sebagai **Verifikator Dinas Provinsi / Ditjenbun**, ketika usulan dikembalikan oleh BPDP, sistem menyinkronkan data dari `validasi_dokumen_proposals` sehingga catatan perbaikan pada dokumen Surat Pengantar SK CPCL (`SURAT_PENGANTAR_SK_CPCL`) atau Rekomtek (`REKOMTEK`) otomatis terisi.

**Why this priority**: Menjaga transparansi alasan perbaikan di seluruh tingkat birokrasi.

**Independent Test**:
- Buka usulan yang dokumen Surat Pengantarnya ditolak oleh BPDP di `/provinsi/verifikasi/:id`.
- Pastikan kotak catatan perbaikan Surat Pengantar terisi teks penolakan.

**Acceptance Scenarios**:
1. **Given** Surat Pengantar ditolak oleh BPDP, **When** Dinas Provinsi membuka form verifikasi berkas, **Then** Kotak catatan perbaikan Surat Pengantar terisi catatan penolakan dari BPDP.

---

## 3. Edge Cases

- **Dokumen Tanpa Penolakan**: Dokumen yang tidak ditolak atau berstatus `is_valid: true` tidak menampilkan kotak catatan merah.
- **Multiple Document Validations**: Jika satu dokumen memiliki beberapa riwayat validasi, sistem mengambil validasi terbaru (`latest by created_at / id`).
- **Dokumen ID String vs Number**: Sinkronisasi harus menangani ID dokumen baik berupa `number` maupun `string`.

---

## 4. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `ApprovalBpdpView.vue` MUST mengirimkan `dokumen_proposal_id: Number(doc.id)` yang valid pada setiap item payload `bulkProposalDocumentValidations`.
- **FR-002**: `verifikasiKabDraft.ts` MUST memetakan alias tipe dokumen `BA_VERIFIKASI` dan `BA_VERIFIKASI_LAPANGAN` ke kunci draft `berita-acara-dokumen` dan `berita-acara-lapangan`.
- **FR-003**: `verifikasiKabDraft.ts` MUST memetakan alias tipe dokumen `RAB_FINAL` ke `rabDocument`.
- **FR-004**: `verifikasiProvinsi.ts` dan `verifikasiDitjenbun.ts` MUST menyinkronkan validasi dari `validasi_dokumen_proposals` untuk tipe dokumen yang diperiksa di instansi masing-masing.
- **FR-005**: Semua pembaruan MUST bersifat non-destructive dan tidak mengubah struktur layout halaman yang sudah ada.

---

## 5. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% catatan penolakan dokumen dari BPDP masuk ke tabel `validasi_dokumen_proposals` dengan `dokumen_proposal_id` yang valid.
- **SC-002**: Komponen kotak catatan merah yang sudah ada di halaman Kabupaten dan Provinsi otomatis menampilkan teks catatan penolakan dari BPDP saat halaman dibuka.
- **SC-003**: Zero console error dan build frontend `npm run build` sukses tanpa error TypeScript.
