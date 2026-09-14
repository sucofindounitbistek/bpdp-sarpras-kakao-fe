/**
 * Utility for standardized file naming across BPDP Sarpras Kelapa.
 * Format: [Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]
 */

export interface FileNamingContext {
  /**
   * Label atau kategori dokumen standar (misal: "Proposal Usulan", "RAB", "KTP", "SK CPCL")
   */
  documentLabel: string;

  /**
   * Sub-label opsional untuk kategori yang memiliki banyak berkas (misal: "Depan", "Dalam", "Bidang 1")
   */
  subLabel?: string;

  /**
   * Nomor proposal usulan (misal: "SPKA109260001").
   * Jika belum terbit (tahap draf), otomatis menggunakan "DRAFT".
   */
  proposalNumber?: string | null;

  /**
   * Nama lembaga pekebun pemohon (misal: "Koperasi Tani Makmur").
   */
  institutionName?: string | null;
}

export interface StandardizedFileResult {
  /**
   * Objek File baru dengan properti name yang telah distandarisasi
   */
  file: File;

  /**
   * Nama lengkap berkas standar termasuk ekstensi
   */
  fileName: string;

  /**
   * Ekstensi berkas dalam huruf kecil (tanpa titik)
   */
  extension: string;
}

/**
 * Membersihkan token dari karakter ilegal filesystem, spasi, dan tanda baca berulang.
 */
export function sanitizeToken(token: string | null | undefined, maxLength: number = 60, fallback: string = ''): string {
  if (!token) return fallback;

  const cleaned = token
    .trim()
    // Ganti karakter non-alfanumerik atau spasi dengan tanda hubung (-)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    // Satukan tanda hubung yang berurutan
    .replace(/-+/g, '-')
    // Hapus tanda hubung atau garis bawah di awal dan akhir
    .replace(/^[-_]+|[-_]+$/g, '');

  if (!cleaned) return fallback;

  // Batasi panjang string secara aman
  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength).replace(/[-_]+$/, '');
  }

  return cleaned;
}

/**
 * Membentuk nama berkas standar sesuai format:
 * [Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]
 *
 * @param file Objek File dari input berkas klien
 * @param context Konteks penamaan (label dokumen, no proposal, nama lembaga)
 */
export function formatStandardFileName(file: File, context: FileNamingContext): StandardizedFileResult {
  // 1. Ekstrak ekstensi berkas asli
  const originalName = file.name || '';
  const lastDotIndex = originalName.lastIndexOf('.');
  let extension = '';
  if (lastDotIndex !== -1 && lastDotIndex < originalName.length - 1) {
    extension = originalName.slice(lastDotIndex + 1).toLowerCase();
  }

  // 2. Bentuk segmen [Nama File]
  let rawLabel = context.documentLabel || 'Dokumen';
  if (context.subLabel && context.subLabel.trim()) {
    rawLabel = `${rawLabel}-${context.subLabel.trim()}`;
  }
  const namaFilePart = sanitizeToken(rawLabel, 50, 'Dokumen');

  // 3. Bentuk segmen [No Proposal] (fallback ke DRAFT jika belum ada)
  let noProposalPart = 'DRAFT';
  if (context.proposalNumber && context.proposalNumber.trim()) {
    noProposalPart = sanitizeToken(context.proposalNumber.trim().toUpperCase(), 35, 'DRAFT');
  }

  // 4. Bentuk segmen [Nama Kelembagaan Pekebun]
  const namaKelembagaanPart = sanitizeToken(context.institutionName, 50, 'Kelembagaan');

  // 5. Rangkai nama lengkap dengan pemisah underscore (_)
  const baseName = `${namaFilePart}_${noProposalPart}_${namaKelembagaanPart}`;
  const fullFileName = extension ? `${baseName}.${extension}` : baseName;

  // 6. Buat objek File baru dengan nama standar
  const standardizedFile = new File([file], fullFileName, {
    type: file.type,
    lastModified: file.lastModified,
  });

  return {
    file: standardizedFile,
    fileName: fullFileName,
    extension,
  };
}
