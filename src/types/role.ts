export interface RoleDetails {
  id: string;
  name: string;
  description: string;
  scope: string;
}

export const ROLE_DETAILS_MAP: Record<string, RoleDetails> = {
    KELEMBAGAAN_PEKEBUN: {
    id: 'KELEMBAGAAN_PEKEBUN',
    name: '',
    description: '',
    scope: 'Pekebun / Kelompok Tani / Koperasi',
  },
  DINAS_KAB: {
    id: 'DINAS_KAB',
    name: 'Dinas Kabupaten / Kota',
    description: 'Melakukan verifikasi berkas dan pemeriksaan lapangan terhadap data pekebun dan lahan yang dikirimkan oleh pemohon di tingkat regional kabupaten/kota.',
    scope: 'Regional Kabupaten / Kota',
  },
  DINAS_PROV: {
    id: 'DINAS_PROV',
    name: 'Dinas Provinsi',
    description: 'Melakukan validasi lanjutan di tingkat provinsi terhadap usulan yang sudah disetujui oleh Dinas Kabupaten/Kota sebelum diteruskan ke Ditjenbun.',
    scope: 'Regional Provinsi',
  },
  DITJENBUN_VERIFIKATOR: {
    id: 'DITJENBUN_VERIFIKATOR',
    name: 'Ditjenbun Verifikator',
    description: 'Melakukan asistensi, verifikasi kelengkapan berkas usulan kelompok tani, serta menyiapkan draf Rekomendasi Teknis (Rekomtek).',
    scope: 'Nasional / Asistensi Pusat',
  },
  DITJENBUN_APPROVAL: {
    id: 'DITJENBUN_APPROVAL',
    name: 'Ditjenbun Approval',
    description: 'Meninjau hasil asistensi verifikator, memberikan persetujuan akhir rekomtek, dan meneruskannya ke pihak BPDP.',
    scope: 'Nasional / Keputusan Pusat',
  },
  BPDP_VERIFIKATOR: {
    id: 'BPDP_VERIFIKATOR',
    name: 'BPDP Verifikator',
    description: 'Melakukan pemeriksaan kesesuaian berkas rekomtek dari Ditjenbun, menilai kelayakan kelengkapan, dan menyusun draf Surat Keputusan Direktur Utama.',
    scope: 'Nasional / Verifikator BPDP',
  },
  BPDP_APPROVAL: {
    id: 'BPDP_APPROVAL',
    name: 'BPDP Approval (Admin)',
    description: 'Meninjau kelayakan usulan, memberikan persetujuan SK Dirut, serta mengelola akun pengguna dan matriks hak akses peran.',
    scope: 'Nasional / Persetujuan BPDP & Admin',
  },
  BPDP_PPK: {
    id: 'BPDP_PPK',
    name: 'BPDP PPK',
    description: 'Pejabat Pembuat Komitmen pengadaan barang sarpras, penetapan jalur disposisi pengadaan dan kontrak.',
    scope: 'Penyaluran Barang / PPK',
  },
  BPDP_ULP: {
    id: 'BPDP_ULP',
    name: 'BPDP ULP',
    description: 'Unit Layanan Pengadaan barang sarpras kelapa melalui tender dan pemilihan vendor.',
    scope: 'Penyaluran Barang / ULP',
  },
  BPDP_STAFF: {
    id: 'BPDP_STAFF',
    name: 'BPDP Staff',
    description: 'Menerima dokumen pencairan dana beserta laporan/lampiran VPD dari SCI dan melakukan pemeriksaan awal sebelum persetujuan Kadiv.',
    scope: 'Pencairan Dana / Pemeriksaan',
  },
  BPDP_KADIV: {
    id: 'BPDP_KADIV',
    name: 'BPDP Kadiv',
    description: 'Memberikan persetujuan akhir pencairan dana (Ya/Tidak) dan menerbitkan Surat Persetujuan Pencairan Dana.',
    scope: 'Pencairan Dana / Persetujuan',
  },
  SURVEYOR_SCI: {
    id: 'SURVEYOR_SCI',
    name: 'Surveyor SCI',
    description:
      'Rantai verifikasi dokumen pencairan (sub-peran: Pendok, Verdok, QC, Kantor Pusat) serta monitoring lapangan tahap 2 dan 3 (laporan E/G).',
    scope: 'Pencairan Dana / Verifikasi Dokumen & Monitoring',
  },
  BANK_MITRA: {
    id: 'BANK_MITRA',
    name: 'Bank Mitra',
    description:
      'Mengisi komparisi A.3 (nomor rekening KP), menerima notifikasi Surat Persetujuan Pencairan Dana, mengonfirmasi transfer, dan memproses penutupan rekening escrow.',
    scope: 'Pencairan Dana / Bank Mitra',
  },
};
