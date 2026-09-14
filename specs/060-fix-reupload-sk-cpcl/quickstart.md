# Quickstart & Verification Guide: Fix Reupload & Removal of SK CPCL Documents

## Overview

This guide provides step-by-step instructions to verify that document removal ("Hapus") and re-uploading function correctly for SK CPCL and related verification documents on the Regency Verification interface (`/dinas/verifikasi/kabupaten/:id`).

---

## Prerequisites

1. Frontend Development Server running:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Open browser at `http://localhost:5173`.
3. Log in as a Regency Dinas officer (Role: `DINAS_KAB`).

---

## Manual Verification Scenarios

### Scenario 1: Remove Pre-Existing SK CPCL Document

1. Navigate to `http://localhost:5173/dinas/verifikasi/kabupaten/24`.
2. Click on **Step 3: SK CPCL** tab or navigate to Step 3.
3. Observe that a pre-existing SK CPCL document card is displayed.
4. Click the **Hapus** (Remove) button next to the SK CPCL document.
5. **Expected Result**:
   - Info toast appears confirming removal ("Dokumen SK CPCL dihapus.").
   - The document preview/info card vanishes.
   - The file upload dropzone (`FileUpload`) becomes immediately visible and active.

---

### Scenario 2: Re-upload Replacement SK CPCL Document

1. Following Scenario 1 (after clicking **Hapus**), drag & drop or select a new PDF or image file (e.g., `SK_CPCL_Updated.pdf`).
2. **Expected Result**:
   - Success toast appears ("Dokumen SK CPCL berhasil diunggah.").
   - The green success document card displays the new file name `SK_CPCL_Updated.pdf` and correct file size.
   - Clicking **Pratinjau** opens the Document Preview Modal rendering the new document.

---

### Scenario 3: Re-upload Same File Name After Removal

1. Click **Hapus** on the newly uploaded document.
2. Re-select the exact same file from the file picker.
3. **Expected Result**:
   - The `@file-selected` event fires cleanly (file input value was reset on remove).
   - Document card updates cleanly with the re-selected file.

---

### Scenario 4: Step 4 Summary & Final Submission Verification

1. Click **Simpan & Lanjut ke Summary & Submit** to navigate to Step 4.
2. Inspect the **Step 2: SK CPCL** summary section.
3. **Expected Result**:
   - The summary reflects the replacement SK CPCL document.
   - Submitting the proposal verification succeeds with the updated file payload.

---

## Automated Verification Command

Run frontend type-checking and build verification commands:

```bash
cd bpdp-sarpras-kelapa-fe
npm run build
```
