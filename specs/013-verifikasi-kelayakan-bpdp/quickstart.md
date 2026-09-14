# Quickstart Validation Guide: Verifikasi Kelayakan BPDP

**Feature Branch**: `013-verifikasi-kelayakan-bpdp`  
**Date**: 2026-08-05  

## Prerequisites & Role Switch

1. Ensure the development server is running (`npm run dev`).
2. Log in or switch role to **`BPDP_VERIFIKATOR`** (Verifikator BPDP).
3. Navigate to **Verifikasi Kelayakan** (`/bpdp/antrean`).

---

## Scenario 1: Successful Verification & Approval Workflow

1. Click on an usulan with status `VERIFIKASI_BPDP` (e.g. `usl-003`).
2. Verify that 4 document items are displayed using `VerifikasiDokumenItem` (Rekomendasi Teknis, SK CPCL, Surat Pengantar, Berita Acara).
3. Click the **✓ (Sesuai)** button on all 4 documents.
   - *Expected*: All 4 items turn green (Sesuai active). Decision panel shows "Status Penilaian Kelayakan" (Layak / Tidak Layak) and "Generate Dokumen Kelayakan".
4. Select "Layak" and click **Generate Dokumen Kelayakan**.
   - *Expected*: Draft Kelayakan PDF download link appears.
5. Upload a signed PDF via `FileUpload`.
   - *Expected*: Green checkmark "Berkas Laporan Kelayakan berhasil diunggah".
6. Click **Ajukan Kelayakan ke Kadiv BPDP**.
   - *Expected*: Toast success notification shown, status updated to `APPROVAL_BPDP`, redirected to `/bpdp/antrean`.

---

## Scenario 2: Document Invalid & Return to Ketua Ditjenbun

1. Open another usulan in `VERIFIKASI_BPDP` status.
2. Click **✗ (Tidak Sesuai)** on the SK CPCL document.
   - *Expected*: Red highlight appears, textarea for notes expands below SK CPCL item.
3. Type note: `"SK CPCL tidak melampirkan tanda tangan Kepala Dinas."`
4. Observe the Decision Panel on the right.
   - *Expected*: Panel shows red warning banner and button **"Kembalikan ke Ditjenbun"**.
5. Click **Kembalikan ke Ditjenbun** and confirm.
   - *Expected*: Toast warning "Usulan dikembalikan ke Ditjenbun", usulan status changes to `APPROVAL_DITJENBUN`, redirected to `/bpdp/antrean`.

---

## Scenario 3: Readonly Mode Verification

1. Open an usulan that is ALREADY submitted (status: `APPROVAL_BPDP` or `GENERATE_SK_DIRUT`, e.g. `usl-004`).
2. Inspect the document list.
   - *Expected*: All ✓/✗ buttons are hidden. Status badges ("Sesuai" / "Tidak Sesuai" / "Belum dicek") are rendered in readonly mode. Inputs cannot be toggled or edited.
