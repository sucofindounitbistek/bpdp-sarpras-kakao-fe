# Data Model: Perbaikan Form Edit Paket Sarpras & Dokumen Wajib/Opsional (Frontend)

**Feature**: `082-fix-edit-paket-sarpras`  
**Date**: 2026-09-12  
**Status**: Completed  

---

## 1. Entities & Types

### 1.1 `PaketSarprasFormState` (Modal Form Edit Paket)
Struktur data form modal edit paket sarpras di `PaketSarprasListView.vue` (tanpa field label singkat terpisah di UI):

```typescript
export interface PaketSarprasFormState {
  kategori_code: string;           // Kode kategori (contoh: 'EKSTENSIFIKASI', 'UPH')
  code: string;                    // Kode unik paket (read-only saat mode edit)
  name: string;                    // Nama lengkap paket (Wajib diisi - label disinkronkan otomatis)
  description: string;             // Deskripsi ruang lingkup paket
  icon: string;                    // Ikon emoji / simbol (default '📦')
  is_pupuk: boolean;               // Penanda apakah paket melibatkan alokasi pupuk
  jumlah_tahap: number;            // Jumlah tahapan pencairan RAB (1 s.d 4)
  kode_penomoran: string;          // Kode penomoran usulan (1-10 karakter)
  minimal_pekebun: number | null;  // Batas minimum pekebun (opsional)
  minimal_luas_ha: number | null;  // Batas minimum luas lahan dalam hektar (opsional)
  keterangan: string;              // Catatan tambahan syarat minimum
  dokumen_codes: string[];         // Daftar kode dokumen persyaratan yang tercentang
}
```

### 1.2 `DokumenPersyaratanFormState` (Modal Form Tambah/Edit Dokumen)
Struktur data form modal dokumen persyaratan di `DokumenPersyaratanListView.vue`:

```typescript
export interface DokumenPersyaratanFormState {
  code: string;                    // Kode unik dokumen (contoh: 'LEGALITAS_KP')
  name: string;                    // Nama dokumen persyaratan
  description: string;             // Deskripsi petunjuk pengunggahan
  format_download_url: string;     // URL template format download (opsional)
  max_size_mb: number;             // Batas maksimal ukuran file dalam MB (default 5)
  allowed_types: string[];         // Ekstensi yang diizinkan ['PDF', 'IMAGE', 'DOCX', 'XLSX']
  is_active: boolean;              // Status aktif dokumen
  is_wajib: boolean;               // Status sifat dokumen: true = Wajib, false = Opsional
}
```

### 1.3 `MasterDokumenCatalog` (Type Definition)
```typescript
export interface MasterDokumenCatalog {
  id: number;
  code: string;
  name: string;
  description?: string;
  format_download_url?: string;
  allowed_mime_types?: string;
  max_size_bytes?: number;
  is_active: boolean;
  is_wajib: boolean;               // NEW: default Wajib vs Opsional
}
```

### 1.4 `DokumenPersyaratanItem` (Relasi Paket-Dokumen)
```typescript
export interface DokumenPersyaratanItem {
  id: number;
  dokumen_code: string;
  nama?: string;
  format_download_url?: string;
  is_wajib: boolean;               // Mewarisi status Wajib/Opsional dari katalog
  sort_order: number;
  max_size_bytes?: number;
  keterangan?: string;
}
```

---

## 2. Validation & Fallback Rules

| Field | Tipe | Wajib | Aturan Validasi / Fallback |
| :--- | :--- | :--- | :--- |
| `name` | string | Ya | Wajib non-kosong. Jika awal kosong di DB, fallback dari `label`. Saat submit, otomatis disalin ke `label`. |
| `is_wajib` (Katalog) | boolean | Ya | Default `true` (Wajib). Dapat di-toggle menjadi `false` (Opsional). |
| `is_wajib` (Paket) | boolean | Ya | Mewarisi nilai `is_wajib` dari master katalog dokumen bersangkutan. |
| `kategori_code` | string | Ya | Wajib dipilih dari daftar `kategoriList`. |
| `dokumen_codes` | string[] | Tidak | Array kode dokumen persyaratan yang aktif tercentang. |

---

## 3. Proposal Flow Visual Rules

```
[Master Dokumen Persyaratan]
     │ is_wajib: true / false
     ▼
[Master Paket Sarpras]
     │ Inherits is_wajib per document
     ▼
[Proposal Multi-Role Verification]
     ├── If is_wajib == true:
     │     ├── Render: <Badge variant="rose">Wajib</Badge>
     │     └── Validation: Blocking (harus diunggah / disetujui)
     │
     └── If is_wajib == false:
           ├── Render: <Badge variant="slate">Opsional</Badge>
           └── Validation: Non-blocking (dapat lanjut meski kosong)
```
