# Research & Technical Decisions: Revamp UX Halaman Verifikasi Usulan Kabupaten

**Feature**: `071-revamp-ux-verifikasi-kabupaten`
**Date**: 2026-09-03

## 1. UX Structure: Modular Accordion Pattern

### Decision:
Menggunakan pola **Independent Multi-Expand Accordion** dengan default state cerdas:
- **Modul 1 (Peta Spasial)**: `closed` secara default untuk mencegah inisialisasi berat Leaflet tile layer sebelum pengguna benar-benar memerlukannya.
- **Modul 2 (Pekebun & CPCL)**: `open` secara default karena verifikator harus melihat status seluruh anggota pekebun.
- **Modul 3 (Berkas Proposal)**: `open` secara default untuk memudahkan verifikasi berkas dan aksi *Setujui Semua*.
- **Modul 4 (Gudang Serah Terima)**: `closed` secara default (hanya dirender jika `hasStorageArea`).
- **Modul 5 (RAB & Rincian Anggaran)**: `closed` secara default untuk menjaga panjang halaman tetap proporsional.

### Rationale:
- Mengurangi *initial scroll length* halaman hingga lebih dari 60%.
- Mengurangi konsumsi memori dan latensi rendering browser untuk peta dan tabel besar.
- Tetap memberikan kebebasan penuh kepada pengguna untuk membuka modul apa pun kapan saja tanpa saling menutup (*multi-expand*).

---

## 2. Standardized Accordion Header Anatomy

### Decision:
Setiap modul membungkus headernya dengan komponen visual standar:
```html
<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
  <!-- Accordion Toggle Bar -->
  <button
    type="button"
    @click="toggleSection('sectionKey')"
    class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/70 transition-colors text-left cursor-pointer border-b border-slate-100"
  >
    <!-- Left: Icon & Title -->
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#066C2A] border border-emerald-100">
        <component :is="iconComponent" class="w-4 h-4" />
      </div>
      <div class="flex flex-col min-w-0">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
          {{ moduleTitle }}
        </h3>
        <p class="text-[11px] text-slate-500 truncate">
          {{ moduleSubtitle }}
        </p>
      </div>
    </div>

    <!-- Right: Reactive Status Tally + Chevron -->
    <div class="flex items-center gap-2.5 shrink-0">
      <!-- Status Badges -->
      <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ...">
        {{ tallyCount }}
      </span>
      <!-- Chevron -->
      <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
        <ChevronUp v-if="isOpen" class="w-3.5 h-3.5" />
        <ChevronDown v-else class="w-3.5 h-3.5" />
      </div>
    </div>
  </button>

  <!-- Accordion Body -->
  <div v-show="isOpen" class="p-5 flex flex-col gap-4">
    <!-- Content -->
  </div>
</div>
```

---

## 3. Reactive Tally Helpers

### Decision:
Menambahkan computed helpers reaktif di dalam `<script setup>`:
1. `pekebunSummary`: Menghitung berapa pekebun `Sesuai`, `Tidak Sesuai`, dan `Belum Diverifikasi`.
2. `dokumenSummary`: Menghitung berapa dokumen proposal `Sesuai`, `Tidak Sesuai`, dan `Belum Lengkap`.
3. `gudangSummary`: Menghitung status verifikasi parameter gudang (Alamat, Koordinat, Foto).
4. `rabSummary`: Menghitung status kelengkapan dokumen RAB dan validasi.
