// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatRupiah, formatDate, exportProposalsToCsv, exportProposalsToPdf } from './exportProposal';

describe('exportProposal utility', () => {
  describe('formatRupiah', () => {
    it('formats numbers to Indonesian Rupiah currency format', () => {
      expect(formatRupiah(150000000)).toBe('Rp 150.000.000');
      expect(formatRupiah(0)).toBe('Rp 0');
      expect(formatRupiah(undefined)).toBe('Rp 0');
      expect(formatRupiah('500000')).toBe('Rp 500.000');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates to readable short dates', () => {
      const formatted = formatDate('2026-08-15T10:00:00Z');
      expect(formatted).toContain('2026');
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('exportProposalsToCsv', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('creates a download link with CSV blob and triggers click', () => {
      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const dummyProposals = [
        {
          id: 1,
          nomor_proposal: 'SPKA0108260001',
          lembaga: { namaLembaga: 'Koperasi Sawit Makmur' },
          paket_sarpras: 'PAKET_A',
          total_anggaran: 250000000,
          status: 'SUBMITTED',
          no_rekomtek: 'REK-123',
          created_at: '2026-08-01',
        },
      ];

      exportProposalsToCsv(dummyProposals, 'test-export');

      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });

    it('safely handles empty data array', () => {
      const createObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;

      exportProposalsToCsv([], 'empty-export');
      expect(createObjectURLMock).not.toHaveBeenCalled();
    });
  });

  describe('exportProposalsToPdf', () => {
    it('creates an invisible iframe and triggers document write', () => {
      const mockIframe = {
        style: {},
        contentWindow: {
          document: {
            open: vi.fn(),
            write: vi.fn(),
            close: vi.fn(),
          },
          focus: vi.fn(),
          print: vi.fn(),
        },
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockIframe as any);
      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);

      const dummyProposals = [
        {
          id: 1,
          nomor_proposal: 'SPKA0108260001',
          namaLembaga: 'Kelompok Tani Bersama',
          paket_sarpras: 'PAKET_A',
          total_anggaran: 100000000,
          status: 'SUBMITTED',
        },
      ];

      exportProposalsToPdf(dummyProposals, 'Daftar Usulan Test', {
        startDate: '2026-01-01',
        endDate: '2026-08-01',
        statusLabel: 'Submitted',
      });

      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockIframe.contentWindow.document.write).toHaveBeenCalled();
    });
  });
});
