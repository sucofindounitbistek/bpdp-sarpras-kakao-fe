export interface Role {
  id: 'PEMOHON' | 'DINAS_KAB' | 'DINAS_PROV' | 'DITJENBUN' | 'BPDPKS';
  name: string;
  description: string;
  allowedRoutes: string[];
}

export interface SimulatedUser {
  id: string | number;
  name: string;
  email: string;
  role: Role['id'];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CPCLPekebunLahan {
  id: string;
  namaPekebun: string;
  nik: string;
  noHp: string;
  luasLahanHa: number;
  statusSertifikat: 'SHM' | 'SKT' | 'Alas Hak' | 'Girik';
  noSertifikat: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  polygonCoordinates: [number, number][];
}

export interface ProposalSarpras {
  id: string;
  nomorUsulan: string;
  namaLembaga: string;
  jenisPaket: string;
  luasTotalHa: number;
  jumlahPekebun: number;
  tanggalPengajuan: string;
  status: 'Draft' | 'Diajukan ke Dinas Kab/Kota' | 'Rekomtek Kab/Kota' | 'Verifikasi Provinsi' | 'SK Ditjenbun' | 'Penyaluran BPDPKS' | 'Revisi Proposal';
  catatanRevisi?: string;
}

export interface VerificationRecord {
  id: string;
  proposalId: string;
  verifiedByRole: Role['id'];
  statusResult: 'Disetujui' | 'Dikembalikan (Revisi)' | 'Ditolak';
  nomorSuratRekomtek?: string;
  catatan: string;
  tanggalVerifikasi: string;
}

export interface DashboardMetricCard {
  label: string;
  value: string | number;
  change?: string;
  type: 'success' | 'warning' | 'info' | 'primary';
}
