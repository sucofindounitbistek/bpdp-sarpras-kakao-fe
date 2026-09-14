# Data Model & Interfaces: Standarisasi UI Setuju / Tolak Approval

**Feature Branch**: `014-setuju-tolak-approval-ui`  
**Date**: 2026-08-05  

## Component Interfaces

### 1. `ApprovalItemState` (`ApprovalBpdpView.vue` & `ApprovalDitjenbunView.vue`)

Local reactive state for approval document items:

```typescript
export interface ApprovalItemState {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  notes: string;
}
```

---

### 2. Standardized Button Styling Rules

```typescript
const setujuButtonClasses = (isActive: boolean) => [
  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
  isActive
    ? 'bg-emerald-600 text-white shadow-sm'
    : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
];

const tolakButtonClasses = (isActive: boolean) => [
  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
  isActive
    ? 'bg-rose-600 text-white shadow-sm'
    : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
];
```

---

### 3. `VerifikasiDokumenItem` Extended Props (`src/components/rekomtek/VerifikasiDokumenItem.vue`)

```typescript
export interface VerifikasiDokumenItemProps {
  title: string;
  subtitle?: string;
  badgeType?: 'emerald' | 'blue' | 'amber' | 'slate';
  valid: boolean | null;
  note: string;
  fileUrl?: string;
  downloadLabel?: string;
  readonly?: boolean;
  buttonVariant?: 'icon' | 'text'; // 'text' renders "✓ Setuju" & "✕ Tolak" buttons
}
```
