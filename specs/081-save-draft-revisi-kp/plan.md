# Implementation Plan: Simpan Sebagai Draft pada Proses Revisi Proposal (Role KP)

**Branch**: `081-save-draft-revisi-kp` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/081-save-draft-revisi-kp/spec.md`

## Summary

Menyediakan opsi "Simpan Draf" pada halaman revisi permohonan proposal untuk role Kelembagaan Pekebun (KP). Fitur ini memungkinkan pemohon mencicil penyimpanan perbaikan teks dan unggahan berkas pekebun, lahan, storage area, atau RAB tanpa harus menunggu semua item penolakan beres, dan tanpa memindahkan status proposal ke antrean verifikator sebelum pemohon siap mengirim ulang secara final.

## Technical Context

**Backend**:
- **Framework**: Echo v4 (Go 1.23+)
- **Database/ORM**: PostgreSQL, GORM v1.25.12
- **Key Modules**: `internal/proposal` (`dto.go`, `service.go`, `repository.go`)
- **Testing**: Go unit test (`go test ./internal/proposal/...`)

**Frontend**:
- **Framework**: Vue 3.5, TypeScript 5.7, Pinia
- **Styling**: TailwindCSS, Lucide Vue Next
- **Key Files**: `RevisiProposalView.vue`, `proposalRevisionStore.ts`, `proposal.service.ts`
- **Testing**: Vitest (`npm run test`)

## Project Structure

### Documentation (this feature)

```text
specs/081-save-draft-revisi-kp/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research findings & decisions
├── data-model.md        # Data model updates & state matrix
├── contracts/           # API & service contracts
│   └── revision-draft-contract.md
├── quickstart.md        # Validation guide
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
1. bpdp-sarpras-kelapa-be/
   ├── internal/proposal/dto.go         # [MODIFY] Tambah `IsDraft *bool` pada ResubmitProposalRequest
   ├── internal/proposal/repository.go  # [MODIFY] Tambah handling isDraft pada ResubmitProposalRevisionWithUpdatesTx
   └── internal/proposal/service.go     # [MODIFY] Guard status proposal & audit action saat isDraft == true

2. bpdp-sarpras-kelapa-fe/
   ├── src/services/proposal.service.ts # [MODIFY] Tambah parameter isDraft?: boolean pada resubmitProposal
   ├── src/stores/proposalRevisionStore.ts # [MODIFY] Tambah state isDrafting & action saveDraftRevision
   └── src/views/pemohon/RevisiProposalView.vue # [MODIFY] Tambah tombol "Simpan Draf" di footer aksi
```

## Implementation Phases

### Phase 1: Backend Implementation (`bpdp-sarpras-kelapa-be`)
1. **DTO Update**: Tambah `IsDraft *bool json:"is_draft,omitempty"` pada struct `ResubmitProposalRequest`.
2. **Repository Update**:
   - Di `ResubmitProposalRevisionWithUpdatesTx`:
     - Jika `isDraft == true`: jangan update `status: newStatus`, hanya update `updated_at`.
     - Jangan hapus catatan validasi rejected saat draft agar verifikator tetap memiliki riwayat sebelum diajukan ulang secara resmi.
3. **Service Update**:
   - Di `Service.ResubmitProposalRevision`:
     - Cek `isDraft := req.IsDraft != nil && *req.IsDraft`.
     - Jika `isDraft == true`:
       - Status proposal tetap `oldStatus`.
       - Catat audit event sebagai `PROPOSAL_REVISION_DRAFT_SAVED`.
       - Lewati pengiriman dispatch notifikasi ke verifikator.
     - Jika `isDraft == false`:
       - Jalankan flow existing (status `SUBMITTED`, audit `PROPOSAL_RESUBMITTED`, dispatch notifikasi).
4. **Backend Test**:
   - Jalankan `go test ./internal/proposal/...` dan `go build ./cmd/api/main.go`.

### Phase 2: Frontend Implementation (`bpdp-sarpras-kelapa-fe`)
1. **Service Update (`proposal.service.ts`)**:
   - Teruskan flag `is_draft: isDraft` pada payload `api.put(/proposals/${proposalId}/revisi)`.
2. **Store Update (`proposalRevisionStore.ts`)**:
   - Tambahkan `const isDrafting = ref(false)`.
   - Implementasikan method `saveDraftRevision(storageAreaPayload?: any)`.
   - Method ini memanggil `proposalService.resubmitProposal(..., true)`.
3. **UI Update (`RevisiProposalView.vue`)**:
   - Tambahkan tombol **"Simpan Draf"** di sebelah tombol "Batal" dan "Kirim Ulang Revisi":
     ```html
     <button
       type="button"
       @click="handleSaveDraft"
       :disabled="revisionStore.isSubmitting || revisionStore.isDrafting"
       class="px-5 py-2.5 text-xs font-bold text-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-2"
     >
       <Save class="w-4 h-4" />
       <span>{{ revisionStore.isDrafting ? 'Menyimpan Draf...' : 'Simpan Draf' }}</span>
     </button>
     ```
   - Handler `handleSaveDraft`:
     ```typescript
     const handleSaveDraft = async () => {
       const payloadGudang = ...;
       const success = await revisionStore.saveDraftRevision(payloadGudang);
       if (success) {
         toast.success('Draf revisi berhasil disimpan');
       }
     };
     ```
4. **Frontend Verification**:
   - Jalankan `npm run test` untuk memastikan tidak ada regresi komponen.
