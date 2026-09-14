# Data Model: Direct Multi-Tier Pushback for Published SK Dirut Proposals

**Feature**: `066-direct-multi-tier-pushback-sk-dirut`

## Entities & Interfaces

### 1. DocumentValidationItemState
```typescript
export interface DocumentValidationItemState {
  docId?: number;
  valid: boolean | null; // null: neutral (valid default in inspect mode), false: rejected
  note: string;
  url?: string;
  fileName?: string;
  documentType: string;
  ownerTier: 'KABUPATEN' | 'PROVINSI' | 'DITJENBUN_VERIFIKATOR' | 'BPDP_VERIFIKATOR';
}
```

### 2. PushbackTargetOption
```typescript
export interface PushbackTargetOption {
  id: 'KABUPATEN' | 'PROVINSI' | 'DITJENBUN_VERIFIKATOR' | 'BPDP_VERIFIKATOR';
  label: string;
  subLabel: string;
  targetStatus: 'REV_FROM_PROV' | 'REV_FROM_DITJEN_VERIF' | 'REV_FROM_DITJEN_APPR' | 'REV_FROM_BPDP_APPR';
  isEnabled: boolean;
  disabledReason?: string;
}
```

### 3. State Transition Matrix
```
Current State: SK_DIRUT_PUBLISHED / SELESAI
Available Transitions on Pushback:
├── Target: KABUPATEN ──────────────► Next Status: REV_FROM_PROV
├── Target: PROVINSI ───────────────► Next Status: REV_FROM_DITJEN_VERIF
├── Target: DITJENBUN_VERIFIKATOR ──► Next Status: REV_FROM_DITJEN_APPR
└── Target: BPDP_VERIFIKATOR ───────► Next Status: REV_FROM_BPDP_APPR
```
