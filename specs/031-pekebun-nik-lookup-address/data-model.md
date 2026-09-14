# Data Model: NIK Lookup Updates Alamat and Kodepos

This feature extends mock Dukcapil records and maps them directly to UI form models.

## Entities Modified

### DukcapilResult (Type Interface)
Extended `DukcapilResult` in `src/types/pekebun.ts` to include optional properties:
```typescript
export interface DukcapilResult {
  // ... existing fields
  alamat?: string;
  kodepos?: string;
}
```

### MOCK_DUKCAPIL (Store Config)
Appended mock address strings and zip codes matching each NIK profile in `src/stores/pekebun.ts`.
```typescript
const MOCK_DUKCAPIL: Record<string, DukcapilResult> = {
  '7301021508850001': {
    // ... existing fields
    alamat: 'Jl. Poros Masamba No. 45, Desa Bone',
    kodepos: '92961',
  },
  // ...
};
```
