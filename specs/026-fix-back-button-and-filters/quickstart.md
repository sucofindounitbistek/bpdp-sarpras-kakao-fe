# Quickstart Validation Guide: fix-back-button-and-filters

Validate the implementation of the back button fix and unique status filters.

## Prerequisites & Setup

Ensure the application is running locally.

```bash
# Install dependencies if not done
npm install

# Start local dev server
npm run dev
```

Open your browser and navigate to `http://localhost:5173/` (or the port specified in console).

## Validation Scenarios

### Scenario 1: Dinas Kabupaten Wizard "Kembali" Button
1. Log in or switch role to **Dinas Kabupaten/Kota** using the role switcher.
2. Go to **Antrean Verifikasi** and click **Proses Verifikasi** on any proposal.
3. Verify you are on Step 1 ("Verifikasi Pekebun & Dokumen").
4. Scroll to the bottom and click **Lanjut ke SK CPCL**.
5. You should now be on Step 2 ("SK CPCL").
6. Click the **Kembali** button at the bottom.
7. **Expected Outcome**: The page MUST successfully navigate back to Step 1. The wizard contents MUST NOT go blank.

### Scenario 2: Status Filter Option Deduplication (Dinas Dashboard)
1. Go to **Antrean Verifikasi** under **Dinas Kabupaten** or **Dinas Provinsi**.
2. Click on the **Status** filter dropdown select box.
3. **Expected Outcome**:
   - The dropdown list MUST NOT contain duplicate options.
   - Specifically, "Verifikasi Dinas Kab/Kota" and "Selesai" should only appear ONCE.
4. Select the option **Verifikasi Dinas Kab/Kota**.
5. **Expected Outcome**: The queue list filters and shows all proposals under statuses `SUBMITTED`, `VERIFIED_ADMIN`, or `VERIFIED_FIELD`.

### Scenario 3: Tracking Status Filter Deduplication (Pemohon Dashboard)
1. Log in or switch role to **Pemohon**.
2. Go to **Pengajuan Proposal** or **Tracking Proposal** page.
3. Open the **Semua Status** filter dropdown.
4. **Expected Outcome**:
   - The options list MUST have unique labels (no duplicate "Selesai" or other labels).
5. Select a status (e.g. **Selesai**) and verify it correctly filters the table to only show proposals with statuses mapping to "Selesai".

### Scenario 4: Role-Specific Status Filters (Ditjenbun / BPDP)
1. Switch role to **Ditjenbun** or **BPDPKS**.
2. Navigate to the **Antrean Rekomtek** page.
3. Click the **Status** filter dropdown.
4. **Expected Outcome**:
   - For **Ditjenbun**, it shows Ditjenbun workflow statuses (e.g., "Perlu Verifikasi Ditjenbun", "Perbaikan Dinas Kab", "Perbaikan Dinas Prov", etc.).
   - For **BPDPKS**, it shows BPDP workflow statuses (e.g., "Perlu Verifikasi BPDP", "Menunggu Approval Kadiv", "Penerbitan SK Dirut", etc.).
   - The list does not show irrelevant Dinas/Pemohon statuses, and selection correctly filters the table records.
