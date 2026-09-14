import type { DokumenPersyaratanItem } from '@/types/masterSarpras';
import { PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { JenisSarpras } from '@/types/pengusulan';

export interface UnifiedProposalDocItem {
  id: string; // Identifier unik / kode dokumen normal
  code: string; // Kode dokumen (e.g. SIMLUHTAN, GAMBAR_LAHAN)
  nama: string; // Judul tampilan dokumen
  isWajib: boolean; // Apakah dokumen wajib
  isFromMaster: boolean; // True jika dokumen terdaftar di master paket aktif
  formatDownloadUrl?: string | null;

  // Status berkas terunggah di proposal
  isUploaded: boolean;
  uploadedDocId?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;

  // Status verifikasi
  isValid?: boolean | null;
  validationNote?: string;
}

/**
 * Normalisasi string kode dokumen untuk perbandingan toleran (case-insensitive & tanpa underscore/strip).
 */
export function normalizeDocCode(code: string): string {
  if (!code) return '';
  return code.toUpperCase().replace(/[-_\s]/g, '');
}

/**
 * Memeriksa apakah tipe dokumen cocok berdasarkan kode dokumen atau alias umum.
 */
export function isDocMatch(codeA: string, codeB: string): boolean {
  const normA = normalizeDocCode(codeA);
  const normB = normalizeDocCode(codeB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Alias umum pemetaan dokumen pemohon
  const aliasMap: Record<string, string[]> = {
    SIMLUHTAN: ['SIMLUHTAN', 'PENUNJUKANKETUA', 'DOKUMENPENUNJUKANKETUAKELEMBAGAANPEKEBUN', 'SKKETUA'],
    GAMBARLAHAN: ['GAMBARLAHAN', 'GAMBARLAHANBERKOORDINAT', 'PETA', 'PETALAHAN', 'POLIGON'],
    RABRK: ['RABRK', 'RENCANAKERJA', 'RAB', 'RENCANAANGGARANBIAYA'],
    PERNYATAANLUAS: ['PERNYATAANLUAS', 'PERNYATAANLUASLAHAN', 'SURATPERNYATAANLUASLAHANDANUMURTANAMAN'],
    LEGALITASKP: ['LEGALITASKP', 'LEGALITASLEMBAGA', 'AKTA', 'AKTALEGALITAS', 'SKKEMENKUMHAM'],
    SPORADIK: ['SPORADIK', 'SURATKETERANGANKEPALADESA'],
    KTP: ['KTP', 'KTPPEKEBUN'],
    KK: ['KK', 'KARTUKELUARGA'],
    PROPOSAL: ['PROPOSAL', 'PROPOSALPENGAJUAN', 'DOKUMENPROPOSAL'],
  };

  for (const group of Object.values(aliasMap)) {
    const hasA = group.some((g) => normalizeDocCode(g) === normA);
    const hasB = group.some((g) => normalizeDocCode(g) === normB);
    if (hasA && hasB) return true;
  }

  return normA.includes(normB) || normB.includes(normA);
}

/**
 * Menggabungkan daftar persyaratan dari Master Paket dengan dokumen terunggah proposal (Union Strategy).
 * Dokumen lama yang terunggah tetapi tidak ada di master tetap ditampilkan sebagai 'Dokumen Tambahan / Riwayat Berkas'.
 */
export function resolveProposalRequirements(
  paketCode: string | undefined | null,
  proposalDocuments: any[] | undefined | null,
  masterPersyaratanList?: DokumenPersyaratanItem[] | null,
  fallbackStaticConfig?: boolean
): UnifiedProposalDocItem[] {
  const code = (paketCode || '').trim().toUpperCase();
  const rawDocs = Array.isArray(proposalDocuments) ? proposalDocuments : [];

  // 1. Ambil daftar master persyaratan
  let masterItems: Array<{
    code: string;
    nama: string;
    isWajib: boolean;
    formatDownloadUrl?: string | null;
  }> = [];

  if (masterPersyaratanList && masterPersyaratanList.length > 0) {
    masterItems = masterPersyaratanList.map((d) => ({
      code: d.dokumen_code || String(d.id),
      nama: d.nama,
      isWajib: d.is_wajib ?? true,
      formatDownloadUrl: d.format_download_url,
    }));
  } else if (fallbackStaticConfig !== false && code) {
    // Fallback ke static config jika master offline atau kosong
    const staticList = PAKET_PERSYARATAN_CONFIG[code as JenisSarpras] || [];
    masterItems = staticList.map((s) => ({
      code: s.id,
      nama: s.nama,
      isWajib: s.wajib ?? true,
      formatDownloadUrl: s.formatDownloadUrl,
    }));
  }

  const matchedUploadedDocIds = new Set<any>();
  const resolvedList: UnifiedProposalDocItem[] = [];

  // 2. Petakan dokumen master ke berkas terunggah
  for (const m of masterItems) {
    const uploaded = rawDocs.find((d) => {
      const docType = d.document_type || d.tipeDokumen || d.doc_type || '';
      return isDocMatch(docType, m.code) || isDocMatch(docType, m.nama);
    });

    if (uploaded) {
      matchedUploadedDocIds.add(uploaded.id || uploaded.file_id || uploaded.file_name);
    }

    resolvedList.push({
      id: m.code,
      code: m.code,
      nama: m.nama,
      isWajib: m.isWajib,
      isFromMaster: true,
      formatDownloadUrl: m.formatDownloadUrl,

      isUploaded: !!uploaded,
      uploadedDocId: uploaded?.id || uploaded?.file_id,
      fileName: uploaded?.file_name || uploaded?.fileName || uploaded?.file?.name || '',
      fileUrl: uploaded?.file_url || uploaded?.urlFile || uploaded?.file?.url || '',
      fileSize: uploaded?.file_size || uploaded?.ukuranBytes,
      mimeType: uploaded?.mime_type || uploaded?.mimeType,
      uploadedAt: uploaded?.created_at || uploaded?.uploadedAt,

      isValid: uploaded?.is_valid ?? uploaded?.isValid ?? null,
      validationNote: uploaded?.notes || uploaded?.note || '',
    });
  }

  // 3. Union: Sisipkan berkas terunggah yang TIDAK ada di master paket terkini
  // Dokumen institusi pemerintah (SK CPCL, BA, dsb) dikecualikan agar tidak bercampur dengan berkas pemohon
  const institutionalDocTypes = [
    'SK_CPCL',
    'SKCPCL',
    'SURAT_PENGANTAR_SK_CPCL',
    'SURATPENGANTAR',
    'SURAT_PENGANTAR',
    'BA_VERIFIKASI',
    'BAVERIFIKASI',
    'BERITA_ACARA_VERIFIKASI',
    'BERITA_ACARA_DOKUMEN',
    'BA_VERIFIKASI_LAPANGAN',
    'BAVERIFIKASILAPANGAN',
    'BERITA_ACARA_LAPANGAN',
    'REKOMTEK',
    'KEPUTUSAN_KELAYAKAN',
    'RAB_FINAL',
  ];

  for (const uploaded of rawDocs) {
    const docId = uploaded.id || uploaded.file_id || uploaded.file_name;
    const docType = (uploaded.document_type || uploaded.tipeDokumen || uploaded.doc_type || '').toUpperCase();

    // Lewati jika sudah terpetakan atau merupakan dokumen output instansi
    if (matchedUploadedDocIds.has(docId)) continue;
    if (institutionalDocTypes.some((t) => normalizeDocCode(t) === normalizeDocCode(docType))) continue;

    // Masukkan sebagai dokumen tambahan
    resolvedList.push({
      id: docType || `EXTRA-${docId}`,
      code: docType || 'DOKUMEN_TAMBAHAN',
      nama: formatDocLabel(docType || 'Dokumen Tambahan'),
      isWajib: false,
      isFromMaster: false,

      isUploaded: true,
      uploadedDocId: uploaded.id || uploaded.file_id,
      fileName: uploaded.file_name || uploaded.fileName || uploaded.file?.name || 'Berkas Terunggah',
      fileUrl: uploaded.file_url || uploaded.urlFile || uploaded.file?.url || '',
      fileSize: uploaded.file_size || uploaded.ukuranBytes,
      mimeType: uploaded.mime_type || uploaded.mimeType,
      uploadedAt: uploaded.created_at || uploaded.uploadedAt,

      isValid: uploaded.is_valid ?? uploaded.isValid ?? null,
      validationNote: uploaded.notes || uploaded.note || '',
    });
  }

  return resolvedList;
}

/**
 * Format string snake_case / code menjadi label yang ramah dibaca pengguna.
 */
export function formatDocLabel(code: string): string {
  if (!code) return '';
  return code
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
