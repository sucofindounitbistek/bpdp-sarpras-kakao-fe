import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeXml,
  formatDateIndo,
  extractPolygonCoordinates,
  generateXmlSpreadsheet,
  normalizePekebunLahans,
  exportLaporanTitikKoordinat,
  exportLaporanProfilPekebun,
} from './exportPekebunExcel';

describe('exportPekebunExcel.ts', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('escapeXml', () => {
    it('should correctly escape special XML characters', () => {
      expect(escapeXml('PT. Subur & Makmur <Koperasi> "Unggul" \'Lestari\'')).toBe(
        'PT. Subur &amp; Makmur &lt;Koperasi&gt; &quot;Unggul&quot; &apos;Lestari&apos;'
      );
    });

    it('should return empty string for null or undefined', () => {
      expect(escapeXml(null)).toBe('');
      expect(escapeXml(undefined)).toBe('');
    });
  });

  describe('formatDateIndo', () => {
    it('should format ISO date string to DD-MM-YYYY', () => {
      expect(formatDateIndo('2024-08-17')).toBe('17-08-2024');
    });

    it('should return - for empty values', () => {
      expect(formatDateIndo('')).toBe('-');
      expect(formatDateIndo(null)).toBe('-');
    });
  });

  describe('extractPolygonCoordinates', () => {
    it('should extract points from JSON array of objects', () => {
      const input = JSON.stringify([
        { lat: -0.1234, lng: 102.5678 },
        { lat: -0.1245, lng: 102.5689 },
      ]);
      const res = extractPolygonCoordinates(input);
      expect(res).toHaveLength(2);
      expect(res[0]).toEqual({ lat: -0.1234, lng: 102.5678 });
    });

    it('should extract points from legacy semicolon format', () => {
      const input = '-0.1234, 102.5678; -0.1245, 102.5689';
      const res = extractPolygonCoordinates(input);
      expect(res).toHaveLength(2);
      expect(res[0]).toEqual({ lat: -0.1234, lng: 102.5678 });
      expect(res[1]).toEqual({ lat: -0.1245, lng: 102.5689 });
    });

    it('should return empty array for invalid input', () => {
      expect(extractPolygonCoordinates('')).toEqual([]);
      expect(extractPolygonCoordinates(null)).toEqual([]);
    });
  });

  describe('normalizePekebunLahans', () => {
    it('should map pekebuns and lahans correctly', () => {
      const context = {
        pekebuns: [{ id: 1, nama: 'Budi' }],
        lahans: [{ id: 10, pekebun_id: 1, luas_lahan: 3 }],
      };
      const items = normalizePekebunLahans(context);
      expect(items).toHaveLength(1);
      expect(items[0].pekebun.nama).toBe('Budi');
      expect(items[0].lahan.luas_lahan).toBe(3);
    });
  });

  describe('generateXmlSpreadsheet', () => {
    it('should create valid XML workbook with headers and styled cells', () => {
      const headers = ['No', 'Nama'];
      const rows = [
        [
          { val: 1, type: 'Number' as const },
          { val: 'Budi', type: 'String' as const },
        ],
      ];
      const xml = generateXmlSpreadsheet('TestSheet', headers, rows);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<Worksheet ss:Name="TestSheet">');
      expect(xml).toContain('<Data ss:Type="String">Nama</Data>');
      expect(xml).toContain('<Data ss:Type="String">Budi</Data>');
    });
  });

  describe('exportLaporanTitikKoordinat (US1)', () => {
    it('should generate Laporan Titik Koordinat with 16 columns and 1 row per polygon vertex', () => {
      const mockContext = {
        proposal: {
          nomor_proposal: 'PRP/2026/001',
          nama_dinas_provinsi: 'Riau',
          nama_dinas_kabupaten: 'Indragiri Hilir',
          kelembagaan: { nama_lembaga: 'Koperasi Sawit Makmur' },
          tanggal_rekomtek: '2026-09-14T08:00:00.000Z',
        },
        pekebuns: [
          {
            id: 1,
            nama: 'Ahmad Yani',
            nik: '3201011234560001',
            lahans: [
              {
                id: 101,
                luas_lahan: 2.5,
                jenis_legalitas: 'SHM',
                nomor_legalitas: 'SHM-12345',
                coordinates: JSON.stringify([
                  { lat: -0.5, lng: 102.1 },
                  { lat: -0.51, lng: 102.11 },
                  { lat: -0.52, lng: 102.12 },
                ]),
              },
            ],
          },
        ],
      };

      const xml = exportLaporanTitikKoordinat(mockContext);

      // Verify 16 headers
      expect(xml).toContain('Nomor Proposal');
      expect(xml).toContain('Provinsi');
      expect(xml).toContain('Kabupaten');
      expect(xml).toContain('Nama Kelembagaan Pekebun');
      expect(xml).toContain('Nama Pekebun');
      expect(xml).toContain('NIK Pekebun');
      expect(xml).toContain('Luas Lahan (Ha)');
      expect(xml).toContain('Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)');
      expect(xml).toContain('Nama Tertera di SHM');
      expect(xml).toContain('Nomor SHM');
      expect(xml).toContain('Nomor SKT/GIRIK/SPORADIK');
      expect(xml).toContain('Tanggal Terbit Rekomtek');
      expect(xml).toContain('Tahun Terbit Rekomtek');
      expect(xml).toContain('Latitude');
      expect(xml).toContain('Longitude');

      // Verify Rekomtek date and year values
      expect(xml).toContain('<Data ss:Type="String">14-09-2026</Data>');
      expect(xml).toContain('<Data ss:Type="String">2026</Data>');

      // Verify polygon vertices (3 rows for 3 vertices)
      expect(xml).toContain('<Data ss:Type="String">3201011234560001</Data>');
      expect(xml).toContain('<Data ss:Type="String">SHM-12345</Data>');
      expect(xml).toContain('<Data ss:Type="Number">-0.50000000</Data>');
      expect(xml).toContain('<Data ss:Type="Number">102.10000000</Data>');
      expect(xml).toContain('<Data ss:Type="Number">-0.51000000</Data>');
      expect(xml).toContain('<Data ss:Type="Number">-0.52000000</Data>');

      // Verify SHM name logic: SHM sendiri -> Nama Pekebun
      expect(xml).toContain('<Data ss:Type="String">Ahmad Yani</Data>');
    });

    it('should handle non-SHM parcels properly and fallback for unissued rekomtek', () => {
      const mockContext = {
        proposal: {
          nomor_proposal: 'PRP/2026/002',
        },
        pekebuns: [
          {
            id: 2,
            nama: 'Siti Rahma',
            nik: '3201011234560002',
            lahans: [
              {
                id: 102,
                luas_lahan: 1.8,
                jenis_legalitas: 'SKT/GIRIK/SPORADIK',
                nomor_legalitas: 'SKT-9988',
                coordinates: [{ lat: -0.6, lng: 102.2 }],
              },
            ],
          },
        ],
      };

      const xml = exportLaporanTitikKoordinat(mockContext);
      expect(xml).toContain('<Data ss:Type="String">SKT-9988</Data>');
      expect(xml).toContain('<Data ss:Type="String">-</Data>'); // nomor SHM & rekomtek fallback is '-'
    });
  });

  describe('exportLaporanProfilPekebun (US2)', () => {
    it('should generate Laporan Profil Pekebun with 12 columns and 1 row per parcel', () => {
      const mockContext = {
        proposal: {
          nomor_proposal: 'PRP/2026/001',
          tanggal_rekomtek: '2026-09-14',
        },
        pekebuns: [
          {
            id: 1,
            nama: 'Ahmad Yani',
            nik: '3201011234560001',
            nomor_kk: '3201011234560009',
            address: 'Jl. Sawit No. 10',
            lahans: [
              {
                id: 101,
                jenis_legalitas: 'SHM',
                nomor_legalitas: 'SHM-12345',
                tanggal_penerbitan_legalitas: '2023-05-12',
                luas_lahan: 2.5,
              },
              {
                id: 102,
                jenis_legalitas: 'SKT',
                nomor_legalitas: 'SKT-5544',
                tanggal_penerbitan_legalitas: '2022-01-10',
                luas_lahan: 1.2,
              },
            ],
          },
        ],
      };

      const xml = exportLaporanProfilPekebun(mockContext);

      // Verify 12 headers
      expect(xml).toContain('Nama Pekebun');
      expect(xml).toContain('NIK Pekebun');
      expect(xml).toContain('KK Pekebun');
      expect(xml).toContain('Alamat Pekebun');
      expect(xml).toContain('Jenis Legalitas');
      expect(xml).toContain('No / Nama Dokumen Legalitas Lahan');
      expect(xml).toContain('Tanggal Terbit Legalitas Lahan');
      expect(xml).toContain('Luas Lahan Sesuai Legalitas (Ha)');
      expect(xml).toContain('Luas Lahan (Ha)');
      expect(xml).toContain('Tanggal Terbit Rekomtek');
      expect(xml).toContain('Tahun Terbit Rekomtek');

      // Verify data for both parcels
      expect(xml).toContain('<Data ss:Type="String">3201011234560001</Data>');
      expect(xml).toContain('<Data ss:Type="String">3201011234560009</Data>');
      expect(xml).toContain('<Data ss:Type="String">Jl. Sawit No. 10</Data>');
      expect(xml).toContain('<Data ss:Type="String">SHM-12345</Data>');
      expect(xml).toContain('<Data ss:Type="String">12-05-2023</Data>');
      expect(xml).toContain('<Data ss:Type="Number">2.50</Data>');
      expect(xml).toContain('<Data ss:Type="String">SKT-5544</Data>');
      expect(xml).toContain('<Data ss:Type="String">10-01-2022</Data>');
      expect(xml).toContain('<Data ss:Type="Number">1.20</Data>');
      expect(xml).toContain('<Data ss:Type="String">14-09-2026</Data>');
      expect(xml).toContain('<Data ss:Type="String">2026</Data>');
    });
  });
});
