import { getStatusLabel } from '@/types/pengusulan';

export type UserRole =
  | 'DINAS_KAB'
  | 'DINAS_PROV'
  | 'DITJENBUN'
  | 'DITJENBUN_VERIFIKATOR'
  | 'DITJENBUN_APPROVAL'
  | 'BPDP'
  | 'BPDP_VERIFIKATOR'
  | 'BPDP_APPROVAL'
  | string;

export function getRoleAwareStatusLabel(statusRaw?: string, role?: UserRole): string {
  if (!statusRaw) return '-';
  const status = String(statusRaw).toUpperCase().trim();
  const normalizedRole = String(role || '').toUpperCase().trim();

  // 1. DINAS KABUPATEN
  if (normalizedRole === 'DINAS_KAB') {
    switch (status) {
      case 'SUBMITTED':
        return 'Perlu Verifikasi';
      case 'REV_FROM_PROV':
        return 'Perlu Perbaikan';
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
        return 'Sedang Perbaikan di Pemohon';
      case 'KAB_SUBMITTED':
      case 'REKOMTEK_KAB_ISSUED':
        return 'Menunggu Verifikasi Provinsi';
      case 'REV_FROM_DITJEN_VERIF':
      case 'REV_FROM_DITJEN_APPR':
      case 'REV_FROM_BPDP_VERIF':
      case 'REV_FROM_BPDP_APPR':
        return 'Sedang Perbaikan';
      case 'PROV_SUBMITTED':
      case 'VALIDATED_PROV':
      case 'DITJEN_VERIF_SUBMITTED':
      case 'DITJEN_APPR_SUBMITTED':
        return 'Verifikasi Ditjenbun';
      case 'BPDP_VERIF_SUBMITTED':
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Verifikasi BPDP';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // 2. DINAS PROVINSI
  if (normalizedRole === 'DINAS_PROV') {
    switch (status) {
      case 'KAB_SUBMITTED':
      case 'REKOMTEK_KAB_ISSUED':
        return 'Perlu Verifikasi';
      case 'REV_FROM_DITJEN_VERIF':
      case 'PERBAIKAN_DINAS_PROV':
        return 'Perlu Perbaikan';
      case 'REV_FROM_PROV':
        return 'Sedang Perbaikan';
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
        return 'Sedang Perbaikan';
      case 'REV_FROM_DITJEN_APPR':
      case 'REV_FROM_BPDP_VERIF':
      case 'REV_FROM_BPDP_APPR':
        return 'Sedang Perbaikan';
      case 'SUBMITTED':
        return 'Verifikasi Dinas Kab/Kota';
      case 'PROV_SUBMITTED':
      case 'VALIDATED_PROV':
        return 'Menunggu Verifikasi Ditjenbun';
      case 'DITJEN_VERIF_SUBMITTED':
      case 'DITJEN_APPR_SUBMITTED':
        return 'Verifikasi Ditjenbun';
      case 'BPDP_VERIF_SUBMITTED':
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Verifikasi BPDP';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // 3. DITJENBUN VERIFIKATOR
  if (normalizedRole === 'DITJENBUN_VERIFIKATOR' || normalizedRole === 'DITJENBUN') {
    switch (status) {
      case 'PROV_SUBMITTED':
      case 'VALIDATED_PROV':
      case 'VERIFIKASI_DITJENBUN':
        return 'Perlu Verifikasi';
      case 'REV_FROM_DITJEN_APPR':
      case 'REV_FROM_BPDP_VERIF':
        return 'Perlu Perbaikan';
      case 'REV_FROM_PROV':
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
      case 'REV_FROM_DITJEN_VERIF':
      case 'REV_FROM_BPDP_APPR':
        return 'Sedang Perbaikan';
      case 'DITJEN_VERIF_SUBMITTED':
      case 'APPROVAL_DITJENBUN':
        return 'Menunggu Approval Ketua';
      case 'DITJEN_APPR_SUBMITTED':
      case 'VERIFIKASI_BPDP':
      case 'BPDP_VERIF_SUBMITTED':
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Verifikasi BPDP';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // 4. DITJENBUN APPROVAL
  if (normalizedRole === 'DITJENBUN_APPROVAL') {
    switch (status) {
      case 'DITJEN_VERIF_SUBMITTED':
      case 'APPROVAL_DITJENBUN':
        return 'Perlu Verifikasi';
      case 'REV_FROM_BPDP_VERIF':
        return 'Perlu Perbaikan';
      case 'REV_FROM_DITJEN_APPR':
        return 'Sedang Perbaikan';
      case 'REV_FROM_PROV':
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
      case 'REV_FROM_DITJEN_VERIF':
      case 'REV_FROM_BPDP_APPR':
        return 'Sedang Perbaikan';
      case 'PROV_SUBMITTED':
        return 'Verifikasi Ditjenbun';
      case 'DITJEN_APPR_SUBMITTED':
      case 'VERIFIKASI_BPDP':
      case 'BPDP_VERIF_SUBMITTED':
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Verifikasi BPDP';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // 5. BPDP VERIFIKATOR
  if (normalizedRole === 'BPDP_VERIFIKATOR' || normalizedRole === 'BPDP') {
    switch (status) {
      case 'DITJEN_APPR_SUBMITTED':
      case 'VERIFIKASI_BPDP':
        return 'Perlu Penelitian';
      case 'REV_FROM_BPDP_APPR':
        return 'Perlu Perbaikan';
      case 'REV_FROM_BPDP_VERIF':
        return 'Sedang Perbaikan di Ditjenbun';
      case 'REV_FROM_PROV':
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
      case 'REV_FROM_DITJEN_VERIF':
      case 'REV_FROM_DITJEN_APPR':
        return 'Sedang Perbaikan';
      case 'BPDP_VERIF_SUBMITTED':
      case 'APPROVAL_BPDP':
        return 'Menunggu Approval Kadiv';
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Penerbitan SK Dirut';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // 6. BPDP APPROVAL
  if (normalizedRole === 'BPDP_APPROVAL') {
    switch (status) {
      case 'BPDP_VERIF_SUBMITTED':
      case 'APPROVAL_BPDP':
        return 'Perlu Verifikasi';
      case 'REV_FROM_BPDP_APPR':
      case 'REV_FROM_BPDP_VERIF':
      case 'REV_FROM_PROV':
      case 'REV_FROM_KAB':
      case 'REVISION_ADMIN':
      case 'REV_FROM_DITJEN_VERIF':
      case 'REV_FROM_DITJEN_APPR':
        return 'Sedang Perbaikan';
      case 'DITJEN_APPR_SUBMITTED':
      case 'VERIFIKASI_BPDP':
        return 'Penelitian BPDP';
      case 'BPDP_APPR_SUBMITTED':
      case 'GENERATE_SK_DIRUT':
        return 'Penerbitan SK Dirut';
      case 'SK_DIRUT_PUBLISHED':
      case 'SK_DIRUT_ISSUED':
        return 'SK Dirut Terbit';
      case 'COMPLETED':
      case 'SELESAI':
        return 'Selesai';
      default:
        return getStatusLabel(status);
    }
  }

  // Fallback if role is unknown or generic
  if (status === 'REV_FROM_PROV' || status === 'REV_FROM_KAB' || status === 'REV_FROM_DITJEN_VERIF') {
    return 'Sedang Perbaikan';
  }

  return getStatusLabel(status);
}

export function getRoleAwareStatusVariant(statusRaw?: string, role?: UserRole): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' {
  const label = getRoleAwareStatusLabel(statusRaw, role);
  if (label.includes('Perlu Verifikasi') || label.includes('Perlu Penelitian') || label.includes('Perlu Approval')) {
    return 'info';
  }
  if (label.includes('Perlu Perbaikan')) {
    return 'warning';
  }
  if (label.includes('Sedang Perbaikan') || label.includes('Menunggu Perbaikan')) {
    return 'warning';
  }
  if (label.includes('Selesai') || label.includes('SK Dirut Terbit') || label.includes('Disetujui')) {
    return 'success';
  }
  if (label.includes('Menunggu')) {
    return 'info';
  }
  return 'secondary';
}
