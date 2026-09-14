# Contract: SPKA Numbering Utility API

## Function Contract: `generateSpkaNomor`

### Request Parameters

```typescript
export interface GenerateSpkaOptions {
  bantuanTypeOrPackage: string; // Paket Sarpras or Enum key
  date?: Date | string;        // Optional date override (default: new Date())
  sequenceNumber?: number;     // Sequence number in month (default: auto/incremental)
}
```

### Return Value

```typescript
export interface GenerateSpkaResult {
  nomorUsulan: string;         // e.g. 'SPKA106260001'
  kodePaket: string;           // '1'
  bulan: string;               // '06'
  tahun: string;               // '26'
  sequenceNumber: number;      // 1
  formattedWithSeparator: string; // 'SPKA-1-06-26-0001'
}
```

### Behavior & Rules

1. `bantuanTypeOrPackage` is mapped to package code `1` through `9`.
2. Month `MM` is formatted as 2-digit zero-padded string (`01` - `12`).
3. Year `YY` is formatted as 2-digit string (`26` for 2026).
4. Sequence number is formatted as 4-digit zero-padded string (`0001` - `9999`).
5. On month transition, sequence number resets to `1` (`0001`).
