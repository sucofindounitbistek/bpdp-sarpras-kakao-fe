# Quickstart Validation Guide: Direct Multi-Tier Pushback

**Feature**: `066-direct-multi-tier-pushback-sk-dirut`

## Prerequisites
- Frontend server running on `http://localhost:5173`
- Backend API running on `http://localhost:8080`

## Validation Steps

1. **Access Published Proposal as BPDP Verifikator**:
   - Navigate to `/bpdp/sk-dirut`.
   - Locate a proposal with status `SK_DIRUT_PUBLISHED` and click "Tinjau".
   - Confirm it opens `/bpdp/approval/:id` in Inspect Mode showing all 7 documents.

2. **Inspect & Reject a Kabupaten Document**:
   - Locate `SK Penetapan CPCL (SK_CPCL)` or `RAB Final (RAB_FINAL)`.
   - Click "Tolak".
   - Input rejection notes: `Nomor SK tidak sesuai`.
   - Confirm the "Kembalikan Usulan (Pushback)" button becomes active.

3. **Verify Pushback Modal Guardrails**:
   - Click "Kembalikan Usulan (Pushback)".
   - In the modal, verify **Dinas Kabupaten/Kota** is enabled.
   - Verify **Dinas Provinsi**, **Ditjenbun Verifikator**, and **BPDP Verifikator** are disabled with a label stating no related documents were rejected.

4. **Confirm Pushback Execution**:
   - Select **Dinas Kabupaten/Kota** and click "Konfirmasi Pengembalian".
   - Verify success toast notification appears.
   - Verify the router redirects back to `/bpdp/sk-dirut`.
   - Verify the proposal status in the queue is now `REV_FROM_PROV`.

5. **Access Completed Proposal as BPDP Approval**:
   - Log in as BPDP Approval and navigate to `/bpdp/riwayat-selesai`.
   - Click "Lihat" on a completed proposal.
   - Verify it opens `/bpdp/approval/:id` with the same inspection & pushback capabilities.
