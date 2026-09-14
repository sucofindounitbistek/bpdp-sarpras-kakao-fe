# Specification: Global Proposal Status Alignment

## Background & Problem Statement
Currently, proposal status display is fragmented. The tracking list, internal verifier queues, and stepper in the details page display different names for the same status values.
To create a unified, consistent experience across all views and all user roles (Pemohon, Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS), we will align the global status mapping inside the localization configuration.

## Proposed Alignment
We will update `LOCALIZATION.proposalStatus` in `src/config/localization.ts` to map statuses directly to the unified workflow step names.

### Updated Localization Mapping
| Status Key | Value |
|------------|-------|
| `DRAFT` | 'Draft' |
| `SUBMITTED` | 'Verifikasi Dinas Kab/Kota' |
| `REVISION_ADMIN` | 'Perlu Perbaikan' |
| `VERIFIED_ADMIN` | 'Verifikasi Dinas Kab/Kota' |
| `VERIFIED_FIELD` | 'Verifikasi Dinas Kab/Kota' |
| `REKOMTEK_KAB_ISSUED` | 'Asistensi Dinas Provinsi' |
| `VALIDATED_PROV` | 'Penerbitan Rekomtek Ditjenbun' |
| `SK_DITJENBUN_ISSUED` | 'Penerbitan SK Dirut BPDP' |
| `PKS_BPDP_SIGNED` | 'Selesai' |
| `DISBURSED` | 'Selesai' |
| `COMPLETED` | 'Selesai' |
| `REJECTED` | 'Ditolak' |

## Functional Requirements
- **FR-001**: Centralize aligned status labels in `LOCALIZATION.proposalStatus` inside `src/config/localization.ts`.
- **FR-002**: Revert any local mapping workarounds in view files (e.g. inside `TrackingPengusulanView.vue`) to use the global `getStatusLabel` function.
- **FR-003**: Ensure all pages display identical aligned status text for equivalent status keys.
- **FR-004**: Clean up the custom override status label mapping inside `QueueVerifikasiKabView.vue` so it uses the centralized `getStatusLabel` from `@/types/pengusulan.ts`.
