# Quickstart Verification Guide: sarpras-package-rules

This guide describes the manual verification steps to ensure the updated Sarpras packages, required documents, and minimum validation rules operate correctly.

## Prerequisites
1. Node.js environment configured.
2. Dependencies installed: `npm install`.
3. Development server running: `npm run dev`.

## Verification Scenarios

### Scenario 1: Step 1 Package Selection Cards & Descriptions
1. Navigate to the Proposal Submission page (Pemohon role).
2. Confirm there are 12 selectable package cards displayed in the grid.
3. Verify that the new cards are present:
   * **Unit Pengolahan Hasil (UPH) - 1 Jenis Produk**
   * **Unit Pengolahan Hasil (UPH) - Multi-Jenis / Skala Besar**
   * **Alat Transportasi Pikap**
4. Check that descriptions match `ceklis_dokumen_persyaratan.md` rules.

### Scenario 2: Dynamic Document Checklist & Templates (Step 1)
1. Select the **Ekstensifikasi** package.
2. Verify that 9 required documents are listed. Check that templates like "Pernyataan Tanpa Bakar" and "Pernyataan Luas" have download buttons.
3. Switch package to **UPH - Multi-Jenis**.
4. Confirm that the list changes dynamically to show 19 documents, including UPH-specific ones (Kelayakan Usaha, Perizinan Berusaha, etc.).
5. Check that file formats are restricted to PDF/JPG/PNG, and file size limits (>10MB) throw error toast notifications (and do not crash the app).

### Scenario 3: Step 3 Validation Checks
1. Select the **Ekstensifikasi** package, proceed to Step 3 (Pilih Pekebun & Lahan).
2. Select 15 farmers with a combined land area of 2.5 Ha.
3. Verify the validation banner is amber and displays: `"Belum memenuhi syarat minimum: kurang 5 pekebun dan kurang 0.5 Ha. Total pekebun: 15 (min. 20), total luas: 2.5 Ha (min. 3.0 Ha)."`
4. Add another farmer with 0.6 Ha (total land becomes 3.1 Ha).
5. Verify that the validation banner instantly turns green and displays: `"Memenuhi syarat minimum."` (satisfies OR condition).

### Scenario 4: Verifier Summary & Document Checks (Dinas & BPDP)
1. Complete a proposal submission under **Jalan Kebun** package.
2. Switch role to **Dinas Kabupaten**.
3. Open the newly submitted proposal from the queue.
4. Verify that the verifier document review section renders exactly the 13 required Jalan Kebun documents (including SID, Foto Jalan, Kurva S, etc.).
5. Switch role to **BPDP** and verify the same document set is visible for final review.
