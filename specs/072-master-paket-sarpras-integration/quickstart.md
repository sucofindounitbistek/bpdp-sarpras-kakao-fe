# Quickstart: Testing Frontend Master Sarpras Integration

**Feature**: `072-master-paket-sarpras-integration`
**Date**: 2026-09-03

## 1. Local Development Setup

1. Make sure backend is running on `http://localhost:8080` (or `VITE_API_URL` configured in `.env`).
2. Run frontend dev server:
   ```bash
   npm run dev
   ```

## 2. Manual Verification Checklist

1. **Step 1: Pilihan Paket Sarpras**
   - Open `/pengusulan/baru`.
   - Verify that the 13 package cards load with category icons and descriptions dynamically.
   - Verify that switching packages works smoothly and sets `isPupuk` accordingly.
2. **Step 2: Dokumen Proposal**
   - Select `UPH_MULTI_JENIS`.
   - Verify that 18 requirement rows appear, including UPH-specific ones with template download links.
3. **Step 3: Pekebun & Lahan Thresholds**
   - Select `PIKAP` (rule: 25 pekebun OR 10 Ha).
   - Select 10 pekebun with 2 Ha -> Verify warning banner calculates deficit of 15 farmers and 8 Ha.
