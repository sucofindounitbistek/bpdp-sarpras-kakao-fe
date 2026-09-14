# Quickstart & Validation Guide: Align Proposal Status List with Detail Steps

## Prerequisites
- The frontend development server must be running (`npm run dev`).
- Log in to the application and switch to the Pemohon/Lembaga Pekebun role to view "Status & Tracking Proposal" dashboard list.

## Validation Scenarios

### Scenario 1: Verify List Status Labels
1. Open the "Status & Tracking Proposal" view (`/pengusulan/tracking`).
2. Locate the "Status" column in the data table.
3. Verify that instead of displaying "Diajukan" or "Terverifikasi Administrasi", ongoing proposals show "Verifikasi Dinas Kab/Kota".
4. Verify that proposals that have reached province phase display "Asistensi Dinas Provinsi".

### Scenario 2: Verify Detail Header Badge
1. In the proposal list, click "Lihat Detail" for any proposal.
2. Verify that the badge inside the detail header displays the exact same aligned step status (e.g. "Verifikasi Dinas Kab/Kota" instead of the raw status).
3. Check that the active indicator step number matches this status stage.
