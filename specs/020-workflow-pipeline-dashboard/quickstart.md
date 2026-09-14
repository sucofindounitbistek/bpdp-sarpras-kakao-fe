# Quickstart & Validation Guide: Workflow Pipeline Dashboard

## Prerequisites
- The frontend development server must be running (`npm run dev`).
- Access to the application using different accounts or the `RoleSwitcher` component (to swap between `DINAS_KAB`, `DINAS_PROV`, `DITJENBUN_VERIFIKATOR`, `BPDP_VERIFIKATOR`, and `PEMOHON`).

## Validation Scenarios

### Scenario 1: Multi-Role Dashboard Toggle Validation
1. Open the browser to `http://localhost:5173/` and log in (or bypass to dashboard).
2. Change the role to **Dinas Kabupaten / Kota** using the role switcher.
3. **Expected Outcome**:
   - The dashboard updates to show the "TAMPILAN ALUR WORKFLOW PIPELINE" section.
   - The layout presents 10 pipeline cards displaying mock metrics.
   - The active/highlighted cards should visual-highlight the stages relevant to the Dinas Kabupaten/Kota (e.g. Stage 2 and 3).
4. Change the role to **Kelembagaan Pekebun (PEMOHON)**.
5. **Expected Outcome**:
   - The pipeline section disappears, showing only the standard dashboard for Pekebun (no regression).

### Scenario 2: Interactive Hover & Navigation Validation
1. Under any of the non-PEMOHON roles (e.g., Dinas Provinsi), hover over the **Verifikasi Dinas Kabupaten/Kota** card.
2. **Expected Outcome**:
   - The card shows a smooth micro-animation: lifts slightly (`-translate-y-1`), borders glowing or highlighting with the primary green accent, cursor changes to pointer.
3. Click the card.
4. **Expected Outcome**:
   - Page redirects smoothly to `/dinas/verifikasi/kabupaten`.
   - The navigation breadcrumb at the top reflects the correct sub-page hierarchy.

### Scenario 3: Responsive Layout Shift Verification
1. Open Chrome DevTools and toggle Device Toolbar.
2. Set viewport width to `375px` (Mobile view).
3. **Expected Outcome**:
   - The 10-step looped grid collapses into a clean, vertical step list.
   - Arrow connectors do not overlap cards or extend off-screen.
   - No horizontal scrollbars are present.
