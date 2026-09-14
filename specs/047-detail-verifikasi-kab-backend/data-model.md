# Data Model: Detail Verifikasi Kabupaten Backend Integration

## Entities

The primary data entity is `Proposal` detail aggregate.

### Verification Actions Payload

#### Revision Payload
- `catatanRevisi` (string): Notes explaining changes required.

#### SK CPCL Approval Payload
- `nomorSkCpcl` (string): Decree number.
- `tglSkCpcl` (string): Date of issue.
- `fileSkCpclUrl` (string): Stored file URL.
- `catatanVerifikasi` (string): Verification logs/comments.
- `statusVerifikasi` (string): Must be `"APPROVED"`.
