import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  Proposal,
  PengajuanStatus,
  ProposalStatus,
  JenisSarpras,
  LembagaPengusul,
  StorageArea,
  CreateProposalPayload,
  CreateFullProposalPayload,
  UpdateProposalPayload,
  SyncProposalDocumentItem,
  BulkCreateDocumentItem,
  UpdateProposalDocumentPayload,
  CreateRabPayload,
  CreateRabItemPayload,
  SpatialOverlapResponse,
  ProposalDocumentValidationResponse,
  ListProposalDocumentValidationQueryParams,
  CreateProposalDocumentValidationPayload,
  DataCPCL,
} from '@/types/pengusulan';
import { proposalService, ProposalListQueryParams } from '@/services/proposal.service';
import { rabService } from '@/services/rab.service';
import { generateSpkaNomor } from '@/lib/spkaNumbering';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';

function mapStorageArea(storageArea: any): StorageArea | null {
  if (!storageArea) return null;
  const exteriorUrl =
    storageArea.exterior_photo_file_url ||
    (typeof storageArea.fotoTampakDepan === 'string' ? storageArea.fotoTampakDepan : '') ||
    storageArea.fotoTampakDepan?.dataUrl ||
    storageArea.fotoTampakDepan?.fileUrl ||
    storageArea.fotoTampakDepan?.urlFile ||
    '';
  const interiorUrl =
    storageArea.interior_photo_file_url ||
    (typeof storageArea.fotoTampakDalam === 'string' ? storageArea.fotoTampakDalam : '') ||
    storageArea.fotoTampakDalam?.dataUrl ||
    storageArea.fotoTampakDalam?.fileUrl ||
    storageArea.fotoTampakDalam?.urlFile ||
    '';

  return {
    ...storageArea,
    alamat: storageArea.address || storageArea.alamat || '',
    koordinat: storageArea.coordinate || storageArea.koordinat || '',
    exterior_photo_file_url: exteriorUrl || storageArea.exterior_photo_file_url,
    interior_photo_file_url: interiorUrl || storageArea.interior_photo_file_url,
    fotoTampakDepan:
      exteriorUrl || storageArea.fotoTampakDepan
        ? {
            persyaratanId: 'gudang-depan',
            namaFile: storageArea.fotoTampakDepan?.namaFile || storageArea.fotoTampakDepan?.fileName || 'foto_tampak_depan_gudang.jpg',
            mimeType: storageArea.fotoTampakDepan?.mimeType || 'image/jpeg',
            ukuranBytes: storageArea.fotoTampakDepan?.ukuranBytes || storageArea.fotoTampakDepan?.fileSize || 0,
            dataUrl: exteriorUrl,
            uploadedAt: storageArea.fotoTampakDepan?.uploadedAt || storageArea.fotoTampakDepan?.createdAt || '',
            fileId: storageArea.exterior_photo_file_id || storageArea.fotoTampakDepan?.fileId || undefined,
          }
        : null,
    fotoTampakDalam:
      interiorUrl || storageArea.fotoTampakDalam
        ? {
            persyaratanId: 'gudang-dalam',
            namaFile: storageArea.fotoTampakDalam?.namaFile || storageArea.fotoTampakDalam?.fileName || 'foto_tampak_dalam_gudang.jpg',
            mimeType: storageArea.fotoTampakDalam?.mimeType || 'image/jpeg',
            ukuranBytes: storageArea.fotoTampakDalam?.ukuranBytes || storageArea.fotoTampakDalam?.fileSize || 0,
            dataUrl: interiorUrl,
            uploadedAt: storageArea.fotoTampakDalam?.uploadedAt || storageArea.fotoTampakDalam?.createdAt || '',
            fileId: storageArea.interior_photo_file_id || storageArea.fotoTampakDalam?.fileId || undefined,
          }
        : null,
  };
}

function mapCoordinates(coordinates: unknown): DataCPCL['coordinates'] {
  if (!Array.isArray(coordinates)) return [];

  return coordinates.map((coordinate: any) => ({
    lat: Number(coordinate?.lat),
    lng: Number(coordinate?.lng),
  }));
}

function mapCpclFromPekebun(pekebun: any, lahan: any = {}): DataCPCL {
  return {
    id: String(lahan.id ?? pekebun.id ?? ''),
    namaPekebun: pekebun.name || pekebun.nama || pekebun.namaPekebun || '',
    nik: pekebun.nik || '',
    nomorKK: pekebun.nomor_kk || pekebun.nomorKK || '',
    luasLahanHektar: Number(lahan.luas_lahan ?? lahan.luasLahan ?? pekebun.luas_lahan ?? pekebun.luasLahan ?? 0),
    jenisHakLahan: (lahan.jenis_legalitas ?? lahan.jenisLegalitas ?? pekebun.jenisHakLahan ?? 'SHM') as DataCPCL['jenisHakLahan'],
    nomorSuratLahan: lahan.nomor_legalitas ?? lahan.nomorLegalitas ?? pekebun.nomorSuratLahan ?? '-',
    coordinates: mapCoordinates(lahan.coordinates ?? lahan.koordinat_poligon ?? pekebun.coordinates),
  };
}

/** Supports detail payloads containing either top-level `lahans` or only `pekebuns`. */
function mapDaftarCpcl(item: any): DataCPCL[] {
  const pekebuns = Array.isArray(item?.pekebuns) ? item.pekebuns : [];
  const lahans = Array.isArray(item?.lahans) ? item.lahans : [];

  if (lahans.length > 0) {
    return lahans.map((lahan: any) => {
      const pekebun = pekebuns.find((p: any) => String(p.id) === String(lahan.pekebun_id)) || {};
      return mapCpclFromPekebun(pekebun, lahan);
    });
  }

  return pekebuns.flatMap((pekebun: any) => {
    const lahansPekebun = Array.isArray(pekebun.lahans) ? pekebun.lahans : pekebun.lahan ? [pekebun.lahan] : [];

    return lahansPekebun.length > 0 ? lahansPekebun.map((lahan: any) => mapCpclFromPekebun(pekebun, lahan)) : [mapCpclFromPekebun(pekebun)];
  });
}

function mapLocalDaftarCpcl(lahanIds?: number[]): DataCPCL[] {
  if (!lahanIds || lahanIds.length === 0) return [];
  const selectedLahanIds = new Set(lahanIds.map(String));
  const pekebunStore = usePekebunStore();

  return pekebunStore.listPekebun.flatMap((pekebun: any) => {
    const lahans = Array.isArray(pekebun.daftarLahan) && pekebun.daftarLahan.length > 0 ? pekebun.daftarLahan : pekebun.lahan ? [pekebun.lahan] : [];

    return lahans.filter((lahan: any) => selectedLahanIds.has(String(lahan.id))).map((lahan: any) => mapCpclFromPekebun(pekebun, lahan));
  });
}

export const usePengusulanStore = defineStore(
  'pengusulan',
  () => {
    const listPengajuan = ref<Proposal[]>([
      {
        id: 'REQ-2026-001',
        nomor_proposal: 'BPDP-Kelapa-202607-001',
        nomorProposal: 'BPDP-Kelapa-202607-001',
        kelembagaan_id: 'LEM-101',
        lembagaId: 'LEM-101',
        lembaga: {
          id: 'LEM-101',
          namaLembaga: 'Koperasi Tani Kelapa Sejahtera',
          jenisLembaga: 'KOPERASI',
          nomorAkta: 'AHU-0012345.AH.01.02.2024',
          nikKetua: '7301021508850001',
          namaKetua: 'Budi Santoso',
          telepon: '081234567890',
          alamatLengkap: 'Jl. Raya Perkebunan No. 12, Kab. Luwu Utara',
          kabupatenKode: '7322',
          provinsiKode: '73',
          namaBank: 'Bank BRI',
          nomorRekening: '1234-01-000567-53-1',
          namaPemilikRekening: 'Koperasi Tani Kelapa Sejahtera',
        },
        paket_sarpras: 'Ekstensifikasi Kelapa',
        jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
        detail_usulan: 'Pengusulan Paket Ekstensifikasi Kelapa 50 Hektar',
        detailUsulan: 'Pengusulan Paket Ekstensifikasi Kelapa 50 Hektar',
        total_anggaran: 450000000,
        totalAnggaranPengajuan: 450000000,
        status: ProposalStatus.SUBMITTED,
        currentStatus: PengajuanStatus.SUBMITTED,
        catatanDinas: '',
        daftarCPCL: [
          {
            id: 'CPCL-1',
            namaPekebun: 'Ahmad Supardi',
            nik: '7301021508850001',
            nomorKK: '7301021508850000',
            luasLahanHektar: 2.5,
            jenisHakLahan: 'SHM',
            nomorSuratLahan: 'SHM-99182',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
          },
          {
            id: 'CPCL-2',
            namaPekebun: 'Siti Rahma',
            nik: '7301025509900003',
            nomorKK: '7301025509900000',
            luasLahanHektar: 1.8,
            jenisHakLahan: 'STDB',
            nomorSuratLahan: 'STDB-44129',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
          },
        ],
        dokumen: [
          { id: 'DOC-1', tipeDokumen: 'KTP', namaFile: 'ktp_pengurus.pdf', urlFile: '/templates/scan-ktp.png', ukuranBytes: 1240000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-2', tipeDokumen: 'LEGALITAS_KP', namaFile: 'legalitas_kp.pdf', urlFile: '/templates/proposal-template.docx', ukuranBytes: 2100000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-3', tipeDokumen: 'SIMLUHTAN', namaFile: 'simluhtan.pdf', urlFile: '/templates/surat-kesiapan.docx', ukuranBytes: 1800000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-4', tipeDokumen: 'LEGALITAS_LAHAN', namaFile: 'legalitas_lahan.pdf', urlFile: '/templates/format-sporadik.docx', ukuranBytes: 3200000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-5', tipeDokumen: 'SURAT_BEDA_NAMA', namaFile: 'surat_beda_nama.pdf', urlFile: '/templates/format-surat-beda-nama.docx', ukuranBytes: 1500000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-6', tipeDokumen: 'GAMBAR_LAHAN', namaFile: 'gambar_lahan.pdf', urlFile: '/templates/peta-template.pdf', ukuranBytes: 4500000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-7', tipeDokumen: 'RAB_RK', namaFile: 'rab_rk.pdf', urlFile: '/templates/spek-teknis.pdf', ukuranBytes: 2800000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-8', tipeDokumen: 'PERNYATAAN_LUAS', namaFile: 'pernyataan_luas.pdf', urlFile: '/templates/surat-pernyataan.docx', ukuranBytes: 1600000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-9', tipeDokumen: 'REFERENSI_HARGA', namaFile: 'referensi_harga.pdf', urlFile: '/templates/spek-teknis.pdf', ukuranBytes: 2200000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-10', tipeDokumen: 'PERNYATAAN_TANPA_BAKAR', namaFile: 'pernyataan_tanpa_bakar.pdf', urlFile: '/templates/surat-pernyataan.docx', ukuranBytes: 1400000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-11', tipeDokumen: 'DETAIL_PEKEBUN', namaFile: 'detail_pekebun.pdf', urlFile: '/templates/proposal-template.docx', ukuranBytes: 3500000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-12', tipeDokumen: 'RAB_DETAIL', namaFile: 'rab_detail.pdf', urlFile: '/templates/spek-teknis.pdf', ukuranBytes: 2600000, uploadedAt: '2026-07-28', isValid: true },
          { id: 'DOC-KADES-01', tipeDokumen: 'SURAT_KET_KADES', namaFile: 'surat_keterangan_kades.pdf', urlFile: '/templates/stdb-template.pdf', ukuranBytes: 1500000, uploadedAt: '2026-07-28', isValid: true },
        ],
        documents: [
          {
            id: 1,
            proposal_id: 1,
            file_id: 601,
            document_type: 'SURAT_PERMOHONAN',
            file_name: 'ktp_pengurus.pdf',
            file_url: '/templates/scan-ktp.png',
            file_size: 1240000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 2,
            proposal_id: 1,
            file_id: 602,
            document_type: 'DOKUMEN_LEGALITAS_KELEMBAGAAN',
            file_name: 'legalitas_kp.pdf',
            file_url: '/templates/proposal-template.docx',
            file_size: 2100000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 3,
            proposal_id: 1,
            file_id: 603,
            document_type: 'RAB_PROPOSAL',
            file_name: 'rab_pengajuan_tertandatangani.pdf',
            file_url: '/templates/spek-teknis.pdf',
            file_size: 2500000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 4,
            proposal_id: 1,
            file_id: 604,
            document_type: 'RAB_FINAL',
            file_name: 'rab_final_disetujui.pdf',
            file_url: '/templates/spek-teknis.pdf',
            file_size: 2700000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-29T10:00:00Z',
          },
          {
            id: 5,
            proposal_id: 1,
            file_id: 605,
            document_type: 'STDB',
            file_name: 'surat_tanda_daftar_budidaya.pdf',
            file_url: '/templates/stdb-template.pdf',
            file_size: 1800000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 6,
            proposal_id: 1,
            file_id: 606,
            document_type: 'SURAT_KET_KADES',
            file_name: 'surat_keterangan_kades.pdf',
            file_url: '/templates/stdb-template.pdf',
            file_size: 1500000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 7,
            proposal_id: 1,
            file_id: 607,
            document_type: 'GAMBAR_LAHAN',
            file_name: 'peta_polygon_lahan.pdf',
            file_url: '/templates/peta-template.pdf',
            file_size: 3200000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 8,
            proposal_id: 1,
            file_id: 608,
            document_type: 'BA_VERIFIKASI',
            file_name: 'ba_verifikasi_dokumen.pdf',
            file_url: '/templates/spek-teknis.pdf',
            file_size: 2100000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 9,
            proposal_id: 1,
            file_id: 609,
            document_type: 'BA_VERIFIKASI_LAPANGAN',
            file_name: 'ba_verifikasi_lapangan.pdf',
            file_url: '/templates/spek-teknis.pdf',
            file_size: 2300000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 10,
            proposal_id: 1,
            file_id: 610,
            document_type: 'SK_CPCL',
            file_name: 'sk_cpcl_dinas_kabupaten.pdf',
            file_url: '/templates/spek-teknis.pdf',
            file_size: 2400000,
            file_extension: 'pdf',
            mime_type: 'application/pdf',
            created_at: '2026-07-28T10:00:00Z',
          },
        ],
        storage_area: {
          address: 'Jl. Poros Masamba KM 8, Desa Bone, Kec. Masamba, Kab. Luwu Utara',
          coordinate: '-2.123124, 106.87123',
          alamat: 'Jl. Poros Masamba KM 8, Desa Bone, Kec. Masamba, Kab. Luwu Utara',
          koordinat: '-2.123124, 106.87123',
          fotoTampakDepan: {
            persyaratanId: 'gudang-depan',
            namaFile: 'foto_tampak_depan_gudang.jpg',
            mimeType: 'image/jpeg',
            ukuranBytes: 3200000,
            dataUrl: '/templates/scan-ktp.png',
            uploadedAt: '2026-07-28',
          },
          fotoTampakDalam: {
            persyaratanId: 'gudang-dalam',
            namaFile: 'foto_tampak_dalam_gudang.jpg',
            mimeType: 'image/jpeg',
            ukuranBytes: 2800000,
            dataUrl: '/templates/scan-kk.webp',
            uploadedAt: '2026-07-28',
          },
        },
        gudangSerahTerima: {
          address: 'Jl. Poros Masamba KM 8, Desa Bone, Kec. Masamba, Kab. Luwu Utara',
          coordinate: '-2.123124, 106.87123',
          alamat: 'Jl. Poros Masamba KM 8, Desa Bone, Kec. Masamba, Kab. Luwu Utara',
          koordinat: '-2.123124, 106.87123',
          fotoTampakDepan: {
            persyaratanId: 'gudang-depan',
            namaFile: 'foto_tampak_depan_gudang.jpg',
            mimeType: 'image/jpeg',
            ukuranBytes: 3200000,
            dataUrl: '/templates/scan-ktp.png',
            uploadedAt: '2026-07-28',
          },
          fotoTampakDalam: {
            persyaratanId: 'gudang-dalam',
            namaFile: 'foto_tampak_dalam_gudang.jpg',
            mimeType: 'image/jpeg',
            ukuranBytes: 2800000,
            dataUrl: '/templates/scan-kk.webp',
            uploadedAt: '2026-07-28',
          },
        },
        rabItems: [
          { id: 'rab-1', tahap: 'Tahap 1', uraian: 'Pembelian Bibit Kelapa', volume: 5000, satuan: 'batang', unit: 'batang', price_per_unit: 15000, hargaSatuan: 15000, item_type: 'BARANG', total_price: 75000000, subTotal: 75000000 },
          { id: 'rab-2', tahap: 'Tahap 1', uraian: 'Pupuk NPK', volume: 200, satuan: 'kg', unit: 'kg', price_per_unit: 25000, hargaSatuan: 25000, item_type: 'BARANG', total_price: 5000000, subTotal: 5000000 },
          { id: 'rab-3', tahap: 'Tahap 2', uraian: 'Pestisida Organik', volume: 50, satuan: 'liter', unit: 'liter', price_per_unit: 120000, hargaSatuan: 120000, item_type: 'BARANG', total_price: 6000000, subTotal: 6000000 },
          { id: 'rab-4', tahap: 'Tahap 2', uraian: 'Alat Semprot', volume: 10, satuan: 'unit', unit: 'unit', price_per_unit: 3500000, hargaSatuan: 3500000, item_type: 'BARANG', total_price: 35000000, subTotal: 35000000 },
          { id: 'rab-5', tahap: 'Tahap 3', uraian: 'Biaya Transportasi', volume: 1, satuan: 'paket', unit: 'paket', price_per_unit: 15000000, hargaSatuan: 15000000, item_type: 'JASA', total_price: 15000000, subTotal: 15000000 },
          { id: 'rab-6', tahap: 'Tahap 3', uraian: 'Biaya Pelatihan', volume: 3, satuan: 'sesi', unit: 'sesi', price_per_unit: 5000000, hargaSatuan: 5000000, item_type: 'JASA', total_price: 15000000, subTotal: 15000000 },
        ],
        rabs: [
          {
            id: 'rab-prop-001',
            proposal_id: 'REQ-2026-001',
            flag: 'PROPOSAL',
            items: [
              { id: 'rab-1', tahap: 'Tahap 1', uraian: 'Pembelian Bibit Kelapa', volume: 5000, satuan: 'batang', unit: 'batang', price_per_unit: 15000, hargaSatuan: 15000, item_type: 'BARANG', total_price: 75000000, subTotal: 75000000 },
              { id: 'rab-2', tahap: 'Tahap 1', uraian: 'Pupuk NPK', volume: 200, satuan: 'kg', unit: 'kg', price_per_unit: 25000, hargaSatuan: 25000, item_type: 'BARANG', total_price: 5000000, subTotal: 5000000 },
              { id: 'rab-3', tahap: 'Tahap 2', uraian: 'Pestisida Organik', volume: 50, satuan: 'liter', unit: 'liter', price_per_unit: 120000, hargaSatuan: 120000, item_type: 'BARANG', total_price: 6000000, subTotal: 6000000 },
              { id: 'rab-4', tahap: 'Tahap 2', uraian: 'Alat Semprot', volume: 10, satuan: 'unit', unit: 'unit', price_per_unit: 3500000, hargaSatuan: 3500000, item_type: 'BARANG', total_price: 35000000, subTotal: 35000000 },
              { id: 'rab-5', tahap: 'Tahap 3', uraian: 'Biaya Transportasi', volume: 1, satuan: 'paket', unit: 'paket', price_per_unit: 15000000, hargaSatuan: 15000000, item_type: 'JASA', total_price: 15000000, subTotal: 15000000 },
              { id: 'rab-6', tahap: 'Tahap 3', uraian: 'Biaya Pelatihan', volume: 3, satuan: 'sesi', unit: 'sesi', price_per_unit: 5000000, hargaSatuan: 5000000, item_type: 'JASA', total_price: 15000000, subTotal: 15000000 },
            ],
            created_at: '2026-07-28T10:00:00Z',
            updated_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 'rab-final-001',
            proposal_id: 'REQ-2026-001',
            flag: 'FINAL',
            items: [
              {
                id: 'rab-f-1',
                tahap: 'Tahap 1',
                uraian: 'Pembelian Bibit Kelapa Bersertifikat (SNI)',
                volume: 5000,
                satuan: 'batang',
                unit: 'batang',
                price_per_unit: 15000,
                hargaSatuan: 15000,
                item_type: 'BARANG',
                total_price: 75000000,
                subTotal: 75000000,
              },
              { id: 'rab-f-2', tahap: 'Tahap 1', uraian: 'Pupuk NPK Formula Khusus Kelapa', volume: 200, satuan: 'kg', unit: 'kg', price_per_unit: 25000, hargaSatuan: 25000, item_type: 'BARANG', total_price: 5000000, subTotal: 5000000 },
              { id: 'rab-f-3', tahap: 'Tahap 2', uraian: 'Pestisida Organik Hayati', volume: 50, satuan: 'liter', unit: 'liter', price_per_unit: 120000, hargaSatuan: 120000, item_type: 'BARANG', total_price: 6000000, subTotal: 6000000 },
              {
                id: 'rab-f-4',
                tahap: 'Tahap 2',
                uraian: 'Alat Semprot Elektrik Standard',
                volume: 10,
                satuan: 'unit',
                unit: 'unit',
                price_per_unit: 3500000,
                hargaSatuan: 3500000,
                item_type: 'BARANG',
                total_price: 35000000,
                subTotal: 35000000,
              },
              {
                id: 'rab-f-5',
                tahap: 'Tahap 3',
                uraian: 'Biaya Distribusi Logistik dan Transportasi',
                volume: 1,
                satuan: 'paket',
                unit: 'paket',
                price_per_unit: 15000000,
                hargaSatuan: 15000000,
                item_type: 'JASA',
                total_price: 15000000,
                subTotal: 15000000,
              },
              {
                id: 'rab-f-6',
                tahap: 'Tahap 3',
                uraian: 'Bimbingan Teknis & Pelatihan GAP Kelapa',
                volume: 3,
                satuan: 'sesi',
                unit: 'sesi',
                price_per_unit: 5000000,
                hargaSatuan: 5000000,
                item_type: 'JASA',
                total_price: 15000000,
                subTotal: 15000000,
              },
            ],
            created_at: '2026-07-29T10:00:00Z',
            updated_at: '2026-07-29T10:00:00Z',
          },
        ],
        rabDitandatangani: {
          persyaratanId: 'rab-signed',
          namaFile: 'rab_tertandatangani.pdf',
          mimeType: 'application/pdf',
          ukuranBytes: 2500000,
          dataUrl: '#',
          uploadedAt: '2026-07-28',
        },
        lahans: [
          {
            id: 1,
            pekebun_id: 1,
            jenis_legalitas: 'SHM',
            nomor_legalitas: 'SHM-99182',
            tanggal_penerbitan_legalitas: '2020-05-12',
            luas_lahan: 2.5,
            kode_provinsi: '73',
            kode_kabupaten: '7322',
            kode_kecamatan: '732201',
            kode_desa: '73220101',
            alamat_kebun: 'Blok Barat, Desa Bone, Kec. Masamba, Kab. Luwu Utara',
            tahun_tanam: 2021,
            jenis_bibit: 'Kelapa Dalam Varietas Lokal Unggul',
            nomor_surat_beda_nama: null,
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
            documents: [
              {
                id: 101,
                document_type: 'LEGALITAS_LAHAN',
                file_name: 'scan_shm_99182.pdf',
                file_url: '/templates/stdb-template.pdf',
                file_size: '2048000',
                file_extension: 'pdf',
                mime_type: 'application/pdf',
                created_at: '2026-07-28T10:00:00Z',
              },
              {
                id: 102,
                document_type: 'GAMBAR_LAHAN',
                file_name: 'peta_polygon_blok_barat.pdf',
                file_url: '/templates/peta-template.pdf',
                file_size: '1536000',
                file_extension: 'pdf',
                mime_type: 'application/pdf',
                created_at: '2026-07-28T10:00:00Z',
              },
            ],
            created_at: '2026-07-28T10:00:00Z',
            updated_at: '2026-07-28T10:00:00Z',
          },
          {
            id: 2,
            pekebun_id: 2,
            jenis_legalitas: 'STDB',
            nomor_legalitas: 'STDB-44129',
            tanggal_penerbitan_legalitas: '2021-08-20',
            luas_lahan: 1.8,
            kode_provinsi: '73',
            kode_kabupaten: '7322',
            kode_kecamatan: '732201',
            kode_desa: '73220102',
            alamat_kebun: 'Blok Timur, Desa Masamba, Kec. Masamba, Kab. Luwu Utara',
            tahun_tanam: 2022,
            jenis_bibit: 'Kelapa Genjah Pandan Wangi',
            nomor_surat_beda_nama: 'SBN/2026/088',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
            documents: [
              {
                id: 103,
                document_type: 'LEGALITAS_LAHAN',
                file_name: 'scan_stdb_44129.pdf',
                file_url: '/templates/stdb-template.pdf',
                file_size: '1840000',
                file_extension: 'pdf',
                mime_type: 'application/pdf',
                created_at: '2026-07-28T10:00:00Z',
              },
              {
                id: 104,
                document_type: 'SURAT_BEDA_NAMA',
                file_name: 'surat_keterangan_beda_nama.pdf',
                file_url: '/templates/format-surat-beda-nama.docx',
                file_size: '1220000',
                file_extension: 'pdf',
                mime_type: 'application/pdf',
                created_at: '2026-07-28T10:00:00Z',
              },
            ],
            created_at: '2026-07-28T10:00:00Z',
            updated_at: '2026-07-28T10:00:00Z',
          },
        ],
        createdAt: '2026-07-28T10:00:00Z',
        updatedAt: '2026-07-28T10:00:00Z',
        created_at: '2026-07-28T10:00:00Z',
        updated_at: '2026-07-28T10:00:00Z',
      },
      {
        id: 'REQ-2026-002',
        nomor_proposal: 'BPDP-Kelapa-202607-002',
        nomorProposal: 'BPDP-Kelapa-202607-002',
        kelembagaan_id: 'LEM-102',
        lembagaId: 'LEM-102',
        lembaga: {
          id: 'LEM-102',
          namaLembaga: 'Gapoktan Maju Bersama',
          jenisLembaga: 'GAPOKTAN',
          nomorAkta: 'AHU-009991.2024',
          nikKetua: '7301031208800002',
          namaKetua: 'Hasanuddin',
          telepon: '081312345678',
          alamatLengkap: 'Desa Bone, Masamba',
          kabupatenKode: '7322',
          provinsiKode: '73',
          namaBank: 'Bank Mandiri',
          nomorRekening: '987654321',
          namaPemilikRekening: 'Gapoktan Maju Bersama',
        },
        paket_sarpras: 'Ekstensifikasi Kelapa',
        jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
        detail_usulan: 'Ekstensifikasi Kelapa 30 Ha',
        detailUsulan: 'Ekstensifikasi Kelapa 30 Ha',
        total_anggaran: 320000000,
        totalAnggaranPengajuan: 320000000,
        status: ProposalStatus.SUBMITTED,
        currentStatus: PengajuanStatus.SUBMITTED,
        daftarCPCL: [
          {
            id: 'CPCL-201',
            namaPekebun: 'Rahmat',
            nik: '7301031208800002',
            nomorKK: '7301031208800000',
            luasLahanHektar: 2.2,
            jenisHakLahan: 'SHM',
            nomorSuratLahan: 'SHM-20001',
            coordinates: [],
          },
        ],
        dokumen: [],
        documents: [],
        createdAt: '2026-07-29T09:00:00Z',
        updatedAt: '2026-07-29T09:00:00Z',
        created_at: '2026-07-29T09:00:00Z',
        updated_at: '2026-07-29T09:00:00Z',
      },
      {
        id: 'REQ-2026-003',
        nomor_proposal: 'BPDP-Kelapa-202607-003',
        nomorProposal: 'BPDP-Kelapa-202607-003',
        kelembagaan_id: 'LEM-103',
        lembagaId: 'LEM-103',
        lembaga: {
          id: 'LEM-103',
          namaLembaga: 'Koperasi Kelapa Makmur',
          jenisLembaga: 'KOPERASI',
          nomorAkta: 'AHU-88888.2024',
          nikKetua: '7301040101800001',
          namaKetua: 'Firman',
          telepon: '081355555555',
          alamatLengkap: 'Masamba',
          kabupatenKode: '7322',
          provinsiKode: '73',
          namaBank: 'BRI',
          nomorRekening: '123456789',
          namaPemilikRekening: 'Koperasi Kelapa Makmur',
        },
        paket_sarpras: 'Ekstensifikasi Kelapa',
        jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
        detail_usulan: 'Ekstensifikasi 40 Ha',
        detailUsulan: 'Ekstensifikasi 40 Ha',
        total_anggaran: 400000000,
        totalAnggaranPengajuan: 400000000,
        status: ProposalStatus.SUBMITTED,
        currentStatus: PengajuanStatus.SUBMITTED,
        daftarCPCL: [
          {
            id: 'CPCL-301',
            namaPekebun: 'Andi',
            nik: '7301040101800001',
            nomorKK: '7301040101800000',
            luasLahanHektar: 3,
            jenisHakLahan: 'SHM',
            nomorSuratLahan: 'SHM-30001',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
          },
        ],
        dokumen: [],
        documents: [],
        createdAt: '2026-07-30T10:00:00Z',
        updatedAt: '2026-07-30T10:00:00Z',
        created_at: '2026-07-30T10:00:00Z',
        updated_at: '2026-07-30T10:00:00Z',
      },
      {
        id: 'REQ-2026-004',
        nomor_proposal: 'BPDP-Kelapa-202607-004',
        nomorProposal: 'BPDP-Kelapa-202607-004',
        kelembagaan_id: 'LEM-104',
        lembagaId: 'LEM-104',
        lembaga: {
          id: 'LEM-104',
          namaLembaga: 'Kelompok Tani Harapan',
          jenisLembaga: 'POKTAN',
          nomorAkta: 'AHU-77777.2024',
          nikKetua: '7301050101800001',
          namaKetua: 'Syamsul',
          telepon: '081399999999',
          alamatLengkap: 'Masamba',
          kabupatenKode: '7322',
          provinsiKode: '73',
          namaBank: 'BNI',
          nomorRekening: '555555555',
          namaPemilikRekening: 'Kelompok Tani Harapan',
        },
        paket_sarpras: 'Ekstensifikasi Kelapa',
        jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
        detail_usulan: 'Ekstensifikasi 20 Ha',
        detailUsulan: 'Ekstensifikasi 20 Ha',
        total_anggaran: 250000000,
        totalAnggaranPengajuan: 250000000,
        status: ProposalStatus.SUBMITTED,
        currentStatus: PengajuanStatus.SUBMITTED,
        daftarCPCL: [
          {
            id: 'CPCL-401',
            namaPekebun: 'Jamal',
            nik: '7301050101800001',
            nomorKK: '7301050101800000',
            luasLahanHektar: 1.8,
            jenisHakLahan: 'SHM',
            nomorSuratLahan: 'SHM-40001',
            coordinates: [
              { lat: -2.5835, lng: 120.3122 },
              { lat: -2.584, lng: 120.3142 },
              { lat: -2.586, lng: 120.3138 },
              { lat: -2.585, lng: 120.3118 },
            ],
          },
        ],
        dokumen: [],
        documents: [],
        createdAt: '2026-07-31T11:00:00Z',
        updatedAt: '2026-07-31T11:00:00Z',
        created_at: '2026-07-31T11:00:00Z',
        updated_at: '2026-07-31T11:00:00Z',
      },
    ]);

    const activePengajuan = ref<Proposal | null>(null);
    const spatialOverlap = ref<SpatialOverlapResponse | null>(null);
    const spatialOverlapProposalId = ref<string | null>(null);
    const pagination = ref({ page: 1, limit: 10, total: 4 });
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    /** Fetch proposals list via API with fallback to local state */
    async function fetchProposals(params?: ProposalListQueryParams) {
      isLoading.value = true;
      error.value = null;
      const queryParams: ProposalListQueryParams = {
        sort_by: 'updated_at',
        sort_order: 'desc',
        ...params,
      };
      try {
        const response = await proposalService.getList(queryParams);
        if (response && response.data && Array.isArray(response.data)) {
          listPengajuan.value = response.data.map((item) => ({
            ...item,
            nomorProposal: item.nomor_proposal || item.nomorProposal,
            currentStatus: item.status || item.currentStatus,
            is_draft: item.is_draft,
            isDraft: item.is_draft,
            totalAnggaranPengajuan: item.total_anggaran ?? item.totalAnggaranPengajuan ?? 0,
            detailUsulan: item.detail_usulan || item.detailUsulan || '',
            totalLuasLahan: item.total_luas_lahan ?? item.totalLuasLahan ?? 0,
            totalPekebun: item.total_pekebun ?? item.totalPekebun ?? 0,
            storage_area: mapStorageArea(item.storage_area || item.gudangSerahTerima),
            gudangSerahTerima: mapStorageArea(item.storage_area || item.gudangSerahTerima),
          }));
          if (response.meta) {
            pagination.value = response.meta;
          } else {
            pagination.value = {
              page: queryParams.page || 1,
              limit: queryParams.limit || 10,
              total: listPengajuan.value.length,
            };
          }
        }

        return listPengajuan.value;
      } catch (err: any) {
        error.value = err.message || 'Gagal memuat data proposal';
        return listPengajuan.value;
      } finally {
        isLoading.value = false;
      }
    }

    /** Retrieve proposal detail aggregate */
    async function getProposalDetail(id: string | number): Promise<Proposal | null> {
      isLoading.value = true;
      error.value = null;
      try {
        const response = await proposalService.getById(id);
        if (response && response.data) {
          const item = response.data;
          const mappedDocs = (item.documents || []).map((d: any) => ({
            id: String(d.id),
            persyaratanId: d.document_type || '',
            tipeDokumen: d.document_type || '',
            namaFile: d.file_name || '',
            urlFile: d.file_url || '',
            ukuranBytes: parseInt(d.file_size) || 0,
            uploadedAt: d.created_at || '',
            isValid: true,
          }));

          const pekebunStore = usePekebunStore();
          pekebunStore.listPekebun = (item.pekebuns || []).map((p: any) => {
            const lahan = ((item.lahans || []).find((l: any) => Number(l.pekebun_id) === Number(p.id)) || {}) as any;
            return {
              id: String(p.id),
              kelembagaanId: p.kelembagaan_id || '',
              nik: p.nik || '',
              nama: p.name || p.nama || '',
              nomorKK: p.nomor_kk || p.nomorKK || '',
              statusPernikahan: p.marriage_status || 'BELUM_MENIKAH',
              tempatLahir: p.place_of_birth || '',
              tanggalLahir: p.date_of_birth || '',
              alamat: p.address || '',
              kodepos: p.postcode || '',
              nomorHP: p.phone_number || '',
              dokumen: (p.documents || []).map((d: any) => ({
                id: String(d.id),
                documentType: String(d.document_type || '').toUpperCase(),
                fileName: d.file_name || '',
                fileUrl: d.file_url || '',
                fileSize: Number(d.file_size) || 0,
                fileExtension: d.file_extension || d.mime_type || '',
              })),
              lahan: {
                id: String(lahan.id),
                pekebunId: String(p.id),
                jenisLegalitas: lahan.jenis_legalitas || '',
                nomorLegalitas: lahan.nomor_legalitas || '',
                luasLahan: lahan.luas_lahan || 0,
                scanLegalitasUrl: lahan.documents?.find((d: any) => d.document_type === 'scan_legalitas')?.file_url || '',
                coordinates: (lahan.coordinates || []).map((c: any) => ({ lat: Number(c.lat), lng: Number(c.lng) })),
                dokumen: (lahan.documents || []).map((d: any) => ({
                  id: String(d.id),
                  tipeDokumen: String(d.document_type || '').toUpperCase(),
                  fileName: d.file_name || '',
                  fileUrl: d.file_url || '',
                  mimeType: d.mime_type || '',
                  createdAt: d.created_at || '',
                })),
              } as any,
              isDraft: p.is_draft || false,
              createdAt: p.created_at || new Date().toISOString(),
            };
          }) as any;

          const rawRabProposal = (item as any).rab_proposal || (item as any).rabProposal || (item.rabs || []).find((r: any) => String(r.flag).toUpperCase() === 'PROPOSAL') || null;
          const rawRabFinal = (item as any).rab_final || (item as any).rabFinal || (item.rabs || []).find((r: any) => String(r.flag).toUpperCase() === 'FINAL') || null;

          function normalizeRabItemList(rawSource: any, fallbackItems?: any[]): any[] {
            if (!rawSource) return [];
            const rawList = Array.isArray(rawSource) ? rawSource : Array.isArray(rawSource.items) ? [rawSource] : [rawSource];

            const normalizedItems: any[] = [];

            rawList.forEach((r: any) => {
              if (!r) return;
              const itemList = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [r];
              itemList.forEach((it: any, idx: number) => {
                if (!it || typeof it !== 'object') return;
                const q1 = Number(it.details?.jumlahTahap1 ?? it.jumlah_tahap_1 ?? it.jumlahTahap1 ?? 0);
                const q2 = Number(it.details?.jumlahTahap2 ?? it.jumlah_tahap_2 ?? it.jumlahTahap2 ?? 0);
                const q3 = Number(it.details?.jumlahTahap3 ?? it.jumlah_tahap_3 ?? it.jumlahTahap3 ?? 0);
                const q4 = Number(it.details?.jumlahTahap4 ?? it.jumlah_tahap_4 ?? it.jumlahTahap4 ?? 0);
                const sumStages = q1 + q2 + q3 + q4;
                const vol = Number(it.volume ?? it.jumlah_total ?? it.jumlahTotal ?? (sumStages > 0 ? sumStages : 0));
                const harga = Number(it.price_per_unit ?? it.harga_satuan ?? it.hargaSatuan ?? 0);
                const subTotalCalculated = Number(it.total_price ?? it.sub_total ?? it.subTotal ?? vol * harga);
                let itemVarietas = it.details?.varietas ?? it.varietas ?? '';
                let itemVarietasCustom = it.details?.varietasCustom ?? it.details?.varietas_custom ?? it.varietasCustom ?? it.varietas_custom ?? '';

                if (!itemVarietas && fallbackItems && fallbackItems.length > 0) {
                  const fallbackMatch = fallbackItems.find((fb: any) => fb.uraian === it.uraian || fb.id === it.id) || fallbackItems[idx];
                  if (fallbackMatch) {
                    itemVarietas = fallbackMatch.varietas || fallbackMatch.details?.varietas || '';
                    itemVarietasCustom = fallbackMatch.varietasCustom || fallbackMatch.details?.varietasCustom || fallbackMatch.details?.varietas_custom || '';
                  }
                }

                normalizedItems.push({
                  id: String(it.id || Math.random().toString(36).slice(2)),
                  tahap: r.flag || it.tahap || 'Semua Tahap',
                  uraian: it.uraian || it.item_name || it.name || it.nama_barang || '',
                  volume: vol,
                  satuan: it.unit || it.satuan || '',
                  hargaSatuan: harga,
                  subTotal: subTotalCalculated,
                  jenis: it.details?.jenis || it.item_type || it.jenis || '',
                  varietas: itemVarietas,
                  varietasCustom: itemVarietasCustom,
                  spesifikasi: it.details?.spesifikasi || it.spesifikasi || '',
                  details: {
                    ...(it.details || {}),
                    jenis: it.details?.jenis || it.item_type || it.jenis || '',
                    varietas: itemVarietas,
                    varietasCustom: itemVarietasCustom,
                    jumlahTahap1: q1 || null,
                    jumlahTahap2: q2 || null,
                    jumlahTahap3: q3 || null,
                    jumlahTahap4: q4 || null,
                  },
                  jumlahTahap1: q1 || null,
                  jumlahTahap2: q2 || null,
                  jumlahTahap3: q3 || null,
                  jumlahTahap4: q4 || null,
                  jumlahTotal: vol,
                  unit: it.unit || it.satuan || '',
                  price_per_unit: harga,
                  total_price: subTotalCalculated,
                });
              });
            });

            return normalizedItems;
          }

          const rabProposalItems = normalizeRabItemList(rawRabProposal);
          const rabFinalItems = normalizeRabItemList(rawRabFinal, rabProposalItems);
          const combinedRabItems = rabFinalItems.length > 0 ? rabFinalItems : rabProposalItems.length > 0 ? rabProposalItems : normalizeRabItemList(item.rabItems || item.rabs);

          const mapped: Proposal = {
            ...item,
            id: String(item.id),
            nomorProposal: item.nomor_proposal || item.nomorProposal || '',
            nomor_proposal: item.nomor_proposal || item.nomorProposal || '',
            lembagaId: String(item.kelembagaan_id || ''),
            jenisSarpras: (item.paket_sarpras || item.jenisSarpras) as any,
            paket_sarpras: item.paket_sarpras || item.jenisSarpras,
            currentStatus: item.status || item.currentStatus,
            status: item.status || item.currentStatus,
            totalAnggaranPengajuan: item.total_anggaran ?? item.totalAnggaranPengajuan ?? 0,
            total_anggaran: item.total_anggaran ?? item.totalAnggaranPengajuan ?? 0,
            detailUsulan: item.detail_usulan || item.detailUsulan || '',
            detail_usulan: item.detail_usulan || item.detailUsulan || '',
            gudangSerahTerima: mapStorageArea(item.storage_area || item.gudangSerahTerima),
            storage_area: mapStorageArea(item.storage_area || item.gudangSerahTerima),
            daftarCPCL: mapDaftarCpcl(item),
            documents: item.documents || [],
            dokumen: mappedDocs,
            rabProposalItems,
            rabFinalItems,
            rabItems: combinedRabItems,
            rab_proposal: rawRabProposal
              ? {
                  ...rawRabProposal,
                  items: rabProposalItems,
                }
              : null,
            rab_final: rawRabFinal
              ? {
                  ...rawRabFinal,
                  items: rabFinalItems,
                }
              : null,
            createdAt: item.created_at || '',
            updatedAt: item.updated_at || '',
          };

          activePengajuan.value = mapped;

          const idx = listPengajuan.value.findIndex((p) => String(p.id) === String(mapped.id));
          if (idx >= 0) {
            listPengajuan.value[idx] = mapped;
          } else {
            listPengajuan.value.unshift(mapped);
          }

          return activePengajuan.value;
        }
      } catch (err: any) {
        error.value = err.message || 'Gagal memuat detail proposal';
      } finally {
        isLoading.value = false;
      }

      // Local fallback lookup
      const local = listPengajuan.value.find((p) => String(p.id) === String(id));
      if (local) {
        activePengajuan.value = local;
      }
      return activePengajuan.value;
    }

    /**
     * Sequential 3-step proposal creation:
     * 1. POST /proposals (create header, land plots, storage area)
     * 2. POST /proposals/:id/documents/bulk (bulk attach documents including SPTJM)
     * 3. POST /rabs (create budget plan with stage details)
     */
    async function createProposal(
      payload: CreateProposalPayload | CreateFullProposalPayload | FormData,
      documents?: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] | FormData,
      rab?: CreateRabPayload | { flag?: string; items: CreateRabItemPayload[] },
    ) {
      isLoading.value = true;
      error.value = null;
      try {
        let proposalPayload: CreateProposalPayload;
        let docsToCreate: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] | FormData | undefined;
        let rabToCreate: (CreateRabPayload | { flag?: string; items: CreateRabItemPayload[] }) | undefined;

        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
          const res = await proposalService.create(payload);
          return res.data;
        }

        if ('proposal' in payload && typeof payload.proposal === 'object') {
          proposalPayload = (payload as CreateFullProposalPayload).proposal;
          docsToCreate = (payload as CreateFullProposalPayload).documents ?? documents;
          rabToCreate = (payload as CreateFullProposalPayload).rab ?? rab;
        } else {
          proposalPayload = payload as CreateProposalPayload;
          docsToCreate = documents;
          rabToCreate = rab;
        }

        const authStore = useAuthStore();
        if (!proposalPayload.kelembagaan_id) {
          const authKId = (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ?? (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined);
          if (authKId) {
            proposalPayload.kelembagaan_id = authKId;
          }
        }

        if (proposalPayload.total_anggaran === undefined && rabToCreate?.items && rabToCreate.items.length > 0) {
          proposalPayload.total_anggaran = rabToCreate.items.reduce(
            (sum, item) => sum + (Number(item.volume) || 1) * (Number(item.price_per_unit) || 0),
            0
          );
        }

        // 1. Create Proposal via proposalService (auto-handles FormData if storage area files present)
        const res = await proposalService.create(proposalPayload);
        const createdProposal = res.data;
        const proposalId = createdProposal.id;

        // 2. Bulk create documents via proposalService
        const authUserId = authStore.user?.id ? Number(authStore.user.id) : undefined;
        if (proposalId && docsToCreate) {
          const hasDocs = (typeof FormData !== 'undefined' && docsToCreate instanceof FormData) || (Array.isArray(docsToCreate) && docsToCreate.length > 0);
          if (hasDocs) {
            try {
              if (authUserId) {
                if (typeof FormData !== 'undefined' && docsToCreate instanceof FormData) {
                  if (!docsToCreate.has('created_by')) docsToCreate.append('created_by', String(authUserId));
                  if (!docsToCreate.has('updated_by')) docsToCreate.append('updated_by', String(authUserId));
                  if (!docsToCreate.has('user_id')) docsToCreate.append('user_id', String(authUserId));
                } else if (Array.isArray(docsToCreate)) {
                  docsToCreate = docsToCreate.map((d: any) => ({
                    ...d,
                    created_by: d.created_by ?? authUserId,
                    updated_by: d.updated_by ?? authUserId,
                  }));
                }
              }
              await proposalService.bulkCreateDocuments(proposalId, docsToCreate);
            } catch (docErr) {
              console.warn('Gagal mengunggah dokumen proposal secara bulk:', docErr);
            }
          }
        }

        // 3. Create RAB via rabService
        if (proposalId && rabToCreate && rabToCreate.items && rabToCreate.items.length > 0) {
          try {
            await rabService.create({
              proposal_id: Number(proposalId),
              flag: rabToCreate.flag || 'PROPOSAL',
              items: rabToCreate.items,
            });
          } catch (rabErr: any) {
            console.error('Gagal membuat RAB proposal:', rabErr);
            throw new Error(`Proposal berhasil dibuat (${createdProposal.nomor_proposal}), namun gagal menyimpan data RAB: ${rabErr?.response?.data?.error?.message || rabErr?.message || 'Terjadi kesalahan sistem'}`);
          }
        }

        // Local state update
        const localProposal: Proposal = {
          id: String(createdProposal.id),
          nomor_proposal: createdProposal.nomor_proposal,
          nomorProposal: createdProposal.nomor_proposal,
          kelembagaan_id: String(proposalPayload.kelembagaan_id || 'LEM-101'),
          lembagaId: String(proposalPayload.kelembagaan_id || 'LEM-101'),
          lembaga: {
            id: String(proposalPayload.kelembagaan_id || 'LEM-101'),
            namaLembaga: 'Koperasi Tani Kelapa Sejahtera',
            jenisLembaga: 'KOPERASI',
            nomorAkta: 'AHU-0012345.AH.01.02.2024',
            nikKetua: '7301021508850001',
            namaKetua: 'Budi Santoso',
            telepon: '081234567890',
            alamatLengkap: 'Jl. Raya Perkebunan No. 12',
            kabupatenKode: '7322',
            provinsiKode: '73',
            namaBank: 'Bank BRI',
            nomorRekening: '1234-01-000567-53-1',
            namaPemilikRekening: 'Koperasi Tani Kelapa Sejahtera',
          },
          paket_sarpras: proposalPayload.paket_sarpras,
          jenisSarpras: proposalPayload.paket_sarpras as any,
          detail_usulan: proposalPayload.detail_usulan || '',
          detailUsulan: proposalPayload.detail_usulan || '',
          total_anggaran: (rabToCreate?.items || []).reduce((sum, item) => sum + (item.volume || 1) * (item.price_per_unit || 0), 0),
          totalAnggaranPengajuan: (rabToCreate?.items || []).reduce((sum, item) => sum + (item.volume || 1) * (item.price_per_unit || 0), 0),
          status: createdProposal.status || ProposalStatus.SUBMITTED,
          currentStatus: (createdProposal.status as any) || PengajuanStatus.SUBMITTED,
          storage_area: (proposalPayload.storage_area as StorageArea) || null,
          gudangSerahTerima: (proposalPayload.storage_area as StorageArea) || null,
          daftarCPCL: mapLocalDaftarCpcl(proposalPayload.lahan_ids),
          dokumen: [],
          documents: [],
          rabs: rabToCreate?.items
            ? [
                {
                  id: 'rab-' + Date.now(),
                  proposal_id: String(createdProposal.id),
                  flag: rabToCreate.flag || 'PROPOSAL',
                  items: rabToCreate.items.map((item, idx) => ({
                    id: 'rab-item-' + (idx + 1),
                    uraian: item.uraian,
                    volume: item.volume,
                    unit: item.unit,
                    satuan: item.unit,
                    price_per_unit: item.price_per_unit,
                    hargaSatuan: item.price_per_unit,
                    item_type: item.item_type || 'BARANG',
                    total_price: (item.volume || 1) * (item.price_per_unit || 0),
                    subTotal: (item.volume || 1) * (item.price_per_unit || 0),
                    details: item.details,
                  })),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]
            : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        listPengajuan.value.unshift(localProposal);
        activePengajuan.value = localProposal;

        return createdProposal;
      } catch (err: any) {
        error.value = err.message || 'Gagal membuat proposal';
        console.log(err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    }

    /** Update proposal via API */
    async function updateProposal(id: string | number, payload: UpdateProposalPayload | FormData) {
      isLoading.value = true;
      error.value = null;
      try {
        const res = await proposalService.update(id, payload);
        if (res && res.data) {
          await getProposalDetail(id);
        }
        return res.data;
      } finally {
        isLoading.value = false;
      }
    }

    /** Delete proposal via API */
    async function deleteProposal(id: string | number) {
      isLoading.value = true;
      error.value = null;
      try {
        const res = await proposalService.delete(id);
        listPengajuan.value = listPengajuan.value.filter((p) => String(p.id) !== String(id));
        return res.data;
      } finally {
        isLoading.value = false;
      }
    }

    /** Bulk create documents */
    async function bulkCreateProposalDocuments(proposalId: string | number, documents: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] | FormData) {
      return proposalService.bulkCreateDocuments(proposalId, documents);
    }

    /** Fetch proposal documents */
    async function fetchProposalDocuments(proposalId: string | number) {
      return proposalService.getDocuments(proposalId);
    }

    /** Sync attached documents / Bulk update proposal documents */
    async function syncProposalDocuments(proposalId: string | number, documents: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[] | FormData) {
      return proposalService.syncDocuments(proposalId, documents);
    }

    /** Update a single proposal document (PUT /proposals/{proposal_id}/documents/{id}) */
    async function updateProposalDocument(proposalId: string | number, documentId: string | number, payload: UpdateProposalDocumentPayload | FormData) {
      return proposalService.updateProposalDocument(proposalId, documentId, payload);
    }

    /** Update / Synchronize proposal documents (alias for syncProposalDocuments) */
    async function updateProposalDocuments(proposalId: string | number, documents: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[] | FormData) {
      return proposalService.syncDocuments(proposalId, documents);
    }

    async function getSpatialOverlap(id: string | number) {
      const strId = String(id);
      try {
        const res = await proposalService.getSpatialOverlap(id);
        const data = res?.data || res;
        if (data && (Array.isArray(data.active_polygons) || Array.isArray(data.other_proposals))) {
          spatialOverlap.value = data;
          spatialOverlapProposalId.value = strId;
          return data;
        }
        spatialOverlap.value = null;
        spatialOverlapProposalId.value = strId;
        return null;
      } catch (err) {
        console.warn('Gagal memuat spatial overlap:', err);
        spatialOverlap.value = null;
        spatialOverlapProposalId.value = strId;
        return null;
      }
    }

    async function bulkFarmerValidations(payload: any[]) {
      return proposalService.bulkFarmerValidations(payload);
    }

    async function bulkLandValidations(payload: any[]) {
      return proposalService.bulkLandValidations(payload);
    }

    function createPengajuan(payload: Partial<Proposal>) {
      const spka = generateSpkaNomor({
        bantuanTypeOrPackage: payload.jenisSarpras || 'EKSTENSIFIKASI',
        sequenceNumber: listPengajuan.value.length + 1,
      });
      const id = `REQ-2026-${String(listPengajuan.value.length + 1).padStart(3, '0')}`;
      const nomor_proposal = spka.nomorUsulan;
      const nomorProposal = spka.nomorUsulan;
      const newPengajuan: Proposal = {
        id,
        nomor_proposal,
        nomorProposal,
        kelembagaan_id: payload.lembaga?.id || 'LEM-NEW',
        lembagaId: String(payload.lembaga?.id || 'LEM-NEW'),
        lembaga: payload.lembaga as LembagaPengusul,
        paket_sarpras: String(payload.jenisSarpras || 'EKSTENSIFIKASI'),
        jenisSarpras: payload.jenisSarpras || JenisSarpras.BENIH_PUPUK,
        detail_usulan: payload.detailUsulan || payload.detail_usulan || '',
        detailUsulan: payload.detailUsulan || payload.detail_usulan || '',
        total_anggaran: payload.totalAnggaranPengajuan || payload.total_anggaran || 0,
        totalAnggaranPengajuan: payload.totalAnggaranPengajuan || payload.total_anggaran || 0,
        status: ProposalStatus.SUBMITTED,
        currentStatus: PengajuanStatus.SUBMITTED,
        daftarCPCL: payload.daftarCPCL || [],
        dokumen: payload.dokumen || [],
        documents: payload.documents || [],
        storage_area: mapStorageArea(payload.storage_area || payload.gudangSerahTerima) as StorageArea,
        gudangSerahTerima: mapStorageArea(payload.storage_area || payload.gudangSerahTerima) as StorageArea,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      listPengajuan.value.unshift(newPengajuan);
      return newPengajuan;
    }

    function updateStatus(id: string, newStatus: PengajuanStatus | ProposalStatus | string, catatan?: string) {
      const item = listPengajuan.value.find((p) => p.id === id);
      if (item) {
        item.currentStatus = newStatus;
        item.status = String(newStatus);
        if (catatan) item.catatanDinas = catatan;
        item.updatedAt = new Date().toISOString();
        item.updated_at = new Date().toISOString();
      }
    }

    const proposalDocumentValidations = ref<ProposalDocumentValidationResponse[]>([]);

    async function getProposalDocumentValidations(params?: ListProposalDocumentValidationQueryParams) {
      try {
        const response = await proposalService.getProposalDocumentValidations(params);
        const list = Array.isArray(response) ? response : Array.isArray((response as any)?.data) ? (response as any).data : [];
        proposalDocumentValidations.value = list;
        return list;
      } catch (err: any) {
        console.error('Gagal mengambil daftar validasi dokumen proposal:', err);
        return [];
      }
    }

    async function bulkProposalDocumentValidations(payload: CreateProposalDocumentValidationPayload[]) {
      try {
        return await proposalService.bulkProposalValidations(payload);
      } catch (err: any) {
        console.warn('Failed bulkProposalDocumentValidations API call:', err);
        return null;
      }
    }

    async function getFarmerDocumentValidations(params?: any) {
      try {
        return await proposalService.getFarmerDocumentValidations(params);
      } catch (err: any) {
        console.warn('Failed getFarmerDocumentValidations API call:', err);
        return null;
      }
    }

    async function getLandDocumentValidations(params?: any) {
      try {
        return await proposalService.getLandDocumentValidations(params);
      } catch (err: any) {
        console.warn('Failed getLandDocumentValidations API call:', err);
        return null;
      }
    }

    return {
      proposals: listPengajuan,
      listPengajuan,
      activeProposal: activePengajuan,
      activePengajuan,
      spatialOverlap,
      spatialOverlapProposalId,
      pagination,
      isLoading,
      error,
      // proposalDocumentValidations,
      fetchProposals,
      getProposalDetail,
      getSpatialOverlap,
      createProposal,
      updateProposal,
      deleteProposal,
      bulkCreateProposalDocuments,
      fetchProposalDocuments,
      syncProposalDocuments,
      updateProposalDocument,
      updateProposalDocuments,
      createPengajuan,
      updateStatus,
      bulkFarmerValidations,
      bulkLandValidations,
      bulkProposalDocumentValidations,
      // fetchProposalDocumentValidations,
      getProposalDocumentValidations,
      getFarmerDocumentValidations,
      getLandDocumentValidations,
    };
  },
  {
    persist: true,
  },
);
