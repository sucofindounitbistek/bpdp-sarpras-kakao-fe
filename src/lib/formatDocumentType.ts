export const EXCLUDED_VERIFIER_DOC_TYPES = [
  'SK_CPCL',
  'BERITA_ACARA_DOKUMEN',
  'BERITA_ACARA_LAPANGAN',
  'BA_DOKUMEN',
  'BA_LAPANGAN',
  'BERITA_ACARA_VERIFIKASI',
  'BERITA_ACARA_VERIFIKASI_LAPANGAN',
  'BA_VERIFIKASI',
  'BA_VERIFIKASI_LAPANGAN',
  'SURAT_KET_KADES',
];

export function formatDocumentTypeLabel(docType?: string | null): string {
  if (!docType) return '-';
  const type = docType.toUpperCase().trim();

  switch (type) {
    case 'LEGALITAS_KP':
    case 'KELEMBAGAAN':
    case 'DOKUMEN_LEGALITAS_KELEMBAGAAN':
      return 'Legalitas KP';

    case 'SIMLUHTAN':
    case 'DATA_PENUNJUKKAN_KETUA':
    case 'DATA_PENUNJUKAN_KETUA':
      return 'Dokumen Penunjukan Ketua Kelembagaan Pekebun';

    case 'GAMBAR_LAHAN':
    case 'GAMBAR_LAHAN_BERKOORDINAT':
      return 'Gambar lahan/kebun berkoordinat';

    case 'RAB_RK':
    case 'RENCANA_KERJA':
      return 'Rencana Kerja';

    case 'PERNYATAAN_LUAS':
    case 'PERNYATAAN_LUAS_LAHAN':
      return 'Pernyataan luas lahan dan umur tanaman';

    case 'REFERENSI_HARGA':
    case 'REFERENSI_HARGA_PENYEDIA':
      return 'Referensi harga dari penyedia';

    case 'PERNYATAAN_TANPA_BAKAR':
    case 'PEMBUKAAN_LAHAN_TANPA_BAKAR':
      return 'Pernyataan pembukaan lahan tanpa bakar';

    case 'DETAIL_PEKEBUN':
    case 'DETAIL_MASING_MASING_PEKEBUN':
      return 'Detail RAB Masing-Masing Pekebun';

    case 'RAB_PROPOSAL':
    case 'RAB_SIGNED':
    case 'RAB_DETAIL':
    case 'RAB':
      return 'Rencana Anggaran Biaya (RAB)';

    case 'PROPOSAL':
    case 'PROPOSAL_TEKNIS':
    case 'PROPOSAL_LEMBAGA':
      return 'Proposal Pengajuan Resmi';

    case 'AKTA_LEMBAGA':
    case 'AKTA':
      return 'Akta Kelembagaan';

    case 'KTP':
    case 'KTP_KETUA':
    case 'SCAN_KTP':
      return 'Scan KTP Ketua / Pengurus';

    case 'KK':
    case 'SCAN_KK':
      return 'Scan Kartu Keluarga (KK)';

    default:
      return type
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
