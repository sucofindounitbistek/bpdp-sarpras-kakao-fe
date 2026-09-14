# Quickstart Validation Guide: Penyambungan Alur Riwayat Status & Catatan Timeline

**Feature Branch**: `015-riwayat-status-timeline-flow`  
**Date**: 2026-08-05  

## Scenario 1: Continuous Connected Line Verification

1. Open `/bpdp/ceki/usl-004` (or any usulan with multiple status logs).
2. Scroll to the "Riwayat Status & Catatan" card.
3. Inspect the left side of the timeline items:
   - *Expected*: A continuous vertical line connects node 1 to node 2, node 2 to node 3, etc.
   - *Expected*: The vertical line stops precisely at the last node dot and does NOT hang below the last card.

---

## Scenario 2: Return / Revision Log Color Differentiation

1. Open `/bpdp/ceki/usl-003` or simulate returning an usulan to Ditjenbun.
2. Inspect the history log:
   - *Expected*: Log entries representing returns/pushback have an amber node indicator ring, making return steps visually distinct from forward approval steps.

---

## Scenario 3: Cross-Page Consistency Test

1. Check the timeline component on all 5 views:
   - `/ditjenbun/rekomtek/ceki/:id`
   - `/ditjenbun/rekomtek/approval/:id`
   - `/bpdp/ceki/:id`
   - `/bpdp/approval/:id`
   - `/bpdp/sk-dirut/:id`
2. Confirm the timeline track renders identically across all 5 views.
