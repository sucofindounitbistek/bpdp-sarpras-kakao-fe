# Quickstart: Verification Guide for Detail Page

## Prerequisites

- Frontend app is running.
- Backend service is running and exposes endpoints defined in [contracts/api.md](./contracts/api.md).

## Validation Scenarios

### Scenario 1: Load and Render details
1. Open detailed page for a proposal, e.g. `/dinas/verifikasi/kabupaten/REQ-2026-001`.
2. Confirm detail fields are populated via API response.

### Scenario 2: Submit Revision
1. Click "Kembalikan (Revisi)" button, fill in a remark in modal, and save.
2. Confirm a network POST request to `/api/v1/verifikasi-kab/:id/revisi` is triggered with payload containing the remarks.
3. Confirm toast warning/success appears and page redirects back to queue.
