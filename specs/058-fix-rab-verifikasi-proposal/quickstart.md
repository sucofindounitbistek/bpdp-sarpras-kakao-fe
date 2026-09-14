# Quickstart & Validation Guide: Fix RAB Display

## Manual Verification Steps

1. **Start Frontend Dev Server** (if not already running):
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```

2. **Navigate to Proposal Verification**:
   - Log in as Dinas Kabupaten.
   - Open any proposal detail verification view: `http://localhost:5173/dinas/verifikasi/kabupaten/<proposal-id>`.

3. **Verify RAB Items Display**:
   - Scroll down to the **Pemeriksaan RAB** / **RAB Kabupaten** section.
   - Verify that all RAB items attached to the proposal display correctly with non-zero or expected quantities, unit prices, and subtotals.
   - Check that Step 1 ("Edit RAB") displays the populating rows in `RabTable.vue`.
   - Check that Step 2 ("Generate & Unduh RAB") is enabled when RAB items exist.

4. **Verify Proposal Switching**:
   - Navigate back to list `/dinas/verifikasi`.
   - Open a different proposal detail.
   - Confirm that the RAB items update cleanly to the newly opened proposal's items without showing leftover items from the previous proposal.

5. **Automated Verification**:
   - Type check: `npx vue-tsc -b` (PASSED ✓)
   - Vite Build: `npm run build` (PASSED ✓)

## Execution Log

| Date | Verification Step | Result |
|---|---|---|
| 2026-08-31 | `npx vue-tsc -b` type checking | PASSED (0 errors) |
| 2026-08-31 | `npm run build` production bundle build | PASSED (0 errors) |
