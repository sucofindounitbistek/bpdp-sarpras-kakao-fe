# Quickstart Validation Guide: Storage Area Alignment

This guide outlines the steps to verify the storage area response mapping and document preview.

## Prerequisites

- Local development server running (`npm run dev`)
- Accompanying backend or mock API serving proposal data with a `storage_area` object containing `exterior_photo_file_url` or `interior_photo_file_url`

## Verification Scenarios

### Scenario 1: Verification Page Display

1. Run the local server and log in as `Dinas Kabupaten` or `Dinas Provinsi`.
2. Open a proposal verification detail page (e.g. `/dinas/kabupaten/verifikasi/22`).
3. Navigate to the verification tab and locate the **Informasi Gudang / Tempat Penyerahan** section.
4. Verify the **Alamat Gudang** and **Koordinat Gudang** display correctly.
5. Verify that **Foto Tampak Depan** and **Foto Tampak Dalam** display their corresponding filenames (e.g. `foto_tampak_depan_gudang.jpg`).
6. Click the **Lihat** button for either photo and verify that the preview modal opens showing the image.

### Scenario 2: Preview Modal

1. Navigate to the proposal tracking table or list.
2. Click the view/preview button on a proposal containing a `storage_area`.
3. Confirm that the preview modal displays the warehouse location details and photo links correctly.
