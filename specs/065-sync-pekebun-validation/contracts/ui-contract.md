# UI Contract: Pekebun Document Validation Synchronization

## Store Method Contracts

### `verifikasiKabDraftStore.syncFarmerDocumentValidations(validations, pekebuns)`

**Input**:
- `validations`: Array of `FarmerDocumentValidationItem` returned from backend API (`/validasi-dokumen-pekebun?pengajuan_id=:id`)
- `pekebuns`: Array of CPCL objects (e.g. `pengajuan.daftarCPCL`)

**Behavior**:
1. For each `val` in `validations`:
   - Find matching `cpcl` item where `val.dokumen_pekebun_id` exists in `cpcl.documents`, `cpcl.dokumen`, `cpcl.dokumen_pekebun`, or via `pekebunStore.listPekebun` lookup by `nik`.
   - Compute `mainKey` = `doc-${cpcl.id}-${val.dokumen_pekebun_id}`.
   - Set `verifications[mainKey]` = `{ status: val.is_valid ? 'APPROVED' : 'REJECTED', notes: val.notes || '' }`.
   - If `val.details` contains items:
     - For each detail: set `subKey` = `doc-${cpcl.id}-${val.dokumen_pekebun_id}-${detail.field_name}` to `APPROVED` or `REJECTED`.
   - If `val.is_valid` is `true` and `val.details` is empty/incomplete:
     - Auto-set default fields (`namaLengkap`, `nik` for KTP; `nomorKK` for KK) to `APPROVED`.

## Component Responsibilities

### `DetailVerifikasiKabView.vue`
- On mount: Fetch proposal details, farmer document validations, land document validations, and proposal document validations in parallel.
- Extract CPCL array using fallback `proposalRes.daftarCPCL || proposalRes.cpcl || proposalRes.pekebuns || []`.
- Call `verifikasiStore.syncFarmerDocumentValidations(farmerValidationList, pekebuns)`.

### `StepVerifikasiPekebunDanDokumenProposal.vue`
- Reactively compute `getPekebunStatus(cpclId, docs)` using `verifikasiStore.getVerification(key)`.
- Render "Sesuai" green badge when all keys are `APPROVED`, "Tidak Sesuai" red badge when any key is `REJECTED`, and "Belum Diverifikasi" gray badge when `PENDING`.

### `VerifikasiPekebunDetailView.vue`
- Ensure store synchronization occurs on load so detail view toggles and field status buttons reflect backend state.
