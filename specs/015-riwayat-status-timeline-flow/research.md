# Phase 0 Research & Technical Decisions: Penyambungan Alur Riwayat Status & Catatan Timeline

**Feature Branch**: `015-riwayat-status-timeline-flow`  
**Date**: 2026-08-05  

## Research & Decision Log

### Decision 1: Item-Level Connecting Track Line Architecture

- **Decision**: Refactor `LogStatusUsulan.vue` timeline markup to use an item-level relative track line element (`<div class="absolute left-[19px] top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" v-if="index !== logs.length - 1" />`) instead of relying on a global container `border-l`.
- **Rationale**: 
  - A global container `border-l` extends infinitely down past the last item or requires exact padding hacks that break when note textareas change height dynamically.
  - An item-level connecting line (`top-6 bottom-0`) positioned relative to each timeline item explicitly draws a line from the current item's dot down to the top of the next item's dot.
  - Using `v-if="index !== logs.length - 1"` guarantees that the line is automatically omitted on the last item, eliminating hanging vertical lines.

---

### Decision 2: Node Dot Styling & Color Coding

- **Decision**: Style the node dot with an absolute container centered at `left-3.5` with a ring or colored bg:
  - Approval / Progress transitions: `bg-[#066C2A] text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40`
  - Rejection / Pushback transitions: `bg-amber-500 text-white ring-4 ring-amber-50 dark:ring-amber-950/40`
- **Rationale**: Provides clear visual affordances distinguishing forward progress vs returns/revisions.
