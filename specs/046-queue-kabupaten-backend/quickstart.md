# Quickstart: Verification Guide

## Prerequisites

- Frontend server is running (`npm run dev` or `vite`).
- Sibling backend service `bpdp-sarpras-kelapa-be` is running and seeded with at least one proposal in `"SUBMITTED"` status, OR local storage fallback contains mock `"SUBMITTED"` proposals.

## Validation Scenarios

### Scenario 1: Initial Page Load (Skeleton Loader & Table Render)

1. Navigate to `/dinas/kabupaten/queue` (or appropriate verification route).
2. Observe the page loads:
   - Dynamic skeleton loaders match table geometries during fetching.
   - Confirmation of GET `/api/v1/proposals?status=SUBMITTED` call in network inspector.
3. Confirm the table matches data schema defined in [data-model.md](./data-model.md) and [contracts/api.md](./contracts/api.md).

### Scenario 2: Error Handling Verification

1. Simulate API failure (e.g. stop backend service or throttle network).
2. Reload queue page.
3. Verify toaster notification error is shown according to Principle IX & XI.
4. Verify empty table displays "Proposal tidak ditemukan".
