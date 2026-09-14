# Data Model: Modul Pengusulan Sarpras BPDP

## Status Enums

```typescript
export enum PengajuanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVISION_ADMIN = 'REVISION_ADMIN',
  VERIFIED_ADMIN = 'VERIFIED_ADMIN',
  VERIFIED_FIELD = 'VERIFIED_FIELD',
  REKOMTEK_KAB_ISSUED = 'REKOMTEK_KAB_ISSUED',
  VALIDATED_PROV = 'VALIDATED_PROV',
  SK_DITJENBUN_ISSUED = 'SK_DITJENBUN_ISSUED',
  PKS_BPDP_SIGNED = 'PKS_BPDP_SIGNED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum JenisSarpras {
  BENIH_PUPUK = 'BENIH_PUPUK',
  ALSINTAN = 'ALSINTAN',
  JALAN_PERKEBUNAN = 'JALAN_PERKEBUNAN',
  DRAINASE = 'DRAINASE',
  UPH_KAKAO = 'UPH_KAKAO'
}

export enum UserRole {
  PEMOHON = 'PEMOHON',
  DINAS_KAB = 'DINAS_KAB',
  DINAS_PROV = 'DINAS_PROV',
  DITJENBUN = 'DITJENBUN',
  BPDPKS = 'BPDPKS'
}
```

## Core Entities & Interfaces

### 1. `LembagaPengusul`
```typescript
export interface LembagaPengusul {
  id: string;
  namaLembaga: string;
  jenisLembaga: 'KOPERASI' | 'POKTAN' | 'GAPOKTAN';
  nomorAkta: string;
  nikKetua: string;
  namaKetua: string;
  telepon: string;
  alamatLengkap: string;
  kabupatenKode: string;
  provinsiKode: string;
  namaBank: string;
  nomorRekening: string;
  namaPemilikRekening: string;
}
```

### 2. `DataCPCL` (Calon Petani Calon Lokasi)
```typescript
export interface DataCPCL {
  id: string;
  pengajuanId: string;
  namaPekebun: string;
  nik: string;
  nomorKK: string;
  luasLahanHektar: number;
  jenisHakLahan: 'SHM' | 'SKT' | 'STDB';
  nomorSuratLahan: string;
  koordinatPoligon: string; // GeoJSON / LatLng Array String
}
```

### 3. `DokumenPersyaratan`
```typescript
export interface DokumenPersyaratan {
  id: string;
  pengajuanId: string;
  tipeDokumen: 'KTP' | 'KK' | 'STDB' | 'PROPOSAL' | 'AKTA_LEMBAGA' | 'BAHV' | 'REKOMTEK' | 'SK_PENETAPAN' | 'PKS' | 'BAST' | 'LPJ';
  namaFile: string;
  urlFile: string;
  ukuranBytes: number;
  uploadedAt: string;
  isValid: boolean;
  catatanRevisi?: string;
}
```

### 4. `PengajuanSarpras` (Header)
```typescript
export interface PengajuanSarpras {
  id: string;
  nomorResi: string;
  lembagaId: string;
  lembaga: LembagaPengusul;
  jenisSarpras: JenisSarpras;
  detailUsulan: string;
  totalAnggaranPengajuan: number;
  currentStatus: PengajuanStatus;
  catatanDinas?: string;
  daftarCPCL: DataCPCL[];
  dokumen: DokumenPersyaratan[];
  createdAt: string;
  updatedAt: string;
}
```

### 5. `WorkflowHistoryLog`
```typescript
export interface WorkflowHistoryLog {
  id: string;
  pengajuanId: string;
  statusFrom: PengajuanStatus;
  statusTo: PengajuanStatus;
  actorRole: UserRole;
  actorName: string;
  catatan?: string;
  timestamp: string;
}
```
