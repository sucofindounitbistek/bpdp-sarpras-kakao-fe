# Quickstart & Validation Guide: Global Proposal Status Alignment

## Prerequisites
- The frontend development server must be running (`npm run dev`).
- Test with different roles (Pemohon/Lembaga Pekebun, Dinas Kabupaten, Dinas Provinsi).

## Validation Scenarios

### Scenario 1: Verify Pemohon Proposal List & Detail Header
1. Log in as Pemohon and view `/pengusulan/tracking`.
2. Verify that status column matches stepper stages (e.g. "Verifikasi Dinas Kab/Kota").
3. Click "Lihat Detail" and check detail header badge reads identical text.

### Scenario 2: Verify Verifier Role Queues (Dinas Kabupaten, Dinas Provinsi)
1. Log in as Dinas Kabupaten and view the queue list.
2. Verify that the "Status Saat Ini" column matches the aligned stage labels (e.g. showing "Verifikasi Dinas Kab/Kota" instead of "Diajukan").
3. Log in as Dinas Provinsi and verify the queue list displays matching aligned labels (e.g. "Verifikasi Dinas Kab/Kota").
