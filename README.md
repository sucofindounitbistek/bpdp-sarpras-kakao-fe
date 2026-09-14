# 🌿 BPDPKS — Sistem Informasi Penyaluran Sarana & Prasarana Kelapa (Frontend)

![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)

Frontend web application modern untuk **Sistem Informasi Pengusulan, Verifikasi Berjenjang, dan Penyaluran Bantuan Sarana & Prasarana (Sarpras) Kelapa** di bawah naungan **Badan Pengelola Dana Perkebunan (BPDPKS)** dan **Direktorat Jenderal Perkebunan (Ditjenbun) Kementerian Pertanian Republik Indonesia**.

---

## 🚀 Fitur Utama Application

### 👥 1. Simulasi Multi-Role & Hak Akses (*Role Switcher*)
Fitur pengujian simulasi hak akses lintas instansi secara instan tanpa login berulang:
- **Lembaga Pekebun / Koperasi (Pemohon)**: Pengajuan proposal usulan sarpras, pengelolaan CPCL, tracking status usulan real-time, dan revisi berkas.
- **Dinas Kabupaten / Kota**: Verifikasi kelengkapan administrasi, verifikasi lapangan CPCL, dan penerbitan Surat Rekomendasi Teknis (Rekomtek Kab/Kota).
- **Dinas Provinsi**: Kaji ulang Rekomtek Kabupaten dan pengesahan rekomendasi tingkat provinsi.
- **Ditjenbun Kementan (Pusat)**: Evaluasi usulan, sidang pleno penetapan, dan penerbitan Surat Keputusan (SK) Penetapan Usulan Sarpras.
- **BPDPKS**: Eksekusi penyaluran dana bantuan ke rekening escrow penampung dan pengawasan realisasi sarpras Kelapa.

---

### 📋 2. Form Wizard 5-Tahap Pengusulan Sarpras
Pengisian usulan yang terstruktur dilengkapi **Garis Progres Dinamis (*Animated Connecting Line*)**:
1. **Profil Lembaga Pekebun**: Identitas kelompok tani/koperasi, nomor akta pendirian, NIB, pengurus, dan rekening bank.
2. **Data CPCL & GIS Geotagging**: Input data petani calon lokasi (NIK, KK, luas lahan, legalitas SHM/SKT).
3. **Paket Usulan Sarpras**: Pemilihan bantuan (Benih Kelapa Unggul, Pupuk Organic, Alat Pasca Panen, Jalan Produksi, dll) beserta pagu anggaran.
4. **Unggah Dokumen Persyaratan**: Upload berkas legalitas (PDF / JPG / PNG max 5MB) dengan preview instant.
5. **Konfirmasi & Tracking**: Ringkasan usulan dan penerbitan Nomor Resi Pengajuan.

---

### 🗺️ 3. GIS Pemetaan Spasial Lahan & Impor Excel Bulk
- **Leaflet Spatial Mapping Engine**: Pemetaan titik koordinat lahan Kelapa dan kalkulasi otomatis poligon spasial sentra Kelapa.
- **Excel Bulk Copy-Paste Importer**:
  - Menyalin sel koordinat langsung dari Microsoft Excel (`Latitude \t Longitude`) lalu mengimpor secara masal.
  - Support **Direct Clipboard Paste (`Ctrl + V`)** langsung pada input field latitude/longitude.

---

### 🎨 4. Modern Executive Design System
- **Soft Glassmorphism**: Transparansi kartu melayang di atas backdrop alam perkebunan Kelapa (`bg-login.png`).
- **Floating Sticky Navigation**: Header navbar & sidebar melayang yang presisi (*flush alignment*) dengan konten utama.
- **Breadcrumb Navigation**: Petunjuk navigasi otomatis di setiap halaman.
- **Responsive Layout**: Optimal untuk layar Smartphone (375px), Tablet (768px), Laptop/Desktop (1024px+).

---

## 🛠️ Teknologi & Library

- **Core Framework**: [Vue 3](https://vuejs.org/) (Composition API dengan `<script setup>`)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Type Safety**: [TypeScript 5.6](https://www.typescriptlang.org/)
- **State Management**: [Pinia 2.3](https://pinia.vuejs.org/)
- **Routing**: [Vue Router 4.5](https://router.vuejs.org/)
- **Styling & UI**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **Spatial Maps**: [Leaflet GIS 1.9](https://leafletjs.com/)

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat
Pastikan komputer Anda telah terinstall **Node.js (v18.0 atau lebih baru)** dan **npm**.

### Langkah-langkah:

1. **Clone Repository & Masuk ke Direktori Project**:
   ```bash
   git clone <repository-url>
   cd bpdp-sarpras-Kelapa-fe
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Server Mode Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

4. **Build untuk Production**:
   ```bash
   npm run build
   ```
   Hasil build akan tersimpan di direktori `dist/` dan dipastikan lulus kompilasi TypeScript (`vue-tsc -b`).

5. **Pratinjau Hasil Build Production**:
   ```bash
   npm run preview
   ```

---

## 📁 Struktur Direktori Project

```text
bpdp-sarpras-Kelapa-fe/
├── src/
│   ├── assets/              # Static assets (images, logos, global styles)
│   ├── components/          # Reusable UI components
│   │   ├── dinas/           # Komponen verifikasi dinas (RevisiModal, Checklist)
│   │   ├── gis/             # Komponen peta Leaflet GIS (PolygonMap)
│   │   └── ui/              # UI Design System (Button, Card, Input, Sidebar, Header, Breadcrumb, Toast)
│   ├── composables/         # Custom Vue composables (useToast)
│   ├── lib/                 # Helper utilities (cn tailwind merge)
│   ├── router/              # Konfigurasi Vue Router & route guards
│   ├── stores/              # Pinia Stores (auth.ts, pengusulan.ts)
│   ├── types/               # TypeScript interfaces & enums (pengajuan.ts, role.ts)
│   └── views/               # Halaman View per Role & Fitur
│       ├── bpdpks/          # Penyaluran Dana & User Management
│       ├── dinas/           # Verifikasi Kab/Kota & Provinsi
│       ├── ditjenbun/       # Evaluasi Pleno & Penerbitan SK
│       ├── pemohon/         # Tracking & Form Revisi Usulan
│       └── pengusulan/      # 5-Step Form Wizard Pengusulan
├── public/                  # Static assets public root
├── index.html               # Entry Point HTML
├── tailwind.config.js       # Konfigurasi Design Tokens Tailwind
├── vite.config.ts           # Konfigurasi Vite Bundler
└── tsconfig.json            # Konfigurasi Compiler TypeScript
```

---

## 📝 Lisensi & Hak Cipta

© 2026 **BPDPKS (Badan Pengelola Dana Perkebunan)** & **Direktorat Jenderal Perkebunan Kementan RI**.  
Hak Cipta Dilindungi Undang-Undang.

