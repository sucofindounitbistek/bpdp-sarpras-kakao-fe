# UI Contract: Standarisasi UI Setuju / Tolak Approval

**Feature Branch**: `014-setuju-tolak-approval-ui`  
**Date**: 2026-08-05  

## Approval Screen Contract (`ApprovalBpdpView.vue` & `ApprovalDitjenbunView.vue`)

### Card Component Structure
- **Section Title**: "Hasil Asistensi & Dokumen Pendukung" (Ditjenbun) / "Hasil Asistensi & Laporan Kelayakan BPDP" (BPDP)
- **Header**: Icon (Document SVG in Indigo box), Document Title, Subtitle, and Right-aligned `Setuju` / `Tolak` toggle button group.
- **Body**: Document metadata (Nomor Rekomtek / Nomor Usulan, Jenis Bantuan), Inline PDF Preview trigger button ("👁 Pratinjau ... Bertanda Tangan"), and Conditional Rejection Textarea ("Catatan Penolakan").

---

## Interactive Button Contract

| Action | Active Class | Inactive Class | Icon |
|---|---|---|---|
| **Setuju** | `bg-emerald-600 text-white shadow-sm` | `text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300` | `<Check class="w-3.5 h-3.5" />` |
| **Tolak** | `bg-rose-600 text-white shadow-sm` | `text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300` | `<X class="w-3.5 h-3.5" />` |
