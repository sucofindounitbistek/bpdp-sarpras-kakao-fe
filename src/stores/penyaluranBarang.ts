import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PermohonanPenyaluranBarang,
  StatusPermohonanBarang,
  DokumenKontrakA,
  SuratTugasSurveyor,
} from '@/types/penyaluranBarang';
import { penyaluranBarangService } from '@/services/penyaluranBarang.service';

const INITIAL_DEMO_DATA: PermohonanPenyaluranBarang[] = [
  {
    id: 'PB-2026-000',
    proposalId: 'PROP-2026-999',
    nomorPermohonan: 'SRPR-KLPA/EKS/2026/099',
    namaLembagaPekebun: 'Koperasi Tani Kelapa Berkah Bersama',
    namaKetua: 'Drs. H. Mulyadi',
    kontak: '0812-7788-9900',
    desa: 'Mekar Jaya',
    kecamatan: 'Betara',
    kabupaten: 'Tanjung Jabung Barat',
    provinsi: 'Jambi',
    kategoriPaket: 'Ekstensifikasi',
    tanggalPengajuan: '',
    status: 'DRAFT',
    itemsRAB: [
      {
        id: 'item-draft-1',
        jenisBarang: 'Benih',
        namaBarang: 'Benih Kelapa',
        varietas: 'Kelapa Genjah Kopyor',
        namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kopyor)',
        jumlahTahap1: 800,
        jumlahTahap2: 800,
        jumlah: 1600,
        satuan: 'Batang',
        estimasiHargaSatuan: 85000,
        estimasiTotal: 136000000,
      },
      {
        id: 'item-draft-2',
        jenisBarang: 'Pupuk',
        namaBarang: 'Pupuk Majemuk NPK',
        varietas: 'NPK 15-15-15',
        namaBarangVarietas: 'Pupuk Majemuk NPK (NPK 15-15-15)',
        jumlahTahap1: 1500,
        jumlahTahap2: 1500,
        jumlah: 3000,
        satuan: 'Kg',
        estimasiHargaSatuan: 22000,
        estimasiTotal: 66000000,
      },
    ],
    suratPermohonanNamaFile: 'Proposal_Kelapa_Berkah_Bersama.pdf',
    createdAt: '2026-08-27T08:00:00Z',
    updatedAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 'PB-2026-001',
    nomorPermohonan: 'SRPR-KLPA/EKS/2026/001',
    namaLembagaPekebun: 'Koperasi Produsen Kelapa Makmur Jaya',
    namaKetua: 'H. Sudirman Santoso',
    kontak: '0812-9876-5432',
    desa: 'Karya Maju',
    kecamatan: 'Kelapa Dua',
    kabupaten: 'Tanjung Jabung Barat',
    provinsi: 'Jambi',
    kategoriPaket: 'Ekstensifikasi',
    tanggalPengajuan: '2026-08-20',
    status: 'MENUNGGU_VERIFIKASI_TEKNIS',
    itemsRAB: [
      {
        id: 'item-1',
        jenisBarang: 'Benih',
        namaBarang: 'Benih Kelapa',
        varietas: 'Kelapa Genjah Kuning',
        namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kuning)',
        jumlahTahap1: 600,
        jumlahTahap2: 600,
        jumlah: 1200,
        satuan: 'Batang',
        estimasiHargaSatuan: 85000,
        estimasiTotal: 102000000,
      },
      {
        id: 'item-2',
        jenisBarang: 'Pupuk',
        namaBarang: 'Pupuk Organik / Kompos',
        varietas: 'Kompos Hayati Terfermentasi',
        namaBarangVarietas: 'Pupuk Organik (Kompos Hayati)',
        jumlahTahap1: 1200,
        jumlahTahap2: 1200,
        jumlah: 2400,
        satuan: 'Kg',
        estimasiHargaSatuan: 15000,
        estimasiTotal: 36000000,
      },
      {
        id: 'item-3',
        jenisBarang: 'Pupuk',
        namaBarang: 'Pupuk Majemuk NPK',
        varietas: 'NPK Phonska Plus Granul',
        namaBarangVarietas: 'Pupuk NPK (Phonska Plus)',
        jumlahTahap1: 900,
        jumlahTahap2: 900,
        jumlah: 1800,
        satuan: 'Kg',
        estimasiHargaSatuan: 22000,
        estimasiTotal: 39600000,
      },
    ],
    suratPermohonanUrl: 'mock-surat-permohonan-001.pdf',
    suratPermohonanNamaFile: 'Surat_Permohonan_Kelapa_Makmur_Jaya.pdf',
    createdAt: '2026-08-20T09:30:00Z',
    updatedAt: '2026-08-20T09:30:00Z',
  },
  {
    id: 'PB-2026-002',
    nomorPermohonan: 'SRPR-KLPA/INT/2026/002',
    namaLembagaPekebun: 'Gapoktan Harapan Sejahtera',
    namaKetua: 'Drs. Supardianto',
    kontak: '0813-8877-6655',
    desa: 'Sungai Bahar',
    kecamatan: 'Bahar Utara',
    kabupaten: 'Muaro Jambi',
    provinsi: 'Jambi',
    kategoriPaket: 'Intensifikasi',
    tanggalPengajuan: '2026-08-22',
    status: 'DISPOSISI_PPK',
    itemsRAB: [
      {
        id: 'item-201',
        jenisBarang: 'Pupuk',
        namaBarang: 'Pupuk Majemuk NPK',
        varietas: 'NPK 12-12-17-2',
        namaBarangVarietas: 'Pupuk Majemuk NPK (12-12-17-2)',
        jumlah: 3500,
        satuan: 'Kg',
        estimasiHargaSatuan: 24000,
        estimasiTotal: 84000000,
      },
      {
        id: 'item-202',
        jenisBarang: 'Pestisida',
        namaBarang: 'Herbisida',
        varietas: 'Glifosat 480 SL',
        namaBarangVarietas: 'Herbisida Sistemik (Glifosat 480 SL)',
        jumlah: 250,
        satuan: 'Liter',
        estimasiHargaSatuan: 95000,
        estimasiTotal: 23750000,
      },
    ],
    suratPermohonanUrl: 'mock-surat-002.pdf',
    suratPermohonanNamaFile: 'Surat_Gapoktan_Harapan_Sejahtera.pdf',
    createdAt: '2026-08-22T11:00:00Z',
    updatedAt: '2026-08-23T14:15:00Z',
  },
  {
    id: 'PB-2026-003',
    nomorPermohonan: 'SRPR-KLPA/EKS/2026/003',
    namaLembagaPekebun: 'Koperasi Agro Mandiri Bersatu',
    namaKetua: 'Bambang Irawan',
    kontak: '0852-1122-3344',
    desa: 'Teluk Pandan',
    kecamatan: 'Tanjung Jabung',
    kabupaten: 'Tanjung Jabung Timur',
    provinsi: 'Jambi',
    kategoriPaket: 'Ekstensifikasi',
    tanggalPengajuan: '2026-08-15',
    status: 'PROSES_PEMILIHAN_PENYEDIA',
    jalurPengadaan: 'ULP_TENDER',
    itemsRAB: [
      {
        id: 'item-301',
        jenisBarang: 'Benih',
        namaBarang: 'Bibit Kelapa Siap Tanam',
        varietas: 'Kelapa Dalam Sri Gemilang',
        namaBarangVarietas: 'Bibit Kelapa (Sri Gemilang)',
        jumlah: 2500,
        satuan: 'Batang',
        estimasiHargaSatuan: 90000,
        estimasiTotal: 225000000,
      },
    ],
    suratPermohonanUrl: 'mock-surat-003.pdf',
    suratPermohonanNamaFile: 'Surat_Agro_Mandiri_Bersatu.pdf',
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-08-24T10:00:00Z',
  },
  {
    id: 'PB-2026-004',
    nomorPermohonan: 'SRPR-KLPA/EKS/2026/004',
    namaLembagaPekebun: 'KT Sumber Rejeki Tani',
    namaKetua: 'Ahmad Faisal',
    kontak: '0821-3344-5566',
    desa: 'Mekar Sari',
    kecamatan: 'Kumpeh',
    kabupaten: 'Muaro Jambi',
    provinsi: 'Jambi',
    kategoriPaket: 'Ekstensifikasi',
    tanggalPengajuan: '2026-08-10',
    status: 'PENETAPAN_PEMENANG',
    jalurPengadaan: 'ULP_TENDER',
    pemenangVendor: 'PT Agro Sarana Nusantara',
    nilaiPemenangTender: 218500000,
    tanggalPenetapanPemenang: '2026-08-25',
    itemsRAB: [
      {
        id: 'item-401',
        jenisBarang: 'Benih',
        namaBarang: 'Benih Kelapa',
        varietas: 'Kelapa Hibrida KHINA-1',
        namaBarangVarietas: 'Benih Kelapa (KHINA-1)',
        jumlah: 2000,
        satuan: 'Batang',
        estimasiHargaSatuan: 110000,
        estimasiTotal: 220000000,
      },
    ],
    suratPermohonanUrl: 'mock-surat-004.pdf',
    suratPermohonanNamaFile: 'Surat_KT_Sumber_Rejeki.pdf',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-25T16:30:00Z',
  },
];

export const usePenyaluranBarangStore = defineStore(
  'penyaluranBarang',
  () => {
    const permohonanList = ref<PermohonanPenyaluranBarang[]>([...INITIAL_DEMO_DATA]);
    const activePermohonanId = ref<string | null>(null);
    const isLoading = ref<boolean>(false);

    const activePermohonan = computed(() => {
      if (!activePermohonanId.value) return null;
      return permohonanList.value.find((p) => p.id === activePermohonanId.value) || null;
    });

    const permohonanPekebun = computed(() => permohonanList.value);

    const permohonanVerifikator = computed(() =>
      permohonanList.value.filter((p) =>
        ['MENUNGGU_VERIFIKASI_TEKNIS', 'PERLU_REVISI', 'PENETAPAN_PEMENANG', 'PROSES_PELAKSANAAN_KONTRAK', 'SURVEYOR_DITUGASKAN', 'SELESAI'].includes(p.status)
      )
    );

    const permohonanPpk = computed(() =>
      permohonanList.value.filter((p) =>
        ['DISPOSISI_PPK', 'DISPOSISI_ULP', 'PROSES_PEMILIHAN_PENYEDIA', 'PENETAPAN_PEMENANG'].includes(p.status)
      )
    );

    const permohonanUlp = computed(() =>
      permohonanList.value.filter((p) =>
        ['DISPOSISI_ULP', 'PROSES_PEMILIHAN_PENYEDIA', 'PENETAPAN_PEMENANG'].includes(p.status)
      )
    );

    function setActivePermohonan(id: string | null) {
      activePermohonanId.value = id;
    }

    async function fetchPermohonanList(params?: any) {
      isLoading.value = true;
      try {
        const res = await penyaluranBarangService.getList(params);
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const apiIds = new Set(res.data.map((p) => p.id));
          const nonConflicting = permohonanList.value.filter((p) => !apiIds.has(p.id));
          permohonanList.value = [...res.data, ...nonConflicting];
        }
      } catch (e) {
        console.warn('Gagal memuat penyaluran barang dari API, menggunakan data lokal:', e);
      } finally {
        isLoading.value = false;
      }
    }

    async function fetchPermohonanDetail(id: string) {
      try {
        const item = await penyaluranBarangService.getById(id);
        if (item && item.id) {
          const idx = permohonanList.value.findIndex((p) => p.id === item.id);
          if (idx !== -1) {
            permohonanList.value[idx] = item;
          } else {
            permohonanList.value.unshift(item);
          }
          return item;
        }
      } catch (e) {
        console.warn('Gagal memuat detail penyaluran barang dari API:', e);
      }
      return permohonanList.value.find((p) => p.id === id) || null;
    }

    async function createPermohonan(
      data: Omit<PermohonanPenyaluranBarang, 'id' | 'nomorPermohonan' | 'status' | 'createdAt' | 'updatedAt'> & {
        status?: StatusPermohonanBarang;
      }
    ): Promise<PermohonanPenyaluranBarang> {
      try {
        const pIdNum = Number(data.proposalId);
        if (pIdNum && !Number.isNaN(pIdNum)) {
          const res = await penyaluranBarangService.create({
            proposal_id: pIdNum,
            kategori_paket: data.kategoriPaket,
            items: (data.itemsRAB || []).map((it) => ({
              jenis_barang: it.jenisBarang,
              nama_barang: it.namaBarang,
              varietas: it.varietas,
              nama_barang_varietas: it.namaBarangVarietas,
              jumlah_tahap_1: it.jumlahTahap1 ?? null,
              jumlah_tahap_2: it.jumlahTahap2 ?? null,
              jumlah: it.jumlah,
              satuan: it.satuan,
              estimasi_harga_satuan: it.estimasiHargaSatuan,
              estimasi_total: it.estimasiTotal,
            })),
          });
          if (res && res.id) {
            permohonanList.value.unshift(res);
            return res;
          }
        }
      } catch (e) {
        console.warn('Backend create failed, fallback to local store:', e);
      }

      const count = permohonanList.value.length + 1;
      const id = `PB-2026-${String(count).padStart(3, '0')}`;
      const prefix = data.kategoriPaket === 'Ekstensifikasi' ? 'EKS' : 'INT';
      const nomorPermohonan = `SRPR-KLPA/${prefix}/2026/${String(count).padStart(3, '0')}`;

      const newPermohonan: PermohonanPenyaluranBarang = {
        ...data,
        id,
        nomorPermohonan,
        status: data.status || 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      permohonanList.value.unshift(newPermohonan);
      return newPermohonan;
    }

    function simpanSuratPermohonan(id: string, namaFile: string, url: string) {
      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.suratPermohonanNamaFile = namaFile;
        item.suratPermohonanUrl = url;
        item.updatedAt = new Date().toISOString();
      }
    }

    async function ajukanPenyaluran(id: string, fileData?: { namaFile: string; url: string; fileId?: number }) {
      try {
        await penyaluranBarangService.submit(id, fileData?.fileId);
      } catch (e) {
        console.warn('Backend submit failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        if (fileData) {
          item.suratPermohonanNamaFile = fileData.namaFile;
          item.suratPermohonanUrl = fileData.url;
        }
        item.status = 'MENUNGGU_VERIFIKASI_TEKNIS';
        item.tanggalPengajuan = new Date().toISOString().split('T')[0];
        item.updatedAt = new Date().toISOString();
      }
    }

    async function submitPermohonanDraft(
      id: string,
      suratUrl: string,
      fileName: string,
      fileId?: number
    ) {
      try {
        await penyaluranBarangService.submit(id, fileId);
      } catch (e) {
        console.warn('Backend submit failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.suratPermohonanUrl = suratUrl;
        item.suratPermohonanNamaFile = fileName;
        item.tanggalPengajuan = new Date().toISOString().split('T')[0];
        item.status = 'MENUNGGU_VERIFIKASI_TEKNIS';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function syncCompletedProposals(completedProposals: any[]) {
      try {
        await penyaluranBarangService.syncProposals();
        await fetchPermohonanList();
      } catch (e) {
        console.warn('API syncProposals failed, fallback to local sync:', e);
      }

      if (!Array.isArray(completedProposals)) return;

      completedProposals.forEach((proposal) => {
        if (!proposal) return;
        const pId = proposal.id ? String(proposal.id) : '';
        const pNo = proposal.nomor_proposal || proposal.nomorProposal || pId;

        // Check if already in permohonanList
        const existing = permohonanList.value.find(
          (item) => (item.proposalId && item.proposalId === pId) || item.nomorPermohonan === pNo
        );

        if (!existing && pNo) {
          const kategori: 'Ekstensifikasi' | 'Intensifikasi' =
            proposal.paket_sarpras === 'INTENSIFIKASI' || proposal.jenisSarpras === 'INTENSIFIKASI'
              ? 'Intensifikasi'
              : 'Ekstensifikasi';

          const mappedItems: any[] = [];
          if (proposal.rabItems && Array.isArray(proposal.rabItems)) {
            proposal.rabItems.forEach((r: any, idx: number) => {
              mappedItems.push({
                id: r.id || `item-sync-${pId}-${idx}`,
                jenisBarang: r.jenis || r.jenisBarang || 'Benih',
                namaBarang: r.namaBarang || r.nama_barang || r.uraian || 'Benih Kelapa',
                varietas: r.varietas || r.nama_varietas || 'Kelapa Genjah Kopyor',
                namaBarangVarietas: r.uraian || r.namaBarangVarietas || 'Komoditas Sarpras',
                jumlahTahap1: r.jumlahTahap1 ?? null,
                jumlahTahap2: r.jumlahTahap2 ?? null,
                jumlah: r.jumlahTotal || r.volume || r.jumlah || 0,
                satuan: r.satuan || r.unit || 'Unit',
                estimasiHargaSatuan: r.hargaSatuan || r.price_per_unit || r.estimasiHargaSatuan || 0,
                estimasiTotal: r.subTotal || r.total_price || r.estimasiTotal || 0,
              });
            });
          }

          const newItem: PermohonanPenyaluranBarang = {
            id: `PB-PROP-${pId}`,
            proposalId: pId,
            nomorPermohonan: pNo,
            namaLembagaPekebun: proposal.lembaga?.nama || proposal.lembaga?.namaLembaga || proposal.namaLembagaPekebun || 'Kelompok Tani Pekebun',
            namaKetua: proposal.lembaga?.namaKetua || proposal.namaKetua || 'Ketua Lembaga',
            kontak: proposal.lembaga?.telepon || proposal.lembaga?.nomorTelepon || proposal.kontak || '0812-3456-7890',
            desa: proposal.lembaga?.desa || proposal.desa || 'Desa',
            kecamatan: proposal.lembaga?.kecamatan || proposal.kecamatan || 'Kecamatan',
            kabupaten: proposal.lembaga?.kabupaten || proposal.kabupaten || 'Kabupaten',
            provinsi: proposal.lembaga?.provinsi || proposal.provinsi || 'Jambi',
            kategoriPaket: kategori,
            itemsRAB: mappedItems.length > 0 ? mappedItems : [
              {
                id: `item-def-${pId}`,
                jenisBarang: 'Benih',
                namaBarang: 'Benih Kelapa',
                varietas: 'Kelapa Genjah Kopyor',
                namaBarangVarietas: 'Benih Kelapa Bersertifikat',
                jumlahTahap1: 500,
                jumlahTahap2: 500,
                jumlah: 1000,
                satuan: 'Batang',
                estimasiHargaSatuan: 85000,
                estimasiTotal: 85000000,
              }
            ],
            status: 'DRAFT',
            createdAt: proposal.created_at || proposal.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          permohonanList.value.unshift(newItem);
        }
      });
    }

    async function verifikasiTeknis(
      id: string,
      isApproved: boolean,
      catatan: string,
      notaDinasData?: { namaFile: string; url: string; fileId?: number }
    ) {
      try {
        await penyaluranBarangService.verify(id, {
          is_approved: isApproved,
          catatan,
          nota_dinas_file_id: notaDinasData?.fileId,
        });
      } catch (e) {
        console.warn('Backend verify failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.catatanVerifikasiTeknis = catatan;
        if (isApproved) {
          item.status = 'DISPOSISI_PPK';
          if (notaDinasData) {
            item.notaDinasNamaFile = notaDinasData.namaFile;
            item.notaDinasUrl = notaDinasData.url;
          }
        } else {
          item.status = 'PERLU_REVISI';
        }
        item.updatedAt = new Date().toISOString();
      }
    }

    async function disposisiPpk(id: string, jalur: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG' = 'ULP_TENDER', catatan: string = '') {
      try {
        await penyaluranBarangService.dispositionPpk(id, {
          jalur_pengadaan: jalur,
          catatan,
        });
      } catch (e) {
        console.warn('Backend dispositionPpk failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.jalurPengadaan = jalur;
        item.catatanPpk = catatan;
        item.status = 'DISPOSISI_ULP';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function mulaiTenderUlp(id: string) {
      try {
        await penyaluranBarangService.startTender(id);
      } catch (e) {
        console.warn('Backend startTender failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.status = 'PROSES_PEMILIHAN_PENYEDIA';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function selesaikanTenderUlp(id: string, vendor: string = '', nilaiTender: number = 0, catatan: string = '') {
      try {
        await penyaluranBarangService.finishTender(id, {
          pemenang_vendor: vendor,
          nilai_pemenang_tender: nilaiTender,
          catatan,
        });
      } catch (e) {
        console.warn('Backend finishTender failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        if (vendor) item.pemenangVendor = vendor;
        if (nilaiTender) item.nilaiPemenangTender = nilaiTender;
        if (catatan) item.catatanUlp = catatan;
        item.tanggalPenetapanPemenang = new Date().toISOString().split('T')[0];
        item.status = 'PENETAPAN_PEMENANG';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function simpanDokumenKontrakA(id: string, kontrak: DokumenKontrakA & { fileId?: number }) {
      try {
        await penyaluranBarangService.saveContract(id, {
          nomor_kontrak: kontrak.nomorKontrak,
          nama_penyedia: kontrak.namaPenyedia,
          total_nilai_kontrak: kontrak.totalNilaiKontrak,
          termin_pembayaran: kontrak.terminPembayaran,
          termin_penyaluran: kontrak.terminPenyaluran,
          jangka_waktu_hari: kontrak.jangkaWaktuHari,
          tanggal_mulai: kontrak.tanggalMulai,
          tanggal_selesai: kontrak.tanggalSelesai,
          catatan: kontrak.catatan,
          dokumen_kontrak_file_id: kontrak.fileId,
        });
      } catch (e) {
        console.warn('Backend saveContract failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.dokumenKontrak = kontrak;
        item.status = 'PROSES_PELAKSANAAN_KONTRAK';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function terbitkanSuratTugasSurveyor(id: string, surveyor: SuratTugasSurveyor & { fileId?: number; surveyorId?: number }) {
      try {
        await penyaluranBarangService.assignSurveyor(id, {
          nomor_surat: surveyor.nomorSurat,
          nama_lembaga_surveyor: surveyor.namaLembagaSurveyor,
          lingkup_tugas: surveyor.lingkupTugas,
          tanggal_terbit: surveyor.tanggalTerbit,
          dokumen_surat_file_id: surveyor.fileId,
          surveyor_id: surveyor.surveyorId,
        });
      } catch (e) {
        console.warn('Backend assignSurveyor failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        item.suratTugasSurveyor = surveyor;
        item.status = 'SURVEYOR_DITUGASKAN';
        item.updatedAt = new Date().toISOString();
      }
    }

    async function selesaikanSurveyorMonitoring(id: string, bastData?: { fileId?: number; bastDate?: string; catatan?: string }) {
      try {
        await penyaluranBarangService.completeMonitoring(id, {
          bast_document_file_id: bastData?.fileId,
          bast_date: bastData?.bastDate,
          catatan: bastData?.catatan,
        });
      } catch (e) {
        console.warn('Backend completeMonitoring failed, fallback to local update:', e);
      }

      const item = permohonanList.value.find((p) => p.id === id);
      if (item) {
        if (item.suratTugasSurveyor) {
          item.suratTugasSurveyor.status = 'SELESAI_MONITORING';
        }
        item.status = 'SELESAI';
        item.updatedAt = new Date().toISOString();
      }
    }

    function resetDemoData() {
      permohonanList.value = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
      activePermohonanId.value = null;
    }

    return {
      permohonanList,
      activePermohonanId,
      activePermohonan,
      permohonanPekebun,
      permohonanVerifikator,
      permohonanPpk,
      permohonanUlp,
      isLoading,
      setActivePermohonan,
      fetchPermohonanList,
      fetchPermohonanDetail,
      createPermohonan,
      submitPermohonanDraft,
      simpanSuratPermohonan,
      ajukanPenyaluran,
      syncCompletedProposals,
      verifikasiTeknis,
      disposisiPpk,
      mulaiTenderUlp,
      selesaikanTenderUlp,
      simpanDokumenKontrakA,
      terbitkanSuratTugasSurveyor,
      selesaikanSurveyorMonitoring,
      resetDemoData,
    };
  },
  {
    persist: {
      pick: ['permohonanList'],
    },
  }
);
