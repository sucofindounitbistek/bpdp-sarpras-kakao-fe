# Contract: Rekomtek Generator Interface

**Feature Directory**: `specs/083-generate-rekomtek-ditjenbun/`  
**Date**: 2026-09-12  

---

## 1. Input Contract: `RekomtekDocumentData`

```typescript
export interface RekomtekItemRAB {
  no: number;
  namaBarang: string;
  satuan: string;
  volume: number;
  hargaSatuan: number;
  totalHarga: number;
  keterangan?: string;
}

export interface RekomtekDocumentData {
  nomorSurat: string;
  sifat: string;
  lampiran: string;
  hal: string;
  tanggalSurat: string;
  
  tujuanPenerima: string;
  tempatTujuan: string;

  suratProvinsi: {
    nomor: string;
    tanggal: string;
    perihal: string;
  };

  kelembagaan: {
    namaLembaga: string;
    badanHukum: string;
    alamatLembaga: string;
    luasArealHa: number;
    jumlahPekebun: number;
    lokasiKebun: string;
  };

  paketSarpras: {
    namaPaket: string;
    jenisBantuan: string;
    totalNilaiRp: number;
    terbilangRp: string;
  };

  itemsRAB: RekomtekItemRAB[];

  pejabatDitjenbun: {
    jabatan: string;
    nama: string;
    nip: string;
    isDraft: boolean;
  };

  tembusan: string[];

  skCpclKabupaten: {
    nomorSk: string;
    tanggalSk: string;
    pejabatPenerbit: string;
  };
  beritaAcaraVerifikasi: {
    nomorBa: string;
    tanggalBa: string;
  };
}
```

---

## 2. Generator Functions Contract: `rekomtekPdfGenerator.ts`

```typescript
/**
 * Menghasilkan markup HTML dokumen Rekomtek 3 halaman presisi 1:1
 * lengkap dengan CSS @page dan inline styles.
 */
export function generateRekomtekHtml(data: RekomtekDocumentData): string;

/**
 * Membuka jendela print/PDF browser untuk mencetak dokumen Rekomtek 3 halaman.
 */
export function printRekomtekDocument(data: RekomtekDocumentData): void;

/**
 * Konversi nilai nominal numerik ke teks terbilang Rupiah resmi.
 */
export function terbilangRupiah(nominal: number): string;
```
