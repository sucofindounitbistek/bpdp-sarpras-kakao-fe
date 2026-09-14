# Quickstart & Verification Guide: Fix RAB and Gudang Validation Display

## Overview

This guide provides instructions to verify that the Gudang (Storage Area) and RAB validation sections display correctly on proposal verification detail pages (specifically `/dinas/verifikasi/kabupaten/22`).

---

## Prerequisites

1. Frontend Development Server running:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Open browser at `http://localhost:5173`.
3. Log in as a Regency Dinas officer (Role: `DINAS_KAB`).

---

## Manual Verification Scenarios

### Scenario 1: Verify Proposal #22 Gudang Validation Section

1. Navigate to `http://localhost:5173/dinas/verifikasi/kabupaten/22`.
2. Ensure you are on **Step 1: Pekebun & Dokumen Proposal**.
3. Scroll to the **Informasi Gudang / Tempat Penyerahan** section.
4. **Expected Result**:
   - The Gudang validation section is visible.
   - Address (`gudangAlamat`) and Coordinate (`gudangKoordinat`) display with Setuju/Tolak toggle buttons.
   - Exterior and Interior photo cards render preview buttons ("Lihat") if photos are present.

---

### Scenario 2: Verify Proposal #22 RAB Inspection & Regency RAB Table

1. On `http://localhost:5173/dinas/verifikasi/kabupaten/22` (Step 1), scroll to the **Pemeriksaan RAB** and **RAB Kabupaten** sections.
2. **Expected Result**:
   - The RAB inspection section displays.
   - The RAB Kabupaten editable table (`RabTable`) displays the items attached to proposal #22.
   - Modifying item volumes or unit prices updates the subtotal dynamically.

---

### Scenario 3: Bulk Validation Actions for Gudang and RAB Items

1. Click **Setuju Semua (Approved)** at the top of Step 1.
2. **Expected Result**:
   - Gudang address and coordinate statuses update to `APPROVED` (Green).
   - RAB item validation statuses update cleanly.

---

## Automated Verification Command

Run frontend type-checking and production compilation verification:

```bash
cd bpdp-sarpras-kelapa-fe
npm run build
```
