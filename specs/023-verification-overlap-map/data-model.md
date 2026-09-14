# Data Model: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Feature**: 023-verification-overlap-map
**Date**: 2026-08-06

## Entities

### VerificationOverlapMap (Component Props)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activeProposalId` | `string` | Yes | ID proposal yang sedang diverifikasi |
| `activeProposalName` | `string` | Yes | Nama lembaga/kelompok tani proposal aktif |
| `activeProposalNumber` | `string` | Yes | Nomor proposal aktif |
| `activePolygons` | `PolygonData[]` | Yes | Array poligon lahan proposal aktif (bisa multiple lahan) |
| `otherProposals` | `OtherProposalData[]` | Yes | Array proposal lain dengan data poligon |

### PolygonData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coordinates` | `Array<[number, number]>` | Yes | Array koordinat [lat, lng] dari poligon |
| `label` | `string` | No | Label lahan (mis. "Lahan 1", "Lahan Utama") |

### OtherProposalData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `proposalId` | `string` | Yes | ID proposal |
| `proposalNumber` | `string` | Yes | Nomor proposal |
| `proposalName` | `string` | Yes | Nama lembaga/kelompok tani |
| `polygons` | `PolygonData[]` | Yes | Array poligon lahan proposal ini |
| `distance` | `number` | No | Jarak dari proposal aktif (km) |

### OverlapInfo (Computed)

| Field | Type | Description |
|-------|------|-------------|
| `proposalId` | `string` | ID proposal yang tumpang tindih |
| `proposalNumber` | `string` | Nomor proposal |
| `proposalName` | `string` | Nama lembaga |
| `overlapArea` | `number` | Luas area irisan dalam hektar |
| `overlapPercentage` | `number` | Persentase overlap terhadap luas proposal aktif |

### Localization Additions

```typescript
// src/config/localization.ts - new section
verificationMap: {
  sectionTitle: 'Peta Global Verifikasi',
  toggleOpen: 'Buka Peta',
  toggleClose: 'Tutup Peta',
  legendActive: 'Proposal Sedang Diverifikasi',
  legendOther: 'Proposal Lain',
  noPolygon: 'Proposal ini belum memiliki data poligon lahan',
  noOtherProposals: 'Tidak ada proposal lain di area sekitar',
  overlapTitle: 'Tumpang Tindih Terdeteksi',
  overlapCount: '{count} proposal tumpang tindih',
  overlapArea: 'Luas Irisan',
  overlapPercentage: 'Persentase',
  satelliteLabel: 'Peta Satelit',
}
```

## State Transitions

```
[Verification page loads]
        |
        v
[Fetch proposal data from store]
        |
        v
[Parse active proposal polygons]
        |
   +----+----+
   |         |
[No polygon]  [Has polygon]
   |              |
   v              v
[Show message  [Compute centroid,
 "no polygon"]  fetch other proposals
   |            within 50km radius]
   |              |
   v              v
[Map renders   [Map renders with
 with default   blue polygon(s)]
 Indonesia     |
 view]         v
           [Compute overlaps
            using turf.intersect]
               |
          +----+----+
          |         |
     [No overlap]  [Has overlap]
          |              |
          v              v
     [Show legend    [Show legend +
      only]           overlap list]
```

## Data Flow

```
useRekomtekStore().listUsulan
  → filter by polygon data existence
  → filter by geographic radius (50km from active centroid)
  → parse koordinatPoligon string → PolygonData[]
  → pass to VerificationOverlapMap as otherProposals

useRekomtekStore().activeUsulan
  → activeUsulan.pekebunList[].lahan.koordinatPoligon
  → parse → PolygonData[]
  → pass to VerificationOverlapMap as activePolygons

VerificationOverlapMap
  → render L.polygon for each polygon
  → compute turf.intersect between active and each other
  → render overlap list
  → render legend control
```