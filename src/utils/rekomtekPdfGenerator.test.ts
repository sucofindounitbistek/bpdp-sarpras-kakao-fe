import { describe, it, expect } from 'vitest';
import {
  terbilangRupiah,
  formatRupiah,
  getFallbackNomorRekomtek,
  generateRekomtekHtml,
  type RekomtekDocumentData,
} from './rekomtekPdfGenerator';

describe('rekomtekPdfGenerator', () => {
  describe('terbilangRupiah', () => {
    it('mengubah angka 0 menjadi Nol Rupiah', () => {
      expect(terbilangRupiah(0)).toBe('Nol Rupiah');
    });

    it('mengubah angka jutaan dengan tepat', () => {
      expect(terbilangRupiah(1500000)).toBe('Satu Juta Lima Ratus Ribu Rupiah');
    });

    it('mengubah angka miliaran dengan tepat', () => {
      expect(terbilangRupiah(1450000000)).toBe(
        'Satu Miliar Empat Ratus Lima Puluh Juta Rupiah'
      );
    });
  });

  describe('formatRupiah', () => {
    it('memformat nominal ke mata uang IDR', () => {
      const formatted = formatRupiah(1000000);
      expect(formatted).toContain('1.000.000');
    });
  });

  describe('getFallbackNomorRekomtek', () => {
    it('menghasilkan format standar Kementan .../PI.400/E/MM/YYYY', () => {
      const fallback = getFallbackNomorRekomtek();
      const currentYear = new Date().getFullYear();
      expect(fallback).toMatch(new RegExp(`\\.\\.\\./PI\\.400/E/\\d{2}/${currentYear}`));
    });
  });

  describe('generateRekomtekHtml', () => {
    const mockData: RekomtekDocumentData = {
      nomorSurat: '124/PI.400/E/08/2026',
      tanggalSurat: '20 Agustus 2026',
      kelembagaan: {
        namaLembaga: 'KUD BINA TANI SEJAHTERA',
        badanHukum: 'No. AHU-0001234.AH.01.26.TAHUN 2020',
        alamatLembaga: 'Desa Sukamaju, Kec. Tapung Hilir, Kab. Kampar, Riau',
        luasArealHa: 150.25,
        jumlahPekebun: 75,
        lokasiKebun: 'Desa Sukamaju, Kec. Tapung Hilir, Kab. Kampar',
      },
      paketSarpras: {
        namaPaket: 'Intensifikasi Tanaman Kelapa Sawit',
        jenisBantuan: 'BARANG',
        totalNilaiRp: 1450000000,
      },
      itemsRAB: [
        {
          no: 1,
          namaBarang: 'Pupuk NPK 15-15-15',
          satuan: 'Kg',
          volume: 30000,
          hargaSatuan: 15000,
          totalHarga: 450000000,
        },
        {
          no: 2,
          namaBarang: 'Dolomite Super',
          satuan: 'Kg',
          volume: 100000,
          hargaSatuan: 10000,
          totalHarga: 1000000000,
        },
      ],
      skCpclKabupaten: {
        nomorSk: '500.5.4/DISBUN/SK-CPCL/2026/012',
        tanggalSk: '15 Juni 2026',
        pejabatPenerbit: 'Kepala Dinas Perkebunan Kabupaten Kampar',
      },
      beritaAcaraVerifikasi: {
        nomorBa: 'BA-VERIF/DISBUN-PROV/07/2026',
        tanggalBa: '20 Juli 2026',
      },
    };

    it('menghasilkan dokumen 3 halaman dengan kontainer A4 presisi', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('rekomtek-page page-1');
      expect(html).toContain('rekomtek-page page-2');
      expect(html).toContain('rekomtek-page page-3');
    });

    it('menyematkan kop surat resmi Kementerian Pertanian', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('KEMENTERIAN PERTANIAN');
      expect(html).toContain('DIREKTORAT JENDERAL PERKEBUNAN');
      expect(html).toContain('KANPUS KEMENTERIAN PERTANIAN');
    });

    it('menyematkan nomor surat dan identitas kelembagaan', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('124/PI.400/E/08/2026');
      expect(html).toContain('KUD BINA TANI SEJAHTERA');
      expect(html).toContain('150,25 Ha');
      expect(html).toContain('75 KK');
    });

    it('menyematkan rincian item RAB', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('Pupuk NPK 15-15-15');
      expect(html).toContain('Dolomite Super');
    });

    it('menyematkan blok TTE BSrE Plt. Dirjenbun pada Halaman 2 dan Halaman 3', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('Plt. Direktur Jenderal Perkebunan');
      expect(html).toContain('Heru Tri Widarto, S.Si., M.Sc');
      expect(html).toContain('NIP 197204121999031004');
      expect(html).toContain('BSrE');
    });

    it('menyematkan lampiran SK CPCL dan Berita Acara pada Halaman 3', () => {
      const html = generateRekomtekHtml(mockData);
      expect(html).toContain('500.5.4/DISBUN/SK-CPCL/2026/012');
      expect(html).toContain('BA-VERIF/DISBUN-PROV/07/2026');
    });

    it('menggunakan fallback draf saat nomorSurat kosong', () => {
      const dataWithoutNo = { ...mockData, nomorSurat: '' };
      const html = generateRekomtekHtml(dataWithoutNo);
      expect(html).toContain('.../PI.400/E/');
    });
  });
});
