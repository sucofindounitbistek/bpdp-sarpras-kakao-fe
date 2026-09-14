# Quickstart & Validation Guide: Modul Penyaluran Dashboard Mockup

This document outlines the step-by-step validation scenarios to test and verify the dynamic dashboard and role selector implementation.

---

## 1. Prerequisites & Setup

Ensure the frontend application is running locally:

```bash
# Install dependencies if not already done
npm install

# Start Vite development server
npm run dev
```

Open a web browser at `http://localhost:5173`.

---

## 2. Validation Scenarios

### Scenario A: Dynamic Sidebar Routing Switch

1. Locate the **Role Selector** dropdown in the top header.
2. Select **Lembaga Pekebun (Pemohon)**.
   - **Expected Outcome**: The sidebar instantly updates to display the "Lembaga Pekebun" menus: *Form Usulan Baru* and *Tracking Status Usulan*.
3. Click **Dinas Kab/Kota** in the role dropdown.
   - **Expected Outcome**: The sidebar refreshes to show *Verifikasi & Rekomtek* only, hiding all Pemohon menus.
4. Click **BPDPKS** in the role dropdown.
   - **Expected Outcome**: The sidebar lists *Penyaluran Dana & LPJ* and the new *User Management* link.

### Scenario B: Role-Specific Dashboard Metrics

1. Set the role to **Dinas Kab/Kota**.
2. Observe the landing page statistics.
   - **Expected Outcome**: View displays cards with Regency-level queue metrics (e.g. *Usulan Menunggu Verifikasi Kabupaten*, *Pekebun Terdaftar*).
3. Set the role to **Ditjenbun Pusat**.
   - **Expected Outcome**: View displays cards for nationwide approvals, total recommended funds, and area statistics.

### Scenario C: BPDP User Management & Role Descriptions

1. Switch active role to **BPDPKS**.
2. Click **User Management** in the sidebar.
   - **Expected Outcome**: A dual-column layout is rendered:
     - Left: A clean grid table showcasing mock user accounts.
     - Right: A readable panel showing descriptions of the 5 main system roles.
