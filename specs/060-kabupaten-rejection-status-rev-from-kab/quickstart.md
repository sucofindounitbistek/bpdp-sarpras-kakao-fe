# Quickstart Validation Guide: Rejection Status Update to REV_FROM_KAB

## Validation Scenarios

### Scenario 1: Reject Proposal at Dinas Kabupaten
1. Login as a Dinas Kabupaten user.
2. Navigate to `/dinas/verifikasi/kabupaten/:id`.
3. Reject an item or mark document/farmer verification as non-compliant.
4. Click "Kembalikan ke Pemohon".
5. Confirm rejection with notes.

### Expected Outcome
- Status update API payload sent to backend contains `"status": "REV_FROM_KAB"`.
- User is redirected to `/dinas/verifikasi` queue.
- Proposal status in the queue and proposal detail displays badge "Revisi dari Kabupaten" (`REV_FROM_KAB`).

### Automated Validation Command
```bash
npx vue-tsc -b
npm test
```
