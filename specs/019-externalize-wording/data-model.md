# Data Model: Centralize Localization Wording

## Localization Schema (Client-side Config)

File `src/config/localization.ts` akan mengekspor struktur data konfigurasi statis berikut:

```typescript
export const LOCALIZATION = {
  workflowSteps: {
    submitPemohon: string;
    rekomtekKab: string;
    asistensiProv: string;
    rekomtekDitjenbun: string;
    skDirutBpdp: string;
  },
  stepStatus: {
    active: string;
    warning: string;
    error: string;
    completed: string;
  },
  kabQueueStatus: {
    submitted: string;
    onProgress: string;
    rekomtekKabIssued: string;
    needToFix: string;
  },
  proposalStatus: Record<string, string>;
  jenisSarpras: Record<string, string>;
} as const;
```

Penggunaan modifier `as const` memicu compiler TypeScript untuk memperlakukan semua properti di dalam objek ini sebagai type-literal readonly yang ketat.
Semua rujukan import akan dipaksa sesuai dengan schema readonly ini.
