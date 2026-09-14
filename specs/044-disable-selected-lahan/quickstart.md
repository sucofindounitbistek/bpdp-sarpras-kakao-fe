# Quickstart Validation Guide: Disable Selected Lahan

This guide outlines how to manually verify the Disable Selected Lahan feature.

## Prerequisites

- Dev server running (`npm run dev`)
- Logged in as a user with the `PEMOHON` role

## Verification Scenarios

### Scenario 1: Verify pre-seeded active proposal blocks land selection
1. Navigate to `/pengusulan/pengajuan-proposal` (or start a new proposal).
2. Go to **Step 3: Pilih Pekebun & Lahan**.
3. Search for "Ahmad Supardi" or locate him in the list.
4. Verify that:
   - Ahmad Supardi's header card is disabled and shows the warning text: `Seluruh lahan pekebun ini sedang diajukan dalam proposal lain`.
   - Clicking on Ahmad Supardi's card does not check the card or open it.
5. Search for "Siti Rahma" or locate her in the list.
6. Verify that:
   - Siti Rahma's card is disabled and shows the same warning text (since her land `STDB-44129` is also in the active proposal `REQ-2026-001`).
7. Search for a pekebun whose lands are NOT in any active proposal (e.g. "Darmawan Putra" or a newly created pekebun).
8. Verify that their card is selectable, and checking their land works normally.
