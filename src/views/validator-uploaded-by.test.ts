// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VerifikasiDokumenItem from '@/components/rekomtek/VerifikasiDokumenItem.vue';

import { formatUploadedAt, formatDiunggahOleh } from '@/utils/formatUploadedAt';

describe('Validator Documents "Diunggah oleh {user name}" Display', () => {
  it('renders "Diunggah oleh {user name}" in VerifikasiDokumenItem when uploadedBy prop is provided', () => {
    const wrapper = mount(VerifikasiDokumenItem, {
      props: {
        title: 'Surat Pengantar SK CPCL',
        fileName: 'surat_pengantar.pdf',
        fileUrl: 'http://example.com/sp.pdf',
        valid: true,
        note: '',
        uploadedBy: 'Ahmad Verifikator Provinsi',
      },
    });

    expect(wrapper.text()).toContain('Diunggah oleh Ahmad Verifikator Provinsi');
  });

  it('renders "Diunggah oleh {user name} • {time}" in VerifikasiDokumenItem when uploadedAtFormatted is provided', () => {
    const wrapper = mount(VerifikasiDokumenItem, {
      props: {
        title: 'Surat Pengantar SK CPCL',
        fileName: 'surat_pengantar.pdf',
        fileUrl: 'http://example.com/sp.pdf',
        valid: true,
        note: '',
        uploadedBy: 'Ahmad Verifikator Provinsi',
        uploadedAtFormatted: '12 Sep 2026, 15:19',
      },
    });

    expect(wrapper.text()).toContain('Diunggah oleh Ahmad Verifikator Provinsi • 12 Sep 2026, 15:19');
  });

  it('does NOT render "Diunggah oleh" in VerifikasiDokumenItem when uploadedBy prop is omitted or empty', () => {
    const wrapper = mount(VerifikasiDokumenItem, {
      props: {
        title: 'KTP Pekebun',
        fileName: 'ktp.pdf',
        fileUrl: 'http://example.com/ktp.pdf',
        valid: true,
        note: '',
      },
    });

    expect(wrapper.text()).not.toContain('Diunggah oleh');
  });

  it('correctly resolves updated_by_name prioritized over created_by_name and uploadedBy', () => {
    const docWithBoth = {
      updated_by_name: 'Super Admin BPDP',
      created_by_name: 'Verifikator Ditjenbun',
      uploadedBy: 'Legacy Uploader',
    };

    const resolveUploadedBy = (d: any) => d.updated_by_name || d.created_by_name || d.uploadedBy || '';

    expect(resolveUploadedBy(docWithBoth)).toBe('Super Admin BPDP');

    const docWithOnlyCreated = {
      updated_by_name: '',
      created_by_name: 'Verifikator Ditjenbun',
      uploadedBy: 'Legacy Uploader',
    };
    expect(resolveUploadedBy(docWithOnlyCreated)).toBe('Verifikator Ditjenbun');

    const docWithOnlyUploadedBy = {
      uploadedBy: 'Legacy Uploader',
    };
    expect(resolveUploadedBy(docWithOnlyUploadedBy)).toBe('Legacy Uploader');
  });

  describe('formatUploadedAt and formatDiunggahOleh utility', () => {
    it('returns formatted string directly if provided by backend', () => {
      expect(formatUploadedAt('12 Sep 2026, 15:19')).toBe('12 Sep 2026, 15:19');
    });

    it('formats ISO timestamp fallback to human readable format', () => {
      const result = formatUploadedAt(undefined, '2026-09-12T08:19:00Z');
      expect(result).toMatch(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4},\s+\d{2}:\d{2}/);
    });

    it('returns empty string if neither formatted nor fallback ISO timestamp is given', () => {
      expect(formatUploadedAt('', '')).toBe('');
      expect(formatUploadedAt(undefined, undefined)).toBe('');
    });

    it('formats diunggah oleh correctly with and without timestamp', () => {
      expect(formatDiunggahOleh('Budi Santoso', '12 Sep 2026, 15:19')).toBe('Diunggah oleh Budi Santoso • 12 Sep 2026, 15:19');
      expect(formatDiunggahOleh('Budi Santoso')).toBe('Diunggah oleh Budi Santoso');
      expect(formatDiunggahOleh('Diunggah oleh Budi Santoso', '12 Sep 2026, 15:19')).toBe('Diunggah oleh Budi Santoso • 12 Sep 2026, 15:19');
    });
  });
});
