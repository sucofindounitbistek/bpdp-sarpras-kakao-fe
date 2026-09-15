import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UsulanRekomtek, UsulanStatus, BantuanType, StatusLog } from '@/types/rekomtek';
import { StatusPernikahan, JenisLegalitas, TipeDokumenPekebun, type Pekebun } from '@/types/pekebun';
import { JenisSarpras } from '@/types/pengusulan';
import { generateSpkaNomor } from '@/lib/spkaNumbering';

export const useRekomtekStore = defineStore('rekomtek', () => {
  const mockPekebun: Pekebun[] = [
    {
      id: 'pkb-001',
      kelembagaanId: 'klb-001',
      nik: '3201010101800002',
      nama: 'Suratno',
      nomorKK: '3201010101800001',
      statusPernikahan: StatusPernikahan.MENIKAH,
      tempatLahir: 'Bandung',
      tanggalLahir: '1980-01-15',
      alamat: 'Jl. Cibiru No. 12, RT 03 RW 05, Desa Cileunyi',
      kodepos: '40622',
      nomorHP: '081234567890',
      dokumen: [
        { id: 'doc-001', documentType: TipeDokumenPekebun.SCAN_KTP, fileName: 'ktp-suratno.pdf', fileUrl: '/files/ktp-pkb-001.pdf', fileSize: 450000, fileExtension: 'application/pdf' },
        { id: 'doc-002', documentType: TipeDokumenPekebun.SCAN_KK, fileName: 'kk-suratno.pdf', fileUrl: '/files/kk-pkb-001.pdf', fileSize: 520000, fileExtension: 'application/pdf' },
        { id: 'doc-003', documentType: TipeDokumenPekebun.SWAFOTO, fileName: 'swafoto-suratno.jpg', fileUrl: '/files/swafoto-pkb-001.jpg', fileSize: 210000, fileExtension: 'image/jpeg' },
      ],
      lahan: {
        id: 'lhn-001',
        pekebunId: 'pkb-001',
        jenisLegalitas: JenisLegalitas.SHM,
        nomorLegalitas: 'SHM-0042/2020',
        tanggalPenerbitanLegalitas: '2020-03-10',
        luasLahan: 2.5,
        provinsiKode: '32',
        provinsiNama: 'Jawa Barat',
        kabupatenKode: '3204',
        kabupatenNama: 'Bandung',
        kecamatanKode: '320410',
        kecamatanNama: 'Cileunyi',
        desaKode: '3204102001',
        desaNama: 'Cileunyi Kulon',
        alamatKebun: 'Blok Cisalak RT 03',
        tahunTanam: 2018,
        jenisBibit: 'Kelapa Lindak',
        scanLegalitasUrl: '/files/shm-pkb-001.pdf',
        coordinates: [
          { lat: -2.5831, lng: 120.3121 },
          { lat: -2.5835, lng: 120.314 },
          { lat: -2.5855, lng: 120.3135 },
          { lat: -2.5845, lng: 120.3115 },
        ],
      },
      createdAt: '2026-06-15T08:00:00Z',
    },
    {
      id: 'pkb-002',
      kelembagaanId: 'klb-001',
      nik: '3201010101800004',
      nama: 'Wagimin',
      nomorKK: '3201010101800003',
      statusPernikahan: StatusPernikahan.MENIKAH,
      tempatLahir: 'Bandung',
      tanggalLahir: '1975-06-20',
      alamat: 'Jl. Cibiru No. 15, RT 03 RW 05, Desa Cileunyi',
      kodepos: '40622',
      nomorHP: '081298765432',
      dokumen: [
        { id: 'doc-004', documentType: TipeDokumenPekebun.SCAN_KTP, fileName: 'ktp-wagimin.pdf', fileUrl: '/files/ktp-pkb-002.pdf', fileSize: 430000, fileExtension: 'application/pdf' },
        { id: 'doc-005', documentType: TipeDokumenPekebun.SCAN_KK, fileName: 'kk-wagimin.pdf', fileUrl: '/files/kk-pkb-002.pdf', fileSize: 510000, fileExtension: 'application/pdf' },
        { id: 'doc-006', documentType: TipeDokumenPekebun.SWAFOTO, fileName: 'swafoto-wagimin.jpg', fileUrl: '/files/swafoto-pkb-002.jpg', fileSize: 195000, fileExtension: 'image/jpeg' },
      ],
      lahan: {
        id: 'lhn-002',
        pekebunId: 'pkb-002',
        jenisLegalitas: JenisLegalitas.NON_SHM,
        nomorLegalitas: 'SKT-0018/2019',
        tanggalPenerbitanLegalitas: '2019-08-22',
        luasLahan: 1.8,
        provinsiKode: '32',
        provinsiNama: 'Jawa Barat',
        kabupatenKode: '3204',
        kabupatenNama: 'Bandung',
        kecamatanKode: '320410',
        kecamatanNama: 'Cileunyi',
        desaKode: '3204102001',
        desaNama: 'Cileunyi Kulon',
        alamatKebun: 'Blok Pasir Jengkol',
        tahunTanam: 2017,
        jenisBibit: 'Kelapa Mulia',
        scanLegalitasUrl: '/files/skt-pkb-002.pdf',
        coordinates: [
          { lat: -2.5838, lng: 120.3128 },
          { lat: -2.5842, lng: 120.315 },
          { lat: -2.586, lng: 120.3142 },
          { lat: -2.5855, lng: 120.312 },
        ],
      },
      createdAt: '2026-06-16T10:00:00Z',
    },
    {
      id: 'pkb-003',
      kelembagaanId: 'klb-001',
      nik: '3201010101800006',
      nama: 'Pardi',
      nomorKK: '3201010101800005',
      statusPernikahan: StatusPernikahan.BELUM_MENIKAH,
      tempatLahir: 'Bandung',
      tanggalLahir: '1990-11-05',
      alamat: 'Jl. Cibiru No. 20, RT 03 RW 05, Desa Cileunyi',
      kodepos: '40622',
      nomorHP: '081356789012',
      dokumen: [
        { id: 'doc-007', documentType: TipeDokumenPekebun.SCAN_KTP, fileName: 'ktp-pardi.pdf', fileUrl: '/files/ktp-pkb-003.pdf', fileSize: 440000, fileExtension: 'application/pdf' },
        { id: 'doc-008', documentType: TipeDokumenPekebun.SCAN_KK, fileName: 'kk-pardi.pdf', fileUrl: '/files/kk-pkb-003.pdf', fileSize: 500000, fileExtension: 'application/pdf' },
        { id: 'doc-009', documentType: TipeDokumenPekebun.SWAFOTO, fileName: 'swafoto-pardi.jpg', fileUrl: '/files/swafoto-pkb-003.jpg', fileSize: 180000, fileExtension: 'image/jpeg' },
      ],
      lahan: {
        id: 'lhn-003',
        pekebunId: 'pkb-003',
        jenisLegalitas: JenisLegalitas.SHM,
        nomorLegalitas: 'SHM-0091/2021',
        tanggalPenerbitanLegalitas: '2021-01-15',
        luasLahan: 3.2,
        provinsiKode: '32',
        provinsiNama: 'Jawa Barat',
        kabupatenKode: '3204',
        kabupatenNama: 'Bandung',
        kecamatanKode: '320410',
        kecamatanNama: 'Cileunyi',
        desaKode: '3204102001',
        desaNama: 'Cileunyi Kulon',
        alamatKebun: 'Blok Cilame',
        tahunTanam: 2019,
        jenisBibit: 'Kelapa Lindak',
        scanLegalitasUrl: '/files/shm-pkb-003.pdf',
        coordinates: [
          { lat: -2.5838, lng: 120.3128 },
          { lat: -2.5842, lng: 120.315 },
          { lat: -2.586, lng: 120.3142 },
          { lat: -2.5855, lng: 120.312 },
        ],
      },
      createdAt: '2026-06-17T09:30:00Z',
    },
  ];

  const usulans = ref<UsulanRekomtek[]>([
    {
      id: 'usl-001',
      nomorUsulan: 'SPKA107260001',
      namaKelompokTani: 'Kelompok Tani Murni Jaya',
      komoditas: 'Kelapa',
      status: 'VERIFIKASI_DITJENBUN',
      createdAt: '2026-07-28T09:00:00Z',
      updatedAt: '2026-07-28T09:00:00Z',
      logs: [],
      pekebunList: mockPekebun,
      jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
      daftarCPCL: [
        {
          id: 'cpcl-001',
          namaPekebun: 'Suratno',
          nik: '3201010101800002',
          nomorKK: '3201010101800001',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0042/2020',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-002',
          namaPekebun: 'Wagimin',
          nik: '3201010101800004',
          nomorKK: '3201010101800003',
          luasLahanHektar: 1.8,
          jenisHakLahan: 'SKT',
          nomorSuratLahan: 'SKT-0018/2019',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-003',
          namaPekebun: 'Pardi',
          nik: '3201010101800006',
          nomorKK: '3201010101800005',
          luasLahanHektar: 3.2,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0091/2021',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
      ],
      dokumen: [
        { id: 'prs-001', pengajuanId: 'usl-001', tipeDokumen: 'KTP', namaFile: 'ktp-pengurus.pdf', urlFile: '/files/ktp-pengurus-usl-001.pdf', ukuranBytes: 320000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-002', pengajuanId: 'usl-001', tipeDokumen: 'LEGALITAS_KP', namaFile: 'legalitas-kp.pdf', urlFile: '/files/legalitas-kp-usl-001.pdf', ukuranBytes: 540000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-003', pengajuanId: 'usl-001', tipeDokumen: 'SIMLUHTAN', namaFile: 'simluhtan.pdf', urlFile: '/files/simluhtan-usl-001.pdf', ukuranBytes: 280000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-004', pengajuanId: 'usl-001', tipeDokumen: 'LEGALITAS_LAHAN', namaFile: 'legalitas-lahan.pdf', urlFile: '/files/legalitas-lahan-usl-001.pdf', ukuranBytes: 610000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-005', pengajuanId: 'usl-001', tipeDokumen: 'SURAT_BEDA_NAMA', namaFile: 'surat-beda-nama.pdf', urlFile: '/files/surat-beda-nama-usl-001.pdf', ukuranBytes: 180000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-006', pengajuanId: 'usl-001', tipeDokumen: 'GAMBAR_LAHAN', namaFile: 'gambar-lahan.pdf', urlFile: '/files/gambar-lahan-usl-001.pdf', ukuranBytes: 920000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-007', pengajuanId: 'usl-001', tipeDokumen: 'RAB_RK', namaFile: 'rab-rk.pdf', urlFile: '/files/rab-rk-usl-001.pdf', ukuranBytes: 450000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-008', pengajuanId: 'usl-001', tipeDokumen: 'PERNYATAAN_LUAS', namaFile: 'pernyataan-luas.pdf', urlFile: '/files/pernyataan-luas-usl-001.pdf', ukuranBytes: 200000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-009', pengajuanId: 'usl-001', tipeDokumen: 'REFERENSI_HARGA', namaFile: 'referensi-harga.pdf', urlFile: '/files/referensi-harga-usl-001.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        {
          id: 'prs-010',
          pengajuanId: 'usl-001',
          tipeDokumen: 'PERNYATAAN_TANPA_BAKAR',
          namaFile: 'pernyataan-tanpa-bakar.pdf',
          urlFile: '/files/pernyataan-tanpa-bakar-usl-001.pdf',
          ukuranBytes: 160000,
          uploadedAt: '2026-07-28T09:00:00Z',
          isValid: true,
        },
        { id: 'prs-011', pengajuanId: 'usl-001', tipeDokumen: 'DETAIL_PEKEBUN', namaFile: 'detail-pekebun.xlsx', urlFile: '/files/detail-pekebun-usl-001.xlsx', ukuranBytes: 750000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-012', pengajuanId: 'usl-001', tipeDokumen: 'RAB_DETAIL', namaFile: 'rab-detail.xlsx', urlFile: '/files/rab-detail-usl-001.xlsx', ukuranBytes: 680000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
        { id: 'prs-kades-001', pengajuanId: 'usl-001', tipeDokumen: 'SURAT_KET_KADES', namaFile: 'surat-keterangan-kades.pdf', urlFile: '/templates/stdb-template.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-28T09:00:00Z', isValid: true },
      ],
      gudangSerahTerima: {
        alamat: 'Jl. Raya Cileunyi No. 45, RT 02 RW 03, Desa Cileunyi Kulon, Kec. Cileunyi, Kab. Bandung',
        koordinat: '-6.9165, 107.6182',
        fotoTampakDepan: { persyaratanId: 'foto-depan', namaFile: 'gudang-depan.jpg', mimeType: 'image/jpeg', ukuranBytes: 320000, dataUrl: '/files/gudang-depan-usl-001.jpg', uploadedAt: '2026-07-28T09:00:00Z' },
        fotoTampakDalam: { persyaratanId: 'foto-dalam', namaFile: 'gudang-dalam.jpg', mimeType: 'image/jpeg', ukuranBytes: 280000, dataUrl: '/files/gudang-dalam-usl-001.jpg', uploadedAt: '2026-07-28T09:00:00Z' },
      },
      rabItems: [
        { id: 'rab-001', tahap: 'Persiapan', uraian: 'Pembersihan lahan', volume: 7.5, satuan: 'Ha', hargaSatuan: 1500000, subTotal: 11250000 },
        { id: 'rab-002', tahap: 'Penanaman', uraian: 'Bibit Kelapa hibrida', volume: 7500, satuan: 'Batang', hargaSatuan: 25000, subTotal: 187500000 },
        { id: 'rab-003', tahap: 'Pemeliharaan', uraian: 'Pupuk NPK', volume: 1500, satuan: 'Kg', hargaSatuan: 12000, subTotal: 18000000 },
        { id: 'rab-004', tahap: 'Pemeliharaan', uraian: 'Pestisida', volume: 300, satuan: 'Liter', hargaSatuan: 85000, subTotal: 25500000 },
        { id: 'rab-005', tahap: 'Peralatan', uraian: 'Hand sprayer', volume: 15, satuan: 'Unit', hargaSatuan: 450000, subTotal: 6750000 },
      ],
      rabDitandatangani: { persyaratanId: 'rab-signed', namaFile: 'rab-ditandatangani.pdf', mimeType: 'application/pdf', ukuranBytes: 520000, dataUrl: '/files/rab-signed-usl-001.pdf', uploadedAt: '2026-07-28T09:00:00Z' },
      asistensiChecklist: {
        skCpcl: { valid: null, note: '', url: '/files/sk-cpcl-usl-001.pdf' },
        suratPengantarProv: { valid: null, note: '', url: '/files/surat-pengantar-prov-usl-001.pdf' },
        beritaAcara: { valid: null, note: '', url: '/files/ba-verifikasi-usl-001.pdf' },
        pekebun: mockPekebun.map((p) => ({ pekebunId: p.id, valid: null, note: '' })),
      },
    },
    {
      id: 'usl-002',
      nomorUsulan: 'SPKA207260002',
      namaKelompokTani: 'Koperasi Harapan Tani',
      komoditas: 'Kelapa',
      status: 'APPROVAL_DITJENBUN',
      createdAt: '2026-07-29T10:00:00Z',
      updatedAt: '2026-07-29T14:00:00Z',
      bantuanType: 'BARANG',
      jenisSarpras: JenisSarpras.INTENSIFIKASI,
      daftarCPCL: [
        {
          id: 'cpcl-001',
          namaPekebun: 'Suratno',
          nik: '3201010101800002',
          nomorKK: '3201010101800001',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0042/2020',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-002',
          namaPekebun: 'Wagimin',
          nik: '3201010101800004',
          nomorKK: '3201010101800003',
          luasLahanHektar: 1.8,
          jenisHakLahan: 'SKT',
          nomorSuratLahan: 'SKT-0018/2019',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-003',
          namaPekebun: 'Pardi',
          nik: '3201010101800006',
          nomorKK: '3201010101800005',
          luasLahanHektar: 3.2,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0091/2021',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
      ],
      dokumen: [
        { id: 'prs-001', pengajuanId: 'usl-002', tipeDokumen: 'KTP', namaFile: 'ktp-pengurus.pdf', urlFile: '/files/ktp-pengurus-usl-002.pdf', ukuranBytes: 320000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-002', pengajuanId: 'usl-002', tipeDokumen: 'LEGALITAS_KP', namaFile: 'legalitas-kp.pdf', urlFile: '/files/legalitas-kp-usl-002.pdf', ukuranBytes: 540000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-003', pengajuanId: 'usl-002', tipeDokumen: 'SIMLUHTAN', namaFile: 'simluhtan.pdf', urlFile: '/files/simluhtan-usl-002.pdf', ukuranBytes: 280000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-004', pengajuanId: 'usl-002', tipeDokumen: 'LEGALITAS_LAHAN', namaFile: 'legalitas-lahan.pdf', urlFile: '/files/legalitas-lahan-usl-002.pdf', ukuranBytes: 610000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-005', pengajuanId: 'usl-002', tipeDokumen: 'GAMBAR_LAHAN', namaFile: 'gambar-lahan.pdf', urlFile: '/files/gambar-lahan-usl-002.pdf', ukuranBytes: 920000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-006', pengajuanId: 'usl-002', tipeDokumen: 'RAB_RK', namaFile: 'rab-rk.pdf', urlFile: '/files/rab-rk-usl-002.pdf', ukuranBytes: 450000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-007', pengajuanId: 'usl-002', tipeDokumen: 'PERNYATAAN_LUAS', namaFile: 'pernyataan-luas.pdf', urlFile: '/files/pernyataan-luas-usl-002.pdf', ukuranBytes: 200000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-008', pengajuanId: 'usl-002', tipeDokumen: 'REFERENSI_HARGA', namaFile: 'referensi-harga.pdf', urlFile: '/files/referensi-harga-usl-002.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-009', pengajuanId: 'usl-002', tipeDokumen: 'DETAIL_PEKEBUN', namaFile: 'detail-pekebun.xlsx', urlFile: '/files/detail-pekebun-usl-002.xlsx', ukuranBytes: 750000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
        { id: 'prs-kades-002', pengajuanId: 'usl-002', tipeDokumen: 'SURAT_KET_KADES', namaFile: 'surat-keterangan-kades.pdf', urlFile: '/templates/stdb-template.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-29T10:00:00Z', isValid: true },
      ],
      rabItems: [
        { id: 'rab-001', tahap: 'Pemeliharaan', uraian: 'Pupuk NPK', volume: 1200, satuan: 'Kg', hargaSatuan: 12000, subTotal: 14400000 },
        { id: 'rab-002', tahap: 'Pemeliharaan', uraian: 'Pestisida', volume: 250, satuan: 'Liter', hargaSatuan: 85000, subTotal: 21250000 },
      ],
      rekomtek: {
        nomorRekomtek: '411/DITJENBUN/REKOMTEK/2026',
        draftUrl: '/files/draft-rekomtek-usl-002.pdf',
        signedUrl: '/files/signed-rekomtek-usl-002.pdf',
        uploadedAt: '2026-07-29T14:00:00Z',
      },
      asistensiChecklist: {
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-002.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-002.pdf' },
        beritaAcara: { valid: true, note: '', url: '/files/ba-verifikasi-usl-002.pdf' },
        pekebun: [],
      },
      pekebunList: [
        {
          id: 'pkb-o2-001',
          kelembagaanId: 'klb-002',
          nik: '3201010101800010',
          nama: 'Hendra',
          nomorKK: '3201010101800009',
          statusPernikahan: StatusPernikahan.MENIKAH,
          tempatLahir: 'Bandung',
          tanggalLahir: '1982-04-12',
          alamat: 'Jl. Raya Bandung No. 88, Cileunyi',
          kodepos: '40622',
          nomorHP: '081234567810',
          dokumen: [
            { id: 'doc-o2-001', documentType: TipeDokumenPekebun.SCAN_KTP, fileName: 'ktp-hendra.pdf', fileUrl: '/files/ktp-pkb-o2-001.pdf', fileSize: 420000, fileExtension: 'application/pdf' },
            { id: 'doc-o2-002', documentType: TipeDokumenPekebun.SCAN_KK, fileName: 'kk-hendra.pdf', fileUrl: '/files/kk-pkb-o2-001.pdf', fileSize: 500000, fileExtension: 'application/pdf' },
            { id: 'doc-o2-003', documentType: TipeDokumenPekebun.SWAFOTO, fileName: 'swafoto-hendra.jpg', fileUrl: '/files/swafoto-pkb-o2-001.jpg', fileSize: 210000, fileExtension: 'image/jpeg' },
          ],
          lahan: {
            id: 'lhn-o2-001',
            pekebunId: 'pkb-o2-001',
            jenisLegalitas: JenisLegalitas.SHM,
            nomorLegalitas: 'SHM-0077/2021',
            tanggalPenerbitanLegalitas: '2021-05-10',
            luasLahan: 2.0,
            provinsiKode: '32',
            provinsiNama: 'Jawa Barat',
            kabupatenKode: '3204',
            kabupatenNama: 'Bandung',
            kecamatanKode: '320410',
            kecamatanNama: 'Cileunyi',
            desaKode: '3204102001',
            desaNama: 'Cileunyi Kulon',
            alamatKebun: 'Blok Sindangjaya',
            tahunTanam: 2020,
            jenisBibit: 'Kelapa Lindak',
            scanLegalitasUrl: '/files/shm-pkb-o2-001.pdf',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
          },
          createdAt: '2026-06-18T08:00:00Z',
        },
      ],
      logs: [
        {
          id: 'log-001',
          usulanId: 'usl-002',
          fromStatus: 'VERIFIKASI_DITJENBUN',
          toStatus: 'APPROVAL_DITJENBUN',
          actorName: 'Ahmad Verifikator',
          actorRole: 'VERIFIKATOR_DITJENBUN',
          note: 'Rekomtek berhasil di-generate dan ditandatangani.',
          createdAt: '2026-07-29T14:00:00Z',
        },
      ],
    },
    {
      id: 'usl-003',
      nomorUsulan: 'SPKA307260003',
      namaKelompokTani: 'Kelompok Tani Kelapa Mandiri',
      komoditas: 'Kelapa',
      status: 'VERIFIKASI_BPDP',
      createdAt: '2026-07-25T11:00:00Z',
      updatedAt: '2026-07-30T09:30:00Z',
      bantuanType: 'UANG',
      jenisSarpras: JenisSarpras.ALAT_PASCAPANEN,
      daftarCPCL: [
        {
          id: 'cpcl-001',
          namaPekebun: 'Suratno',
          nik: '3201010101800002',
          nomorKK: '3201010101800001',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0042/2020',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-002',
          namaPekebun: 'Wagimin',
          nik: '3201010101800004',
          nomorKK: '3201010101800003',
          luasLahanHektar: 1.8,
          jenisHakLahan: 'SKT',
          nomorSuratLahan: 'SKT-0018/2019',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-003',
          namaPekebun: 'Pardi',
          nik: '3201010101800006',
          nomorKK: '3201010101800005',
          luasLahanHektar: 3.2,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0091/2021',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
      ],
      dokumen: [
        { id: 'prs-001', pengajuanId: 'usl-003', tipeDokumen: 'KTP', namaFile: 'ktp-pengurus.pdf', urlFile: '/files/ktp-pengurus-usl-003.pdf', ukuranBytes: 320000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-002', pengajuanId: 'usl-003', tipeDokumen: 'LEGALITAS_KP', namaFile: 'legalitas-kp.pdf', urlFile: '/files/legalitas-kp-usl-003.pdf', ukuranBytes: 540000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-003', pengajuanId: 'usl-003', tipeDokumen: 'SIMLUHTAN', namaFile: 'simluhtan.pdf', urlFile: '/files/simluhtan-usl-003.pdf', ukuranBytes: 280000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-004', pengajuanId: 'usl-003', tipeDokumen: 'LEGALITAS_LAHAN', namaFile: 'legalitas-lahan.pdf', urlFile: '/files/legalitas-lahan-usl-003.pdf', ukuranBytes: 610000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-005', pengajuanId: 'usl-003', tipeDokumen: 'GAMBAR_LAHAN', namaFile: 'gambar-lahan.pdf', urlFile: '/files/gambar-lahan-usl-003.pdf', ukuranBytes: 920000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-006', pengajuanId: 'usl-003', tipeDokumen: 'RAB_RK', namaFile: 'rab-rk.pdf', urlFile: '/files/rab-rk-usl-003.pdf', ukuranBytes: 450000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-007', pengajuanId: 'usl-003', tipeDokumen: 'PERNYATAAN_LUAS', namaFile: 'pernyataan-luas.pdf', urlFile: '/files/pernyataan-luas-usl-003.pdf', ukuranBytes: 200000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-008', pengajuanId: 'usl-003', tipeDokumen: 'REFERENSI_HARGA', namaFile: 'referensi-harga.pdf', urlFile: '/files/referensi-harga-usl-003.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
        { id: 'prs-kades-003', pengajuanId: 'usl-003', tipeDokumen: 'SURAT_KET_KADES', namaFile: 'surat-keterangan-kades.pdf', urlFile: '/templates/stdb-template.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-25T11:00:00Z', isValid: true },
      ],
      rabItems: [
        { id: 'rab-001', tahap: 'Pengadaan', uraian: 'Alat fermentasi Kelapa', volume: 5, satuan: 'Unit', hargaSatuan: 8500000, subTotal: 42500000 },
        { id: 'rab-002', tahap: 'Pengadaan', uraian: 'Alat pengering Kelapa', volume: 3, satuan: 'Unit', hargaSatuan: 12000000, subTotal: 36000000 },
      ],
      rekomtek: {
        nomorRekomtek: '412/DITJENBUN/REKOMTEK/2026',
        draftUrl: '/files/draft-rekomtek-usl-003.pdf',
        signedUrl: '/files/signed-rekomtek-usl-003.pdf',
        uploadedAt: '2026-07-30T09:00:00Z',
      },
      asistensiChecklist: {
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-003.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-003.pdf' },
        beritaAcara: { valid: true, note: '', url: '/files/ba-verifikasi-usl-003.pdf' },
        pekebun: [],
      },
      pekebunList: [
        {
          id: 'pkb-o3-001',
          kelembagaanId: 'klb-003',
          nik: '3201010101800012',
          nama: 'Samsul',
          nomorKK: '3201010101800011',
          statusPernikahan: StatusPernikahan.MENIKAH,
          tempatLahir: 'Bandung',
          tanggalLahir: '1979-08-25',
          alamat: 'Jl. Percobaan No. 10, Cileunyi',
          kodepos: '40622',
          nomorHP: '081234567812',
          dokumen: [
            { id: 'doc-o3-001', documentType: TipeDokumenPekebun.SCAN_KTP, fileName: 'ktp-samsul.pdf', fileUrl: '/files/ktp-pkb-o3-001.pdf', fileSize: 410000, fileExtension: 'application/pdf' },
            { id: 'doc-o3-002', documentType: TipeDokumenPekebun.SCAN_KK, fileName: 'kk-samsul.pdf', fileUrl: '/files/kk-pkb-o3-001.pdf', fileSize: 480000, fileExtension: 'application/pdf' },
            { id: 'doc-o3-003', documentType: TipeDokumenPekebun.SWAFOTO, fileName: 'swafoto-samsul.jpg', fileUrl: '/files/swafoto-pkb-o3-001.jpg', fileSize: 190000, fileExtension: 'image/jpeg' },
          ],
          lahan: {
            id: 'lhn-o3-001',
            pekebunId: 'pkb-o3-001',
            jenisLegalitas: JenisLegalitas.SHM,
            nomorLegalitas: 'SHM-0088/2022',
            tanggalPenerbitanLegalitas: '2022-02-14',
            luasLahan: 2.2,
            provinsiKode: '32',
            provinsiNama: 'Jawa Barat',
            kabupatenKode: '3204',
            kabupatenNama: 'Bandung',
            kecamatanKode: '320410',
            kecamatanNama: 'Cileunyi',
            desaKode: '3204102001',
            desaNama: 'Cileunyi Kulon',
            alamatKebun: 'Blok Babakan',
            tahunTanam: 2021,
            jenisBibit: 'Kelapa Hibrida',
            scanLegalitasUrl: '/files/shm-pkb-o3-001.pdf',
            coordinates: [
              { lat: -2.584, lng: 120.3125 },
              { lat: -2.5845, lng: 120.315 },
              { lat: -2.5865, lng: 120.3145 },
              { lat: -2.5855, lng: 120.3122 },
            ],
          },
          createdAt: '2026-06-19T09:00:00Z',
        },
      ],
      bpdpChecklist: {
        rekomtek: { valid: null, note: '', url: '/files/signed-rekomtek-usl-003.pdf' },
        skCpcl: { valid: null, note: '', url: '/files/sk-cpcl-usl-003.pdf' },
        suratPengantarProv: { valid: null, note: '', url: '/files/surat-pengantar-prov-usl-003.pdf' },
        beritaAcaraVerifikasi: { valid: null, note: '', url: '/files/ba-verifikasi-usl-003.pdf' },
      },
      logs: [
        {
          id: 'log-002',
          usulanId: 'usl-003',
          fromStatus: 'APPROVAL_DITJENBUN',
          toStatus: 'VERIFIKASI_BPDP',
          actorName: 'Budi Ketua Tim',
          actorRole: 'APPROVAL_DITJENBUN',
          note: 'Persetujuan rekomendasi teknis diteruskan ke BPDP.',
          createdAt: '2026-07-30T09:30:00Z',
        },
      ],
    },
    {
      id: 'usl-004',
      nomorUsulan: 'SPKA507260004',
      namaKelompokTani: 'Kelompok Tani Tunas Kelapa',
      komoditas: 'Kelapa',
      status: 'APPROVAL_BPDP',
      createdAt: '2026-07-24T08:00:00Z',
      updatedAt: '2026-07-30T16:00:00Z',
      bantuanType: 'BARANG',
      pekebunList: mockPekebun,
      jenisSarpras: JenisSarpras.JALAN_KEBUN,
      daftarCPCL: [
        {
          id: 'cpcl-001',
          namaPekebun: 'Suratno',
          nik: '3201010101800002',
          nomorKK: '3201010101800001',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0042/2020',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-002',
          namaPekebun: 'Wagimin',
          nik: '3201010101800004',
          nomorKK: '3201010101800003',
          luasLahanHektar: 1.8,
          jenisHakLahan: 'SKT',
          nomorSuratLahan: 'SKT-0018/2019',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
        {
          id: 'cpcl-003',
          namaPekebun: 'Pardi',
          nik: '3201010101800006',
          nomorKK: '3201010101800005',
          luasLahanHektar: 3.2,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-0091/2021',
          coordinates: [
            { lat: -2.5835, lng: 120.3122 },
            { lat: -2.584, lng: 120.3142 },
            { lat: -2.586, lng: 120.3138 },
            { lat: -2.585, lng: 120.3118 },
          ],
        },
      ],
      dokumen: [
        { id: 'prs-001', pengajuanId: 'usl-004', tipeDokumen: 'KTP', namaFile: 'ktp-pengurus.pdf', urlFile: '/files/ktp-pengurus-usl-004.pdf', ukuranBytes: 320000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-002', pengajuanId: 'usl-004', tipeDokumen: 'LEGALITAS_KP', namaFile: 'legalitas-kp.pdf', urlFile: '/files/legalitas-kp-usl-004.pdf', ukuranBytes: 540000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-003', pengajuanId: 'usl-004', tipeDokumen: 'SIMLUHTAN', namaFile: 'simluhtan.pdf', urlFile: '/files/simluhtan-usl-004.pdf', ukuranBytes: 280000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-004', pengajuanId: 'usl-004', tipeDokumen: 'LEGALITAS_LAHAN', namaFile: 'legalitas-lahan.pdf', urlFile: '/files/legalitas-lahan-usl-004.pdf', ukuranBytes: 610000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-005', pengajuanId: 'usl-004', tipeDokumen: 'GAMBAR_LAHAN', namaFile: 'gambar-lahan.pdf', urlFile: '/files/gambar-lahan-usl-004.pdf', ukuranBytes: 920000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-006', pengajuanId: 'usl-004', tipeDokumen: 'RAB_RK', namaFile: 'rab-rk.pdf', urlFile: '/files/rab-rk-usl-004.pdf', ukuranBytes: 450000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-007', pengajuanId: 'usl-004', tipeDokumen: 'PERNYATAAN_LUAS', namaFile: 'pernyataan-luas.pdf', urlFile: '/files/pernyataan-luas-usl-004.pdf', ukuranBytes: 200000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-008', pengajuanId: 'usl-004', tipeDokumen: 'DOKUMEN_SID', namaFile: 'dokumen-sid.pdf', urlFile: '/files/dokumen-sid-usl-004.pdf', ukuranBytes: 380000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-009', pengajuanId: 'usl-004', tipeDokumen: 'FOTO_JALAN', namaFile: 'foto-jalan.jpg', urlFile: '/files/foto-jalan-usl-004.jpg', ukuranBytes: 520000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-010', pengajuanId: 'usl-004', tipeDokumen: 'RAB_DETAIL', namaFile: 'rab-detail.xlsx', urlFile: '/files/rab-detail-usl-004.xlsx', ukuranBytes: 680000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
        { id: 'prs-kades-004', pengajuanId: 'usl-004', tipeDokumen: 'SURAT_KET_KADES', namaFile: 'surat-keterangan-kades.pdf', urlFile: '/templates/stdb-template.pdf', ukuranBytes: 350000, uploadedAt: '2026-07-24T08:00:00Z', isValid: true },
      ],
      rabItems: [
        { id: 'rab-001', tahap: 'Konstruksi', uraian: 'Perkerasan jalan kebun', volume: 1200, satuan: 'm²', hargaSatuan: 85000, subTotal: 102000000 },
        { id: 'rab-002', tahap: 'Konstruksi', uraian: 'Drainase jalan', volume: 800, satuan: 'm', hargaSatuan: 45000, subTotal: 36000000 },
      ],
      rekomtek: {
        nomorRekomtek: '413/DITJENBUN/REKOMTEK/2026',
        draftUrl: '/files/draft-rekomtek-usl-004.pdf',
        signedUrl: '/files/signed-rekomtek-usl-004.pdf',
        uploadedAt: '2026-07-30T10:00:00Z',
      },
      asistensiChecklist: {
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-004.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-004.pdf' },
        beritaAcara: { valid: true, note: '', url: '/files/ba-verifikasi-usl-004.pdf' },
        pekebun: [],
      },
      bpdpChecklist: {
        rekomtek: { valid: true, note: '', url: '/files/signed-rekomtek-usl-004.pdf' },
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-004.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-004.pdf' },
        beritaAcaraVerifikasi: { valid: true, note: '', url: '/files/ba-verifikasi-usl-004.pdf' },
        catatan: 'Dokumen Rekomtek dan verifikasi valid.',
      },
      kelayakan: {
        statusKelayakan: 'LAYAK',
        draftUrl: '/files/draft-kelayakan-usl-004.pdf',
        isSubmitted: true,
        createdAt: '2026-07-30T16:00:00Z',
      },
      logs: [
        {
          id: 'log-003',
          usulanId: 'usl-004',
          fromStatus: 'VERIFIKASI_BPDP',
          toStatus: 'APPROVAL_BPDP',
          actorName: 'Citra Verifikator BPDP',
          actorRole: 'VERIFIKATOR_BPDP',
          note: 'Dokumen kelayakan layak rekomtek di-generate.',
          createdAt: '2026-07-30T16:00:00Z',
        },
      ],
    },
    {
      id: 'usl-005',
      nomorUsulan: 'SPKA107260005',
      namaKelompokTani: 'Kelompok Tani Kelapa Sejahtera',
      komoditas: 'Kelapa',
      status: 'GENERATE_SK_DIRUT',
      createdAt: '2026-07-22T08:00:00Z',
      updatedAt: '2026-07-31T09:00:00Z',
      bantuanType: 'UANG',
      rekomtek: {
        nomorRekomtek: '414/DITJENBUN/REKOMTEK/2026',
        draftUrl: '/files/draft-rekomtek-usl-005.pdf',
        signedUrl: '/files/signed-rekomtek-usl-005.pdf',
        uploadedAt: '2026-07-29T10:00:00Z',
      },
      asistensiChecklist: {
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-005.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-005.pdf' },
        beritaAcara: { valid: true, note: '', url: '/files/ba-verifikasi-usl-005.pdf' },
        pekebun: [],
      },
      bpdpChecklist: {
        rekomtek: { valid: true, note: '', url: '/files/signed-rekomtek-usl-005.pdf' },
        skCpcl: { valid: true, note: '', url: '/files/sk-cpcl-usl-005.pdf' },
        suratPengantarProv: { valid: true, note: '', url: '/files/surat-pengantar-prov-usl-005.pdf' },
        beritaAcaraVerifikasi: { valid: true, note: '', url: '/files/ba-verifikasi-usl-005.pdf' },
      },
      kelayakan: {
        statusKelayakan: 'LAYAK',
        draftUrl: '/files/draft-kelayakan-usl-005.pdf',
        isSubmitted: true,
        createdAt: '2026-07-30T11:00:00Z',
      },
      logs: [
        {
          id: 'log-004',
          usulanId: 'usl-005',
          fromStatus: 'APPROVAL_BPDP',
          toStatus: 'GENERATE_SK_DIRUT',
          actorName: 'Dedi Kadiv BPDP',
          actorRole: 'APPROVAL_BPDP',
          note: 'Kelayakan rekomtek disetujui Kadiv BPDP.',
          createdAt: '2026-07-31T09:00:00Z',
        },
      ],
    },
    {
      id: 'usl-006',
      nomorUsulan: 'SPKA107260006',
      namaKelompokTani: 'Kelompok Tani Kelapa Lestari',
      komoditas: 'Kelapa',
      status: 'SELESAI',
      createdAt: '2026-07-20T08:00:00Z',
      updatedAt: '2026-07-31T10:00:00Z',
      bantuanType: 'UANG',
      rekomtek: {
        nomorRekomtek: '410/DITJENBUN/REKOMTEK/2026',
        signedUrl: '/files/signed-rekomtek-usl-006.pdf',
      },
      skDirut: {
        nomorSk: 'SK/DIRUT/BPDP/001/2026',
        signedUrl: '/files/signed-sk-usl-006.pdf',
      },
      logs: [
        {
          id: 'log-005',
          usulanId: 'usl-006',
          fromStatus: 'GENERATE_SK_DIRUT',
          toStatus: 'SELESAI',
          actorName: 'Citra Verifikator BPDP',
          actorRole: 'VERIFIKATOR_BPDP',
          note: 'SK Dirut ditandatangani dan diunggah.',
          createdAt: '2026-07-31T10:00:00Z',
        },
      ],
    },
  ]);

  const activeUsulan = ref<UsulanRekomtek | null>(null);

  const fetchUsulans = async () => {
    return usulans.value;
  };

  const fetchUsulanById = async (id: string) => {
    const item = usulans.value.find((u) => u.id === id);
    activeUsulan.value = item ? { ...item } : null;
    return activeUsulan.value;
  };

  const addLog = (usulan: UsulanRekomtek, fromStatus: UsulanStatus, toStatus: UsulanStatus, actorName: string, actorRole: StatusLog['actorRole'], note: string) => {
    const newLog: StatusLog = {
      id: `log-${Date.now()}`,
      usulanId: usulan.id,
      fromStatus,
      toStatus,
      actorName,
      actorRole,
      note,
      createdAt: new Date().toISOString(),
    };
    if (!usulan.logs) usulan.logs = [];
    usulan.logs.push(newLog);
  };

  // Verifikator Ditjenbun Actions
  const submitAsistensi = async (id: string, checklist: NonNullable<UsulanRekomtek['asistensiChecklist']>) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.asistensiChecklist = structuredClone(checklist);
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.asistensiChecklist = structuredClone(checklist);
      }
    }
  };

  const kembalikanUsulan = async (id: string, tujuan: UsulanStatus, alasan: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = tujuan;
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, tujuan, actorName, 'DITJENBUN_VERIFIKATOR', alasan);
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = tujuan;
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  const generateRekomtek = async (id: string, bantuanType: BantuanType) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.bantuanType = bantuanType;
      item.rekomtek = {
        nomorRekomtek: item.rekomtek?.nomorRekomtek || '',
        draftUrl: `/files/draft-rekomtek-${id}.pdf`,
        signedUrl: item.rekomtek?.signedUrl,
        uploadedAt: item.rekomtek?.uploadedAt,
      };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.bantuanType = bantuanType;
        activeUsulan.value.rekomtek = { ...item.rekomtek };
      }
    }
  };

  const uploadRekomtek = async (id: string, nomorRekomtek: string, signedUrl: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.rekomtek = {
        ...(item.rekomtek || {}),
        nomorRekomtek,
        signedUrl,
        uploadedAt: new Date().toISOString(),
      };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.rekomtek = { ...item.rekomtek };
      }
    }
  };

  const ajukanRekomtek = async (id: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'APPROVAL_DITJENBUN';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'APPROVAL_DITJENBUN', actorName, 'DITJENBUN_VERIFIKATOR', 'Mengajukan usulan rekomtek ke Ketua Tim Ditjenbun.');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'APPROVAL_DITJENBUN';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  // Approval Ditjenbun (Ketua Tim) Actions
  const approveDitjenbun = async (id: string, note: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'VERIFIKASI_BPDP';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'VERIFIKASI_BPDP', actorName, 'DITJENBUN_APPROVAL', note || 'Ketua Tim menyetujui rekomtek. Mengajukan ke BPDP.');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'VERIFIKASI_BPDP';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  const rejectDitjenbun = async (id: string, note: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'VERIFIKASI_DITJENBUN';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'VERIFIKASI_DITJENBUN', actorName, 'DITJENBUN_APPROVAL', note || 'Dikembalikan ke Verifikator Ditjenbun (Pushback).');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'VERIFIKASI_DITJENBUN';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  // Verifikator BPDP Actions
  const submitBpdpChecklist = async (id: string, checklist: NonNullable<UsulanRekomtek['bpdpChecklist']>) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.bpdpChecklist = { ...checklist };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.bpdpChecklist = { ...checklist };
      }
    }
  };

  const generateKelayakan = async (id: string, statusKelayakan: 'LAYAK' | 'TIDAK_LAYAK') => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.kelayakan = {
        statusKelayakan,
        draftUrl: `/files/draft-kelayakan-${id}.pdf`,
        isSubmitted: false,
        createdAt: new Date().toISOString(),
      };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.kelayakan = { ...item.kelayakan };
      }
    }
  };

  const uploadKelayakanFile = async (id: string, signedUrl: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      if (item.kelayakan) {
        item.kelayakan.signedUrl = signedUrl;
      } else {
        item.kelayakan = {
          statusKelayakan: 'LAYAK',
          draftUrl: `/files/draft-kelayakan-${id}.pdf`,
          isSubmitted: false,
          createdAt: new Date().toISOString(),
          signedUrl,
        };
      }
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.kelayakan = { ...item.kelayakan };
      }
    }
  };

  const submitKelayakanToKadiv = async (id: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'APPROVAL_BPDP';
      if (item.kelayakan) {
        item.kelayakan.isSubmitted = true;
      }
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'APPROVAL_BPDP', actorName, 'BPDP_VERIFIKATOR', 'Mengajukan laporan kelayakan usulan ke Kadiv BPDP.');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'APPROVAL_BPDP';
        if (activeUsulan.value.kelayakan) activeUsulan.value.kelayakan.isSubmitted = true;
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  // Approval BPDP (Kadiv) Actions
  const approveBpdpKadiv = async (id: string, note: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'GENERATE_SK_DIRUT';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'GENERATE_SK_DIRUT', actorName, 'BPDP_APPROVAL', note || 'Kadiv BPDP menyetujui kelayakan. Usulan diteruskan untuk pembuatan SK Dirut.');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'GENERATE_SK_DIRUT';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  const rejectBpdpKadiv = async (id: string, note: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'VERIFIKASI_BPDP';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'VERIFIKASI_BPDP', actorName, 'BPDP_APPROVAL', note || 'Laporan kelayakan dikembalikan ke Verifikator BPDP.');
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'VERIFIKASI_BPDP';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  const returnRekomtekToDitjenbun = async (id: string, note: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'VERIFIKASI_DITJENBUN';
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'VERIFIKASI_DITJENBUN', actorName, 'BPDP_APPROVAL', `Surat Pengembalian Rekomtek: ${note}`);
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'VERIFIKASI_DITJENBUN';
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  // SK Dirut Actions
  const generateSkDirut = async (id: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.skDirut = {
        nomorSk: item.skDirut?.nomorSk || '',
        draftUrl: `/files/draft-sk-${id}.pdf`,
        signedUrl: item.skDirut?.signedUrl,
        uploadedAt: item.skDirut?.uploadedAt,
      };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.skDirut = { ...item.skDirut };
      }
    }
  };

  const saveSkDirutFile = async (id: string, signedUrl: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      item.skDirut = {
        ...(item.skDirut || {}),
        signedUrl,
        uploadedAt: new Date().toISOString(),
      };
      item.updatedAt = new Date().toISOString();
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.skDirut = { ...item.skDirut };
      }
    }
  };

  const uploadSkDirut = async (id: string, nomorSk: string, signedUrl: string, actorName: string) => {
    const item = usulans.value.find((u) => u.id === id);
    if (item) {
      const oldStatus = item.status;
      item.status = 'SELESAI';
      item.skDirut = {
        ...(item.skDirut || {}),
        nomorSk,
        signedUrl,
        uploadedAt: item.skDirut?.uploadedAt || new Date().toISOString(),
      };
      item.updatedAt = new Date().toISOString();
      addLog(item, oldStatus, 'SELESAI', actorName, 'BPDP_VERIFIKATOR', `SK Dirut berhasil diterbitkan dengan nomor: ${nomorSk}. Usulan Sarpras Kakao selesai.`);
      if (activeUsulan.value && activeUsulan.value.id === id) {
        activeUsulan.value.status = 'SELESAI';
        activeUsulan.value.skDirut = { ...item.skDirut };
        activeUsulan.value.logs = [...(item.logs || [])];
      }
    }
  };

  const monthlyCounter = ref<Record<string, number>>({
    '2607': 6,
  });

  const getNextSequenceForMonth = (dateObj: Date): number => {
    const monthNum = dateObj.getMonth() + 1;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const yearStr = String(dateObj.getFullYear()).slice(-2);
    const key = `${yearStr}${monthStr}`;

    const currentSeq = monthlyCounter.value[key] || 0;
    const nextSeq = currentSeq + 1;
    monthlyCounter.value[key] = nextSeq;
    return nextSeq;
  };

  const createUsulan = async (payload: { namaKelompokTani: string; komoditas?: string; jenisSarpras?: JenisSarpras | string; pekebunList?: Pekebun[] }): Promise<UsulanRekomtek> => {
    const now = new Date();
    const seq = getNextSequenceForMonth(now);
    const spka = generateSpkaNomor({
      bantuanTypeOrPackage: payload.jenisSarpras || 'EKSTENSIFIKASI',
      date: now,
      sequenceNumber: seq,
    });

    const newId = `usl-${String(usulans.value.length + 1).padStart(3, '0')}`;
    const newUsulan: UsulanRekomtek = {
      id: newId,
      nomorUsulan: spka.nomorUsulan,
      nomor_proposal: spka.nomorUsulan,
      namaKelompokTani: payload.namaKelompokTani,
      komoditas: payload.komoditas || 'Kelapa',
      status: 'VERIFIKASI_DITJENBUN',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      jenisSarpras: (payload.jenisSarpras as any) || JenisSarpras.EKSTENSIFIKASI,
      pekebunList: payload.pekebunList || [],
      logs: [],
    };

    usulans.value.unshift(newUsulan);
    activeUsulan.value = newUsulan;
    return newUsulan;
  };

  return {
    usulans,
    activeUsulan,
    fetchUsulans,
    fetchUsulanById,
    createUsulan,
    submitAsistensi,
    kembalikanUsulan,
    generateRekomtek,
    uploadRekomtek,
    ajukanRekomtek,
    approveDitjenbun,
    rejectDitjenbun,
    submitBpdpChecklist,
    generateKelayakan,
    uploadKelayakanFile,
    submitKelayakanToKadiv,
    approveBpdpKadiv,
    rejectBpdpKadiv,
    returnRekomtekToDitjenbun,
    generateSkDirut,
    saveSkDirutFile,
    uploadSkDirut,
  };
});
