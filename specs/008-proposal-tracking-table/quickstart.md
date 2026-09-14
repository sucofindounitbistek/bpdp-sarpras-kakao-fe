# Quickstart & Verification Guide: Proposal Tracking Table

This guide outlines the verification steps to validate the new proposal tracking table list and detail view.

## Prerequisites

1. Install dependencies and start the local development server:
   ```bash
   npm install
   npm run dev
   ```
2. Log in as a **Lembaga Pekebun** user.

---

## Verification Scenarios

### Scenario 1: Initial Table List Load

1. Open the browser and go to the proposal tracking URL:
   [http://localhost:5173/pengusulan/pengajuan-proposal](http://localhost:5173/pengusulan/pengajuan-proposal)
2. **Expected Outcome**:
   - The view must default to a **Table** showing columns: Nomor Resi, Kelembagaan Pekebun, Paket Usulan, Total Anggaran, Status Saat Ini, and Aksi.
   - Large individual cards are not rendered by default.

### Scenario 2: Searching and Filtering

1. Locate the search bar at the top.
2. Enter a search query matching a specific cooperative/lembaga (e.g., "Koperasi").
3. **Expected Outcome**: The table is filtered immediately in real-time to match the search query.
4. Clear the query, select a status (e.g., "Diajukan ke Dinas Kab/Kota") from the status filter dropdown, and verify only items matching that status are displayed in the table.

### Scenario 3: Proposal Detail View Toggle

1. Click the **Lihat Detail** button on any row in the proposal table.
2. **Expected Outcome**:
   - The list table is hidden.
   - The detailed view of the selected proposal is rendered (CPCL count, documents, budget, and the 5-step workflow timeline progress).
3. Click the **← Kembali ke Daftar** button on the top header.
4. **Expected Outcome**: The detailed view is hidden, and the proposal table is displayed again with previous search/filter states intact.

### Scenario 4: Responsive View Check

1. Open Browser DevTools and set the viewport width to **375px** (mobile view).
2. **Expected Outcome**:
   - The table container allows horizontal scroll via `overflow-x-auto` to prevent layout breakage.
   - No horizontal scrollbars or overflow are visible on the main page wrapper itself.
