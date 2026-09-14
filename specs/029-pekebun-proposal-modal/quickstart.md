# Quickstart & Validation: Pekebun Proposal Confirmation Modal

This guide details how to validate that the `ApprovalConfirmationModal` works correctly in the Pekebun proposal submission flow.

## Prerequisites
1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Open the web browser and log in as "Lembaga Pekebun (Pemohon)".

---

## Validation Scenario: Pekebun Proposal Submission Confirmation
- **Steps**:
  1. Navigate to the new proposal wizard: `/pengusulan/pengajuan-proposal`.
  2. Complete Step 1 (select package and upload documents).
  3. Complete Step 2 (fill RAB details).
  4. Proceed to Step 3: **Pekebun & Submit**.
  5. Select at least one eligible smallholder and their land.
  6. Click the **Submit Proposal** button.
- **Expected Outcome**:
  - The `ApprovalConfirmationModal` modal MUST pop up.
  - The title MUST display: `Konfirmasi Pengajuan`
  - The description MUST display: `Anda akan mengirimkan proposal ini ke:`
  - The highlighted destination box MUST display: `Dinas Kabupaten/Kota`
  - Clicking **Batal** closes the modal without submitting.
  - Clicking **Ya, Kirim** submits the proposal, shows a success toast notification, and redirects to the proposal tracking overview.
