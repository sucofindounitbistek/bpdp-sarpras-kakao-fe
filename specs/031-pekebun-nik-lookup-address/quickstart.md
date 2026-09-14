# Quickstart & Validation: NIK Lookup Updates Alamat and Kodepos

This guide outlines how to validate the automatic form population after a NIK search.

## Prerequisites
1. Run the local dev server:
   ```bash
   npm run dev
   ```
2. Navigate to the master data registration page in your browser.

---

## Validation Scenario: Auto-fill Form Verification
- **Steps**:
  1. Open `/master-data/pekebun/tambah`.
  2. Input NIK: `7301021508850001` in the first field.
  3. Click **Cari NIK**.
- **Expected Outcome**:
  - The loader finishes.
  - The **Alamat Sesuai KTP** textarea is automatically populated with `"Jl. Poros Masamba No. 45, Desa Bone"`.
  - The **Kodepos** input is automatically populated with `"92961"`.
- **Reset Scenario**:
  - Modify the NIK to a non-existent one, e.g. `9999999999999999`.
  - Click **Cari NIK**.
  - All form fields (Nama, KK, Status Pernikahan, Alamat, Kodepos) should be reset and empty.
