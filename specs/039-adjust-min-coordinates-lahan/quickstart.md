# Quickstart Validation Guide: Adjust Minimum Land Coordinates

This guide outlines how to manually verify the coordinate validation constraints in `StepDataLahanPekebun.vue`.

## Prerequisites

- Local development server running (`npm run dev`)
- Authenticated session with access to **Pendaftaran Pekebun Baru** (Master Data Pekebun)

## Validation Scenarios

### Scenario 1: Validate Land with Exactly 3 Coordinates
1. Open the **Pendaftaran Pekebun Baru** form.
2. Advance to **Tahap 3: Data Lahan**.
3. Click **+ Tambah Lahan Baru** (or edit an existing land record).
4. Go to the **Poligon & Peta** tab inside the land drawer.
5. In the coordinates table, enter exactly 3 valid and distinct points:
   - Point 1: `Latitude: -2.5831`, `Longitude: 120.3121`
   - Point 2: `Latitude: -2.5840`, `Longitude: 120.3150`
   - Point 3: `Latitude: -2.5865`, `Longitude: 120.3135`
6. Verify that:
   - The map displays a green triangle polygon connecting the points.
   - The status text reads: `"Poligon valid dengan 3 titik koordinat."`
   - No validation errors are displayed.
7. Click **Simpan Lahan**. Verify that the land is saved in the list successfully.

### Scenario 2: Validate Land with Less Than 3 Coordinates
1. Under the same **Poligon & Peta** tab, enter only 2 points.
2. Verify that:
   - The status text reads: `"Pratinjau poligon akan terbentuk setelah minimal 3 titik koordinat dimasukkan."`
3. Click **Simpan Lahan** or attempt to proceed.
4. Verify that:
   - An error alert/message is displayed: `"Minimal 3 titik koordinat diperlukan"` (from Zod schema validation).
   - The land record fails to save.
