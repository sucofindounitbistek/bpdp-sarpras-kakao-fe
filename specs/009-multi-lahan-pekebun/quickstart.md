# Quickstart & Verification Guide: Multi-Lahan Pekebun

This guide outlines the verification steps to validate the new multi-lahan farmer registration flow.

## Prerequisites

1. Start local dev server:
   ```bash
   npm run dev
   ```
2. Go to the Add Farmer page:
   [http://localhost:5173/master-data/pekebun/tambah](http://localhost:5173/master-data/pekebun/tambah)

---

## Verification Scenarios

### Scenario 1: Empty List State
1. Fill Step 1 (Identitas) and Step 2 (Dokumen) with mock data.
2. Advance to Step 3 (Data Lahan).
3. **Expected Outcome**:
   - The UI shows "Daftar Lahan Pekebun (0 Lahan)".
   - An empty state card is displayed: "Belum ada lahan ditambahkan."
   - The "+ Tambah Lahan Baru" button is visible.
   - The "Kirim Registrasi Pekebun" button is disabled or triggers validation error.

### Scenario 2: Adding a New Land Record
1. Click **+ Tambah Lahan Baru**.
2. **Expected Outcome**:
   - An inline form panel opens below the button with a smooth transition.
   - The form is initialized with blank fields and shows three tabs: "Legalitas", "Alamat & Berkas", and "Poligon Lahan".
   - The "Legalitas" tab is active by default.

### Scenario 3: Leaflet Map Rendering inside Tabs
1. Fill out text fields in Tab 1 (Legalitas) and Tab 2 (Alamat & Berkas).
2. Click the **Poligon Lahan** tab.
3. **Expected Outcome**:
   - The Leaflet Map initializes inside the tab and is fully viewable (no gray tiles or size loading glitches).
   - The default polygon is drawn, and the coordinate coordinates table displays below the map.
   - Modify coordinates and verify the map shape matches the coordinates list.

### Scenario 4: Saving Land to List
1. Click **Simpan Lahan** at the bottom of the active panel.
2. **Expected Outcome**:
   - The active panel collapses.
   - The land list displays a new summary card (e.g. "SHM - LHN-001 (Luas: 2.5 Ha) - Desa Bone").
   - Click "Tambah Lahan Baru" again to verify we can add a second land. Both should show in the list.

### Scenario 5: Validations & Submission
1. Click **Kirim Registrasi Pekebun**.
2. **Expected Outcome**:
   - Zod schema runs. If any fields are invalid (e.g., missing scan document or invalid polygon), validation errors are highlighted on the cards.
   - If valid, the farmer is saved to the store and redirects to the List page. Verify that viewing the detail of this farmer lists all added lands correctly.
