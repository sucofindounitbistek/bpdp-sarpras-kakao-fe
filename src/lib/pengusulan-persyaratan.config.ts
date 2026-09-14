import { JenisSarpras, PaketSarprasOption, PersyaratanDokumen, PaketMinimumRule } from '@/types/pengusulan';

// T004: Static persyaratan config per paket sarpras
// CLIENT-SIMULATED: Real implementation fetches from GET /api/v1/pengusulan/persyaratan/:jenisSarpras

// ─── Per-Paket Persyaratan Definitions ───────────────────────────────────────

// const KTP = {
//   id: 'KTP',
//   nama: 'KTP',
//   formatDownloadUrl: null,
//   wajib: true,
// };

const LEGALITAS_KP = {
  id: 'LEGALITAS_KP',
  nama: 'Legalitas KP',
  formatDownloadUrl: null,
  wajib: true,
};

const SIMLUHTAN = {
  id: 'SIMLUHTAN',
  nama: 'Dokumen Penunjukan Ketua Kelembagaan Pekebun ',
  formatDownloadUrl: null,
  wajib: true,
};

// const LEGALITAS_LAHAN = {
//   id: 'LEGALITAS_LAHAN',
//   nama: 'Legalitas lahan',
//   formatDownloadUrl: '/templates/sporadik.docx',
//   wajib: true,
// };

// const SURAT_BEDA_NAMA = {
//   id: 'SURAT_BEDA_NAMA',
//   nama: 'Surat keterangan kepala desa jika legalitas lahan beda nama',
//   formatDownloadUrl: '/templates/surat-beda-nama.docx',
//   wajib: true,
// };

const GAMBAR_LAHAN = {
  id: 'GAMBAR_LAHAN',
  nama: 'Gambar lahan/kebun berkoordinat',
  formatDownloadUrl: null,
  wajib: true,
};

const RAB_RK = {
  id: 'RAB_RK',
  nama: 'Rencana Kerja',
  formatDownloadUrl: null,
  wajib: true,
};

const PERNYATAAN_LUAS = {
  id: 'PERNYATAAN_LUAS',
  nama: 'Pernyataan luas lahan dan umur tanaman',
  formatDownloadUrl: '/templates/pernyataan-luas.docx',
  wajib: true,
};

const REFERENSI_HARGA = {
  id: 'REFERENSI_HARGA',
  nama: 'Referensi harga dari penyedia',
  formatDownloadUrl: null,
  wajib: true,
};

const PERNYATAAN_TANPA_BAKAR = {
  id: 'PERNYATAAN_TANPA_BAKAR',
  nama: 'Pernyataan pembukaan lahan tanpa bakar',
  formatDownloadUrl: '/templates/pernyataan-tanpa-bakar.docx',
  wajib: true,
};

const DETAIL_PEKEBUN = {
  id: 'DETAIL_PEKEBUN',
  nama: 'Detail RAB Masing-Masing Pekebun',
  formatDownloadUrl: '/templates/detail-pekebun.xlsx',
  wajib: true,
};

const RAB_DETAIL = {
  id: 'RAB_DETAIL',
  nama: 'RAB Detail (Excel)',
  formatDownloadUrl: null,
  wajib: true,
};

const PERJANJIAN_KEMITRAAN = {
  id: 'PERJANJIAN_KEMITRAAN',
  nama: 'Perjanjian kerja sama kemitraan usaha',
  formatDownloadUrl: null,
  wajib: true,
};

const DOKUMEN_SID = {
  id: 'DOKUMEN_SID',
  nama: 'Dokumen SID',
  formatDownloadUrl: null,
  wajib: true,
};

const KELAYAKAN_UPH = {
  id: 'KELAYAKAN_UPH',
  nama: 'Surat pernyataan kelayakan usaha pendirian UPH',
  formatDownloadUrl: null,
  wajib: true,
};

const SHM_UPH = {
  id: 'SHM_UPH',
  nama: 'SHM/HGU/HGB untuk pengolahan hasil',
  formatDownloadUrl: null,
  wajib: true,
};

const IZIN_USAHA = {
  id: 'IZIN_USAHA',
  nama: 'Perizinan berusaha',
  formatDownloadUrl: null,
  wajib: true,
};

const STUDI_KELAYAKAN = {
  id: 'STUDI_KELAYAKAN',
  nama: 'Studi kelayakan',
  formatDownloadUrl: null,
  wajib: true,
};

const HASIL_PRODUKSI = {
  id: 'HASIL_PRODUKSI',
  nama: 'Pernyataan hasil produksi buah',
  formatDownloadUrl: '/templates/pernyataan-hasil-produksi.docx',
  wajib: true,
};

const KELOLA_ADMIN = {
  id: 'KELOLA_ADMIN',
  nama: 'Pernyataan kesanggupan mengelola administrasi dan manajerial',
  formatDownloadUrl: '/templates/pernyataan-kelola-admin.docx',
  wajib: true,
};

const BELUM_ADA_UPH = {
  id: 'BELUM_ADA_UPH',
  nama: 'Pernyataan berada di wilayah perkebunan swadaya yang belum ada usaha pengolahan hasil',
  formatDownloadUrl: '/templates/pernyataan-belum-uph.docx',
  wajib: true,
};

const HASIL_RAT = {
  id: 'HASIL_RAT',
  nama: 'Hasil RAT',
  formatDownloadUrl: null,
  wajib: true,
};

const BIAYA_OPERASIONAL = {
  id: 'BIAYA_OPERASIONAL',
  nama: 'Surat pernyataan kesanggupan membayar biaya operasional',
  formatDownloadUrl: '/templates/biaya-operasional.docx',
  wajib: true,
};

const FOTO_JALAN = {
  id: 'FOTO_JALAN',
  nama: 'Foto kondisi jalan sebelum pelaksanaan',
  formatDownloadUrl: null,
  wajib: true,
};

const RINCIAN_PEKERJAAN = {
  id: 'RINCIAN_PEKERJAAN',
  nama: 'Rincian pekerjaan',
  formatDownloadUrl: '/templates/rincian-pekerjaan.docx',
  wajib: true,
};

const JANGKA_WAKTU = {
  id: 'JANGKA_WAKTU',
  nama: 'Jangka waktu pelaksanaan',
  formatDownloadUrl: null,
  wajib: true,
};

const KURVA_S = {
  id: 'KURVA_S',
  nama: 'Kurva S',
  formatDownloadUrl: null,
  wajib: true,
};

const HARGA_SATUAN = {
  id: 'HARGA_SATUAN',
  nama: 'Harga satuan pengerjaan',
  formatDownloadUrl: null,
  wajib: true,
};

// const SURAT_KET_KADES = {
//   id: 'SURAT_KET_KADES',
//   nama: 'Surat Keterangan Kepala Desa',
//   formatDownloadUrl: null,
//   wajib: true,
// };

const COMMON = [
  LEGALITAS_KP,
  SIMLUHTAN,
  GAMBAR_LAHAN,
  RAB_RK,
  PERNYATAAN_LUAS,
  REFERENSI_HARGA,
  PERNYATAAN_TANPA_BAKAR,
  DETAIL_PEKEBUN,
];


function dedupe(docs: PersyaratanDokumen[]): PersyaratanDokumen[] {
  const seen = new Set<string>();
  return docs.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

const PERSYARATAN: Record<JenisSarpras, PersyaratanDokumen[]> = {
  [JenisSarpras.EKSTENSIFIKASI]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERNYATAAN_TANPA_BAKAR,
    DETAIL_PEKEBUN,
  ]),

  [JenisSarpras.INTENSIFIKASI]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    DETAIL_PEKEBUN,
  ]),

  [JenisSarpras.ALAT_PASCAPANEN]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
  ]),

  [JenisSarpras.UPH]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
    KELAYAKAN_UPH,
    SHM_UPH,
    IZIN_USAHA,
    STUDI_KELAYAKAN,
    HASIL_PRODUKSI,
    KELOLA_ADMIN,
    BELUM_ADA_UPH,
    HASIL_RAT,
    BIAYA_OPERASIONAL,
  ]),

  [JenisSarpras.UPH_1_JENIS]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
  ]),

  [JenisSarpras.UPH_MULTI_JENIS]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
    KELAYAKAN_UPH,
    SHM_UPH,
    IZIN_USAHA,
    STUDI_KELAYAKAN,
    HASIL_PRODUKSI,
    KELOLA_ADMIN,
    BELUM_ADA_UPH,
    HASIL_RAT,
    BIAYA_OPERASIONAL,
  ]),

  [JenisSarpras.JALAN_KEBUN]: dedupe([
    ...COMMON,
    DOKUMEN_SID,
    FOTO_JALAN,
    RINCIAN_PEKERJAAN,
    JANGKA_WAKTU,
    KURVA_S,
    HARGA_SATUAN,
    RAB_DETAIL,
  ]),

  [JenisSarpras.ALAT_ANGKUT_LANGSIR]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.GEROBAK_BERMOTOR]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.PIKAP]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.TRUK]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.MESIN_PERTANIAN]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.INFRASTRUKTUR_PASAR]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
    PERJANJIAN_KEMITRAAN,
  ]),

  [JenisSarpras.VERIFIKASI_TEKNIS]: dedupe([
    ...COMMON,
    REFERENSI_HARGA,
  ]),

  // legacy mapping
  [JenisSarpras.BENIH_PUPUK]: [],
  [JenisSarpras.ALSINTAN]: [],
  [JenisSarpras.JALAN_PERKEBUNAN]: [],
  [JenisSarpras.DRAINASE]: [],
  [JenisSarpras.UPH_KAKAO]: [],
};

export const PAKET_PERSYARATAN_CONFIG: Record<JenisSarpras, PersyaratanDokumen[]> = PERSYARATAN;

// ─── PAKET_OPTIONS: 9 selectable paket cards ─────────────────────────────────

export const PAKET_OPTIONS: PaketSarprasOption[] = [
  {
    id: JenisSarpras.EKSTENSIFIKASI,
    label: 'Ekstensifikasi (Benih, Pupuk, Pestisida)',
    icon: '🌱',
    description: 'Pengadaan benih kelapa hibrida unggul, pupuk, dan pestisida untuk perluasan area.',
    isPupuk: true,
    persyaratan: PERSYARATAN[JenisSarpras.EKSTENSIFIKASI],
  },
  {
    id: JenisSarpras.INTENSIFIKASI,
    label: 'Intensifikasi (Pupuk dan Pestisida)',
    icon: '🌿',
    description: 'Bantuan pupuk dan pestisida untuk peningkatan produktivitas kebun kelapa yang sudah ada.',
    isPupuk: true,
    persyaratan: PERSYARATAN[JenisSarpras.INTENSIFIKASI],
  },
  {
    id: JenisSarpras.ALAT_PASCAPANEN,
    label: 'Alat Pascapanen',
    icon: '🔧',
    description: 'Peralatan pengolahan hasil panen kelapa pasca panen, termasuk alat fermentasi dan pengeringan.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.ALAT_PASCAPANEN],
  },
  {
    id: JenisSarpras.UPH_1_JENIS,
    label: 'Unit Pengolahan Hasil (UPH) - 1 Jenis Produk',
    icon: '🏭',
    description: 'Pembangunan atau rehabilitasi UPH untuk menghasilkan 1 jenis produk.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.UPH_1_JENIS],
  },
  {
    id: JenisSarpras.UPH_MULTI_JENIS,
    label: 'Unit Pengolahan Hasil (UPH) - Multi-Jenis / Skala Besar',
    icon: '🏢',
    description: 'Pembangunan atau rehabilitasi UPH skala besar (multi-jenis produk / kapasitas >= 5000 kelapa).',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.UPH_MULTI_JENIS],
  },
  {
    id: JenisSarpras.JALAN_KEBUN,
    label: 'Jalan Kebun & Akses ke Jalan Umum / Pelabuhan',
    icon: '🛣️',
    description: 'Pembuatan atau perkerasan jalan produksi perkebunan kelapa untuk akses angkut hasil panen.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.JALAN_KEBUN],
  },
  {
    id: JenisSarpras.ALAT_ANGKUT_LANGSIR,
    label: 'Alat Angkut Langsir',
    icon: '🚜',
    description: 'Bantuan alat angkut langsir untuk memudahkan pengangkutan hasil panen kelapa dari kebun menuju titik pengumpulan hasil.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.ALAT_ANGKUT_LANGSIR],
  },
  {
    id: JenisSarpras.GEROBAK_BERMOTOR,
    label: 'Gerobak Bermotor',
    icon: '🛺',
    description: 'Bantuan gerobak bermotor untuk mendukung mobilisasi hasil panen kelapa pada area perkebunan dengan akses terbatas.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.GEROBAK_BERMOTOR],
  },
  {
    id: JenisSarpras.PIKAP,
    label: 'Alat Transportasi Pikap',
    icon: '🛻',
    description: 'Bantuan mobil pikap untuk pengangkutan hasil panen kelapa dari kebun ke penampungan.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.PIKAP],
  },
  {
    id: JenisSarpras.TRUK,
    label: 'Truk',
    icon: '🚚',
    description: 'Bantuan truk untuk mendukung pengangkutan hasil panen kelapa dalam jumlah besar menuju tempat pengolahan atau pemasaran.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.TRUK],
  },
  {
    id: JenisSarpras.MESIN_PERTANIAN,
    label: 'Mesin Pertanian',
    icon: '🚜',
    description: 'Bantuan mesin pertanian kelapa seperti mesin pemangkas, hand sprayer, dan kultivator.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.MESIN_PERTANIAN],
  },
  {
    id: JenisSarpras.INFRASTRUKTUR_PASAR,
    label: 'Infrastruktur Pasar',
    icon: '🏬',
    description: 'Pembangunan atau pengembangan infrastruktur pasar untuk mendukung pemasaran kelapa petani.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.INFRASTRUKTUR_PASAR],
  },
  {
    id: JenisSarpras.VERIFIKASI_TEKNIS,
    label: 'Verifikasi atau Penelusuran Teknis',
    icon: '🔍',
    description: 'Kegiatan verifikasi teknis dan penelusuran kondisi kebun untuk keperluan bantuan sarpras.',
    isPupuk: false,
    persyaratan: PERSYARATAN[JenisSarpras.VERIFIKASI_TEKNIS],
  },
];

export const PAKET_MINIMUM_REQUIREMENTS: Record<JenisSarpras, PaketMinimumRule | null> = {
  [JenisSarpras.EKSTENSIFIKASI]: { minimalPekebun: 20, minimalLuasHa: 3, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.INTENSIFIKASI]: { minimalPekebun: 20, minimalLuasHa: 3, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.ALAT_PASCAPANEN]: { minimalPekebun: 20, minimalLuasHa: 3, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.UPH]: { minimalPekebun: 40, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.UPH_1_JENIS]: { minimalPekebun: 20, minimalLuasHa: 5, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.UPH_MULTI_JENIS]: { minimalPekebun: 40, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.JALAN_KEBUN]: { minimalPekebun: 20, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.ALAT_ANGKUT_LANGSIR]: { minimalPekebun: 20, minimalLuasHa: 3, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.GEROBAK_BERMOTOR]: { minimalPekebun: 20, minimalLuasHa: 5, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.PIKAP]: { minimalPekebun: 25, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.TRUK]: { minimalPekebun: 25, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.MESIN_PERTANIAN]: { minimalPekebun: 20, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.INFRASTRUKTUR_PASAR]: { minimalPekebun: 40, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.VERIFIKASI_TEKNIS]: null,

  [JenisSarpras.BENIH_PUPUK]: null,
  [JenisSarpras.ALSINTAN]: null,
  [JenisSarpras.JALAN_PERKEBUNAN]: null,
  [JenisSarpras.DRAINASE]: null,
  [JenisSarpras.UPH_KAKAO]: null,
};

