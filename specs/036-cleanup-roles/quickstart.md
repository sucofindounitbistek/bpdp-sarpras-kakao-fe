# Quickstart & Validation Guide: Role Cleanup (036-cleanup-roles)

## Overview
This guide provides manual testing steps to verify that generic `DITJENBUN` and `BPDPKS` roles have been removed from the role simulation dropdown and system types.

## Manual Validation Steps

### Test Scenario 1: Inspect Role Switcher Options
1. Open browser at `http://localhost:5173`.
2. Locate the **Role Simulasi** dropdown in the desktop header bar.
3. Click the dropdown to expand options.
4. **Expected Outcome**:
   - Exactly 7 options are displayed (`Kelembagaan Pekebun`, `Dinas Kab/Kota`, `Dinas Provinsi`, `Ditjenbun Verifikator`, `Ditjenbun Approval (Ketua)`, `BPDP Verifikator (Staf)`, `BPDP Approval (Kadiv)`).
   - "Ditjenbun Pusat" (`DITJENBUN`) and "BPDPKS (Admin Penyaluran)" (`BPDPKS`) are NOT present.
