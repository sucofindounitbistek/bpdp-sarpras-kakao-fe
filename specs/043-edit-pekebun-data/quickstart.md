# Quickstart Validation Guide: Edit Data Pekebun

This guide outlines how to manually verify the Edit Data Pekebun feature.

## Prerequisites

- Dev server running (`npm run dev`)
- Logged in as a user with the `PEMOHON` role

## Verification Scenarios

### Scenario 1: Edit registered pekebun from Actions list
1. Navigate to `/master-data/pekebun`.
2. Locate a registered pekebun row (with no "Draft" badge).
3. Verify there is a green Edit button next to the Eye button.
4. Click the Edit button.
5. Verify you are navigated to `/master-data/pekebun/edit/:id` and the form fields, documents, and lands are correctly pre-filled.
6. Verify "Simpan Draft" is hidden in the footer of the wizard steps.
7. Change the Name or NIK, complete steps, and click **Simpan Pekebun**.
8. Verify you are redirected back to `/master-data/pekebun` and the updated name appears.

### Scenario 2: Edit registered pekebun from Detail Modal
1. Navigate to `/master-data/pekebun`.
2. Click the Eye button on a registered pekebun to open the Detail Modal.
3. Verify there is an **Edit Data** button in the footer next to "Tutup".
4. Click the **Edit Data** button.
5. Verify the modal closes and you are navigated to `/master-data/pekebun/edit/:id`.
