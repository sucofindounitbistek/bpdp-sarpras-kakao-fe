# Interface Contract: Storage Area Verification Notes

## Contract Overview

This document specifies the contract between `StepVerifikasiPekebunDanDokumenProposal.vue`, `useVerifikasiKabDraftStore`, and `usePengusulanStore`.

## Rejection Summary Contract

When rejecting a proposal with storage area feedback, `submitRejection()` produces formatted notes:

```text
Gudang (Alamat): Alamat tidak sesuai dengan dokumen legalitas lokasi.
Gudang (Koordinat): Koordinat berada di luar wilayah kabupaten.
Gudang (Foto Tampak Depan): Foto buram dan tidak memperlihatkan bangunan gudang.
Gudang (Foto Tampak Dalam): Kapasitas ruang simpan tidak mencukupi untuk alokasi pupuk.
```

## Storage Keys & Labels Mapping Contract

```typescript
const storageAreaLabelMap: Record<string, string> = {
  gudangAlamat: 'Gudang (Alamat)',
  gudangKoordinat: 'Gudang (Koordinat)',
  fotoTampakDepan: 'Gudang (Foto Tampak Depan)',
  fotoTampakDalam: 'Gudang (Foto Tampak Dalam)',
};
```
