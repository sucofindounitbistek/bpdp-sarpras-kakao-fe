# Quickstart & Validation Guide: Resuming Saved Draft Pekebun Data (032-resume-draft-pekebun)

## Overview
This document outlines manual validation scenarios to verify that Pekebun draft saving, listing, resuming, updating, and final submission work seamlessly.

## Prerequisites & Setup
1. Development server running: `npm run dev`
2. Open browser at `http://localhost:5173/master-data/pekebun`

---

## Validation Scenarios

### Test Scenario 1: Create & Save Draft
1. Click **"Tambah Pekebun"** button on Master Data Pekebun page (`/master-data/pekebun/tambah`).
2. Input NIK: `7301021508850099` (16 digits).
3. Click **"Cari NIK"** or type a test name in Identitas form.
4. Click **"Simpan Draft"** button at the bottom navigation bar.
5. **Expected Outcome**:
   - Toast notification appears: *"Draft Pekebun berhasil disimpan."*
   - User is redirected to `/master-data/pekebun`.
   - The table shows the new row with a **"Draft"** badge and action button **"Lanjutkan Pengisian"**.

---

### Test Scenario 2: Resume & Continue Editing Draft
1. Locate the newly saved draft row on `/master-data/pekebun`.
2. Click **"Lanjutkan Pengisian"** action button.
3. **Expected Outcome**:
   - App navigates to `/master-data/pekebun/tambah?draftId=PKB-xxx`.
   - Form header displays *"Lanjutkan Pengisian Draft Pekebun"*.
   - All previously entered fields (NIK, Nama, etc.) are pre-filled in their respective step inputs.
4. Add missing details (e.g. upload documents or add land details in Step 2/Step 3).
5. Click **"Simpan Draft"** again.
6. **Expected Outcome**:
   - Toast notification appears: *"Draft Pekebun berhasil diperbarui."*
   - Existing draft is updated (no duplicate row created).

---

### Test Scenario 3: Finalize & Submit Resumed Draft
1. Re-open the draft by clicking **"Lanjutkan Pengisian"**.
2. Complete all mandatory fields across Step 1, Step 2, and Step 3.
3. Advance to Step 3 and click **"Simpan Pekebun"**.
4. **Expected Outcome**:
   - Validation checks pass.
   - Toast notification appears: *"Data Pekebun berhasil disimpan."*
   - User is redirected to `/master-data/pekebun`.
   - The row status badge changes from **"Draft"** to active/registered Pekebun, and action button becomes **"Detail"**.

---

### Test Scenario 4: Delete Saved Draft
1. Locate a draft row in the table.
2. Click **"Hapus"** button.
3. Confirm deletion in prompt/toast modal.
4. **Expected Outcome**:
   - Draft entry is removed from the table list.
