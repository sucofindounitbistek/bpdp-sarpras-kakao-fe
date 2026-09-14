import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { masterSarprasService } from '@/services/masterSarpras.service';
import type {
  MasterKategoriSarpras,
  MasterPaketSarpras,
  DokumenPersyaratanItem,
  MasterDokumenCatalog,
  MasterSyaratLahan,
  MasterPaketGroup,
  SyaratMinimumRule,
} from '@/types/masterSarpras';
import {
  PAKET_OPTIONS,
  PAKET_MINIMUM_REQUIREMENTS,
  PAKET_PERSYARATAN_CONFIG,
} from '@/lib/pengusulan-persyaratan.config';
import { JenisSarpras } from '@/types/pengusulan';

export const useMasterSarprasStore = defineStore('masterSarpras', () => {
  const kategoriList = ref<MasterKategoriSarpras[]>([]);
  const paketList = ref<MasterPaketSarpras[]>([]);
  const dokumenCatalog = ref<MasterDokumenCatalog[]>([]);
  const syaratLahanList = ref<MasterSyaratLahan[]>([]);
  const persyaratanMap = ref<Record<string, DokumenPersyaratanItem[]>>({});

  const isLoading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  // Fallback initial population from static config
  function populateDefaults() {
    if (kategoriList.value.length === 0) {
      kategoriList.value = [
        { id: 1, code: 'EKSTENSIFIKASI', name: 'Ekstensifikasi', icon: '🌱', sort_order: 1, is_active: true },
        { id: 2, code: 'INTENSIFIKASI', name: 'Intensifikasi', icon: '🌾', sort_order: 2, is_active: true },
        { id: 3, code: 'ALAT_PASCAPANEN', name: 'Alat Pascapanen', icon: '⚙️', sort_order: 3, is_active: true },
        { id: 4, code: 'UPH', name: 'Unit Pengolahan Hasil (UPH)', icon: '🏭', sort_order: 4, is_active: true },
        { id: 5, code: 'JALAN_KEBUN', name: 'Jalan Kebun & Akses', icon: '🛣️', sort_order: 5, is_active: true },
        { id: 6, code: 'ALAT_TRANSPORTASI', name: 'Alat Transportasi', icon: '🚛', sort_order: 6, is_active: true },
        { id: 7, code: 'MESIN_PERTANIAN', name: 'Mesin Pertanian', icon: '🚜', sort_order: 7, is_active: true },
        { id: 8, code: 'INFRASTRUKTUR_PASAR', name: 'Infrastruktur Pasar', icon: '🏬', sort_order: 8, is_active: true },
        { id: 9, code: 'VERIFIKASI_TEKNIS', name: 'Verifikasi Teknis', icon: '🔍', sort_order: 9, is_active: true },
      ];
    }
    if (dokumenCatalog.value.length === 0) {
      dokumenCatalog.value = [
        { id: 1, code: 'LEGALITAS_KP', name: 'Legalitas KP', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 2, code: 'SIMLUHTAN', name: 'Dokumen Penunjukan Ketua Kelembagaan Pekebun (Simluhtan)', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 3, code: 'GAMBAR_LAHAN', name: 'Gambar lahan/kebun berkoordinat', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 4, code: 'RAB_RK', name: 'Rencana Kerja', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 5, code: 'PERNYATAAN_LUAS', name: 'Pernyataan luas lahan dan umur tanaman', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 6, code: 'REFERENSI_HARGA', name: 'Referensi harga dari penyedia', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 7, code: 'PERNYATAAN_TANPA_BAKAR', name: 'Pernyataan pembukaan lahan tanpa bakar', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 8, code: 'DETAIL_PEKEBUN', name: 'Detail masing-masing pekebun', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 9, code: 'PERJANJIAN_KEMITRAAN', name: 'Perjanjian kerja sama kemitraan usaha', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 10, code: 'DOKUMEN_SID', name: 'Dokumen SID', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 11, code: 'KELAYAKAN_UPH', name: 'Surat pernyataan kelayakan usaha pendirian UPH', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 12, code: 'SHM_UPH', name: 'SHM/HGU/HGB untuk pengolahan hasil', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 13, code: 'IZIN_USAHA', name: 'Perizinan berusaha', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 14, code: 'STUDI_KELAYAKAN', name: 'Studi kelayakan', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 15, code: 'HASIL_PRODUKSI', name: 'Pernyataan hasil produksi buah', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 16, code: 'KELOLA_ADMIN', name: 'Pernyataan kesanggupan mengelola administrasi dan manajerial', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 17, code: 'BELUM_ADA_UPH', name: 'Pernyataan berada di wilayah perkebunan swadaya yang belum ada usaha pengolahan hasil', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 18, code: 'HASIL_RAT', name: 'Hasil RAT', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 19, code: 'BIAYA_OPERASIONAL', name: 'Surat pernyataan kesanggupan membayar biaya operasional', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 20, code: 'FOTO_JALAN', name: 'Foto kondisi jalan sebelum pelaksanaan', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 21, code: 'RINCIAN_PEKERJAAN', name: 'Rincian pekerjaan', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 22, code: 'JANGKA_WAKTU', name: 'Jangka waktu pelaksanaan', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 23, code: 'KURVA_S', name: 'Kurva S', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 24, code: 'HARGA_SATUAN', name: 'Harga satuan pengerjaan', max_size_bytes: 5242880, is_active: true, is_wajib: true },
        { id: 25, code: 'RAB_DETAIL', name: 'RAB Detail (Excel)', max_size_bytes: 5242880, is_active: true, is_wajib: true },
      ];
    }

    if (paketList.value.length === 0) {
      paketList.value = PAKET_OPTIONS.map((opt, idx) => {
        const minRule = PAKET_MINIMUM_REQUIREMENTS[opt.id as JenisSarpras];
        let katCode = 'EKSTENSIFIKASI';
        if (opt.id === JenisSarpras.INTENSIFIKASI) katCode = 'INTENSIFIKASI';
        else if (opt.id === JenisSarpras.ALAT_PASCAPANEN) katCode = 'ALAT_PASCAPANEN';
        else if (opt.id === JenisSarpras.UPH_1_JENIS || opt.id === JenisSarpras.UPH_MULTI_JENIS || opt.id === JenisSarpras.UPH) katCode = 'UPH';
        else if (opt.id === JenisSarpras.JALAN_KEBUN) katCode = 'JALAN_KEBUN';
        else if ([JenisSarpras.ALAT_ANGKUT_LANGSIR, JenisSarpras.GEROBAK_BERMOTOR, JenisSarpras.PIKAP, JenisSarpras.TRUK].includes(opt.id as any)) katCode = 'ALAT_TRANSPORTASI';
        else if (opt.id === JenisSarpras.MESIN_PERTANIAN) katCode = 'MESIN_PERTANIAN';
        else if (opt.id === JenisSarpras.INFRASTRUKTUR_PASAR) katCode = 'INFRASTRUKTUR_PASAR';
        else if (opt.id === JenisSarpras.VERIFIKASI_TEKNIS) katCode = 'VERIFIKASI_TEKNIS';

        return {
          id: idx + 1,
          kategori_id: 1,
          kategori_code: katCode,
          code: String(opt.id),
          name: opt.label,
          label: opt.label,
          description: opt.description,
          icon: opt.icon,
          is_pupuk: !!opt.isPupuk,
          jumlah_tahap: opt.id === JenisSarpras.INTENSIFIKASI ? 4 : opt.id === JenisSarpras.EKSTENSIFIKASI ? 2 : 1,
          sort_order: idx + 1,
          is_active: true,
          syarat_minimum: minRule
            ? {
                minimal_pekebun: minRule.minimalPekebun,
                minimal_luas_ha: minRule.minimalLuasHa,
                jarak_antar_kebun_km: minRule.jarakAntarKebunKm,
                kondisi_validasi: 'OR',
                keterangan: minRule.keterangan,
              }
            : null,
        };
      });
    }
  }


  // Populate static defaults right away
  populateDefaults();

  const paketMap = computed<Record<string, MasterPaketSarpras>>(() => {
    const map: Record<string, MasterPaketSarpras> = {};
    for (const p of paketList.value) {
      if (p.code) {
        map[p.code] = p;
        map[p.code.toUpperCase()] = p;
        map[p.code.toLowerCase()] = p;
      }
      if (p.id) {
        map[String(p.id)] = p;
      }
    }
    return map;
  });

  const paketGroups = computed<MasterPaketGroup[]>(() => {
    if (kategoriList.value.length > 0) {
      return kategoriList.value
        .filter((k) => k.is_active)
        .map((k) => ({
          name: k.name,
          icon: k.icon || '📦',
          description: k.description || '',
          options: paketList.value.filter((p) => p.kategori_code === k.code && p.is_active),
        }))
        .filter((g) => g.options.length > 0);
    }

    // Fallback static groups
    return [
      {
        name: 'Ekstensifikasi',
        icon: '🌱',
        description: 'Perluasan areal tutupan kelapa',
        options: paketList.value.filter((p) => p.code === 'EKSTENSIFIKASI'),
      },
      {
        name: 'Intensifikasi',
        icon: '🌾',
        description: 'Pemeliharaan dan peningkatan produktivitas',
        options: paketList.value.filter((p) => p.code === 'INTENSIFIKASI'),
      },
      {
        name: 'Alat Pascapanen',
        icon: '⚙️',
        description: 'Peralatan pengolahan pascapanen kelapa',
        options: paketList.value.filter((p) => p.code === 'ALAT_PASCAPANEN'),
      },
      {
        name: 'Unit Pengolahan Hasil',
        icon: '🏭',
        description: 'Sarana pengolahan hasil panen kelapa',
        options: paketList.value.filter((p) => ['UPH_1_JENIS', 'UPH_MULTI_JENIS', 'UPH'].includes(p.code)),
      },
      {
        name: 'Jalan Kebun',
        icon: '🛣️',
        description: 'Akses jalan kebun dan pelabuhan/jalan umum',
        options: paketList.value.filter((p) => p.code === 'JALAN_KEBUN'),
      },
      {
        name: 'Alat Transportasi',
        icon: '🚛',
        description: 'Kendaraan & armada pengangkut kelapa',
        options: paketList.value.filter((p) =>
          ['ALAT_ANGKUT_LANGSIR', 'GEROBAK_BERMOTOR', 'PIKAP', 'TRUK'].includes(p.code)
        ),
      },
      {
        name: 'Mesin Pertanian',
        icon: '🚜',
        description: 'Mesin dan perlengkapan budidaya kelapa',
        options: paketList.value.filter((p) => p.code === 'MESIN_PERTANIAN'),
      },
      {
        name: 'Pembentukan Infrastruktur Pasar',
        icon: '🏬',
        description: 'Fasilitas pemasaran dan kelembagaan',
        options: paketList.value.filter((p) => p.code === 'INFRASTRUKTUR_PASAR'),
      },
      {
        name: 'Verifikasi atau Penelusuran Teknis',
        icon: '🔍',
        description: 'Survei dan verifikasi lapangan kelapa',
        options: paketList.value.filter((p) => p.code === 'VERIFIKASI_TEKNIS'),
      },
    ].filter((g) => g.options.length > 0);
  });

  async function fetchMasterData(force: boolean = false) {
    if (isLoaded.value && !force) return;

    isLoading.value = true;
    error.value = null;

    try {
      const [kategoris, pakets, docs, lahan] = await Promise.allSettled([
        masterSarprasService.getKategoriList(),
        masterSarprasService.getPaketList(),
        masterSarprasService.getDokumenCatalog(),
        masterSarprasService.getSyaratLahanList(),
      ]);

      if (kategoris.status === 'fulfilled' && kategoris.value.length > 0) {
        kategoriList.value = kategoris.value;
      }
      if (pakets.status === 'fulfilled' && pakets.value.length > 0) {
        paketList.value = pakets.value;
      }
      if (docs.status === 'fulfilled' && docs.value.length > 0) {
        dokumenCatalog.value = docs.value;
      }
      if (lahan.status === 'fulfilled' && lahan.value.length > 0) {
        syaratLahanList.value = lahan.value;
      }

      isLoaded.value = true;
    } catch (err: any) {
      console.warn('Failed to load master data from API, using static fallback:', err);
      error.value = err?.message || 'Gagal memuat master data';
      populateDefaults();
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPersyaratan(paketCode: string, force: boolean = false): Promise<DokumenPersyaratanItem[]> {
    if (!paketCode) return [];
    if (!force && persyaratanMap.value[paketCode]?.length) {
      return persyaratanMap.value[paketCode];
    }

    try {
      const list = await masterSarprasService.getPersyaratanByPaket(paketCode);
      if (Array.isArray(list)) {
        persyaratanMap.value[paketCode] = list;
        return list;
      }
    } catch (err) {
      console.warn(`Failed to fetch requirements for ${paketCode}, falling back to static config`, err);
    }

    // Static fallback
    const staticDocs = PAKET_PERSYARATAN_CONFIG[paketCode as JenisSarpras] || [];
    const fallbackList: DokumenPersyaratanItem[] = staticDocs.map((d, i) => ({
      id: i + 1,
      dokumen_code: d.id,
      nama: d.nama,
      format_download_url: d.formatDownloadUrl,
      is_wajib: !!d.wajib,
      sort_order: i + 1,
      max_size_bytes: 5242880,
    }));

    persyaratanMap.value[paketCode] = fallbackList;
    return fallbackList;
  }


  function getSyaratMinimum(paketCode: string): SyaratMinimumRule | null {
    if (!paketCode) return null;
    const paket = paketMap.value[paketCode];
    if (paket?.syarat_minimum !== undefined) {
      return paket.syarat_minimum;
    }

    const staticRule = PAKET_MINIMUM_REQUIREMENTS[paketCode as JenisSarpras];
    if (staticRule) {
      return {
        minimal_pekebun: staticRule.minimalPekebun,
        minimal_luas_ha: staticRule.minimalLuasHa,
        jarak_antar_kebun_km: staticRule.jarakAntarKebunKm,
        kondisi_validasi: 'OR',
        keterangan: staticRule.keterangan,
      };
    }
    return null;
  }

  function isPupukPaket(paketCode: string): boolean {
    if (!paketCode) return false;
    const paket = paketMap.value[paketCode];
    if (paket) return paket.is_pupuk;
    return paketCode === 'EKSTENSIFIKASI' || paketCode === 'INTENSIFIKASI';
  }

  async function createPaket(payload: any) {
    const res = await masterSarprasService.createPaket(payload);
    await fetchMasterData(true);
    return res;
  }

  async function updatePaket(code: string, payload: any) {
    const res = await masterSarprasService.updatePaket(code, payload);
    // Clear requirement cache for this package so it refetches cleanly
    delete persyaratanMap.value[code];
    await fetchMasterData(true);
    return res;
  }

  async function deletePaket(code: string) {
    const res = await masterSarprasService.deletePaket(code);
    delete persyaratanMap.value[code];
    await fetchMasterData(true);
    return res;
  }

  async function togglePaketStatus(code: string, isActive: boolean) {
    const res = await masterSarprasService.updatePaketStatus(code, isActive);
    await fetchMasterData(true);
    return res;
  }

  async function createDokumen(payload: any) {
    const res = await masterSarprasService.createDokumen(payload);
    await fetchMasterData(true);
    return res;
  }

  async function updateDokumen(code: string, payload: any) {
    const res = await masterSarprasService.updateDokumen(code, payload);
    // Invalidate requirement maps since document metadata/name might have changed
    persyaratanMap.value = {};
    await fetchMasterData(true);
    return res;
  }

  async function deleteDokumen(code: string) {
    const res = await masterSarprasService.deleteDokumen(code);
    persyaratanMap.value = {};
    await fetchMasterData(true);
    return res;
  }

  async function toggleDokumenStatus(code: string, isActive: boolean) {
    const res = await masterSarprasService.updateDokumenStatus(code, isActive);
    await fetchMasterData(true);
    return res;
  }

  return {
    kategoriList,
    paketList,
    dokumenCatalog,
    syaratLahanList,
    persyaratanMap,
    paketMap,
    paketGroups,
    isLoading,
    isLoaded,
    error,
    fetchMasterData,
    fetchPersyaratan,
    getSyaratMinimum,
    isPupukPaket,
    createPaket,
    updatePaket,
    deletePaket,
    togglePaketStatus,
    createDokumen,
    updateDokumen,
    deleteDokumen,
    toggleDokumenStatus,
  };
});


