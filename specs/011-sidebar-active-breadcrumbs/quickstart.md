# Quickstart Validation Guide: Active Sidebar & Aligned Breadcrumbs

This guide outlines the steps to verify that the active sidebar highlighted states and automatic breadcrumbs work correctly.

## Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Open the application in your browser (usually `http://localhost:5173`).
3. Log in or use the **Role Switcher** in the top-right header simulation to switch roles during verification.

---

## Validation Scenario 1: Sub-page Active Highlighting (BPDPKS Role)

### Steps:
1. Using the Role Switcher, change your role to **BPDP Verifikator (Staf)**.
2. Observe the sidebar. Under section **BPDPKS (VERIFIKATOR)**, the menu item **Verifikasi Kelayakan** should be active (highlighted with forest green/cocoa text and accent borders).
3. Click on one of the items in the queue to open the detail view (navigates to `/bpdp/ceki/:id`).
4. **Observe the Sidebar**: The **Verifikasi Kelayakan** item must remain active and highlighted.
5. **Observe the Breadcrumbs**: The breadcrumbs at the top of the details page must display:
   `Beranda > BPDPKS (VERIFIKATOR) > Verifikasi Kelayakan > Penilaian Kelayakan`.

---

## Validation Scenario 2: Form Add Page Active Highlighting (Lembaga Pemohon Role)

### Steps:
1. Using the Role Switcher, change your role to **Lembaga Pekebun**.
2. Click on **Pekebun** (navigates to `/master-data/pekebun`).
3. Click the button to add a new Pekebun (navigates to `/master-data/pekebun/tambah`).
4. **Observe the Sidebar**: The **Pekebun** menu item must remain highlighted.
5. **Observe the Breadcrumbs**: The breadcrumbs must display:
   `Beranda > MASTER DATA > Pekebun > Tambah Pekebun`.

---

## Validation Scenario 3: Dinas Provinsi Queue & Details

### Steps:
1. Using the Role Switcher, change your role to **Dinas Provinsi**.
2. Under section **DINAS PROVINSI**, click on **Verifikasi & Rekomtek (Prov)** (navigates to `/dinas/verifikasi/provinsi`).
3. Click a proposal to open details (navigates to `/dinas/verifikasi/provinsi/:id`).
4. **Observe the Sidebar**: The **Verifikasi & Rekomtek (Prov)** menu item must remain highlighted.
5. **Observe the Breadcrumbs**: The breadcrumbs must display:
   `Beranda > DINAS PROVINSI > Verifikasi & Rekomtek (Prov) > Detail Verifikasi Usulan`.
