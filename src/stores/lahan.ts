import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Lahan, LahanDocument, PekebunSimplifiedResponse } from '@/types/lahan';
import { Coords, JenisLegalitas, LahanFormData, Pekebun, LahanPekebun, StatusPernikahan } from '@/types/pekebun';
import { lahanService } from '@/services/lahan.service';
import { usePekebunStore } from '@/stores/pekebun';

function mapMarriageStatus(val: string | null | undefined): StatusPernikahan {
  if (!val) return StatusPernikahan.BELUM_MENIKAH;
  const upper = val.toUpperCase();
  if (upper === 'MENIKAH' || upper === 'MARRIED') return StatusPernikahan.MENIKAH;
  if (upper === 'CERAI_HIDUP') return StatusPernikahan.CERAI_HIDUP;
  if (upper === 'CERAI_MATI') return StatusPernikahan.CERAI_MATI;
  return StatusPernikahan.BELUM_MENIKAH;
}

function mapLahanDocument(apiDoc: any): LahanDocument {
  return {
    id: String(apiDoc.id),
    tipeDokumen: (apiDoc.document_type || apiDoc.tipeDokumen || '').toUpperCase(),
    fileName: apiDoc.file_name || apiDoc.fileName || '',
    fileUrl: apiDoc.file_url || apiDoc.fileUrl || '',
    mimeType: apiDoc.mime_type || apiDoc.mimeType || '',
    createdAt: apiDoc.created_at || apiDoc.createdAt || '',
  };
}

function parseCoordsFromApi(raw: any): Coords[] {
  if (!raw) return [];
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(arr)) return [];
  return arr.map((c: any) => ({
    lat: Number(c.lat ?? 0),
    lng: Number(c.lng ?? 0),
  }));
}

function mapLahanFromApi(apiData: any): Lahan {
  const documents = (apiData.documents || []).map(mapLahanDocument);
  const scanDoc = documents.find((d: LahanDocument) => d.tipeDokumen === 'SCAN_LEGALITAS' || d.tipeDokumen.includes('LEGALITAS'));
  const scanLegalitasUrl = scanDoc?.fileUrl || apiData.scan_legalitas_url || apiData.scanLegalitasUrl || '';

  return {
    id: String(apiData.id),
    pekebunId: String(apiData.pekebun_id || apiData.pekebunId || ''),
    jenisLegalitas: apiData.jenis_legalitas === 'SHM' || apiData.jenisLegalitas === JenisLegalitas.SHM ? JenisLegalitas.SHM : JenisLegalitas.NON_SHM,
    nomorLegalitas: apiData.nomor_legalitas || apiData.nomorLegalitas || '',
    tanggalPenerbitanLegalitas: apiData.tanggal_penerbitan_legalitas || apiData.tanggalPenerbitanLegalitas || '',
    luasLahan: Number(apiData.luas_lahan ?? apiData.luasLahan) || 0,
    provinsiKode: apiData.kode_provinsi || apiData.provinsiKode || '',
    kabupatenKode: apiData.kode_kabupaten || apiData.kabupatenKode || '',
    kecamatanKode: apiData.kode_kecamatan || apiData.kecamatanKode || '',
    desaKode: apiData.kode_desa || apiData.desaKode || '',
    provinsiNama: apiData.provinsi_nama || apiData.provinsiNama || '',
    kabupatenNama: apiData.kabupaten_nama || apiData.kabupatenNama || '',
    kecamatanNama: apiData.kecamatan_nama || apiData.kecamatanNama || '',
    desaNama: apiData.desa_nama || apiData.desaNama || '',
    alamatKebun: apiData.alamat_kebun || apiData.alamatKebun || '',
    tahunTanam: Number(apiData.tahun_tanam ?? apiData.tahunTanam) || 0,
    jenisBibit: apiData.jenis_bibit || apiData.jenisBibit || '',
    nomorSuratBedaNama: apiData.nomor_surat_beda_nama || apiData.nomorSuratBedaNama || undefined,
    coordinates: parseCoordsFromApi(apiData.coordinates),
    dokumen: documents,
    scanLegalitasUrl,
    isInProposal: Boolean(apiData.is_in_proposal ?? apiData.isInProposal ?? false),
    proposalStatus: apiData.proposal_status ?? apiData.proposalStatus ?? null,
    paketProposal: apiData.paket_proposal ?? apiData.paketProposal ?? null,
    createdAt: apiData.created_at || apiData.createdAt || '',
    updatedAt: apiData.updated_at || apiData.updatedAt,
  };
}

function buildLahanFormData(pekebunId: string, lahan: LahanFormData): FormData {
  const fd = new FormData();
  fd.append('pekebun_id', pekebunId);
  if (lahan.jenisLegalitas) fd.append('jenis_legalitas', lahan.jenisLegalitas === JenisLegalitas.SHM ? 'SHM' : 'Non SHM');
  if (lahan.nomorLegalitas) fd.append('nomor_legalitas', lahan.nomorLegalitas);
  if (lahan.tanggalPenerbitanLegalitas) fd.append('tanggal_penerbitan_legalitas', lahan.tanggalPenerbitanLegalitas);
  if (lahan.luasLahan !== '') fd.append('luas_lahan', String(lahan.luasLahan));
  if (lahan.provinsiKode) fd.append('kode_provinsi', lahan.provinsiKode);
  if (lahan.kabupatenKode) fd.append('kode_kabupaten', lahan.kabupatenKode);
  if (lahan.kecamatanKode) fd.append('kode_kecamatan', lahan.kecamatanKode);
  if (lahan.desaKode) fd.append('kode_desa', lahan.desaKode);
  if (lahan.alamatKebun) fd.append('alamat_kebun', lahan.alamatKebun);
  if (lahan.tahunTanam) fd.append('tahun_tanam', lahan.tahunTanam);
  if (lahan.jenisBibit) fd.append('jenis_bibit', lahan.jenisBibit);
  if (lahan.nomorSuratBedaNama) fd.append('nomor_surat_beda_nama', lahan.nomorSuratBedaNama);
  if (lahan.coordinates && lahan.coordinates.length > 0) fd.append('coordinates', JSON.stringify(lahan.coordinates.map((c) => ({ lat: c.lat, lng: c.lng }))));
  if (lahan.scanLegalitas instanceof File) fd.append('scan_legalitas', lahan.scanLegalitas);
  if (lahan.scanBedaNamaLahan instanceof File) fd.append('surat_keterangan_beda_nama', lahan.scanBedaNamaLahan);
  return fd;
}

function buildLahanUpdateFormData(lahan: LahanFormData): FormData {
  const fd = new FormData();
  if (lahan.jenisLegalitas) fd.append('jenis_legalitas', lahan.jenisLegalitas === JenisLegalitas.SHM ? 'SHM' : 'Non SHM');
  if (lahan.nomorLegalitas) fd.append('nomor_legalitas', lahan.nomorLegalitas);
  if (lahan.tanggalPenerbitanLegalitas) fd.append('tanggal_penerbitan_legalitas', lahan.tanggalPenerbitanLegalitas);
  if (lahan.luasLahan !== '') fd.append('luas_lahan', String(lahan.luasLahan));
  if (lahan.provinsiKode) fd.append('kode_provinsi', lahan.provinsiKode);
  if (lahan.kabupatenKode) fd.append('kode_kabupaten', lahan.kabupatenKode);
  if (lahan.kecamatanKode) fd.append('kode_kecamatan', lahan.kecamatanKode);
  if (lahan.desaKode) fd.append('kode_desa', lahan.desaKode);
  if (lahan.alamatKebun) fd.append('alamat_kebun', lahan.alamatKebun);
  if (lahan.tahunTanam) fd.append('tahun_tanam', lahan.tahunTanam);
  if (lahan.jenisBibit) fd.append('jenis_bibit', lahan.jenisBibit);
  if (lahan.nomorSuratBedaNama) fd.append('nomor_surat_beda_nama', lahan.nomorSuratBedaNama);
  if (lahan.coordinates && lahan.coordinates.length > 0) fd.append('coordinates', JSON.stringify(lahan.coordinates.map((c) => ({ lat: c.lat, lng: c.lng }))));
  if (lahan.scanLegalitas instanceof File) fd.append('scan_legalitas', lahan.scanLegalitas);
  if (lahan.scanBedaNamaLahan instanceof File) fd.append('surat_keterangan_beda_nama', lahan.scanBedaNamaLahan);
  return fd;
}

export const useLahanStore = defineStore('lahan', () => {
  const lahanList = ref<Lahan[]>([]);
  const isLoading = ref(false);

  async function fetchLahanByPekebunId(pekebunId: string) {
    isLoading.value = true;
    try {
      const result = await lahanService.getByPekebunId(pekebunId);
      if (result) {
        const data = Array.isArray(result) ? result : result.data || [];
        lahanList.value = data.map(mapLahanFromApi);
        return lahanList.value;
      }
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createLahan(pekebunId: string, formData: LahanFormData): Promise<Lahan | null> {
    isLoading.value = true;
    try {
      const fd = buildLahanFormData(pekebunId, formData);
      const result = await lahanService.create(fd);
      if (result) {
        const lahan = mapLahanFromApi(result);
        lahanList.value.push(lahan);
        return lahan;
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteLahan(id: string): Promise<boolean> {
    isLoading.value = true;
    try {
      const result = await lahanService.delete(id);
      if (result) {
        lahanList.value = lahanList.value.filter((l) => l.id !== id);
        return true;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateLahan(id: string, formData: LahanFormData): Promise<Lahan | null> {
    isLoading.value = true;
    try {
      const fd = buildLahanUpdateFormData(formData);
      const result = await lahanService.update(id, fd);
      if (result) {
        const updated = mapLahanFromApi(result);
        const idx = lahanList.value.findIndex((l) => l.id === id);
        if (idx !== -1) lahanList.value[idx] = updated;
        return updated;
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function synchronizeLahan(pekebunId: string, formDataList: LahanFormData[], existingIds: string[]): Promise<Lahan[]> {
    isLoading.value = true;
    try {
      const results: Lahan[] = [];
      const keptIds = new Set<string>();

      for (const lahan of formDataList) {
        const lahanId = (lahan as any)._id as string | undefined;
        if (lahanId && existingIds.includes(lahanId)) {
          keptIds.add(lahanId);
          const updated = await updateLahan(lahanId, lahan);
          if (updated) {
            results.push(updated);
          } else {
            results.push({ id: lahanId } as Lahan);
          }
        } else {
          const created = await createLahan(pekebunId, lahan);
          if (created) {
            (lahan as any)._id = created.id;
            results.push(created);
            keptIds.add(created.id);
          }
        }
      }

      for (const id of existingIds) {
        if (!keptIds.has(id)) {
          await deleteLahan(id);
        }
      }

      return results;
    } finally {
      isLoading.value = false;
    }
  }

  const pekebunLandsMap = ref<Record<string, Lahan[]>>({});
  const pekebunSimplifiedList = ref<PekebunSimplifiedResponse[]>([]);
  const pekebunList = ref<Pekebun[]>([]);

  async function getPekebunLandsByKelembagaanId(kelembagaanId: string | number): Promise<PekebunSimplifiedResponse[]> {
    isLoading.value = true;
    try {
      const result = await lahanService.getByKelembagaanId(kelembagaanId);
      if (result) {
        const data: PekebunSimplifiedResponse[] = Array.isArray(result) ? result : result.data || [];
        pekebunSimplifiedList.value = data;
        const map: Record<string, Lahan[]> = {};
        const mappedPekebunList: Pekebun[] = [];

        for (const p of data) {
          const mappedLands = (p.lahans || []).map(mapLahanFromApi);
          map[String(p.id)] = mappedLands;
          if (p.nik) {
            map[p.nik] = mappedLands;
          }

          const primaryLahan = mappedLands.length > 0 ? (mappedLands[0] as unknown as LahanPekebun) : ({} as LahanPekebun);
          mappedPekebunList.push({
            id: String(p.id),
            kelembagaanId: String(p.kelembagaan_id || ''),
            nik: p.nik || '',
            nama: p.name || '',
            nomorKK: p.nomor_kk || '',
            statusPernikahan: mapMarriageStatus(p.marriage_status),
            tempatLahir: p.place_of_birth || '',
            tanggalLahir: p.date_of_birth || '',
            alamat: p.address || '',
            kodepos: p.postcode || '',
            nomorHP: p.phone_number || '',
            dokumen: [],
            lahan: primaryLahan,
            daftarLahan: mappedLands as unknown as LahanPekebun[],
            isDraft: p.is_draft || false,
            createdAt: '',
            updatedAt: undefined,
          });
        }
        pekebunLandsMap.value = map;
        pekebunList.value = mappedPekebunList;

        const pekebunStore = usePekebunStore();
        pekebunStore.setListPekebun(mappedPekebunList);

        return data;
      }
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  function getPekebunLands(pekebun: any): Lahan[] {
    if (!pekebun) return [];
    if (pekebun.id && pekebunLandsMap.value[String(pekebun.id)] !== undefined) {
      return pekebunLandsMap.value[String(pekebun.id)];
    }
    if (pekebun.nik && pekebunLandsMap.value[pekebun.nik] !== undefined) {
      return pekebunLandsMap.value[pekebun.nik];
    }
    if (pekebun.lahans && Array.isArray(pekebun.lahans)) {
      return pekebun.lahans.map(mapLahanFromApi);
    }
    if (pekebun.daftarLahan && Array.isArray(pekebun.daftarLahan) && pekebun.daftarLahan.length > 0) {
      return pekebun.daftarLahan;
    }
    return pekebun.lahan ? [pekebun.lahan] : [];
  }

  return {
    lahanList,
    pekebunLandsMap,
    pekebunSimplifiedList,
    pekebunList,
    isLoading,
    fetchLahanByPekebunId,
    getPekebunLandsByKelembagaanId,
    getPekebunLands,
    createLahan,
    updateLahan,
    deleteLahan,
    synchronizeLahan,
  };
});
