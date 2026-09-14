# Quickstart Validation Guide: Master Data Pekebun

**Branch**: `004-master-data-pekebun` | **Date**: 2026-07-30

## Prerequisites

- Node.js >= 18
- npm >= 9
- Dev server running: `npm run dev`

## Setup

```bash
cd c:\Users\raiha\Documents\Kerja\IDSurvey\SCI\bpdp-sarpras-kakao-fe
npm install
npm run dev
```

## Validation Scenarios

### Scenario 1: Navigate to Master Data > Pekebun List

1. Open browser at `http://localhost:5173`
2. In the role switcher (navbar), select **PEMOHON** role
3. In the sidebar, click **Master Data > Pekebun**
4. **Expected**: Page displays a table with mock Pekebun data, search bar (Nama/NIK), filter dropdown (Wilayah), and a prominent "+ Tambah Pekebun" button

### Scenario 2: Register New Pekebun — Step 1 (Identitas)

1. From the Pekebun list page, click **"+ Tambah Pekebun"**
2. **Expected**: Multi-step form opens with Step 1 active (Data Identitas), step indicator showing 3 steps
3. Enter a valid 16-digit NIK (e.g., `7301021508850001`)
4. **Expected**: System simulates Dukcapil lookup (~500ms delay), then auto-fills: Nama, Nomor KK, Status Pernikahan, Tempat & Tanggal Lahir — all read-only
5. Fill in Alamat, Kodepos (5 digits), Nomor HP (10+ digits)
6. Click **"Selanjutnya"**
7. **Expected**: Validation passes, navigates to Step 2

### Scenario 3: NIK Uniqueness Validation

1. On Step 1, enter an NIK that already exists in mock data
2. **Expected**: Error message "Nomor KTP sudah terdaftar dalam Master Data" appears, "Selanjutnya" button is blocked

### Scenario 4: NIK Not Found in Dukcapil

1. On Step 1, enter a 16-digit NIK not in the mock data
2. **Expected**: Toast error "Data Dukcapil tidak ditemukan", Dukcapil fields remain empty

### Scenario 5: Register New Pekebun — Step 2 (Upload Dokumen)

1. On Step 2, upload files for each of the 4 required documents:
   - Scan KTP (JPG/PNG, ≤5MB)
   - Scan KK (JPG/PNG, ≤5MB)
   - Swafoto Pekebun (JPG/PNG, ≤5MB)
   - Surat Kuasa Pekebun ke Ketua (PDF, ≤10MB)
2. **Expected**: Each upload shows preview (image) or filename (PDF), dropzone validates file type and size
3. Try uploading an invalid file type (e.g., .exe)
4. **Expected**: Error message displayed, file rejected
5. Click **"Selanjutnya"** with all 4 documents uploaded
6. **Expected**: Navigates to Step 3

### Scenario 6: Register New Pekebun — Step 3 (Data Lahan)

1. On Step 3, select **Jenis Legalitas Lahan**: "SHM"
2. **Expected**: Standard fields appear (Nomor Legalitas, Tanggal Penerbitan, etc.)
3. Change to "Non SHM"
4. **Expected**: "Download Format Sporadik" button appears — clicking downloads a .docx file
5. Fill in all lahan fields:
   - Nomor Legalitas, Tanggal Penerbitan, Luas Lahan
   - Select Provinsi → Kabupaten → Kecamatan → Desa (cascading)
   - Alamat/Blok Kebun, Tahun Tanam, Jenis Bibit
   - Upload Scan Legalitas Lahan
6. Click **"Download Format Surat Keterangan Beda Nama Lahan"** and **"Download Format Surat Pernyataan Penguasaan Fisik Bidang Tanah"**
7. **Expected**: .docx files download successfully
8. Click **"Simpan"** (submit)
9. **Expected**: Toast success "Data pekebun berhasil disimpan", redirects to Pekebun list, new record visible in table

### Scenario 7: Step Navigation (Back/Forward)

1. Fill Step 1 data, proceed to Step 2
2. Click **"Kembali"** button
3. **Expected**: Returns to Step 1 with all data intact (not cleared)
4. Click step indicator for Step 3
5. **Expected**: Only navigates if previous steps are valid; otherwise shows validation errors

### Scenario 8: Detail Modal

1. On the Pekebun list page, click **"Detail"** on a table row
2. **Expected**: Modal opens showing read-only summary of identitas data, list of uploaded documents, and lahan data
3. Click close/backdrop
4. **Expected**: Modal closes cleanly

## Build Validation

```bash
npm run build
```

**Expected**: `vue-tsc -b && vite build` completes with 0 errors.

## References

- Data model: [data-model.md](./data-model.md)
- UI contracts: [contracts/ui-contract.md](./contracts/ui-contract.md)
- Feature spec: [spec.md](./spec.md)
