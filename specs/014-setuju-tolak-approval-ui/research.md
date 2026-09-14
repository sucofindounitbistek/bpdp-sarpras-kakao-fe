# Phase 0 Research & Technical Decisions: Standarisasi UI Setuju / Tolak Approval

**Feature Branch**: `014-setuju-tolak-approval-ui`  
**Date**: 2026-08-05  

## Research & Decision Log

### Decision 1: Aligning `ApprovalBpdpView.vue` with `ApprovalDitjenbunView.vue`

- **Decision**: Update `ApprovalBpdpView.vue` to adopt the exact card structure, button layout, and document preview pattern from `ApprovalDitjenbunView.vue`.
- **Rationale**: Direct response to user prompt & screenshot. `ApprovalDitjenbunView.vue` is the reference design for approval screens in the app. Using identical CSS classes (`bg-emerald-600 text-white shadow-sm` for active Setuju, `bg-rose-600 text-white shadow-sm` for active Tolak) ensures 100% visual fidelity across both roles.
- **Alternatives Considered**: 
  - *Keep `ChecklistDokumen` component in `ApprovalBpdpView`*: Rejected because it uses simple checkboxes without `Setuju` / `Tolak` toggle buttons or inline PDF preview.

---

### Decision 2: Enhancing `VerifikasiDokumenItem.vue` with Text Button Labels

- **Decision**: Add a prop or variant to `VerifikasiDokumenItem.vue` allowing `✓ Setuju` and `✕ Tolak` text buttons instead of icon-only buttons.
- **Rationale**: Enables both verifikator views (`CekiBpdpView.vue` & `CekiDitjenbunView.vue`) to optionally display clear text labels matching the approval UI standards, improving accessibility and visual clarity.

---

### Decision 3: Standardizing `DocumentPreviewModal.vue` Integration

- **Decision**: Ensure both approval views render `DocumentPreviewModal` for PDF preview of signed Rekomtek or Laporan Kelayakan files.
- **Rationale**: Standardizes PDF inspection inside a modal overlay without forcing file downloads.
