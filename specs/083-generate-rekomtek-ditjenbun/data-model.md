# Data Model: 1:1 Rekomendasi Teknis (Rekomtek) Ditjenbun

**Feature Directory**: `specs/083-generate-rekomtek-ditjenbun/`  
**Date**: 2026-09-12  

---

## 1. DTOs & TypeScript Interfaces

### 1.1 `RekomtekDocumentData`
Interface parameter yang dikonsumsi oleh HTML generator dan modal viewer:

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
  // Metadata Surat
  nomorSurat: string;          // e.g. "124/PI.400/E/08/2026" or fallback ".../PI.400/E/09/2026"
  sifat: string;               // Default: "Biasa"
  lampiran: string;            // Default: "Satu Berkas"
  hal: string;                 // e.g. "Rekomendasi Teknis Sarana dan Prasarana Kegiatan Intensifikasi Tanaman ..."
  tanggalSurat: string;        // e.g. "20 Agustus 2026" or current formatted date
  
  // Tujuan
  tujuanPenerima: string;      // "Direktur Utama Badan Pengelola Dana Perkebunan Kelapa Sawit"
  tempatTujuan: string;        // "di Tempat"

  // Rujukan Surat Masuk (Dinas Provinsi)
  suratProvinsi: {
    nomor: string;             // e.g. "500.5.4/4804/DISBUN-Bid.1"
    tanggal: string;           // e.g. "22 Juli 2024"
    perihal: string;           // e.g. "Usulan Kegiatan Sarpras Perkebunan Kelapa Sawit"
  };

  // 8 Butir Rekomendasi Teknis
  kelembagaan: {
    namaLembaga: string;       // e.g. "KUD BINA TANI SEJAHTERA"
    badanHukum: string;        // e.g. "No. AHU-0001234.AH.01.26.TAHUN 2020"
    alamatLembaga: string;     // e.g. "Desa Sukamaju, Kec. Tapung Hilir, Kab. Kampar, Riau"
    luasArealHa: number;       // e.g. 150.25
    jumlahPekebun: number;     // e.g. 75
    lokasiKebun: string;       // e.g. "Desa Sukamaju, Kec. Tapung Hilir, Kab. Kampar"
  };

  // Butir 7 & 8: Paket Sarpras & Nilai Anggaran
  paketSarpras: {
    namaPaket: string;         // e.g. "Intensifikasi Tanaman Kelapa Sawit"
    jenisBantuan: string;      // "Barang" atau "Uang"
    totalNilaiRp: number;      // e.g. 1450000000
    terbilangRp: string;       // e.g. "Satu Miliar Empat Ratus Lima Puluh Juta Rupiah"
  };

  // Butir 8: Rincian Bantuan
  itemsRAB: RekomtekItemRAB[];

  // Penandatangan Ditjenbun
  pejabatDitjenbun: {
    jabatan: string;           // "Plt. Direktur Jenderal Perkebunan"
    nama: string;              // "Heru Tri Widarto, S.Si., M.Sc"
    nip: string;               // "197204121999031004"
    isDraft: boolean;          // true = cetak label watermark / draft qr code
  };

  // Tembusan
  tembusan: string[];

  // Lampiran (Halaman 3)
  skCpclKabupaten: {
    nomorSk: string;           // e.g. "500.5.4/DISBUN/SK-CPCL/2024/012"
    tanggalSk: string;         // e.g. "15 Juni 2024"
    pejabatPenerbit: string;   // e.g. "Kepala Dinas Perkebunan Kabupaten Kampar"
  };
  beritaAcaraVerifikasi: {
    nomorBa: string;           // e.g. "BA-VERIF/DISBUN-PROV/07/2024"
    tanggalBa: string;         // e.g. "20 Juli 2024"
  };
}
```

---

## 2. State Mapping dari Usulan Aktif (`activeUsulan`)

| Field Rekomtek | Sumber Data di `activeUsulan` / Store | Fallback Default |
| :--- | :--- | :--- |
| `nomorSurat` | `nomorRekomtek.value` | `.../PI.400/E/[MM]/[YYYY]` |
| `namaLembaga` | `activeUsulan.lembaga.namaLembaga` \|\| `activeUsulan.namaLembagaPekebun` | `"[Nama Lembaga Pekebun]"` |
| `badanHukum` | `activeUsulan.lembaga.nomorBadanHukum` \|\| `activeUsulan.nomor_sk_kumham` | `"SK Kemenkumham / Akta Notaris"` |
| `luasArealHa` | `activeUsulan.luas_kebun` \|\| `activeUsulan.luasKebun` | `0` |
| `jumlahPekebun` | `activeUsulan.total_pekebun` \|\| `activeUsulan.totalPekebun` | `0` |
| `totalNilaiRp` | `activeUsulan.total_anggaran` \|\| `activeUsulan.totalAnggaran` | `0` |
| `itemsRAB` | `activeUsulan.rabItems` \|\| dari API `/rab/proposal/:id` | Item RAB terdaftar |
