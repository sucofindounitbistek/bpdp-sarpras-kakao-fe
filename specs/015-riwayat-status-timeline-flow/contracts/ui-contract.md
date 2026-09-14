# UI Contract: Penyambungan Alur Riwayat Status & Catatan Timeline

**Feature Branch**: `015-riwayat-status-timeline-flow`  
**Date**: 2026-08-05  

## Timeline Component Contract (`LogStatusUsulan.vue`)

- **Component Name**: `LogStatusUsulan.vue`
- **Location**: `src/components/rekomtek/LogStatusUsulan.vue`
- **Props**: `logs?: StatusLog[]`
- **Visual Behavior**:
  - Continuous vertical connecting track line between index `0` and index `N-1`.
  - Omitted connecting line after index `N-1` (last item).
  - Green theme for forward progress logs, Amber theme for return/revising logs.
  - Full Dark Mode compatibility.
