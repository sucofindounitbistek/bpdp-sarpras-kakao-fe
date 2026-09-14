# Technical Research: Direct Multi-Tier Pushback for Published SK Dirut Proposals

**Feature**: `066-direct-multi-tier-pushback-sk-dirut`

## 1. Document Mapping & Role Ownership Taxonomy

| Document Type Code | Display Title | Owner Role / Tier | Target Status on Pushback |
|---|---|---|---|
| `RAB_FINAL` | Rencana Anggaran Biaya Final | Dinas Kabupaten/Kota | `REV_FROM_PROV` |
| `SK_CPCL` | SK Penetapan CPCL | Dinas Kabupaten/Kota | `REV_FROM_PROV` |
| `BA_VERIFIKASI` | Berita Acara Verifikasi Dokumen | Dinas Kabupaten/Kota | `REV_FROM_PROV` |
| `BA_VERIFIKASI_LAPANGAN` | Berita Acara Verifikasi Lapangan | Dinas Kabupaten/Kota | `REV_FROM_PROV` |
| `SURAT_PENGANTAR_SK_CPCL` | Surat Pengantar SK CPCL | Dinas Provinsi | `REV_FROM_DITJEN_VERIF` |
| `REKOMTEK` | Rekomendasi Teknis | Ditjenbun Verifikator | `REV_FROM_DITJEN_APPR` |
| `KEPUTUSAN_KELAYAKAN` | Laporan Keputusan Kelayakan | BPDP Verifikator | `REV_FROM_BPDP_APPR` |

## 2. Decision on Multi-Tier Pushback Guardrails

- **Decision**: Render a dedicated radio group inside a Pushback Modal with 4 options. Dynamically compute the `disabled` property for each option based on whether any document belonging to that tier has `is_valid === false`.
- **Rationale**: Prevents human error (e.g. accidentally returning to Dinas Provinsi when only Kabupaten documents were rejected).
- **Alternatives Considered**:
  - Automatically submitting to the first rejected tier without confirmation: Rejected because the evaluator should explicitly confirm the return destination and review notes.

## 3. Decision on API Submission Strategy

- **Decision**:
  1. Construct aggregated notes string: `[Catatan Penolakan Hasil Audit BPDP]:\n- Dokumen A (Tier): alasan\n- Dokumen B (Tier): alasan`.
  2. Call `proposalService.update(proposalId, { status: selectedStatus, notes: aggregatedNotes })`.
  3. Call `proposalService.bulkProposalValidations(...)` to store granular per-document validation rows with `validated_by_role: authStore.activeRole`.
- **Rationale**: Keeps proposal status machine updated and maintains full granular audit trail for each individual document.
