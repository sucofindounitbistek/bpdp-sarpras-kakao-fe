# Tasks: Simpan Sebagai Draft pada Proses Revisi Proposal (Role KP)

**Input**: Design documents from `specs/081-save-draft-revisi-kp/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/revision-draft-contract.md`  
**Branch**: `081-save-draft-revisi-kp`

---

## Format: `- [ ] [TaskID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (independent files or layers)
- **[Story]**: Belongs to user story:
  - **[US1]**: User Story 1 - Simpan Sebagian Perbaikan Revisi sebagai Draft (P1) 🎯 MVP

---

## Phase 1: Backend Implementation (`bpdp-sarpras-kelapa-be`)

**Purpose**: Menyiapkan dukungan flag `is_draft` pada handler, DTO, service, dan transaksi repository revisi proposal.

- [x] T001 [US1] Tambahkan field `IsDraft *bool json:"is_draft,omitempty"` pada struct `ResubmitProposalRequest` di `internal/proposal/dto.go`
- [x] T002 [US1] Perbarui signature dan implementasi `ResubmitProposalRevisionWithUpdatesTx` di `internal/proposal/repository.go` agar menerima parameter `isDraft bool`:
  - Jika `isDraft == true`: jangan ubah kolom `status`, pertahankan status revisi eksisting (`REV_FROM_KAB` dll), dan jangan hapus data validasi rejected eksisting
  - Jika `isDraft == false`: pertahankan alur submit eksisting (`status: newStatus`, bersihkan catatan validasi yang sudah diperbarui)
- [x] T003 [US1] Perbarui `ResubmitProposalRevisionWithUpdates` di `internal/proposal/repository.go` untuk meneruskan nilai `isDraft` ke versi transaksi `ResubmitProposalRevisionWithUpdatesTx`
- [x] T004 [US1] Sesuaikan method `ResubmitProposalRevision` di `internal/proposal/service.go`:
  - Ekstrak nilai boolean `isDraft` dari `req.IsDraft` (default `false` jika `nil`)
  - Jika `isDraft == true`: status tetap `oldStatus`, catat event audit trail sebagai `PROPOSAL_REVISION_DRAFT_SAVED`, dan lewati dispatch notifikasi ke verifikator
  - Jika `isDraft == false`: pertahankan alur pengiriman ulang penuh (`status = SUBMITTED`, audit `PROPOSAL_RESUBMITTED`, dispatch notifikasi)
- [x] T005 [P] [US1] Tambahkan unit test untuk skenario `is_draft: true` vs `is_draft: false` pada `ResubmitProposalRevision` di `internal/proposal/service_test.go`
- [x] T006 [US1] Jalankan pengujian backend (`go test ./internal/proposal/...`) dan validasi build (`go build ./cmd/api/main.go`)

**Checkpoint**: Backend siap menerima payload draf revisi tanpa mengubah status proposal ke antrean verifikator.

---

## Phase 2: Frontend Implementation (`bpdp-sarpras-kelapa-fe`)

**Purpose**: Menyediakan method simpan draf di service & store, serta tombol aksi "Simpan Draf" pada halaman revisi proposal.

- [x] T007 [US1] Tambahkan parameter opsional `isDraft?: boolean` pada fungsi `proposalService.resubmitProposal` di `src/services/proposal.service.ts` dan teruskan field `is_draft` pada body request API
- [x] T008 [US1] Tambahkan state `isDrafting = ref(false)` dan action `saveDraftRevision(storageAreaPayload?: any): Promise<boolean>` pada `src/stores/proposalRevisionStore.ts` yang memanggil `resubmitProposal` dengan `isDraft = true` tanpa validasi kelengkapan seluruh penolakan (`isAllRejectedResolved`)
- [x] T009 [US1] Tambahkan tombol **"Simpan Draf"** dengan icon `Save` dan state loading di footer aksi `src/views/pemohon/RevisiProposalView.vue` di samping tombol "Batal" dan "Kirim Ulang Revisi"
- [x] T010 [US1] Hubungkan event click tombol "Simpan Draf" ke handler `handleSaveDraft` di `src/views/pemohon/RevisiProposalView.vue` yang menampilkan feedback toast sukses tanpa berpindah halaman
- [x] T011 [P] [US1] Tambahkan atau perbarui unit test store/komponen revisi di frontend untuk memvalidasi pemanggilan simpan draft

**Checkpoint**: Pemohon KP dapat menekan tombol "Simpan Draf" kapan saja dan data perbaikan tersimpan.

---

## Phase 3: Verification & Integration Testing

**Purpose**: Memastikan seluruh alur bekerja secara end-to-end tanpa regresi.

- [x] T012 Lakukan verifikasi manual sesuai skenario `specs/081-save-draft-revisi-kp/quickstart.md`:
  - Login role KP -> buka proposal revisi -> ubah 1 field -> klik "Simpan Draf" -> cek toast & halaman tetap aktif -> refresh halaman -> pastikan perubahan tersimpan & status proposal tidak berubah
  - Selesaikan semua perbaikan -> klik "Kirim Ulang Revisi" -> pastikan status beralih ke `SUBMITTED`
- [x] T013 Jalankan full test suite frontend (`npm run test`) dan build check backend/frontend untuk memastikan integrasi bersih tanpa error

