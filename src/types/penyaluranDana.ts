// Types: Modul Penyaluran & Pencairan Dana
// CLIENT-SIMULATED: backend belum menyediakan endpoint — lihat specs/074-penyaluran-pencairan-dana/contracts/backend-api.md

export type PihakKomparisi = 'A1_KP' | 'A2_BPDP' | 'A3_BANK';

export type StatusPks3Pihak = 'DIPROSES' | 'KOMPARISI' | 'PENJADWALAN' | 'DITANDATANGANI' | 'AKTIF';

export type JenisPembelian = 'PEMBELIAN' | 'REIMBURSEMENT' | 'UMK';

export type PeruntukanDana = 'BENEFICIER' | 'OPERASIONAL_KP';

export type SkemaTransfer = 'ONLINE_EKSTERNAL' | 'SKN_EKSTERNAL';

export type DivisiId = 'DIV_01' | 'DIV_02' | 'DIV_03' | 'DIV_04' | 'DIV_05' | 'DIV_06' | 'DIV_07' | 'DIV_08' | 'DIV_09' | 'DIV_10';

export const DIVISI_PEKERJAAN: DivisiId[] = [
  'DIV_01',
  'DIV_02',
  'DIV_03',
  'DIV_04',
  'DIV_05',
  'DIV_06',
  'DIV_07',
  'DIV_08',
  'DIV_09',
  'DIV_10',
];

export type StatusPermohonan = 'DRAFT' | 'DIAJUKAN' | 'DIPROSES_TAHAP1' | 'DIPROSES_TAHAP2' | 'DIPROSES_TAHAP3' | 'SELESAI' | 'DIBATALKAN';

export type StatusTahap = 'TERKUNCI' | 'DIAJUKAN' | 'VERIF_SCI' | 'VERIF_BPDP' | 'DISETUJUI' | 'DITRANSFER' | 'DITOLAK_PERBAIKAN' | 'DITOLAK';

export type TipeDokumen =
  | 'SK_DIRUT'
  | 'PENELITIAN_REKOMTEK'
  | 'REKOMTEK_CPCL_BA'
  | 'SURAT_PERMOHONAN'
  | 'PKS_3PIHAK'
  | 'KUITANSI'
  | 'SPTJM'
  | 'BA_PEMBAYARAN'
  | 'SURAT_KUASA'
  | 'RENCANA_PENGGUNAAN_RAB'
  | 'LAP_PENGGUNAAN'
  | 'LAP_KEMAJUAN'
  | 'LAP_MON_SCI'
  | 'BA_MON'
  | 'DOK_KEGIATAN'
  | 'DOK_D'
  | 'BA'
  | 'SURAT_TUGAS'
  | 'VPD'
  | 'SURAT_PERSETUJUAN'
  | 'BUKTI_SISA_DANA'
  | 'SURAT_PENUTUPAN'
  | 'SURAT_PENGEMBALIAN';

export type TingkatVerifikasi = 'PENDOK' | 'VERDOK' | 'QC' | 'SCI_PUSAT' | 'BPDP_STAFF' | 'BPDP_KADIV';

export const URUTAN_VERIFIKASI: TingkatVerifikasi[] = ['PENDOK', 'VERDOK', 'QC', 'SCI_PUSAT', 'BPDP_STAFF', 'BPDP_KADIV'];

export type HasilVerifikasi = 'SESUAI' | 'TIDAK_SESUAI';

export type StatusPengembalian = 'DIAJUKAN' | 'DITELITI' | 'DIKEMBALIKAN' | 'SELESAI';

export type StatusPenutupan = 'DIAJUKAN' | 'DITERIMA_BPDP' | 'DITERIMA_BANK' | 'SELESAI';

export type TipeNotifikasi = 'SK_DIRUT_TERBIT' | 'JADWAL_TTD' | 'CATATAN_PERBAIKAN' | 'PERSETUJUAN' | 'PENOLAKAN' | 'DANA_MASUK_ESCROW';

export type TargetRoleNotifikasi =
  | 'KELEMBAGAAN_PEKEBUN'
  | 'BPDP_VERIFIKATOR'
  | 'BPDP_STAFF'
  | 'BPDP_KADIV'
  | 'SURVEYOR_SCI'
  | 'BANK_MITRA';

export interface KopSuratB {
  namaKp: string;
  telpKantor: string;
  emailKantor: string;
  noSkDirut: string;
  tglSkDirut: string;
  noPks: string;
  tglPks: string;
  namaKetua: string;
  hpKetua: string;
}

export interface LegalitasKpData {
  namaKp: string;
  aktaAtauSk: string;
  instansiPengesahan: string;
  npwp: string;
  ketuaNama: string;
  ketuaNik: string;
  alamat: string;
}

export interface DataGeneratedPermohonan {
  dataA: LegalitasKpData;
  dataB: KopSuratB;
  pagu: number;
  luasHektar: number;
  saldoPernyataan: number;
  sisaSaldo: number;
  namaPemohon: string;
  jabatanPemohon: string;
  tanggalPermohonan: string;
  jumlahPekebun: number;
  jumlahKK: number;
  escrowNoRekening: string;
  escrowBank: string;
}

export interface PKS3Pihak {
  id: string;
  proposalId: string;
  noPksKp?: string;
  noPksBpdp?: string;
  noPksBank?: string;
  status: StatusPks3Pihak;
  jadwalTtd?: string;
  dokumenPksFile?: string;
  suratKuasaFile?: string;
  kopSuratB: KopSuratB;
  createdAt: string;
}

export interface Komparisi {
  pksId: string;
  pihak: PihakKomparisi;
  payload: {
    noPks?: string;
    narasiBadanHukum?: string;
    noRekeningKp?: string;
    legalitas?: LegalitasKpData;
    penunjukkanKetua?: string;
  };
  submittedAt: string;
}

export interface PencairanDivisiItem {
  divisiId: DivisiId;
  nilaiPermohonan: number;
}

export interface RekeningTujuan {
  namaRekening: string;
  nomorRekening: string;
  bankTujuan: string;
  skema: SkemaTransfer;
  alamat: string;
  kota: string;
  kodepos: string;
  email: string;
}

export interface Pencairan {
  id: string;
  nomorPermohonan: string;
  idPenyaluranBasis: string;
  proposalId: string;
  pksId: string;
  jenisPembelian: JenisPembelian;
  peruntukan: PeruntukanDana;
  divisiItems: PencairanDivisiItem[];
  rekeningTujuan: RekeningTujuan;
  dataGenerated: DataGeneratedPermohonan;
  status: StatusPermohonan;
  createdAt: string;
  updatedAt: string;
}

export interface DokumenPencairan {
  tahapId: string;
  jenis: 'GENERATED' | 'UPLOAD';
  tipeDokumen: TipeDokumen;
  required: boolean;
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface TransferEscrow {
  tahapId: string;
  odooSppNo: string;
  statusPembayaran: 'PENDING' | 'PAID';
  nominal: number;
  rekeningEscrow: string;
  bank: string;
  waktu: string;
}

export interface PencairanTahap {
  id: string;
  pencairanId: string;
  tahap: 1 | 2 | 3;
  persen: number;
  idPenyaluran: string;
  nominal: number;
  gateProgress: number | null;
  progressMonitoring: number;
  status: StatusTahap;
  escrow?: TransferEscrow;
}

export interface VerifikasiRantai {
  id: string;
  tahapId: string;
  tingkat: TingkatVerifikasi;
  hasil: HasilVerifikasi;
  catatan?: string;
  vpdFile?: string;
  actor: string;
  actedAt: string;
}

export interface SuratPersetujuanPencairan {
  tahapId: string;
  nomor: string;
  fileName?: string;
  generatedAt: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface RiwayatPerbaikan {
  id: string;
  referensiId: string;
  gerbang: string;
  catatan: string;
  aktor: string;
  createdAt: string;
}

export interface PengembalianDana {
  proposalId: string;
  suratPermohonanFile?: string;
  status: StatusPengembalian;
  hasilPenelitian?: string;
  suratPemberitahuanFile?: string;
  skPembatalanFile?: string;
  createdAt: string;
}

export interface PenutupanRekening {
  proposalId: string;
  buktiPencairanSisaDanaFile?: string;
  gerbangSisaDanaSelesai: boolean;
  suratPenutupanFile?: string;
  status: StatusPenutupan;
  createdAt: string;
}

export interface NotifikasiEvent {
  id: string;
  referensiId: string;
  tipe: TipeNotifikasi;
  targetRole: TargetRoleNotifikasi;
  judul: string;
  pesan: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  referensiId: string;
  aktor: string;
  kejadian: string;
  waktu: string;
}

export interface ChecklistTemplateItem {
  tipeDokumen: TipeDokumen;
  jenis: 'GENERATED' | 'UPLOAD';
  required: boolean;
}

const GENERATED_TAHAP: ChecklistTemplateItem[] = [
  { tipeDokumen: 'SK_DIRUT', jenis: 'GENERATED', required: true },
  { tipeDokumen: 'PENELITIAN_REKOMTEK', jenis: 'GENERATED', required: true },
  { tipeDokumen: 'REKOMTEK_CPCL_BA', jenis: 'GENERATED', required: true },
];

export const CHECKLIST_TEMPLATE_TAHAP: Record<1 | 2 | 3, ChecklistTemplateItem[]> = {
  1: [
    ...GENERATED_TAHAP,
    { tipeDokumen: 'SURAT_PERMOHONAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'PKS_3PIHAK', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'KUITANSI', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SPTJM', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'BA_PEMBAYARAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SURAT_KUASA', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'RENCANA_PENGGUNAAN_RAB', jenis: 'UPLOAD', required: true },
  ],
  2: [
    ...GENERATED_TAHAP,
    { tipeDokumen: 'PKS_3PIHAK', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SURAT_PERMOHONAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'KUITANSI', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SPTJM', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'BA_PEMBAYARAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_PENGGUNAAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_KEMAJUAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'RENCANA_PENGGUNAAN_RAB', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SURAT_TUGAS', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_MON_SCI', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'BA_MON', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'DOK_KEGIATAN', jenis: 'UPLOAD', required: true },
  ],
  3: [
    ...GENERATED_TAHAP,
    { tipeDokumen: 'PKS_3PIHAK', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SURAT_PERMOHONAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'KUITANSI', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SPTJM', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'BA_PEMBAYARAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_PENGGUNAAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_KEMAJUAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'DOK_KEGIATAN', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'SURAT_TUGAS', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'LAP_MON_SCI', jenis: 'UPLOAD', required: true },
    { tipeDokumen: 'BA_MON', jenis: 'UPLOAD', required: true },
  ],
};

export const BANK_MITRA_SEED = ['BCA', 'BRI', 'Bank Mandiri', 'BNI', 'Bank Jambi'];

export interface ProposalRingkas {
  id: string;
  nomorProposal: string;
  namaKp: string;
  pagu: number;
  luasHektar: number;
  jumlahPekebun: number;
  jumlahKK: number;
  saldoPernyataan: number;
  noSkDirut: string;
  tglSkDirut: string;
}
