# Phase 1 Data Model: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

## Entities & Relationships

### 1. Proposal
Entitas utama pengajuan proposal permohonan sarpras.

| Field | Type | Description |
|---|---|---|
| `id` | `uint` (PK) | Identifier proposal |
| `nomor_proposal` | `string` | Nomor proposal (format SPKA...) |
| `kelembagaan_id` | `uint` (FK) | Relasi ke kelembagaan pekebun |
| `paket_sarpras` | `string` | Kode paket sarpras |
| `total_anggaran` | `float64` | Total nominal anggaran RAB (tetap terjaga/konsisten) |
| `status` | `string` | Status alur (`SUBMITTED`, `REV_FROM_KAB`, dll) |

**Relasi**:
- `HasMany`: `DokumenProposal` (`documents`)
- `HasMany`: `RabProposal` (`rabs`)
- `HasOne`: `StorageArea` (`storage_area`)

---

### 2. DokumenProposal (RAB Document)
Tabel penyimpanan dokumen fisik pendukung usulan, termasuk berkas fisik RAB.

| Field | Type | Description |
|---|---|---|
| `id` | `uint` (PK) | Identifier dokumen proposal |
| `proposal_id` | `uint` (FK) | Relasi ke proposal |
| `file_id` | `uint` (FK) | Relasi ke file upload (diperbarui saat revisi) |
| `document_type` | `string` | Jenis dokumen (`RAB_PROPOSAL`, `RAB_RK`, `RAB`, dll) |

**Relasi**:
- `BelongsTo`: `File` (`file`)
- `HasMany`: `ProposalDocumentValidation` (`validations`)

---

### 3. ProposalDocumentValidation (Validasi Dokumen Proposal)
Tabel pencatatan hasil verifikasi administratif per-dokumen proposal.

| Field | Type | Description |
|---|---|---|
| `id` | `uint` (PK) | Identifier validasi |
| `dokumen_proposal_id` | `uint` (FK) | Relasi ke dokumen proposal |
| `is_valid` | `boolean` | `true` jika disetujui, `false` jika ditolak |
| `notes` | `text` (nullable) | Catatan alasan penolakan dari verifikator |
| `validated_by_role` | `string` | Role verifikator (`DINAS_KABUPATEN`) |

---

### 4. CategorizedRejectionItem (DTO Response)
Struktur data DTO yang dikembalikan ke halaman revisi untuk memetakan penolakan ke tab yang sesuai.

| Field | Type | Description |
|---|---|---|
| `category` | `string` | Kategori tab (`PROPOSAL_DOC`, `GUDANG`, `PEKEBUN`, `RAB`) |
| `target_id` | `uint` | ID entitas yang ditolak (`dokumen_proposal_id`) |
| `target_key` | `string` | Key unik target (`rab-signed`, `doc-123`) |
| `item_label` | `string` | Label deskriptif dokumen |
| `notes` | `string` | Catatan penolakan dari verifikator |
| `is_resolved` | `boolean` | Status apakah berkas baru sudah diunggah di sesi revisi |

---

## State Lifecycle & Transitions

```
[Pengajuan Awal]
       │ (Status: SUBMITTED, Dokumen RAB Terunggah)
       ▼
[Verifikasi Dinas Kabupaten]
       │
       ├─► Setuju Semua Dokumen ──► Status: VERIFIED_KAB / Diajukan ke Provinsi
       │
       └─► Tolak Dokumen RAB + Catatan ──► Status: REV_FROM_KAB
                                                 │
                                                 ▼
                                     [Halaman Revisi Pekebun]
                                                 │
                                                 ├─► Tab RAB: Tinjau Overview Tabel RAB (Read-Only)
                                                 ├─► Tab RAB: Cetak Ulang Format PDF (Jika Perlu)
                                                 ├─► Tab RAB: Unggah Dokumen RAB Baru Bertandatangan
                                                 │   (Sinkronisasi status ke Tab Dokumen Proposal)
                                                 │
                                                 ▼
                                     [Kirim Ulang Revisi Proposal]
                                                 │ (Status: SUBMITTED, File ID Baru Terhubung)
                                                 ▼
                                     [Verifikasi Ulang Dinas Kabupaten]
                                       (Menampilkan Dokumen Baru & Riwayat Catatan Penolakan Lama)
```
