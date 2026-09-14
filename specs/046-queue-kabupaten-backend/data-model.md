# Data Model: Queue Kabupaten Backend Integration

## Entities

### Proposal

Represents the proposal aggregate loaded from the backend API.

| Field | Type | Description |
|---|---|---|
| `id` | `string \| number` | Unique identifier |
| `nomor_proposal` | `string` | Human-readable proposal number (e.g. SPKA...) |
| `lembaga` | `object` | Institution details (includes `namaLembaga`) |
| `paket_sarpras` | `string` | Selected sarpras package |
| `total_anggaran` | `number` | Total calculated budget |
| `status` | `string` | Proposal status enum (value: `"SUBMITTED"`) |

## State Transitions

- The queue view focuses exclusively on proposals whose status is **`SUBMITTED`**. No status transitions are executed from this list directly, but clicking "Proses Verifikasi" routes to the verifikator detail page where transition to `VERIFIED_ADMIN`, `VERIFIED_FIELD`, or `REVISION_ADMIN` may happen.
