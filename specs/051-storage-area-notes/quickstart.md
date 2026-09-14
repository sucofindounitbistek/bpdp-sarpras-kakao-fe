# Quickstart & Verification Guide: Storage Area Notes Integration

## Verification Scenario

1. Launch frontend development environment:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Navigate to Dinas Kabupaten verification flow (`/dinas/verifikasi/kabupaten/:id`).
3. Select a proposal containing Pupuk package (`isPupukPaket = true`).
4. Scroll to **Pemeriksaan Gudang Serah Terima**.
5. Click **Tolak** on **Alamat Gudang**, **Koordinat**, or **Foto Tampak Depan / Dalam**.
6. Enter feedback notes in the rejection text area.
7. Attempt to submit rejection without notes -> system blocks submission with error toast.
8. Enter notes, click submit -> confirm modal displays formatted notes (e.g., `Gudang (Alamat): <notes>`).
9. Verify type check passes:
   ```bash
   npm run build
   ```
