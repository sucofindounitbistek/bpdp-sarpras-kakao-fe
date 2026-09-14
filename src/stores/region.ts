import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Province, Regency } from '@/types/region';
import { regionService } from '@/services/region.service';

export const useRegionStore = defineStore('region', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const provinces = ref<Province[]>([]);
  const regenciesByProvince = ref<Record<string, Regency[]>>({});
  const isLoadingProvinces = ref(false);
  const loadingRegencies = ref<Record<string, boolean>>({});
  const error = ref<string | null>(null);

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Load provinces from API with in-memory caching
   */
  async function loadProvinces(force = false): Promise<Province[]> {
    if (!force && provinces.value.length > 0) {
      return provinces.value;
    }

    isLoadingProvinces.value = true;
    error.value = null;

    try {
      const data = await regionService.fetchProvinces();
      provinces.value = data;
      return data;
    } catch (err: any) {
      const msg = err?.message || 'Gagal memuat daftar provinsi dari IAM';
      error.value = msg;
      throw err;
    } finally {
      isLoadingProvinces.value = false;
    }
  }

  /**
   * Load regencies for a province from API with in-memory caching
   */
  async function loadRegencies(provinceId: number | string, force = false): Promise<Regency[]> {
    const key = String(provinceId).trim();
    if (!key) return [];

    if (!force && regenciesByProvince.value[key]) {
      return regenciesByProvince.value[key];
    }

    loadingRegencies.value[key] = true;
    error.value = null;

    try {
      const data = await regionService.fetchRegenciesByProvinceId(key);
      regenciesByProvince.value[key] = data;
      return data;
    } catch (err: any) {
      const msg = err?.message || `Gagal memuat daftar kabupaten/kota untuk provinsi ID ${key}`;
      error.value = msg;
      throw err;
    } finally {
      loadingRegencies.value[key] = false;
    }
  }

  /**
   * Resolve Province name by ID
   */
  function getProvinceName(id: number | string): string {
    const key = String(id).trim();
    const match = provinces.value.find((p) => String(p.id) === key);
    return match ? match.name : '';
  }

  /**
   * Resolve Regency name by ID
   */
  function getRegencyName(id: number | string): string {
    const key = String(id).trim();
    for (const list of Object.values(regenciesByProvince.value)) {
      const match = list.find((r) => String(r.id) === key);
      if (match) return match.name;
    }
    return '';
  }

  /**
   * Unified lookup for province or regency name, falling back to input code
   */
  function getWilayahNama(code: string | number): string {
    if (!code) return '';
    const key = String(code).trim();
    const regName = getRegencyName(key);
    if (regName) return regName;
    const provName = getProvinceName(key);
    if (provName) return provName;
    return key;
  }

  return {
    provinces,
    regenciesByProvince,
    isLoadingProvinces,
    loadingRegencies,
    error,
    loadProvinces,
    loadRegencies,
    getProvinceName,
    getRegencyName,
    getWilayahNama,
  };
});

export default useRegionStore;
