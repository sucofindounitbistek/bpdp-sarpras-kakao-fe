# Quickstart & Validation: RAB PDF Generation

This guide details how to validate that the RAB print layouts match the target design.

## Prerequisites
1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Open the web browser and log in as "Lembaga Pekebun (Pemohon)".

---

## Validation Scenario: RAB Print to PDF Layout
- **Steps**:
  1. Navigate to `/pengusulan/baru`.
  2. Complete Step 1 ( Paket & Dokumen ) and click Lanjut.
  3. On Step 2 (Rencana Anggaran Biaya), click **Tambah Baris** in the RAB table.
  4. Select a category (e.g. Pupuk) and item (e.g. Rock Phosphate).
  5. Fill out amounts: Tahap 1 = `1000`, Tahap 2 = `200`, Satuan = `kg`, Harga = `5000`.
  6. Click the **Unduh RAB** button.
- **Expected Outcome**:
  - The browser's native print modal/save-as-PDF interface should open.
  - The document header MUST show:
    - `"Rancangan Anggaran Biaya"` centered.
    - `"Kelompok Tani Bukan Karyawan Baru"` centered below it.
    - `"Alamat : Sleman Semabda"` left-aligned below it.
  - The table MUST display:
    - A sub-header with the selected package description: e.g. `Ekstensifikasi (Bibit atau Benih, Pupuk dan Pestisida)`.
    - Columns: `Jenis`, `Barang`, `Jumlah Tahap 1`, `Jumlah Tahap 2`, `Jumlah Total`, `Satuan`, `Harga`, `Biaya`.
    - The row for "Pupuk - Rock Phosphate" with calculations: total quantity = `1.200`, total price = `6.000.000`.
  - The bottom of the table MUST show:
    - `Total Biaya` = `6.000.000`.
    - `Pembulatan Kebawah` = `6000000`.
    - `Pembulatan Kebawah` = `0`.
