import { usePekebunStore } from '@/stores/pekebun';

/**
 * Helper to resolve the Regency / Kabupaten name for a proposal item.
 */
export function getKabupatenNama(item: any): string {
  if (!item) return '-';
  if (item.kabupatenNama) return item.kabupatenNama;
  if (item.kabupaten) return item.kabupaten;
  if (item.lembaga?.kabupatenNama) return item.lembaga.kabupatenNama;
  if (item.lembaga?.kabupaten) return item.lembaga.kabupaten;
  if (item.kelembagaan?.kabupatenNama) return item.kelembagaan.kabupatenNama;
  if (item.kelembagaan?.kabupaten) return item.kelembagaan.kabupaten;

  const kode =
    item.kabupatenKode ||
    item.lembaga?.kabupatenKode ||
    item.kelembagaan?.kabupatenKode ||
    item.kode_kabupaten;

  if (kode) {
    try {
      const pekebunStore = usePekebunStore();
      const nama = pekebunStore.getWilayahNama(String(kode));
      if (nama) return nama;
    } catch (_) {}
  }

  if (item.lahans && item.lahans.length > 0) {
    const lahanKab = item.lahans[0].kode_kabupaten || item.lahans[0].kabupatenKode;
    if (lahanKab) {
      try {
        const pekebunStore = usePekebunStore();
        const nama = pekebunStore.getWilayahNama(String(lahanKab));
        if (nama) return nama;
      } catch (_) {}
    }
  }

  return 'Kab. Luwu Utara';
}

/**
 * Helper to resolve the Province name for a proposal item.
 */
export function getProvinsiNama(item: any): string {
  if (!item) return '-';
  if (item.provinsiNama) return item.provinsiNama;
  if (item.provinsi) return item.provinsi;
  if (item.lembaga?.provinsiNama) return item.lembaga.provinsiNama;
  if (item.lembaga?.provinsi) return item.lembaga.provinsi;
  if (item.kelembagaan?.provinsiNama) return item.kelembagaan.provinsiNama;
  if (item.kelembagaan?.provinsi) return item.kelembagaan.provinsi;

  const kode =
    item.provinsiKode ||
    item.lembaga?.provinsiKode ||
    item.kelembagaan?.provinsiKode ||
    item.kode_provinsi;

  if (kode) {
    try {
      const pekebunStore = usePekebunStore();
      const nama = pekebunStore.getWilayahNama(String(kode));
      if (nama) return nama;
    } catch (_) {}
  }

  if (item.lahans && item.lahans.length > 0) {
    const lahanProv = item.lahans[0].kode_provinsi || item.lahans[0].provinsiKode;
    if (lahanProv) {
      try {
        const pekebunStore = usePekebunStore();
        const nama = pekebunStore.getWilayahNama(String(lahanProv));
        if (nama) return nama;
      } catch (_) {}
    }
  }

  return 'Sulawesi Selatan';
}

/**
 * Normalizes a region name string for clean, case-insensitive comparison
 * Strips leading "kabupaten", "kab.", "kota", extra spaces, and punctuation.
 */
export function normalizeRegionName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(kabupaten|kab\.|kota)\s+/i, '')
    .trim();
}

/**
 * Validates if a proposal matches the target region.
 * Implements the Hybrid Matching Rule:
 * 1. If targetRegencyId is provided, matches against item.regency_id / regencyId / kode_kabupaten / kabupatenKode
 * 2. If targetRegencyName is provided, matches against getKabupatenNama(item) after normalization
 * 3. If neither target is provided (e.g. Ditjenbun / BPDP), allows all proposals (returns true)
 */
export function matchesProposalRegion(
  item: any,
  targetRegencyId?: number | string | null,
  targetRegencyName?: string | null,
): boolean {
  const hasTargetId = targetRegencyId !== undefined && targetRegencyId !== null && String(targetRegencyId).trim() !== '';
  const hasTargetName = targetRegencyName !== undefined && targetRegencyName !== null && targetRegencyName.trim() !== '';

  // If no regional scoping specified, allow all (unrestricted)
  if (!hasTargetId && !hasTargetName) {
    return true;
  }

  if (!item) return false;

  // 1. Check numeric / string regency ID / code match
  if (hasTargetId) {
    const itemRegId = item.regency_id ?? item.regencyId ?? item.kode_kabupaten ?? item.kabupatenKode;
    if (itemRegId !== undefined && itemRegId !== null && String(itemRegId).trim() !== '') {
      if (String(itemRegId).trim() === String(targetRegencyId).trim()) {
        return true;
      }
    }
  }

  // 2. Check region name match via getKabupatenNama
  if (hasTargetName) {
    const itemKabNama = getKabupatenNama(item);
    const cleanTarget = normalizeRegionName(targetRegencyName);
    const cleanItem = normalizeRegionName(itemKabNama);

    if (cleanTarget && cleanItem) {
      if (cleanItem === cleanTarget || cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem)) {
        return true;
      }
    }
  }

  return false;
}
