import { describe, it, expect } from 'vitest';
import {
  getKabupatenNama,
  getProvinsiNama,
  normalizeRegionName,
  matchesProposalRegion,
} from './regionHelper';

describe('regionHelper', () => {
  describe('normalizeRegionName', () => {
    it('normalizes regency strings with Kabupaten prefix', () => {
      expect(normalizeRegionName('Kabupaten Luwu Utara')).toBe('luwu utara');
    });

    it('normalizes regency strings with Kab. prefix', () => {
      expect(normalizeRegionName('Kab. Bogor')).toBe('bogor');
      expect(normalizeRegionName('Kab.  Siak')).toBe('siak');
    });

    it('normalizes regency strings with Kota prefix', () => {
      expect(normalizeRegionName('Kota Bogor')).toBe('bogor');
    });

    it('handles null, undefined, or empty values safely', () => {
      expect(normalizeRegionName(null)).toBe('');
      expect(normalizeRegionName(undefined)).toBe('');
      expect(normalizeRegionName('')).toBe('');
    });
  });

  describe('matchesProposalRegion (Hybrid Matching Rule)', () => {
    it('returns true when no target region is specified (unscoped / central role)', () => {
      const proposal = { id: 1, nomor_proposal: 'PROP-01' };
      expect(matchesProposalRegion(proposal, undefined, undefined)).toBe(true);
      expect(matchesProposalRegion(proposal, null, '')).toBe(true);
    });

    it('returns false when proposal item is null or undefined', () => {
      expect(matchesProposalRegion(null, 3201, 'Kabupaten Bogor')).toBe(false);
      expect(matchesProposalRegion(undefined, 3201, 'Kabupaten Bogor')).toBe(false);
    });

    it('matches by targetRegencyId using regency_id', () => {
      const proposal = { id: 1, regency_id: 3201 };
      expect(matchesProposalRegion(proposal, 3201)).toBe(true);
      expect(matchesProposalRegion(proposal, '3201')).toBe(true);
      expect(matchesProposalRegion(proposal, 7322)).toBe(false);
    });

    it('matches by targetRegencyId using kode_kabupaten', () => {
      const proposal = { id: 2, kode_kabupaten: '73.22' };
      expect(matchesProposalRegion(proposal, '73.22')).toBe(true);
      expect(matchesProposalRegion(proposal, '32.01')).toBe(false);
    });

    it('matches by targetRegencyName using getKabupatenNama fallback', () => {
      const proposal = {
        id: 3,
        kelembagaan: {
          kabupatenNama: 'Kabupaten Luwu Utara',
        },
      };
      expect(matchesProposalRegion(proposal, undefined, 'Kab. Luwu Utara')).toBe(true);
      expect(matchesProposalRegion(proposal, undefined, 'Luwu Utara')).toBe(true);
      expect(matchesProposalRegion(proposal, undefined, 'Kab. Bogor')).toBe(false);
    });

    it('successfully matches when targetRegencyId is different but fallback name matches', () => {
      const proposal = {
        id: 4,
        regency_id: 9999, // Unsynchronized ID
        kabupaten: 'Kabupaten Luwu Utara',
      };
      // Matches via name fallback
      expect(matchesProposalRegion(proposal, 7322, 'Kabupaten Luwu Utara')).toBe(true);
    });

    it('returns false when neither ID nor name matches target region', () => {
      const proposal = {
        id: 5,
        regency_id: 1405, // Siak
        kelembagaan: {
          kabupaten: 'Kabupaten Siak',
        },
      };
      expect(matchesProposalRegion(proposal, 7322, 'Kab. Luwu Utara')).toBe(false);
    });
  });

  describe('getKabupatenNama and getProvinsiNama fallbacks', () => {
    it('resolves direct property kabupatenNama', () => {
      expect(getKabupatenNama({ kabupatenNama: 'Kab. Paser' })).toBe('Kab. Paser');
    });

    it('resolves kelembagaan kabupaten property', () => {
      expect(getKabupatenNama({ kelembagaan: { kabupaten: 'Kab. Asahan' } })).toBe('Kab. Asahan');
    });

    it('returns default fallback Kab. Luwu Utara when no location property exists', () => {
      expect(getKabupatenNama({})).toBe('Kab. Luwu Utara');
    });

    it('returns default fallback Sulawesi Selatan for provinsi', () => {
      expect(getProvinsiNama({})).toBe('Sulawesi Selatan');
    });
  });
});
