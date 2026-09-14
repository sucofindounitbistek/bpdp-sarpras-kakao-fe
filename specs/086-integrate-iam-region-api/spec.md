# Feature Specification: Integrasi API Master Wilayah IAM pada Pengisian Lahan Pekebun

**Feature Branch**: `086-integrate-iam-region-api`

**Created**: 2026-09-14

**Status**: Ready for Planning

**Input**: User description: "tolong dong diintegrasikan dengan api yang ada di iam untuk data wilayah"

## Clarifications

### Session 2026-09-14

- Q: Bagaimana mekanisme input Kecamatan dan Desa mengingat API IAM saat ini baru menyediakan data hingga tingkat Kabupaten/Kota? → A: Option A (Input Teks Bebas / Free Text Input): Mengubah field input Kecamatan dan Desa pada formulir lahan menjadi text input fleksibel sehingga operator KP dapat mengisi nama kecamatan dan desa di seluruh 38 provinsi tanpa batasan.
- Q: Bagaimana representasi nilai identitas wilayah yang dikirim dan disimpan ke backend Sarpras? → A: Option A (Gunakan ID/Kode Standar IAM): Menyimpan ID numerik dari IAM (misal: `"73"`, `"7322"`) ke `kode_provinsi` & `kode_kabupaten`, serta mencatat nama teks wilayahnya untuk sinkronisasi optimal dengan data SSO/IAM.
- Q: Bagaimana strategi caching untuk data master wilayah dari API IAM di frontend? → A: Option A (In-Memory / Pinia Store Cache): Menyimpan daftar provinsi dan kabupaten/kota yang sudah di-fetch ke dalam in-memory store/cache (Pinia) agar request jaringan hanya dilakukan sekali per sesi pengisian dan tidak redundan saat navigasi antar persil lahan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pemuatan dan Pemilihan Provinsi dari API Master Wilayah IAM (Priority: P1) 🎯 MVP

Sebagai operator Kelembagaan Pekebun (KP), saya ingin memilih provinsi lokasi lahan perkebunan dari daftar resmi seluruh 38 provinsi di Indonesia yang diambil secara langsung dari API IAM (`/public/regions/provinces`), sehingga data provinsi akurat dan tidak terbatas pada data tiruan (mock) lokal.

**Why this priority**: Menghilangkan ketergantungan pada data statis tiruan lokal yang hanya memuat 3 provinsi Sulawesi, memungkinkan pengusulan lahan di seluruh wilayah perkebunan Indonesia.

**Independent Test**: Buka form pendaftaran pekebun, buka tab Data Lahan, buka dropdown Provinsi; pastikan daftar 38 provinsi Indonesia berhasil dimuat secara dinamis dari API IAM dengan indikator loading yang responsif.

**Acceptance Scenarios**:

1. **Given** operator KP berada pada tab "Wilayah & Berkas" di formulir penambahan/pengubahan lahan, **When** komponen dimuat, **Then** sistem memanggil endpoint API IAM `/public/regions/provinces` dan menampilkan 38 provinsi resmi Indonesia pada dropdown Provinsi.
2. **Given** koneksi ke API IAM mengalami gangguan sementara, **When** dropdown provinsi dimuat, **Then** sistem menampilkan pesan error yang informatif dan menyediakan tombol untuk mencoba memuat ulang (*retry*).

---

### User Story 2 - Pemilihan Kabupaten/Kota Dinamis Berdasarkan Provinsi Terpilih (Priority: P1) 🎯 MVP

Sebagai operator Kelembagaan Pekebun (KP), saya ingin dropdown Kabupaten/Kota secara otomatis memuat daftar kabupaten/kota yang sesuai dengan provinsi yang saya pilih melalui endpoint API IAM (`/public/regions/regencies?province_id={id}`), sehingga saya dapat memilih kabupaten/kota yang valid.

**Why this priority**: Menjamin relasi administratif antara provinsi dan kabupaten/kota konsisten dan sesuai dengan pembagian wilayah resmi nasional.

**Independent Test**: Pilih provinsi (misal: "RIAU"), pastikan dropdown Kabupaten/Kota aktif dan terisi seluruh kabupaten/kota di Riau (seperti "KABUPATEN SIAK", "KABUPATEN KAMPAR", dll.). Jika provinsi diubah, dropdown kabupaten/kota di-reset dan dimuat ulang sesuai provinsi baru.

**Acceptance Scenarios**:

1. **Given** operator telah memilih salah satu provinsi, **When** pilihan provinsi berubah, **Then** sistem otomatis mengosongkan pilihan kabupaten/kota sebelumnya dan memanggil API IAM `/public/regions/regencies?province_id={province_id}` untuk mengisi opsi kabupaten/kota terkait.
2. **Given** operator belum memilih provinsi, **When** melihat dropdown kabupaten/kota, **Then** dropdown dalam kondisi nonaktif (*disabled*) dengan placeholder "Pilih Provinsi terlebih dahulu".

---

### User Story 3 - Pengisian Kecamatan dan Desa Fleksibel Berbasis Teks Bebas (Priority: P2)

Sebagai operator Kelembagaan Pekebun (KP), saya ingin mengisi nama kecamatan dan desa lokasi lahan melalui input teks bebas yang fleksibel, sehingga pengisian data lahan dapat diselesaikan secara tuntas untuk seluruh wilayah di Indonesia tanpa terhalang ketiadaan master data kecamatan/desa di API IAM.

**Why this priority**: Memastikan proses bisnis pendaftaran lahan pekebun tetap berjalan 100% lengkap sampai tingkat desa tanpa terblokir keterbatasan cakupan data API IAM.

**Independent Test**: Pilih provinsi dan kabupaten dari API IAM, kemudian ketikkan nama kecamatan (misal: "Siak") dan desa (misal: "Kampung Rempak"), lalu simpan lahan ke dalam daftar; pastikan ringkasan wilayah menampilkan hierarki lengkap (Provinsi, Kabupaten, Kecamatan, Desa).

**Acceptance Scenarios**:

1. **Given** operator telah memilih provinsi dan kabupaten/kota dari API IAM, **When** mengisi informasi wilayah lanjutan, **Then** sistem menyediakan text input untuk Kecamatan dan Desa yang dapat diisi secara leluasa oleh pengguna.
2. **Given** data lahan disimpan dan diedit kembali, **When** modal atau form edit dibuka, **Then** nilai provinsi, kabupaten, kecamatan, dan desa ter-rehydrate dengan tepat.

---

### Edge Cases

- **Kegagalan Jaringan ke API IAM**: Jika endpoint IAM mengembalikan error HTTP (500 atau timeout), sistem harus menampilkan notifikasi toast peringatan dan fallback gracefully tanpa menyebabkan crash pada form wizard.
- **Penyimpanan Draft Lahan**: Saat pekebun disimpan sebagai draft, kode dan nama wilayah yang bersumber dari API IAM tetap tersimpan dengan utuh.
- **Rehidrasi Data Lahan Eksisting**: Ketika mengedit pekebun yang sudah terdaftar, sistem harus memetakan kembali `provinsiKode` dan `kabupatenKode` ke opsi dropdown API IAM yang sesuai.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST mengintegrasikan pemanggilan API publik IAM untuk mengambil daftar provinsi melalui endpoint `GET /public/regions/provinces` menggunakan client HTTP terkonfigurasi (`VITE_IAM_API_URL` atau proxy API).
- **FR-002**: Sistem MUST memuat daftar kabupaten/kota secara dinamis dari API IAM melalui endpoint `GET /public/regions/regencies?province_id={province_id}` segera setelah pengguna memilih provinsi.
- **FR-003**: Sistem MUST me-reset nilai kabupaten, kecamatan, dan desa jika pengguna mengganti pilihan provinsi pada form lahan aktif.
- **FR-004**: Sistem MUST menghentikan penggunaan data tiruan (`MOCK_WILAYAH`) pada level Provinsi dan Kabupaten/Kota di formulir lahan pekebun (`StepDataLahanPekebun.vue`).
- **FR-005**: Sistem MUST mengimplementasikan caching lokal/store untuk daftar provinsi dan kabupaten yang telah diunduh dari API IAM agar tidak melakukan request HTTP berulang saat berpindah-pindah persil lahan (*zero redundant API calls* per Konstitusi Prinsip V).
- **FR-006**: Sistem MUST menyimpan ID numerik standar IAM sebagai nilai `kode_provinsi` dan `kode_kabupaten` (misal: `"73"`, `"7322"`), serta mencatat label nama teks wilayahnya agar sinkron dengan relasi IAM dan database Sarpras.
- **FR-007**: Sistem MUST menampilkan status loading (*skeleton* atau *spinner*) pada dropdown saat data wilayah sedang di-fetch dari API IAM.
- **FR-008**: Sistem MUST menyediakan input teks bebas (*free-text input*) yang ramah pengguna untuk field Kecamatan dan Desa dengan placeholder dan validasi yang jelas.

### Key Entities

- **Province (IAM)**: Entitas provinsi dari IAM dengan atribut `id` (numerik) dan `name` (string uppercase, e.g. "SULAWESI SELATAN").
- **Regency (IAM)**: Entitas kabupaten/kota dari IAM dengan atribut `id` (numerik), `province_id` (numerik), dan `name` (string uppercase, e.g. "KABUPATEN LUWU UTARA").
- **LahanFormData**: Model data lahan di frontend yang menampung `provinsiKode`, `kabupatenKode`, `kecamatanKode`, `desaKode`, serta nama teks wilayah terkait.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% provinsi (seluruh 38 provinsi di Indonesia) tersedia dan dapat dipilih di dropdown Provinsi form lahan pekebun secara dinamis dari API IAM.
- **SC-002**: 100% kabupaten/kota dari provinsi terpilih dimuat secara otomatis dari API IAM dalam waktu < 1 detik pada kondisi jaringan normal.
- **SC-003**: Jumlah request HTTP duplikat untuk provinsi yang sama adalah 0 berkat mekanisme caching di store/service.
- **SC-004**: Tidak ada ketergantungan tersisa pada array mock `MOCK_WILAYAH` untuk level Provinsi dan Kabupaten di form lahan pekebun.
- **SC-005**: Pengguna dapat menginputkan nama kecamatan dan desa di seluruh 38 provinsi di Indonesia tanpa terhambat oleh opsi dropdown terbatas.

## Assumptions

- Endpoint publik IAM (`/api/v1/public/regions/provinces` dan `/api/v1/public/regions/regencies`) dapat diakses oleh frontend tanpa memerlukan autentikasi Bearer token khusus (*public lookup*).
- Variabel environment `VITE_IAM_API_URL` telah terdefinisi di `.env` atau dapat di-resolve melalui proxy frontend/API base URL.
- Backend Sarpras (`bpdp-sarpras-kelapa-be`) tetap menerima string/ID kode wilayah pada field `kode_provinsi`, `kode_kabupaten`, `kode_kecamatan`, `kode_desa` pada payload usulan lahan tanpa memerlukan perubahan skema tabel database.
