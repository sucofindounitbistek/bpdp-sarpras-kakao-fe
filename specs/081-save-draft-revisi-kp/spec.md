# Feature Specification: Simpan Sebagai Draft pada Proses Revisi Proposal / Dokumen (Role Kelembagaan Pekebun / KP)

**Feature Branch**: `081-save-draft-revisi-kp`  
**Created**: 2026-09-12  
**Status**: Draft  
**Input**: User description: "Revisi Dokumen KP save as draft direvisi pekebun. /speckit-specify buatkan fitur draft ketika revisi dokumen di role KP, tetapi analisa dahulu apakah banyak yang akan berubah"

---

## Analysis: Dampak & Scope Perubahan (Impact Analysis)

### Apakah Banyak yang Berubah?
**Tidak banyak (perubahan minimal, non-destruktif, dan terlokalisasi).**

Berikut hasil analisa komprehensif pada Frontend dan Backend:
1. **Backend (`bpdp-sarpras-kelapa-be`)**:
   - Struktur API `PUT /proposals/:id/revisi` saat ini menerima payload revisi (`updated_documents`, `storage_area`, `updated_farmer_data`, `updated_farmer_documents`, `updated_land_data`, `updated_land_documents`, `updated_rab_document`, `updated_rab_items`).
   - Saat submit, status proposal saat ini langsung diubah menjadi `"SUBMITTED"` (atau antrean kabupaten).
   - **Untuk Save as Draft**:
     - Kita hanya menambahkan parameter opsional `is_draft` (boolean) pada payload `ResubmitProposalRequest`.
     - Jika `is_draft: true`:
       - Data teks pekebun, teks lahan, dokumen, foto gudang, dan RAB tetap disimpan ke database secara permanen.
       - **Status proposal TIDAK diubah** ke `SUBMITTED` (tetap berstatus revisi, misalnya `REV_FROM_KAB`, `REV_FROM_PROV`, dsb.) dan status validasi lama yang belum diselesaikan tetap dipertahankan.
       - Tidak memicu notifikasi resubmit ke verifikator.
     - Jika `is_draft: false` (atau tidak dikirim):
       - Berjalan normal seperti saat ini (status proposal berubah ke `SUBMITTED`, proposal dikirim ulang ke validator).

2. **Frontend (`bpdp-sarpras-kelapa-fe`)**:
   - Halaman `RevisiProposalView.vue` saat ini hanya memiliki tombol `Kirim Ulang Revisi` (yang disabled jika belum semua item terselesaikan) dan tombol `Batal`.
   - **Untuk Save as Draft**:
     - Menambahkan tombol **"Simpan Draf Revisi"** di footer samping tombol "Kirim Ulang".
     - Tombol "Simpan Draf" **TIDAK memerlukan semua item selesai diperbaiki** (bisa disimpan sebagian kapan saja).
     - Menambahkan method `saveDraftRevision()` di `proposalRevisionStore.ts` yang memanggil `proposalService.resubmitProposal(..., isDraft = true)`.
     - Memberikan feedback toast "Perubahan draf revisi berhasil disimpan".

---

## Clarifications

### Session 2026-09-12
- Q: Apakah tombol "Simpan Draf" mengharuskan seluruh item revisi yang ditolak selesai diperbaiki?  
  → A: **Tidak**. Tujuan utama draft adalah agar pemohon KP dapat mencicil perbaikan berkas/data pekebun tanpa takut hilang jika browser ditutup atau belum semua dokumen siap diunggah.
- Q: Bagaimana status proposal setelah klik "Simpan Draf"?  
  → A: Status proposal **tetap pada status perbaikan saat itu** (misal: `REV_FROM_KAB` / Perlu Perbaikan), sehingga proposal tetap muncul di tab/menu perbaikan pemohon KP dan belum berpindah ke antrean verifikator.
- Q: Bagaimana alur navigasi setelah pemohon KP menekan tombol "Simpan Draf"?  
  → A: **Tetap berada di halaman revisi** dan menampilkan toast sukses (memungkinkan pemohon lanjut mengedit/mengunggah dokumen lain tanpa terdistraksi).
- Q: Bagaimana perlakuan catatan penolakan verifikator saat "Simpan Draf"?  
  → A: **Pertahankan catatan penolakan di DB** (agar tidak ambigu dan tidak memberatkan/merubah skema), hanya tampilkan status visual "Telah Diperbarui" di UI pada item yang sudah diunggah/diisi. Catatan penolakan baru resmi di-reset/di-resolve saat dikirim ulang via tombol "Kirim Ulang".
- Q: Apakah aksi "Simpan Draf" memicu notifikasi ke verifikator dinas?  
  → A: **Tidak**. Aksi simpan draf hanya mencatat riwayat log internal tanpa mengirimkan notifikasi ke pihak verifikator. Notifikasi hanya dikirim saat proposal diajukan ulang via "Kirim Ulang Revisi".

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simpan Sebagian Perbaikan Revisi sebagai Draft (Priority: P1) 🎯 MVP

Sebagai Pemohon dari Kelembagaan Pekebun (role KP), ketika saya sedang mengerjakan perbaikan revisi proposal yang memiliki banyak catatan penolakan (misalnya 10 pekebun perlu upload KTP baru dan 5 berkas lahan), saya ingin dapat menekan tombol **"Simpan Draf"** kapan saja meskipun belum semua berkas selesai diperbaiki, sehingga progres perbaikan yang sudah saya kerjakan tidak hilang dan saya bisa melanjutkannya di waktu lain.

**Why this priority**: Menghindari kehilangan data dan frustrasi pemohon saat mengunggah banyak berkas perbaikan bertahap.

**Independent Test**:
1. Login sebagai Kelembagaan Pekebun (KP) yang memiliki proposal berstatus perbaikan/revisi.
2. Buka halaman revisi proposal.
3. Ubah salah satu data teks pekebun atau unggah salah satu dokumen perbaikan (belum semuanya selesai).
4. Klik tombol "Simpan Draf".
5. Sistem menampilkan notifikasi sukses dan data tersimpan tanpa merubah status proposal menjadi `SUBMITTED`.
6. Muat ulang (refresh) halaman, pastikan data/dokumen yang sudah diubah tetap tersimpan.

**Acceptance Scenarios**:
1. **Given** Pemohon KP berada di halaman revisi proposal dengan beberapa item penolakan yang belum lengkap,  
   **When** Pemohon menekan tombol "Simpan Draf",  
   **Then** Sistem mengirimkan data perubahan dengan flag draft, menyimpan seluruh perubahan dokumen dan teks yang sudah diinput, menampilkan toast sukses "Draf revisi berhasil disimpan", dan proposal tetap berstatus perbaikan.
2. **Given** Pemohon KP telah menyimpan draf revisi dan keluar dari sistem,  
   **When** Pemohon KP membuka kembali halaman revisi proposal tersebut di kemudian hari,  
   **Then** Seluruh data teks dan berkas yang sudah diunggah pada sesi draft sebelumnya tetap ada dan teridentifikasi sebagai item yang telah diperbarui.
3. **Given** Pemohon KP telah melengkapi seluruh perbaikan dan menekan tombol "Kirim Ulang Revisi",  
   **When** Sistem memproses pengiriman akhir,  
   **Then** Proposal beralih status ke `SUBMITTED` dan masuk ke antrean verifikator.

---

## Functional Requirements *(mandatory)*

- **FR-001**: Sistem MUST menyediakan tombol aksi "Simpan Draf" pada antarmuka halaman revisi proposal (`RevisiProposalView.vue`) di samping tombol "Kirim Ulang Revisi".
- **FR-002**: Tombol "Simpan Draf" MUST dapat diklik kapan saja oleh role KP selama terdapat setidaknya satu perubahan atau tanpa harus menunggu seluruh item penolakan berstatus terselesaikan (`isAllRejectedResolved == true` BUKAN prasyarat simpan draft).
- **FR-003**: Saat "Simpan Draf" dijalankan, sistem MUST mengirimkan payload revisi terkini ke endpoint backend dengan menandai permintaan sebagai draf (`is_draft: true`).
- **FR-004**: Backend MUST menyimpan perubahan data teks pekebun, data teks lahan, dokumen proposal, foto gudang, dan rincian RAB yang dikirimkan tanpa mengubah status utama proposal menjadi antrean verifikasi (`SUBMITTED`).
- **FR-005**: Proposal yang disimpan sebagai draf revisi MUST tetap dapat diakses kembali melalui menu tracking/revisi pemohon KP dengan menampilkan data terakhir yang telah tersimpan.
- **FR-006**: Tombol "Kirim Ulang Revisi" MUST tetap mempertahankan validasi ketat di mana seluruh catatan penolakan wajib terselesaikan (`isAllRejectedResolved == true`) sebelum proposal dapat diajukan kembali ke verifikator.
- **FR-007**: Selama proses penyimpanan draf berlangsung, sistem MUST menampilkan indikator loading pada tombol simpan draf untuk mencegah klik ganda.

---

## Key Entities

- **Proposal**: Memiliki status proposal (misal `REV_FROM_KAB`, `REV_FROM_PROV`, `SUBMITTED`). Dalam skenario draft revisi, status ini dipertahankan.
- **ResubmitProposalRequest**: Kontrak data pengiriman revisi yang diperluas dengan opsi `is_draft: bool`.
- **ProposalRevisionStore**: State store di frontend yang mengelola berkas pengganti, field koreksi, dan interaksi simpan draft maupun submit akhir.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Pemohon KP dapat menyimpan draf revisi kapan saja dengan response time API < 2 detik.
- **SC-002**: Tidak ada data berkas atau field yang hilang saat pemohon meninggalkan halaman revisi setelah menekan "Simpan Draf".
- **SC-003**: Status proposal tidak berubah menjadi `SUBMITTED` saat aksi simpan draf dilakukan, sehingga proposal tidak masuk secara prematur ke antrean verifikator.
- **SC-004**: Tidak ada regresi fungsional pada alur pengiriman ulang penuh ("Kirim Ulang Revisi").
