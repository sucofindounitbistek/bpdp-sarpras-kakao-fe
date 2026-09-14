# Implementation Plan: Multi-Tier Pushback Revision Notes Display & Synchronization

**Feature Branch**: `067-sync-pushback-revision-notes`  
**Created**: 2026-09-01  
**Status**: Ready for Tasks & Implementation  

---

## 1. Technical Context

- **Backend API**:
  - `POST /api/v1/proposal-document-validations/bulk`: Menerima array validasi dokumen dengan `dokumen_proposal_id`, `is_valid`, `notes`, `validated_by_role`.
  - `GET /api/v1/proposal-document-validations?proposal_id=...`: Mengembalikan daftar riwayat validasi dokumen untuk usulan yang bersangkutan.
- **Frontend Stores**:
  - `src/stores/pengusulan.ts`: Memuat fungsi `bulkProposalDocumentValidations` dan `getProposalDocumentValidations`.
  - `src/stores/verifikasiKabDraft.ts`: State management verifikasi berkas Kabupaten. Menyinkronkan data validasi dokumen ke `verifications` store dictionary.
  - `src/stores/verifikasiProvinsi.ts` & `src/stores/verifikasiDitjenbun.ts`: State management Provinsi dan Ditjenbun.
- **Frontend Views**:
  - `src/views/bpdp/ApprovalBpdpView.vue`: Saat pushback, memastikan `dokumen_proposal_id` dikirim dengan `doc.id` dokumen yang tepat.
  - `src/views/dinas/kabupaten/StepDataCPCL.vue`: Membaca `getDocVerification('berita-acara-dokumen')`, `getDocVerification('berita-acara-lapangan')`, `getDocVerification('sk-cpcl')`.
  - `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`: Membaca `getVerification(...)`.
  - `src/views/dinas/provinsi/StepDataCPCL.vue`: Membaca catatan validasi `SURAT_PENGANTAR_SK_CPCL`.

---

## 2. Implementation Approach & Architecture

### Step 1: Fix Payload in `ApprovalBpdpView.vue`
Pastikan payload pushback memasukkan `dokumen_proposal_id: Number(d.doc?.id)` (jika `d.doc?.id` tidak ada, cari dari `activeUsulan.documents` yang memiliki tipe dokumen sesuai) sehingga backend menyimpan catatan penolakan ke tabel `validasi_dokumen_proposals` dengan relasi FK yang valid.

### Step 2: Update Alias Mappings in `verifikasiKabDraft.ts`
Di dalam method `syncProposalValidations`:
Tambahkan pemetaan alias dua arah untuk:
- `'BA_VERIFIKASI' ➔ 'berita-acara-dokumen'` & `'berita-acara-dokumen' ➔ 'BA_VERIFIKASI'`
- `'BA_VERIFIKASI_LAPANGAN' ➔ 'berita-acara-lapangan'` & `'berita-acara-lapangan' ➔ 'BA_VERIFIKASI_LAPANGAN'`
- `'RAB_FINAL' ➔ 'rabDocument'` & `'rabDocument' ➔ 'RAB_FINAL'`
- Serta fallback matching berdasarkan kesamaan `dokumen_proposal_id` langsung terhadap `doc.id` atau `persyaratanId`.

### Step 3: Ensure Dynamic Role Labels where Applicable
Pastikan label pada kotak catatan penolakan menampilkan asal role penolak jika tersedia (misal: "Catatan Revisi / Penolakan (BPDP KS):") atau fallback label yang jelas.

---

## 3. Verification Plan

1. **Automated Verification**:
   - Run `npm run build` in `bpdp-sarpras-kelapa-fe` to verify zero TypeScript or bundle errors.
2. **Manual Verification**:
   - Di usulan `101` (`SK_DIRUT_PUBLISHED` / `REV_FROM_PROV`), lakukan pushback dengan menolak dokumen Berita Acara & SK CPCL.
   - Buka `/dinas/verifikasi/101`.
   - Pastikan kotak catatan merah di Langkah 2 (Berita Acara Dokumen, Berita Acara Lapangan, SK CPCL) terisi teks penolakan secara otomatis.
