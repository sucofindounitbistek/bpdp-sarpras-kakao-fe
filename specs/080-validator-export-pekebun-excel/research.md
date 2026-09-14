# Research: Fitur Ekspor Excel Data Pekebun & Lahan untuk Seluruh Validator

## 1. Mekanisme Pembangkitan Spreadsheet Excel (.xlsx)

- **Decision**: Gunakan generator XML Spreadsheet 2003 / RFC-4180 MIME `application/vnd.ms-excel` dengan extensi `.xlsx` atau generator XML Spreadsheet terstruktur di `src/utils/exportPekebunExcel.ts` (Client-side browser generation).
- **Rationale**:
  - Semua data proposal, pekebun, dan persil lahan sudah dimuat lengkap di reactive store (`pengusulanStore` / `pekebunStore`) saat validator membuka halaman peninjauan.
  - Zero round-trip ke backend: ekspor selesai dalam sekejap (< 100ms) tanpa membebani server backend atau antrean network.
  - Tidak memerlukan library berat pihak ketiga (zero external runtime bloat), mendukung styling header (tebal, border, warna), format teks pada NIK/KK agar tidak terkonversi menjadi format saintifik (`3.21E+15`), dan kompatibel penuh dengan Microsoft Excel, LibreOffice Calc, dan Google Sheets.
- **Alternatives Considered**:
  - *Endpoint Backend Go dengan library excelize*: Memerlukan penambahan rute, handler, DTO, dan dependensi baru di Go BE, serta beban network roundtrip saat mengunduh data yang sebenarnya sudah ada di frontend.
  - *CSV biasa*: CSV rentan merusak format string NIK/KK (16 digit terpotong/menjadi notasi ilmiah di Excel tanpa delimiter teks yang rumit) dan tidak mendukung styling header/lebar kolom.

---

## 2. Parsing Titik Koordinat Poligon Lahan

- **Decision**: Gunakan `parseCoordinatePolygon` dari `@/lib/coordinatePolygon` yang sudah ada di codebase frontend untuk mengekstrak array koordinat `[lat, lng]` dari string koordinat GeoJSON / WKT / format koordinat lahan.
- **Rationale**:
  - Format koordinat lahan pada sistem Sarpras disimpan dalam format array atau JSON string pasangan titik `[lat, lng]` (atau `[{lat, lng}]`).
  - Helper `parseCoordinatePolygon` telah teruji di peta spasial `VerificationOverlapMap.vue` dan `MapStep.vue`.
  - Berdasarkan hasil klarifikasi (Opsi A), setiap titik sudut poligon diekspor sebagai 1 baris berurutan dengan data atribut proposal dan pekebun diduplikasi.
- **Alternatives Considered**:
  - *Ambil titik centroid saja*: Ditolak dalam klarifikasi karena verifikator kementerian membutuhkan seluruh titik sudut untuk plot ulang poligon ke GIS/Google Earth.

---

## 3. Komponen UI Tombol Ekspor

- **Decision**: Buat komponen reusable atau menu dropdown `EksporPekebunDropdown.vue` (atau tombol dropdown inline) dengan 2 aksi unduh:
  1. *Laporan Titik Koordinat (.xlsx)*
  2. *Laporan Profil Pekebun (.xlsx)*
  Dipasang di:
  - `StepVerifikasiPekebunDanDokumenProposal.vue` (Tinjau Verifikasi Kabupaten di Tab My Task)
  - `PratinjauPekebunDanDokumenProposal.vue` (Tinjau Verifikasi Provinsi, Ditjenbun, dan BPDP)
- **Rationale**:
  - Memastikan konsistensi 100% tampilan antarmuka di seluruh peran validator.
  - Tampilan dropdown ringkas, tidak mengganggu tombol "Unduh Format Foto Udara" yang sudah ada.
