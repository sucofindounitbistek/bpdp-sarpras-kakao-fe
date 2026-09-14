# Data Model: Fitur Ekspor Excel Data Pekebun & Lahan

## 1. Skema Baris Ekspor Laporan Titik Koordinat

| No | Nama Kolom Excel | Tipe Data Excel | Sumber Data Sistem | Keterangan / Fallback |
|:---|:---|:---|:---|:---|
| 1 | `No` | Number | Nomor urut baris (1, 2, 3...) | Indeks baris berurutan |
| 2 | `Nomor Proposal` | String | `proposal.nomor_proposal` | e.g. `PRP/2026/03/001` |
| 3 | `Provinsi` | String | `lahan.provinsiNama` / `proposal.nama_dinas_provinsi` / lookup wilayah | Nama Provinsi lokasi |
| 4 | `Kabupaten` | String | `lahan.kabupatenNama` / `proposal.nama_dinas_kabupaten` / lookup wilayah | Nama Kabupaten lokasi |
| 5 | `Nama Kelembagaan Pekebun` | String | `proposal.kelembagaan.nama_lembaga` / `proposal.namaKelompokTani` | Nama Koperasi / Gapoktan |
| 6 | `Nama Pekebun` | String | `pekebun.name` / `pekebun.nama` | Nama lengkap pekebun |
| 7 | `NIK Pekebun` | String (Text) | `pekebun.nik` | 16 digit NIK (format teks agar tidak saintifik) |
| 8 | `Luas Lahan (Ha)` | Number | `lahan.luas_lahan` / `lahan.luasLahan` | Desimal, e.g. `2.50` |
| 9 | `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)` | String | `lahan.jenis_legalitas` | e.g. `SHM` atau `SKT/GIRIK/SPORADIK` |
| 10 | `Nama Tertera di SHM` | String | `pekebun.name` jika SHM sendiri, nama pemilik jika beda nama, `-` jika non-SHM | Sesuai klarifikasi |
| 11 | `Nomor SHM` | String | `lahan.nomor_legalitas` (jika jenis SHM), else `-` | Nomor sertifikat SHM |
| 12 | `Nomor SKT/GIRIK/SPORADIK` | String | `lahan.nomor_legalitas` (jika non-SHM), else `-` | Nomor surat non-SHM |
| 13 | `Latitude` | Number | Koordinat titik poligon Latitude | Desimal 6-8 digit presisi |
| 14 | `Longitude` | Number | Koordinat titik poligon Longitude | Desimal 6-8 digit presisi |

---

## 2. Skema Baris Ekspor Laporan Profil Pekebun

| No | Nama Kolom Excel | Tipe Data Excel | Sumber Data Sistem | Keterangan / Fallback |
|:---|:---|:---|:---|:---|
| 1 | `No` | Number | Nomor urut baris (1, 2, 3...) | Indeks baris berurutan |
| 2 | `Nama Pekebun` | String | `pekebun.name` / `pekebun.nama` | Nama lengkap pekebun |
| 3 | `NIK Pekebun` | String (Text) | `pekebun.nik` | 16 digit NIK (format teks) |
| 4 | `KK Pekebun` | String (Text) | `pekebun.nomor_kk` / `pekebun.nomorKK` | 16 digit No. KK (format teks) |
| 5 | `Alamat Pekebun` | String | `pekebun.address` / `pekebun.alamat` | Alamat tempat tinggal pekebun |
| 6 | `Jenis Legalitas` | String | `lahan.jenis_legalitas` | SHM / SKT / GIRIK / SPORADIK |
| 7 | `No / Nama Dokumen Legalitas Lahan` | String | `lahan.nomor_legalitas` | Nomor surat / nama dokumen alas hak |
| 8 | `Tanggal Terbit Legalitas Lahan` | String / Date | `lahan.tanggal_penerbitan_legalitas` | Format `DD-MM-YYYY` |
| 9 | `Luas Lahan Sesuai Legalitas (Ha)` | Number | `lahan.luas_lahan` | Luas tertera di legalitas |
| 10 | `Luas Lahan (Ha)` | Number | `lahan.luas_lahan` | Luas pengajuan lahan |

---

## 3. Relasi Data & Penanganan Null

- Jika seorang pekebun memiliki $N$ persil lahan ($N > 1$), maka:
  - Pada Laporan Profil Pekebun: Ditulis sebanyak $N$ baris (1 baris per persil lahan, data pekebun diulang).
  - Pada Laporan Titik Koordinat: Ditulis sebanyak $\sum (\text{titik sudut}_i)$ baris untuk seluruh persil lahan milik pekebun tersebut.
- Jika field opsional bernilai `null`, `undefined`, atau kosong, sistem menampilkan strip (`-`) dan tidak menampilkan teks `null` atau `undefined`.
