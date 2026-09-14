# Specification: Align Proposal Status List with Detail Steps

## Background & Problem Statement
Currently, in `TrackingPengusulanView.vue` (the Pekebun's proposal tracking view), the status column displays raw workflow status labels (e.g., "Diajukan", "Terverifikasi Administrasi", "Terverifikasi Lapangan").
However, the detail view uses a simplified 5-step stepper to represent proposal progress:
1. **Submit Proposal**
2. **Verifikasi Dinas Kab/Kota**
3. **Asistensi Dinas Provinsi**
4. **Penerbitan Rekomtek Ditjenbun**
5. **Penerbitan SK Dirut BPDP**

This leads to a mismatch between the status shown in the list view vs. the active step shown in the detail page.

## Proposed Alignment
We will update the status badge rendering inside `TrackingPengusulanView.vue` list view and the detail view header to align exactly with the step labels defined in `LOCALIZATION.workflowSteps`.

### Mapping Rules
| Raw status (`currentStatus`) | Mapped Status Label | Badge Variant | Stepper Step Mapping |
|-------------------|---------------------|---------------|----------------------|
| `DRAFT` | "Draft" | `secondary` | Draft / Not Submitted |
| `REVISION_ADMIN` | "Perlu Perbaikan" | `warning` | Step 1 (Submit Proposal - Warning) |
| `SUBMITTED`, `VERIFIED_ADMIN`, `VERIFIED_FIELD` | "Verifikasi Dinas Kab/Kota" | `info` | Step 2 (Verifikasi Dinas Kab/Kota - Active) |
| `REKOMTEK_KAB_ISSUED` | "Asistensi Dinas Provinsi" | `info` | Step 3 (Asistensi Dinas Provinsi - Active) |
| `VALIDATED_PROV` | "Penerbitan Rekomtek Ditjenbun" | `info` | Step 4 (Penerbitan Rekomtek - Active) |
| `SK_DITJENBUN_ISSUED` | "Penerbitan SK Dirut BPDP" | `info` | Step 5 (Penerbitan SK Dirut - Active) |
| `PKS_BPDP_SIGNED`, `DISBURSED`, `COMPLETED` | "Selesai" | `success` | Completed |
| `REJECTED` | "Ditolak" | `danger` | Rejected / Failed |

## Functional Requirements
- **FR-001**: Align the status column in the tracking list view with the step labels defined in `LOCALIZATION.workflowSteps`.
- **FR-002**: Align the status badge colors in the tracking list view to reflect progress context (Info for ongoing stages, Warning for revisions, Danger for rejections, Success for finalized steps).
- **FR-003**: Ensure the detail header proposal badge uses the same aligned label.
