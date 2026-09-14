# Phase 1: Data Model - SPKA Numbering Format

## Entities & Interfaces

### 1. `SpkaNomorConfig` Interface

Representasi komponen pembentuk nomor usulan SPKA:

```typescript
export interface SpkaNomorConfig {
  prefix: string;            // Default: 'SPKA'
  kodePaket: string;         // '1' s/d '9'
  bulan: string;             // '01' s/d '12' (2-digit MM)
  tahun: string;             // '26' (2-digit YY)
  sequence: number;          // 1 s/d 9999 (monthly sequence)
  formattedNomor: string;    // Hasil akhir: e.g. 'SPKA106260001'
}
```

### 2. Package Code Mapping Table

| Kode (1-9) | Enum / Sarpras Package Identifier | Description Wording |
|---|---|---|
| `1` | `EKSTENSIFIKASI` / `BENIH_PUPUK` | Ekstensifikasi (Benih, Pupuk, Pestisida) |
| `2` | `INTENSIFIKASI` | Intensifikasi (Pupuk dan Pestisida) |
| `3` | `ALAT_PASCAPANEN` | Alat pascapanen |
| `4` | `UPH` / `UPH_KAKAO` | Unit Pengolahan Hasil |
| `5` | `JALAN_PERKEBUNAN` / `JALAN_KEBUN` | Jalan kebun dan jalan akses ke jalan umum dan/atau pelabuhan |
| `6` | `TRUK` / `ALAT_ANGKUT_LANGSIR` / `GEROBAK_BERMOTOR` | Alat transportasi |
| `7` | `ALSINTAN` / `MESIN_PERTANIAN` | Mesin pertanian |
| `8` | `DRAINASE` | Infrastruktur pasar |
| `9` | `VERIFIKASI_TEKNIS` | Verifikasi atau penelusuran teknis |

### 3. Monthly Sequence Rule

- Key: `year-month` (e.g. `'2606'`)
- Counter: Inkremental per proposal baru di bulan yang sama.
- Reset: Jika proposal dibuat pada bulan baru (`year-month` berbeda), counter kembali ke `1` (menghasilkan `'0001'`).
