# Quickstart & Validation Guide: Remove Layak Options BPDP (037-remove-layak-options-bpdp)

## Overview
This guide provides manual testing steps to verify that the "Layak / Tidak Layak" radio options are removed from the BPDP Verifikator view.

## Manual Validation Steps

### Test Scenario: BPDP Verifikator Detail View Inspection
1. Open browser at `http://localhost:5173`.
2. Log in / switch role to **BPDP Verifikator (Staf)** (`BPDP_VERIFIKATOR`).
3. Open a proposal detail for verification at `/bpdp/ceki/1`.
4. Complete checking all 4 verification checkboxes.
5. **Expected Outcome**:
   - The "Keputusan Kelayakan" card renders the document download and signed file upload sections directly.
   - The radio choices "Layak" and "Tidak Layak" are NOT rendered.
