import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Pekebun, WilayahItem, WilayahLevel, JenisKelamin, StatusPernikahan, TipeDokumenPekebun, DokumenPekebun, LahanPekebun, IdentitasFormData, DokumenFormData, LahanFormData } from '@/types/pekebun';
import { pekebunService } from '@/services/pekebun.service';
import { sikpService } from '@/services/sikp.service';
import { useLahanStore } from '@/stores/lahan';
import { useAuthStore } from '@/stores/auth';
import { useRegionStore } from '@/stores/region';
import { Lahan } from '@/types/lahan';

// ─── Mock Wilayah Data ────────────────────────────────────────────────────────
const MOCK_WILAYAH: WilayahItem[] = [
  { kode: '73', nama: 'Sulawesi Selatan', parentKode: null, level: WilayahLevel.PROVINSI },
  { kode: '74', nama: 'Sulawesi Tenggara', parentKode: null, level: WilayahLevel.PROVINSI },
  { kode: '76', nama: 'Sulawesi Barat', parentKode: null, level: WilayahLevel.PROVINSI },
  { kode: '7322', nama: 'Kab. Luwu Utara', parentKode: '73', level: WilayahLevel.KABUPATEN },
  { kode: '7325', nama: 'Kab. Luwu Timur', parentKode: '73', level: WilayahLevel.KABUPATEN },
  { kode: '7401', nama: 'Kab. Kolaka', parentKode: '74', level: WilayahLevel.KABUPATEN },
  { kode: '7402', nama: 'Kab. Konawe', parentKode: '74', level: WilayahLevel.KABUPATEN },
  { kode: '7601', nama: 'Kab. Mamuju', parentKode: '76', level: WilayahLevel.KABUPATEN },
  { kode: '732201', nama: 'Kec. Masamba', parentKode: '7322', level: WilayahLevel.KECAMATAN },
  { kode: '732202', nama: 'Kec. Sabbang', parentKode: '7322', level: WilayahLevel.KECAMATAN },
  { kode: '732501', nama: 'Kec. Malili', parentKode: '7325', level: WilayahLevel.KECAMATAN },
  { kode: '740101', nama: 'Kec. Kolaka', parentKode: '7401', level: WilayahLevel.KECAMATAN },
  { kode: '740201', nama: 'Kec. Unaaha', parentKode: '7402', level: WilayahLevel.KECAMATAN },
  { kode: '760101', nama: 'Kec. Mamuju', parentKode: '7601', level: WilayahLevel.KECAMATAN },
  { kode: '73220101', nama: 'Desa Bone', parentKode: '732201', level: WilayahLevel.DESA },
  { kode: '73220102', nama: 'Desa Masamba', parentKode: '732201', level: WilayahLevel.DESA },
  { kode: '73220201', nama: 'Desa Sabbang', parentKode: '732202', level: WilayahLevel.DESA },
  { kode: '73250101', nama: 'Desa Malili', parentKode: '732501', level: WilayahLevel.DESA },
  { kode: '74010101', nama: 'Desa Laloeha', parentKode: '740101', level: WilayahLevel.DESA },
  { kode: '74020101', nama: 'Desa Unaaha', parentKode: '740201', level: WilayahLevel.DESA },
  { kode: '76010101', nama: 'Desa Binanga', parentKode: '760101', level: WilayahLevel.DESA },
];

// ─── API Response Mappers ─────────────────────────────────────────────────────

function mapMarriageStatus(val: string | null): StatusPernikahan {
  if (!val) return StatusPernikahan.BELUM_MENIKAH;
  const upper = val.toUpperCase();
  if (upper === 'MENIKAH' || upper === 'MARRIED') return StatusPernikahan.MENIKAH;
  if (upper === 'CERAI_HIDUP') return StatusPernikahan.CERAI_HIDUP;
  if (upper === 'CERAI_MATI') return StatusPernikahan.CERAI_MATI;
  return StatusPernikahan.BELUM_MENIKAH;
}

function mapDocumentType(val: string): TipeDokumenPekebun {
  const upper = val.toUpperCase();
  if (upper === 'SCAN_KTP') return TipeDokumenPekebun.SCAN_KTP;
  if (upper === 'SCAN_KK') return TipeDokumenPekebun.SCAN_KK;
  if (upper === 'SWAFOTO') return TipeDokumenPekebun.SWAFOTO;
  if (upper === 'SURAT_KUASA') return TipeDokumenPekebun.SURAT_KUASA;
  return TipeDokumenPekebun.SCAN_KTP;
}

function mapDocument(apiDoc: any): DokumenPekebun {
  return {
    id: String(apiDoc.id),
    documentType: mapDocumentType(apiDoc.document_type),
    fileName: apiDoc.file_name || '',
    fileUrl: apiDoc.file_url || '',
    fileSize: Number(apiDoc.file_size) || 0,
    fileExtension: apiDoc.file_extension || apiDoc.mime_type || '',
  };
}

function mapPekebunFromApi(apiData: any): Pekebun {
  return {
    id: String(apiData.id),
    kelembagaanId: apiData.kelembagaan_id || '',
    nik: apiData.nik || '',
    nama: apiData.name || '',
    nomorKK: apiData.nomor_kk || '',
    statusPernikahan: mapMarriageStatus(apiData.marriage_status),
    tempatLahir: apiData.place_of_birth || '',
    tanggalLahir: apiData.date_of_birth || '',
    alamat: apiData.address || '',
    kodepos: apiData.postcode || '',
    nomorHP: apiData.phone_number || '',
    dokumen: (apiData.documents || []).map(mapDocument),
    lahan: {} as LahanPekebun,
    isDraft: apiData.is_draft || false,
    isInProposal: Boolean(apiData.is_in_proposal),
    totalLuasLahan: apiData.total_luas_lahan !== undefined ? Number(apiData.total_luas_lahan) : 0,
    createdAt: apiData.created_at || '',
    updatedAt: apiData.updated_at,
  };
}

export const usePekebunStore = defineStore('pekebun', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const listPekebun = ref<Pekebun[]>([]);
  const isLoading = ref(false);
  const pagination = ref({ page: 1, limit: 10, total: 0 });

  // ─── API-backed Actions ─────────────────────────────────────────────────────

  async function fetchPekebunList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    kelembagaan_id?: string | number;
    is_draft?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    isLoading.value = true;
    try {
      const authStore = useAuthStore();
      const authKelembagaanId =
        (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ??
        (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined);

      const effectiveKelembagaanId = params?.kelembagaan_id ?? authKelembagaanId;

      const queryParams: any = {
        sort_by: 'updated_at',
        sort_order: 'desc' as const,
        ...params,
      };
      if (effectiveKelembagaanId !== undefined && effectiveKelembagaanId !== null && effectiveKelembagaanId !== '') {
        queryParams.kelembagaan_id = String(effectiveKelembagaanId);
      }
      const result = await pekebunService.getList(queryParams);
      if (result) {
        const data = Array.isArray(result) ? result : result.data || [];
        listPekebun.value = data.map(mapPekebunFromApi);
        if (result.meta) {
          pagination.value = { page: result.meta.page, limit: result.meta.limit, total: result.meta.total };
        } else {
          pagination.value = { page: queryParams.page || 1, limit: queryParams.limit || 10, total: listPekebun.value.length };
        }
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPekebunById(id: string): Promise<Pekebun | null> {
    isLoading.value = true;
    try {
      const result = await pekebunService.getById(id);
      if (result) {
        return mapPekebunFromApi(result);
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deletePekebun(id: string): Promise<boolean> {
    isLoading.value = true;
    try {
      const result = await pekebunService.delete(id);
      if (result) {
        listPekebun.value = listPekebun.value.filter((p) => p.id !== id);
        return true;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function createPekebunWithLahan(
    identitas: IdentitasFormData,
    dokumenFiles: DokumenFormData,
    lahanList: LahanFormData[],
    isDraft: boolean = false,
    kelembagaanIdParam?: string | number,
  ): Promise<Pekebun | null> {
    isLoading.value = true;
    let pekebun: Pekebun | null = null;
    try {
      const fd = new FormData();
      fd.append('nik', identitas.nik);
      if (identitas.nama) fd.append('name', identitas.nama);
      if (identitas.nomorKK) fd.append('nomor_kk', identitas.nomorKK);
      if (identitas.statusPernikahan) fd.append('marriage_status', identitas.statusPernikahan.toLowerCase());
      if (identitas.tempatLahir) fd.append('place_of_birth', identitas.tempatLahir);
      if (identitas.tanggalLahir) fd.append('date_of_birth', identitas.tanggalLahir);
      fd.append('address', identitas.alamat);
      fd.append('postcode', identitas.kodepos);
      fd.append('phone_number', identitas.nomorHP);

      const authStore = useAuthStore();
      const effectiveKelembagaanId =
        kelembagaanIdParam ??
        identitas.kelembagaanId ??
        authStore.user?.kelembagaan_id ??
        authStore.user?.kelembagaanId;

      if (effectiveKelembagaanId) {
        fd.append('kelembagaan_id', String(effectiveKelembagaanId));
      }
      fd.append('is_draft', String(isDraft));

      if (dokumenFiles.scanKTP instanceof File) fd.append('scan_ktp', dokumenFiles.scanKTP);
      if (dokumenFiles.scanKK instanceof File) fd.append('scan_kk', dokumenFiles.scanKK);
      if (dokumenFiles.swafoto instanceof File) fd.append('swafoto', dokumenFiles.swafoto);
      if (dokumenFiles.suratKuasa instanceof File) fd.append('surat_kuasa', dokumenFiles.suratKuasa);

      const result = await pekebunService.create(fd);
      if (!result) return null;

      pekebun = mapPekebunFromApi(result);
      const existingIdx = listPekebun.value.findIndex((p) => p.id === pekebun!.id || p.nik === pekebun!.nik);
      if (existingIdx !== -1) {
        listPekebun.value[existingIdx] = pekebun;
      } else {
        listPekebun.value.unshift(pekebun);
      }

      const lahanStore = useLahanStore();
      for (let i = 0; i < lahanList.length; i++) {
        const created = await lahanStore.createLahan(pekebun.id, lahanList[i]);
        if (created) {
          (lahanList[i] as any)._id = created.id;
        }
      }

      return pekebun;
    } catch (err: any) {
      if (pekebun) {
        err.createdPekebun = pekebun;
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function saveDraftPekebun(
    identitas: IdentitasFormData,
    dokumenFiles: DokumenFormData,
    lahanList: LahanFormData[],
    kelembagaanIdParam?: string | number,
  ): Promise<Pekebun | null> {
    return createPekebunWithLahan(identitas, dokumenFiles, lahanList, true, kelembagaanIdParam);
  }

  async function resumeDraft(id: string): Promise<{ pekebun: Pekebun; lahanList: Lahan[] } | null> {
    isLoading.value = true;
    try {
      const pekebun = await fetchPekebunById(id);
      if (!pekebun) return null;

      const lahanStore = useLahanStore();
      const lahanList = await lahanStore.fetchLahanByPekebunId(id);

      return { pekebun, lahanList };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPekebunDetail(id: string): Promise<Pekebun | null> {
    isLoading.value = true;
    try {
      const pekebun = await fetchPekebunById(id);
      if (!pekebun) return null;

      const lahanStore = useLahanStore();
      const lahanList = await lahanStore.fetchLahanByPekebunId(id);
      if (lahanList.length > 0) {
        pekebun.lahan = lahanList[0] as unknown as LahanPekebun;
        pekebun.daftarLahan = lahanList as unknown as LahanPekebun[];
        if (lahanList.some((l: any) => l.isInProposal)) {
          pekebun.isInProposal = true;
        }
      }

      return pekebun;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePekebunWithLahan(
    id: string,
    identitas: IdentitasFormData,
    dokumenFiles: DokumenFormData,
    lahanList: LahanFormData[],
    existingLahanIds: string[],
    isDraft: boolean = false,
    kelembagaanIdParam?: string | number,
  ): Promise<Pekebun | null> {
    isLoading.value = true;
    try {
      const fd = new FormData();
      if (identitas.nik) fd.append('nik', identitas.nik);
      if (identitas.nama) fd.append('name', identitas.nama);
      if (identitas.nomorKK) fd.append('nomor_kk', identitas.nomorKK);
      if (identitas.statusPernikahan) fd.append('marriage_status', identitas.statusPernikahan.toLowerCase());
      if (identitas.tempatLahir) fd.append('place_of_birth', identitas.tempatLahir);
      if (identitas.tanggalLahir) fd.append('date_of_birth', identitas.tanggalLahir);
      if (identitas.alamat) fd.append('address', identitas.alamat);
      if (identitas.kodepos) fd.append('postcode', identitas.kodepos);
      if (identitas.nomorHP) fd.append('phone_number', identitas.nomorHP);

      const authStore = useAuthStore();
      const effectiveKelembagaanId =
        kelembagaanIdParam ??
        identitas.kelembagaanId ??
        authStore.user?.kelembagaan_id ??
        authStore.user?.kelembagaanId;

      if (effectiveKelembagaanId) {
        fd.append('kelembagaan_id', String(effectiveKelembagaanId));
      }
      fd.append('is_draft', String(isDraft));

      if (dokumenFiles.scanKTP instanceof File) fd.append('scan_ktp', dokumenFiles.scanKTP);
      if (dokumenFiles.scanKK instanceof File) fd.append('scan_kk', dokumenFiles.scanKK);
      if (dokumenFiles.swafoto instanceof File) fd.append('swafoto', dokumenFiles.swafoto);
      if (dokumenFiles.suratKuasa instanceof File) fd.append('surat_kuasa', dokumenFiles.suratKuasa);

      const result = await pekebunService.update(id, fd);
      if (!result) return null;

      const pekebun = mapPekebunFromApi(result);
      const idx = listPekebun.value.findIndex((p) => p.id === id);
      if (idx !== -1) listPekebun.value[idx] = pekebun;

      const lahanStore = useLahanStore();
      await lahanStore.synchronizeLahan(id, lahanList, existingLahanIds);

      return pekebun;
    } finally {
      isLoading.value = false;
    }
  }

  function isNikRegistered(nik: string, excludeId?: string | number | null): boolean {
    return listPekebun.value.some((p) => p.nik === nik && !p.isDraft && (!excludeId || String(p.id) !== String(excludeId)));
  }

  function findDraftByNik(nik: string): Pekebun | undefined {
    return listPekebun.value.find((p) => p.nik === nik && p.isDraft);
  }

  // Validates Pekebun identity data against SIKP/Dukcapil via the backend
  // endpoint POST /sikp/validate-nik. Used as the gate before proceeding from
  // the identitas step of the registration wizard. Email and no_hp sent to
  // SIKP are taken from the authenticated user (auth store/localStorage),
  // not from the form fields (which serve different purposes).
  async function validateNikSikp(identitas: IdentitasFormData): Promise<{ valid: boolean; message: string }> {
    try {
      const authStore = useAuthStore();
      const sikpResult: any = await sikpService.validateNik({
        nik: identitas.nik,
        kk: identitas.nomorKK,
        nama: identitas.nama,
        tgl_lahir: identitas.tanggalLahir,
        jns_kelamin: identitas.jenisKelamin === JenisKelamin.PEREMPUAN ? '2' : '1',
        email: authStore.user?.email || '',
        no_hp: authStore.user?.phone_number || '',
      });

      // SIKP passthrough shape: { status: 1, data: { success, code, ... } }
      const inner = (sikpResult && typeof sikpResult === 'object' && sikpResult.data && typeof sikpResult.data === 'object' ? sikpResult.data : sikpResult) || {};
      const isValid = inner.success === true || inner.code === '00';

      if (isValid) {
        return { valid: true, message: 'Data identitas terverifikasi melalui SIKP/Dukcapil.' };
      }

      const message = inner.message || inner.desc || inner.response || inner.error || 'Data identitas pekebun tidak sesuai dengan data Dukcapil.';
      return { valid: false, message };
    } catch (err: any) {
      return {
        valid: false,
        message: err?.message || 'Gagal menghubungi server validasi SIKP/Dukcapil.',
      };
    }
  }

  function getWilayahByParent(parentKode: string | null, level: WilayahLevel): WilayahItem[] {
    const regionStore = useRegionStore();
    if (level === WilayahLevel.PROVINSI) {
      if (regionStore.provinces.length > 0) {
        return regionStore.provinces.map((p) => ({
          kode: String(p.id),
          nama: p.name,
          parentKode: null,
          level: WilayahLevel.PROVINSI,
        }));
      }
      return MOCK_WILAYAH.filter((w) => w.level === WilayahLevel.PROVINSI);
    }
    if (level === WilayahLevel.KABUPATEN && parentKode) {
      const regencies = regionStore.regenciesByProvince[String(parentKode)];
      if (regencies && regencies.length > 0) {
        return regencies.map((r) => ({
          kode: String(r.id),
          nama: r.name,
          parentKode: String(parentKode),
          level: WilayahLevel.KABUPATEN,
        }));
      }
    }
    return MOCK_WILAYAH.filter((w) => w.level === level && w.parentKode === parentKode);
  }

  function getWilayahNama(kode: string): string {
    if (!kode) return '';
    const regionStore = useRegionStore();
    const storeName = regionStore.getWilayahNama(kode);
    if (storeName && storeName !== kode) {
      return storeName;
    }
    const mockMatch = MOCK_WILAYAH.find((w) => w.kode === kode)?.nama;
    if (mockMatch) return mockMatch;
    return storeName || kode;
  }

  function setListPekebun(list: Pekebun[]) {
    listPekebun.value = list;
  }

  return {
    listPekebun,
    isLoading,
    pagination,
    setListPekebun,
    fetchPekebunList,
    fetchPekebunById,
    deletePekebun,
    createPekebunWithLahan,
    saveDraftPekebun,
    resumeDraft,
    updatePekebunWithLahan,
    fetchPekebunDetail,
    isNikRegistered,
    findDraftByNik,
    validateNikSikp,
    getWilayahByParent,
    getWilayahNama,
  };
});
