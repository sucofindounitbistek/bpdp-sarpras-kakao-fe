# Quickstart & Validation: provinsi-approval-modal

This guide details how to validate that the `ApprovalConfirmationModal` works correctly in both Dinas Kabupaten and Dinas Provinsi verification flows.

## Prerequisites
1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Open the web browser and log in or navigate to the Dinas verification routes.

---

## Validation Scenario 1: Dinas Kabupaten Step 4 Submission Confirmation
- **Steps**:
  1. Navigate to Dinas Kabupaten Queue: `/dinas/verifikasi`.
  2. Click **Proses Verifikasi** on any pending proposal.
  3. Complete all checklist verifications on Step 1, proceed to Step 3, and upload/confirm the SK CPCL document.
  4. Proceed to Step 4: **Summary & Submit**.
  5. Click **Ajukan Ke Provinsi**.
- **Expected Outcome**:
  - The `ApprovalConfirmationModal` modal MUST pop up.
  - The description MUST say: `Anda akan meneruskan proposal ke tahap:`
  - The highlighted destination box MUST display: `Dinas Provinsi`
  - Clicking **Batal** closes the modal without submitting.
  - Clicking **Ya, Setujui** executes the state change, displays a success toast, and redirects to the queue.

---

## Validation Scenario 2: Dinas Provinsi Step 4 Submission Confirmation
- **Steps**:
  1. Navigate to Dinas Provinsi Queue: `/dinas/verifikasi/provinsi`.
  2. Click **Proses Verifikasi** on any pending proposal.
  3. Review all documents on Step 1, proceed to Step 3, and confirm the SK CPCL document.
  4. Proceed to Step 4: **Summary & Submit**.
  5. Click **Ajukan ke Ditjenbun**.
- **Expected Outcome**:
  - The `ApprovalConfirmationModal` modal MUST pop up.
  - The description MUST say: `Anda akan meneruskan proposal ke tahap:`
  - The highlighted destination box MUST display: `Ditjenbun`
  - Clicking **Ya, Setujui** executes the submission, displays a success toast, and redirects.

---

## Validation Scenario 3: Dinas Provinsi Step 3 Rejection Confirmation
- **Steps**:
  1. Navigate to Dinas Provinsi Queue: `/dinas/verifikasi/provinsi`.
  2. Click **Proses Verifikasi** on any pending proposal.
  3. Go to Step 3: **Surat Pengantar SK CPCL**.
  4. Click **Tolak** on the SK CPCL document.
  5. Enter a rejection note: `"Surat keputusan tidak ditandatangani oleh pejabat berwenang."`
  6. Click the red **Revisi Kembali Dokumen** button.
- **Expected Outcome**:
  - The `ApprovalConfirmationModal` modal MUST pop up.
  - The description MUST say: `Anda akan mengembalikan proposal ke tahap:`
  - The highlighted destination box MUST display: `Dinas Kabupaten/Kota (Revisi)`
  - The notes field MUST display the exact rejection note entered.
  - Clicking **Ya, Kembalikan** returns the proposal and redirects.
