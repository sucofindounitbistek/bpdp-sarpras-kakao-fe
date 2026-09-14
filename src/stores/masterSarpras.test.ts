import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMasterSarprasStore } from './masterSarpras';
import { masterSarprasService } from '@/services/masterSarpras.service';

describe('useMasterSarprasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('should initialize with static default packages', () => {
    const store = useMasterSarprasStore();
    expect(store.paketList.length).toBeGreaterThan(0);
    expect(store.paketMap['EKSTENSIFIKASI']).toBeDefined();
    expect(store.paketMap['EKSTENSIFIKASI'].is_pupuk).toBe(true);
  });

  it('should identify isPupukPaket correctly', () => {
    const store = useMasterSarprasStore();
    expect(store.isPupukPaket('EKSTENSIFIKASI')).toBe(true);
    expect(store.isPupukPaket('INTENSIFIKASI')).toBe(true);
    expect(store.isPupukPaket('JALAN_KEBUN')).toBe(false);
  });

  it('should return syarat minimum rule correctly', () => {
    const store = useMasterSarprasStore();
    const rule = store.getSyaratMinimum('EKSTENSIFIKASI');
    expect(rule).toBeDefined();
    expect(rule?.minimal_pekebun).toBe(20);
    expect(rule?.minimal_luas_ha).toBe(3);
  });

  it('should fetch dynamic master data and update store state', async () => {
    const mockCategories = [
      { id: 1, code: 'EKSTENSIFIKASI', name: 'Ekstensifikasi', sort_order: 1, is_active: true },
    ];
    const mockPakets = [
      {
        id: 1,
        kategori_id: 1,
        kategori_code: 'EKSTENSIFIKASI',
        code: 'EKSTENSIFIKASI',
        name: 'Ekstensifikasi (Benih, Pupuk)',
        label: 'Ekstensifikasi',
        is_pupuk: true,
        sort_order: 1,
        is_active: true,
        syarat_minimum: {
          minimal_pekebun: 20,
          minimal_luas_ha: 3.0,
          jarak_antar_kebun_km: null,
          kondisi_validasi: 'OR',
        },
      },
    ];

    vi.spyOn(masterSarprasService, 'getKategoriList').mockResolvedValue(mockCategories);
    vi.spyOn(masterSarprasService, 'getPaketList').mockResolvedValue(mockPakets);
    vi.spyOn(masterSarprasService, 'getDokumenCatalog').mockResolvedValue([]);
    vi.spyOn(masterSarprasService, 'getSyaratLahanList').mockResolvedValue([]);

    const store = useMasterSarprasStore();
    await store.fetchMasterData(true);

    expect(store.isLoaded).toBe(true);
    expect(store.kategoriList.length).toBe(1);
    expect(store.paketList[0].code).toBe('EKSTENSIFIKASI');
  });

  it('should fetch and cache dynamic requirements per package', async () => {
    const mockDocs = [
      {
        id: 1,
        dokumen_code: 'LEGALITAS_KP',
        nama: 'Legalitas KP',
        is_wajib: true,
        sort_order: 1,
        max_size_bytes: 5242880,
      },
    ];

    vi.spyOn(masterSarprasService, 'getPersyaratanByPaket').mockResolvedValue(mockDocs);

    const store = useMasterSarprasStore();
    const result = await store.fetchPersyaratan('EKSTENSIFIKASI');

    expect(result.length).toBe(1);
    expect(result[0].dokumen_code).toBe('LEGALITAS_KP');
    expect(store.persyaratanMap['EKSTENSIFIKASI']).toBeDefined();
  });
});
