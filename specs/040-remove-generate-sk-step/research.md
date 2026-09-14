# Research & Technical Decisions: Remove Generate SK Step

## Findings & Audit

We audited the SK finalization view `FinalisasiSkDirutView.vue` and how `draftUrl` is handled.

1. **Current Component Code**:
   - `FinalisasiSkDirutView.vue` checks `activeUsulan.skDirut?.draftUrl` to render the finalization form.
   - A button "Generate Draf SK Dirut" calls `handleGenerateSk` which triggers `store.generateSkDirut(usulanId)`. This action updates the client store's active usulan and sets `draftUrl` to `/files/draft-sk-${id}.pdf`.

2. **Refactoring Steps**:
   - Remove the "1. Generate Rancangan SK Dirut" step from the view.
   - Automatically initialize the `draftUrl` on mount in `FinalisasiSkDirutView.vue` if it is missing (by calling `store.generateSkDirut(usulanId)` directly or setting it locally/on store fetch).
   - Display the form directly on mount.

## Decisions

### Decision 1: Direct Form Access & Auto-Initialization
- **Choice**: Automatically initialize `skDirut` draft URL on load if not present.
- **Rationale**: Ensures the form is visible on load and the "Download Draft" link works correctly without requiring a manual click of a "Generate SK" button.
- **Alternatives Considered**: Fetch draft URL from backend (skipped, as this is a frontend mock-driven view).

### Decision 2: Remove Generate SK Step from Template
- **Choice**: Delete the "Step 1: Generate SK" HTML container.
- **Rationale**: Directly aligns with user requirement to remove the manual step.
