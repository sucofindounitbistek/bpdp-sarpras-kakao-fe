# Data Model & Check Logic: Disable Selected Lahan

## Active Proposal Check Logic

We define a helper function `getLahanActiveProposal(lahan: LahanPekebun)` in `StepPilihPekebunLahan.vue`:

```typescript
const pengusulanStore = usePengusulanStore();

function getLahanActiveProposal(lahan: any) {
  if (!lahan?.nomorLegalitas) return null;
  
  return pengusulanStore.listPengajuan.find((proposal) => {
    // Exclude rejected proposals
    if (proposal.currentStatus === 'REJECTED') return false;
    
    // Check if any CPCL matches the land certificate number
    return (proposal.daftarCPCL || []).some(
      (cpcl) => cpcl.nomorSuratLahan.trim().toLowerCase() === lahan.nomorLegalitas.trim().toLowerCase()
    );
  });
}
```

## Pekebun Selectability Logic

A pekebun is considered fully unavailable if all of their lands are associated with active proposals:

```typescript
function isPekebunDisabled(pekebun: any) {
  const lands = getPekebunLands(pekebun);
  if (lands.length === 0) return true;
  return lands.every((l) => getLahanActiveProposal(l) !== null);
}
```
