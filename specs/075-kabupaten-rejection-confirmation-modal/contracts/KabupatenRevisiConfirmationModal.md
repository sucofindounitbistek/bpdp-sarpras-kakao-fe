# Component Contract: `KabupatenRevisiConfirmationModal.vue`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | `false` | Menentukan apakah modal terbuka atau tertutup. |
| `isSubmitting` | `boolean` | `false` | Status loading tombol konfirmasi saat proses API berlangsung. |
| `proposalNumber` | `string` | `''` | Nomor usulan proposal untuk header informasi. |
| `lembagaName` | `string` | `''` | Nama kelembagaan pemohon. |
| `destinationStage` | `string` | `'Pemohon (Revisi)'` | Tahap tujuan alur usulan setelah dikembalikan. |
| `rejectedProposalDocs` | `RejectedProposalDocItem[]` | `[]` | Daftar item dokumen proposal/kelembagaan/gudang yang ditolak. |
| `groupedPekebunRejections` | `GroupedPekebunRejection[]` | `[]` | Daftar item penolakan data pekebun & lahan yang dikelompokkan per pekebun. |

## Emitted Events

| Event | Payload | Description |
|---|---|---|
| `close` | `void` | Dipancarkan ketika pengguna menekan tombol Batal atau tombol X. |
| `confirm` | `void` | Dipancarkan ketika pengguna menekan tombol Konfirmasi Kembalikan. |

## UI Layout Specification

```text
+-----------------------------------------------------------------------------------+
|  Konfirmasi Pengembalian Berkas Usulan (Revisi)                               [X] |
|  Proposal: PSR2510220004JK • PERKUMPULAN GAPOKTAN KARYA MANDIRI                   |
|                                                                                   |
|  [Peringatan: Usulan akan dikembalikan ke Pemohon dengan rincian catatan berikut] |
|                                                                                   |
|  A. Data dan Dokumen Usulan & Kelembagaan                                         |
|  +----+--------------------------------+----------------------------------------+ |
|  | No | Nama Dokumen                   | Keterangan Penolakan                   | |
|  +----+--------------------------------+----------------------------------------+ |
|  | 1. | Rencana Anggaran Biaya (RAB)   | Format RAB belum sesuai pagu acuan     | |
|  | 2. | Foto Gudang Tampak Depan       | Foto buram tidak menampilkan plang     | |
|  +----+--------------------------------+----------------------------------------+ |
|                                                                                   |
|  B. Data dan Dokumen Pekebun & Lahan (CPCL)                                       |
|  +----+-------------------+-----------------------+-----------------------------+ |
|  | No | Nama Pekebun      | Jenis Dokumen / Objek | Keterangan Penolakan        | |
|  +----+-------------------+-----------------------+-----------------------------+ |
|  | 1. | ADE               | SHM - 188 / ADE       | Input nomor SHM tdk sesuai  | |
|  |    |                   | Scan KTP Pekebun      | NIK tdk terbaca pada pindaian| |
|  +----+-------------------+-----------------------+-----------------------------+ |
|  | 2. | ADITYA DWI P.     | SHM - 2871 / WAGIMAN  | Lahan tumpang tindih dgn... | |
|  |    |                   | SHM - 2925 / SITI J.  | Lahan tumpang tindih dgn... | |
|  +----+-------------------+-----------------------+-----------------------------+ |
|                                                                                   |
|                                            [ Batal ] [ Kembalikan ke Pemohon ]    |
+-----------------------------------------------------------------------------------+
```
