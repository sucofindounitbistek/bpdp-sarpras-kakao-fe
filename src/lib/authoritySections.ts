/**
 * Authority & Government Tier Configuration for BPDP Document Verification
 * Defines institutional origins, responsibilities, visual badges, and document mappings.
 */

export type AuthorityTier = 'KABUPATEN' | 'PROVINSI' | 'DITJENBUN' | 'BPDP';

export interface AuthoritySectionMeta {
  id: AuthorityTier;
  title: string;
  roleLabel: string;
  description: string;
  badgeClass: string;
  headerBorderClass: string;
  iconName: 'Building2' | 'Compass' | 'Award' | 'FileCheck2';
}

export const AUTHORITY_CONFIG: Record<AuthorityTier, AuthoritySectionMeta> = {
  KABUPATEN: {
    id: 'KABUPATEN',
    title: 'Dinas Kabupaten / Kota',
    roleLabel: 'Dinas Kabupaten/Kota',
    description: 'Kewenangan verifikasi dokumen usulan, verifikasi lapangan, penetapan SK CPCL, dan RAB Final',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/80',
    headerBorderClass: 'border-l-4 border-l-blue-500',
    iconName: 'Building2',
  },
  PROVINSI: {
    id: 'PROVINSI',
    title: 'Dinas Provinsi',
    roleLabel: 'Dinas Provinsi',
    description: 'Kewenangan asistensi tingkat provinsi dan penerbitan Surat Pengantar SK CPCL ke Ditjenbun',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
    headerBorderClass: 'border-l-4 border-l-amber-500',
    iconName: 'Compass',
  },
  DITJENBUN: {
    id: 'DITJENBUN',
    title: 'Direktorat Jenderal Perkebunan (Ditjenbun)',
    roleLabel: 'Ditjenbun Kementan',
    description: 'Kewenangan verifikasi teknis nasional dan penerbitan Rekomendasi Teknis (REKOMTEK)',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80',
    headerBorderClass: 'border-l-4 border-l-indigo-500',
    iconName: 'Award',
  },
  BPDP: {
    id: 'BPDP',
    title: 'Badan Pengelola Dana Perkebunan (BPDP)',
    roleLabel: 'BPDP Verifikator / Approval',
    description: 'Kewenangan penelitian kepatuhan, penetapan kelayakan penyaluran dana, dan penerbitan SK Dirut',
    badgeClass: 'bg-emerald-50 text-[#066C2A] border-emerald-250 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80',
    headerBorderClass: 'border-l-4 border-l-[#066C2A]',
    iconName: 'FileCheck2',
  },
};

export const DOC_AUTHORITY_MAPPING: Record<string, AuthorityTier> = {
  rabFinal: 'KABUPATEN',
  skCpcl: 'KABUPATEN',
  baVerifikasi: 'KABUPATEN',
  baVerifikasiLapangan: 'KABUPATEN',
  suratPengantarProv: 'PROVINSI',
  rekomtek: 'DITJENBUN',
  kelayakan: 'BPDP',
};

export function getAuthorityConfig(tier: AuthorityTier): AuthoritySectionMeta {
  return AUTHORITY_CONFIG[tier] || AUTHORITY_CONFIG.KABUPATEN;
}

export function getAuthorityForDoc(docKey: string): AuthoritySectionMeta {
  const tier = DOC_AUTHORITY_MAPPING[docKey] || 'KABUPATEN';
  return getAuthorityConfig(tier);
}
