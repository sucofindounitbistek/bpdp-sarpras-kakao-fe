# Component Contract: VerificationOverlapMap

**Feature**: 023-verification-overlap-map
**Date**: 2026-08-06

## Interface

```typescript
interface PolygonData {
  coordinates: Array<[number, number]>;
  label?: string;
}

interface OtherProposalData {
  proposalId: string;
  proposalNumber: string;
  proposalName: string;
  polygons: PolygonData[];
  distance?: number;
}

interface VerificationOverlapMapProps {
  activeProposalId: string;
  activeProposalName: string;
  activeProposalNumber: string;
  activePolygons: PolygonData[];
  otherProposals: OtherProposalData[];
}
```

## Usage Contract

```vue
<VerificationOverlapMap
  :active-proposal-id="usulanId"
  :active-proposal-name="activeUsulan.namaKelompokTani"
  :active-proposal-number="activeUsulan.nomorUsulan"
  :active-polygons="activePolygons"
  :other-proposals="nearbyProposals"
/>
```

## Behavior Contract

| Scenario | Expected Behavior |
|----------|-------------------|
| Component mounts | Initialize Leaflet map with satellite tiles, parse activePolygons |
| Active has polygons | Render blue polygons (`#2563EB`, opacity 0.3), fit bounds |
| Active has no polygons | Show default Indonesia view, display "no polygon" message |
| Other proposals exist | Render red polygons (`#DC2626`, opacity 0.2), bind popups |
| No other proposals | Only blue polygons visible, legend shows "no other proposals" |
| Click red polygon | Popup with proposal number + name |
| Overlap detected | Render overlap list below map with proposal info + area |
| Mobile viewport | Map height auto-adjusts, touch gesture support |
| Dark mode | Map tiles unaffected, legend + list adapt to dark theme |
| Section collapse | Map destroyed on collapse, re-initialized on expand (cleanup) |

## Styling Contract

- Map height: `h-[350px]` on desktop, `h-[280px]` on mobile
- Blue polygon: `color: '#2563EB'`, `fillColor: '#2563EB'`, `fillOpacity: 0.3`, `weight: 2`
- Red polygon: `color: '#DC2626'`, `fillColor: '#DC2626'`, `fillOpacity: 0.2`, `weight: 2`
- Active polygon: `weight: 3` (slightly thicker for emphasis)
- Legend: positioned `bottomright`, semi-transparent white background
- Collapsible header: same card style as existing verification cards
- Loading state: skeleton placeholder with `h-[350px]`

## Integration Points

| Halaman | Lokasi | Keterangan |
|---------|--------|-----------|
| `CekiDitjenbunView.vue` | Di bawah validation card, sebelum LogStatusUsulan | Collapsible section |
| `CekiBpdpView.vue` | Di bawah validation card, sebelum LogStatusUsulan | Collapsible section |
| `StepVerifikasiPekebunDanDokumenProposal.vue` | Di bawah pekebun cards | Collapsible section |
| `StepVerifikasiPekebun.vue` | Di bawah pekebun cards | Collapsible section |
| `DetailVerifikasiKabView.vue` | Di dalam wizard step content | Per-step placement |
| `DetailVerifikasiProvinsiView.vue` | Di dalam wizard step content | Per-step placement |