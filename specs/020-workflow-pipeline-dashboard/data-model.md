# Data Model: Dashboard Workflow Pipeline

## Types & Interfaces

```typescript
export interface PipelineStageMetric {
  pekebunCount: number;      // Jumlah Pekebun
  luasLahanHa: number;       // Luas Lahan (Ha)
  proposalCount: number;     // Jumlah Proposal
}

export interface PipelineStageConfig {
  id: string;                // Unik identifier (e.g. 'PENGAJUAN_PROPOSAL')
  labelKey: string;          // Key untuk lokalisasi nama tahapan
  targetUrl: string;         // Halaman tujuan ketika diklik
  rolesWithWriteAccess: string[]; // Role yang memiliki hak edit/tindakan di step ini
}

export interface PipelineStageState extends PipelineStageConfig {
  metrics: PipelineStageMetric;
  isActiveForRole: boolean;  // Menandakan apakah step ini relevan secara langsung dengan role aktif
}
```

## Mock Data Structure

Since there are no backend aggregation APIs yet (Mockup-First Standard - Constitution XIII), the metrics for the 10 stages will be defined as responsive mock stores mapped per role scope (e.g. DINAS_KAB vs DINAS_PROV vs BPDPKS).

### Mapped Stages Configuration

```typescript
export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: '1', labelKey: 'pipeline.pengajuanProposal', targetUrl: '/pengusulan/pengajuan-proposal', rolesWithWriteAccess: ['PEMOHON'] },
  { id: '2', labelKey: 'pipeline.verifikasiKab', targetUrl: '/dinas/verifikasi/kabupaten', rolesWithWriteAccess: ['DINAS_KAB'] },
  { id: '3', labelKey: 'pipeline.approvalSkCpcl', targetUrl: '/dinas/verifikasi/kabupaten', rolesWithWriteAccess: ['DINAS_KAB'] },
  { id: '4', labelKey: 'pipeline.asistensiProv', targetUrl: '/dinas/verifikasi/provinsi', rolesWithWriteAccess: ['DINAS_PROV'] },
  { id: '5', labelKey: 'pipeline.asistensiDitjenbun', targetUrl: '/ditjenbun/rekomtek', rolesWithWriteAccess: ['DITJENBUN_VERIFIKATOR'] },
  { id: '6', labelKey: 'pipeline.penerbitanRekomtek', targetUrl: '/ditjenbun/rekomtek', rolesWithWriteAccess: ['DITJENBUN_VERIFIKATOR'] },
  { id: '7', labelKey: 'pipeline.approvalRekomtek', targetUrl: '/ditjenbun/rekomtek', rolesWithWriteAccess: ['DITJENBUN_APPROVAL'] },
  { id: '8', labelKey: 'pipeline.penelitianBpdp', targetUrl: '/bpdp/antrean', rolesWithWriteAccess: ['BPDP_VERIFIKATOR'] },
  { id: '9', labelKey: 'pipeline.approvalBpdp', targetUrl: '/bpdp/antrean', rolesWithWriteAccess: ['BPDP_APPROVAL'] },
  { id: '10', labelKey: 'pipeline.penerbitanSkDirut', targetUrl: '/bpdp/antrean', rolesWithWriteAccess: ['BPDP_VERIFIKATOR'] }
];
```
