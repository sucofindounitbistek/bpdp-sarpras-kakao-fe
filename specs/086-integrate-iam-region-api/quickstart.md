# Quickstart & Verification Guide: Integrasi API Master Wilayah IAM

**Feature**: `086-integrate-iam-region-api`  
**Date**: 2026-09-14  

---

## 1. Prerequisites

1. Ensure the development environment configuration in `.env` points to the IAM API:
   ```env
   VITE_IAM_API_URL=https://sso-local.scitechnology.id/api/api/v1
   ```
2. Make sure dependencies are installed (`npm install`).

---

## 2. Validation Scenarios

### Scenario 1: Verify Direct API Fetch from IAM
Run a quick curl or browser fetch to confirm network connectivity to the public IAM endpoints:
```bash
# Check Provinces (should return 38 provinces in JSON envelope)
curl -s "https://sso-local.scitechnology.id/api/api/v1/public/regions/provinces" | head -n 30

# Check Regencies for Sulawesi Selatan (id: 73)
curl -s "https://sso-local.scitechnology.id/api/api/v1/public/regions/regencies?province_id=73" | head -n 30
```

### Scenario 2: Form Lahan Dynamic Region Selection (Manual E2E)
1. Launch frontend dev server:
   ```bash
   npm run dev
   ```
2. Log in as operator Kelembagaan Pekebun (KP).
3. Navigate to **Master Data > Data Pekebun** and click **Tambah Pekebun**.
4. Complete Step 1 (Identitas) and Step 2 (Dokumen) or skip to Step 3 (**Data Lahan**).
5. Click **Tambah Lahan Baru** and switch to tab **Alamat & Wilayah**:
   - **Dropdown Provinsi**: Verify that the dropdown displays 38 provinces from Indonesia (e.g. ACEH, RIAU, JAWA BARAT, SULAWESI SELATAN, PAPUA, etc.) instead of only 3 Sulawesi provinces.
   - Select `"RIAU"`.
   - **Dropdown Kabupaten**: Verify that it is activated and populated with regencies belonging to Riau (e.g. KABUPATEN SIAK, KABUPATEN KAMPAR, KOTA PEKANBARU).
   - Change Province to `"SULAWESI SELATAN"`.
   - Verify that Kabupaten dropdown is reset and re-populated with South Sulawesi regencies (e.g. KABUPATEN LUWU UTARA).
   - **Input Kecamatan & Desa**: Verify that Kecamatan and Desa are text inputs. Enter `"Masamba"` and `"Desa Bone"`.
   - Save the land and verify that the card summary displays the correct region labels.
6. Click **Tambah Lahan Baru** a second time:
   - Check the browser DevTools Network tab: Verify that **no second HTTP call** is made for `/public/regions/provinces` (0 redundant calls, cached in Pinia).

### Scenario 3: Typecheck and Production Build
Verify TypeScript strictness and Vite bundle production:
```bash
# Run TypeScript compilation check
npx vue-tsc -b

# Run production build
npm run build
```
Expected outcome: 0 type errors, build completes successfully.
