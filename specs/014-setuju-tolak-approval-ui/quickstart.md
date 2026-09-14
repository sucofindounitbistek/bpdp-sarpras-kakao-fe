# Quickstart Validation Guide: Standarisasi UI Setuju / Tolak Approval

**Feature Branch**: `014-setuju-tolak-approval-ui`  
**Date**: 2026-08-05  

## Prerequisites & Role Switch

1. Ensure dev server is running (`npm run dev`).
2. Log in or switch role to **`BPDP_APPROVAL`** (Kadiv BPDP) or **`DITJENBUN_APPROVAL`** (Ketua Tim Ditjenbun).

---

## Scenario 1: Kadiv BPDP Approval UI Verification

1. Navigate to `/bpdp/approval/usl-004` (or any usulan in `APPROVAL_BPDP` status).
2. Inspect the left panel card:
   - *Expected*: Card title "Hasil Asistensi & Laporan Kelayakan BPDP".
   - *Expected*: Header shows Document Icon, Title "Laporan Kelayakan Rekomtek", Subtitle "dari Verifikator BPDP", and right-aligned buttons **`✓ Setuju`** & **`✕ Tolak`**.
3. Click **`✓ Setuju`**:
   - *Expected*: Setuju button turns green (`bg-emerald-600 text-white`). Right-panel button "Setujui Kelayakan" becomes active.
4. Click **`✕ Tolak`**:
   - *Expected*: Tolak button turns red (`bg-rose-600 text-white`). Textarea "Catatan Penolakan" expands below. Right-panel button "Kembalikan ke Ditjenbun" activates when notes are typed.
5. Click **Pratinjau Laporan Kelayakan Bertanda Tangan**:
   - *Expected*: Modal `DocumentPreviewModal` opens showing PDF preview.

---

## Scenario 2: Visual Parity Verification with Ditjenbun Approval

1. Switch role to `DITJENBUN_APPROVAL`.
2. Navigate to `/ditjenbun/rekomtek/approval/usl-002`.
3. Compare the card title, header layout, button styling, hover states, and modal preview with `/bpdp/approval/usl-004`.
   - *Expected*: 100% visual parity across both pages.
