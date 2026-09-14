// Pinia store: Modul Penyaluran & Pencairan Dana
// CLIENT-SIMULATED: backend belum menyediakan endpoint — lihat specs/074-penyaluran-pencairan-dana/contracts/backend-api.md
// Data disimulasikan penuh (persist localStorage) mengikuti preseden stores/penyaluranBarang.ts.
import { defineStore } from 'pinia';
import type {
  Pencairan,
  PencairanTahap,
  PKS3Pihak,
  Komparisi,
  PihakKomparisi,
  DokumenPencairan,
  VerifikasiRantai,
  TingkatVerifikasi,
  HasilVerifikasi,
  SuratPersetujuanPencairan,
  RiwayatPerbaikan,
  PengembalianDana,
  PenutupanRekening,
  NotifikasiEvent,
  TimelineEvent,
  ProposalRingkas,
  PencairanDivisiItem,
  RekeningTujuan,
  JenisPembelian,
  PeruntukanDana,
  KopSuratB,
  TipeDokumen,
  TargetRoleNotifikasi,
  TipeNotifikasi,
} from '@/types/penyaluranDana';
import { CHECKLIST_TEMPLATE_TAHAP, URUTAN_VERIFIKASI } from '@/types/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';

const nowIso = () => new Date().toISOString();

function seedKop(noPks: string, tglPks: string): KopSuratB {
  return {
    namaKp: 'Koperasi Produsen Kelapa Makmur Jaya',
    telpKantor: '0741-123456',
    emailKantor: 'sekretariat@makmurjaya.co.id',
    noSkDirut: 'SK-110/BPDPKS/DPP/2026',
    tglSkDirut: '2026-07-15',
    noPks,
    tglPks,
    namaKetua: 'H. Sudirman Santoso',
    hpKetua: '0812-9876-5432',
  };
}

const SEED_PROPOSALS: ProposalRingkas[] = [
  {
    id: 'PROP-2026-001',
    nomorProposal: 'SPKA106260001',
    namaKp: 'Koperasi Produsen Kelapa Makmur Jaya',
    pagu: 2000000000,
    luasHektar: 412.5,
    jumlahPekebun: 386,
    jumlahKK: 342,
    saldoPernyataan: 2000000000,
    noSkDirut: 'SK-110/BPDPKS/DPP/2026',
    tglSkDirut: '2026-07-15',
  },
  {
    id: 'PROP-2026-002',
    nomorProposal: 'SPKA106260002',
    namaKp: 'Koperasi Tani Kelapa Berkah Bersama',
    pagu: 1450000000,
    luasHektar: 268,
    jumlahPekebun: 251,
    jumlahKK: 233,
    saldoPernyataan: 1450000000,
    noSkDirut: 'SK-111/BPDPKS/DPP/2026',
    tglSkDirut: '2026-08-02',
  },
];

const SEED_PKS: PKS3Pihak[] = [
  {
    id: 'PKS-PROP-2026-001',
    proposalId: 'PROP-2026-001',
    noPksKp: 'PKS/KP/2026/088',
    noPksBpdp: 'PKS/BPDP/2026/091',
    noPksBank: 'PKS/BRI/2026/077',
    status: 'AKTIF',
    jadwalTtd: '2026-08-20T09:00:00Z',
    dokumenPksFile: 'PKS_3Pihak_SPKA106260001.doc',
    suratKuasaFile: 'Surat_Kuasa_MakmurJaya.pdf',
    kopSuratB: seedKop('PKS/BPDP/BRI/2026/041', '2026-08-20'),
    createdAt: '2026-08-01T08:00:00Z',
  },
];

const SEED_KOMPARISI: Komparisi[] = [
  {
    pksId: 'PKS-PROP-2026-001',
    pihak: 'A1_KP',
    payload: {
      noPks: 'PKS/KP/2026/088',
      penunjukkanKetua: 'SK Pengangkatan Ketua No. 07/KP-MJ/2025',
      legalitas: {
        namaKp: 'Koperasi Produsen Kelapa Makmur Jaya',
        aktaAtauSk: 'Akta Pendirian No. 12 Tahun 2019',
        instansiPengesahan: 'Kemenkumham RI',
        npwp: '82.145.667.8-214.000',
        ketuaNama: 'H. Sudirman Santoso',
        ketuaNik: '1571042008660001',
        alamat: 'Jl. Perkebunan Raya No. 7, Betara, Tanjung Jabung Barat, Jambi',
      },
    },
    submittedAt: '2026-08-05T02:11:00Z',
  },
  {
    pksId: 'PKS-PROP-2026-001',
    pihak: 'A2_BPDP',
    payload: { noPks: 'PKS/BPDP/2026/091', narasiBadanHukum: 'BPDP merupakan badan hukum publik yang dibentuk berdasarkan Peraturan Pemerintah No. 54 Tahun 2015 dan berkedudukan di Jakarta.' },
    submittedAt: '2026-08-06T04:30:00Z',
  },
  {
    pksId: 'PKS-PROP-2026-001',
    pihak: 'A3_BANK',
    payload: { noPks: 'PKS/BRI/2026/077', narasiBadanHukum: 'PT Bank Rakyat Indonesia (Persero) Tbk adalah bank umum milik negara yang berkedudukan di Jakarta.', noRekeningKp: '0123456789012' },
    submittedAt: '2026-08-07T07:05:00Z',
  },
];

const SEED_PERMOHONAN: Pencairan[] = [
  {
    id: 'PD-2026-001',
    nomorPermohonan: 'SRPR-KLPA/DANA/2026/001',
    idPenyaluranBasis: 'SPKA106260001',
    proposalId: 'PROP-2026-001',
    pksId: 'PKS-PROP-2026-001',
    jenisPembelian: 'PEMBELIAN',
    peruntukan: 'BENEFICIER',
    divisiItems: [
      { divisiId: 'DIV_01', nilaiPermohonan: 400000000 },
      { divisiId: 'DIV_06', nilaiPermohonan: 600000000 },
    ],
    rekeningTujuan: {
      namaRekening: 'Koperasi Produsen Kelapa Makmur Jaya',
      nomorRekening: '0123456789012',
      bankTujuan: 'BRI',
      skema: 'ONLINE_EKSTERNAL',
      alamat: 'Jl. Perkebunan Raya No. 7',
      kota: 'Tanjung Jabung Barat',
      kodepos: '37111',
      email: 'sekretariat@makmurjaya.co.id',
    },
    dataGenerated: {
      dataA: SEED_KOMPARISI[0].payload.legalitas!,
      dataB: seedKop('PKS/BPDP/BRI/2026/041', '2026-08-20'),
      pagu: 2000000000,
      luasHektar: 412.5,
      saldoPernyataan: 2000000000,
      sisaSaldo: 2000000000,
      namaPemohon: 'H. Sudirman Santoso',
      jabatanPemohon: 'Ketua KP',
      tanggalPermohonan: '2026-08-25',
      jumlahPekebun: 386,
      jumlahKK: 342,
      escrowNoRekening: '32010098765432',
      escrowBank: 'BRI',
    },
    status: 'DIPROSES_TAHAP1',
    createdAt: '2026-08-25T03:00:00Z',
    updatedAt: '2026-09-01T06:00:00Z',
  },
];

const SEED_TAHAP: PencairanTahap[] = [
  {
    id: 'TAHAP-PD-2026-001-1',
    pencairanId: 'PD-2026-001',
    tahap: 1,
    persen: 0.4,
    idPenyaluran: 'SPKA106260001.T1',
    nominal: 400000000,
    gateProgress: null,
    progressMonitoring: 0,
    status: 'DITRANSFER',
    escrow: {
      tahapId: 'TAHAP-PD-2026-001-1',
      odooSppNo: 'SPP-20260901-001',
      statusPembayaran: 'PAID',
      nominal: 400000000,
      rekeningEscrow: '32010098765432',
      bank: 'BRI',
      waktu: '2026-09-01T06:00:00Z',
    },
  },
  { id: 'TAHAP-PD-2026-001-2', pencairanId: 'PD-2026-001', tahap: 2, persen: 0.3, idPenyaluran: 'SPKA106260001.T2', nominal: 0, gateProgress: 0.7, progressMonitoring: 0.75, status: 'TERKUNCI' },
  { id: 'TAHAP-PD-2026-001-3', pencairanId: 'PD-2026-001', tahap: 3, persen: 0.3, idPenyaluran: 'SPKA106260001.T3', nominal: 0, gateProgress: 1.0, progressMonitoring: 0, status: 'TERKUNCI' },
];

const SEED_DOKUMEN: DokumenPencairan[] = ([1, 2, 3] as const).flatMap((n) =>
  CHECKLIST_TEMPLATE_TAHAP[n].map((t, i) => ({
    tahapId: `TAHAP-PD-2026-001-${n}`,
    jenis: t.jenis,
    tipeDokumen: t.tipeDokumen,
    required: t.required,
    // Tahap 1 (seed) lengkap terisi; Tahap 2/3 menunggu alur (pratinjau PKS & dokumen monitoring tersinkron saat proses)
    ...(n === 1
      ? { fileName: `Seed_${t.tipeDokumen}.pdf`, uploadedAt: `2026-08-2${(i % 9) + 1}T10:00:00Z`, uploadedBy: 'SEED' }
      : t.jenis === 'GENERATED'
        ? { fileName: `Generated_${t.tipeDokumen}.pdf`, uploadedAt: '2026-08-25T10:00:00Z', uploadedBy: 'SISTEM' }
        : {}),
  }))
);

const SEED_VERIFIKASI: VerifikasiRantai[] = URUTAN_VERIFIKASI.map((tingkat, i) => ({
  id: `VER-SEED-${i + 1}`,
  tahapId: 'TAHAP-PD-2026-001-1',
  tingkat,
  hasil: 'SESUAI',
  catatan: i === 3 ? 'Dokumen lengkap, VPD terbit' : undefined,
  vpdFile: tingkat === 'SCI_PUSAT' ? 'VPK_VPD_SPKA106260001_T1.pdf' : undefined,
  actor: 'SEED',
  actedAt: `2026-08-30T0${i + 1}:00:00Z`,
}));

const SEED_SURAT_PERSETUJUAN: SuratPersetujuanPencairan[] = [
  {
    tahapId: 'TAHAP-PD-2026-001-1',
    nomor: 'SPR-KLPA/DANA/2026/001',
    fileName: 'Surat_Persetujuan_SPKA106260001_T1.pdf',
    generatedAt: '2026-08-31T02:00:00Z',
    uploadedAt: '2026-08-31T03:00:00Z',
    uploadedBy: 'BPDP_VERIFIKATOR',
  },
];

const SEED_NOTIFIKASI: NotifikasiEvent[] = [
  ...SEED_PROPOSALS.flatMap((p) => [
    {
      id: `N-seed-skdirut-kp-${p.id}`,
      referensiId: p.id,
      tipe: 'SK_DIRUT_TERBIT' as TipeNotifikasi,
      targetRole: 'KELEMBAGAAN_PEKEBUN' as TargetRoleNotifikasi,
      judul: LOCALIZATION.penyaluranDana.notifikasi.skDirutTerbit,
      pesan: `${p.namaKp} — ${p.nomorProposal}`,
      createdAt: p.tglSkDirut + 'T08:00:00Z',
    },
    {
      id: `N-seed-skdirut-bank-${p.id}`,
      referensiId: p.id,
      tipe: 'SK_DIRUT_TERBIT' as TipeNotifikasi,
      targetRole: 'BANK_MITRA' as TargetRoleNotifikasi,
      judul: LOCALIZATION.penyaluranDana.notifikasi.skDirutTerbit,
      pesan: `${p.namaKp} — ${p.nomorProposal}`,
      createdAt: p.tglSkDirut + 'T08:00:00Z',
    },
  ]),
  {
    id: 'N-seed-dana-masuk-1',
    referensiId: 'PD-2026-001',
    tipe: 'DANA_MASUK_ESCROW',
    targetRole: 'KELEMBAGAAN_PEKEBUN',
    judul: LOCALIZATION.penyaluranDana.notifikasi.danaMasuk,
    pesan: 'SPKA106260001.T1 — Rp 400.000.000 masuk rekening escrow BRI',
    createdAt: '2026-09-01T06:00:00Z',
  },
];

const SEED_TIMELINE: TimelineEvent[] = [
  { id: 'TL-1', referensiId: 'PD-2026-001', aktor: 'KP', kejadian: 'Permohonan pencairan dibuat & diajukan (wizard)', waktu: '2026-08-25T03:00:00Z' },
  { id: 'TL-2', referensiId: 'PD-2026-001', aktor: 'SCI', kejadian: 'Verifikasi dokumen Pendok → Verdok → QC → Kantor Pusat (VPD terbit)', waktu: '2026-08-30T06:00:00Z' },
  { id: 'TL-3', referensiId: 'PD-2026-001', aktor: 'BPDP', kejadian: 'Staff review → Kadiv menyetujui → Surat Persetujuan terbit', waktu: '2026-08-31T03:00:00Z' },
  { id: 'TL-4', referensiId: 'PD-2026-001', aktor: 'BPDP', kejadian: 'Penyaluran tahap 1 (40%) diproses ke escrow — SPP-20260901-001', waktu: '2026-09-01T06:00:00Z' },
  { id: 'TL-5', referensiId: 'PD-2026-001', aktor: 'BANK', kejadian: 'Bank Mitra mengonfirmasi transfer — status DITRANSFER', waktu: '2026-09-01T09:00:00Z' },
];

export interface MonitoringReport {
  id: string;
  tahapId: string;
  progress: number; // 0–100
  verified: boolean;
  suratTugasFile?: string;
  laporanFile?: string;
  baMonitoringFile?: string;
  dokumentasiFile?: string;
  alasanTolak?: string;
  createdAt: string;
}

const SEED_MONITORING: MonitoringReport[] = [
  {
    id: 'MON-SEED-1',
    tahapId: 'TAHAP-PD-2026-001-2',
    progress: 75,
    verified: false,
    suratTugasFile: 'Surat_Tugas_T2.pdf',
    laporanFile: 'Laporan_E_Progress75.pdf',
    baMonitoringFile: 'BA_Monitoring_T2.pdf',
    dokumentasiFile: 'Dokumentasi_T2.zip',
    createdAt: '2026-09-02T05:00:00Z',
  },
];

export interface WizardDraft {
  proposalId: string;
  jenisPembelian: JenisPembelian;
  peruntukan: PeruntukanDana;
  divisiItems: PencairanDivisiItem[];
  rekeningTujuan: RekeningTujuan;
  suratTtdFile?: string;
  dokumenDFiles: string[];
  baFile?: string;
}

export const usePenyaluranDanaStore = defineStore('penyaluranDana', {
  state: () => ({
    proposals: SEED_PROPOSALS as ProposalRingkas[],
    pksList: SEED_PKS as PKS3Pihak[],
    komparisiList: SEED_KOMPARISI as Komparisi[],
    permohonanList: SEED_PERMOHONAN as Pencairan[],
    tahapList: SEED_TAHAP as PencairanTahap[],
    dokumenList: SEED_DOKUMEN as DokumenPencairan[],
    verifikasiList: SEED_VERIFIKASI as VerifikasiRantai[],
    suratPersetujuanList: SEED_SURAT_PERSETUJUAN as SuratPersetujuanPencairan[],
    riwayatPerbaikanList: [] as RiwayatPerbaikan[],
    monitoringReports: SEED_MONITORING as MonitoringReport[],
    pengembalianList: [] as PengembalianDana[],
    penutupanList: [] as PenutupanRekening[],
    notifikasiList: SEED_NOTIFIKASI as NotifikasiEvent[],
    timelineEvents: SEED_TIMELINE as TimelineEvent[],
    seq: { permohonan: 2, suratPersetujuan: 2, spp: 2, verifikasi: 10, notifikasi: 100, timeline: 10, riwayat: 1, monitoring: 2, pks: 2 },
    wizardDraft: null as WizardDraft | null,
  }),

  persist: true,

  getters: {
    totalPermohonanById: (state) => (pencairanId: string) => {
      const p = state.permohonanList.find((m) => m.id === pencairanId);
      if (!p) return 0;
      return p.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0);
    },
    eligibleProposals(state): ProposalRingkas[] {
      return state.proposals.filter((p) => {
        const pks = state.pksList.find((k) => k.proposalId === p.id);
        return pks?.status === 'AKTIF';
      });
    },
    pksByProposal: (state) => (proposalId: string) => state.pksList.find((k) => k.proposalId === proposalId),
    permohonanByProposal: (state) => (proposalId: string) => state.permohonanList.filter((m) => m.proposalId === proposalId),
    tahapByPermohonan: (state) => (pencairanId: string) =>
      [...state.tahapList].filter((t) => t.pencairanId === pencairanId).sort((a, b) => a.tahap - b.tahap),
    dokumenByTahap: (state) => (tahapId: string) => state.dokumenList.filter((d) => d.tahapId === tahapId),
    verifikasiByTahap: (state) => (tahapId: string) => state.verifikasiList.filter((v) => v.tahapId === tahapId).sort((a, b) => URUTAN_VERIFIKASI.indexOf(a.tingkat) - URUTAN_VERIFIKASI.indexOf(b.tingkat)),
    suratPersetujuanByTahap: (state) => (tahapId: string) => state.suratPersetujuanList.find((s) => s.tahapId === tahapId),
    monitoringByTahap: (state) => (tahapId: string) => state.monitoringReports.find((m) => m.tahapId === tahapId),
    timelineByPermohonan: (state) => (pencairanId: string) => [...state.timelineEvents].filter((t) => t.referensiId === pencairanId).sort((a, b) => a.waktu.localeCompare(b.waktu)),
    riwayatByPermohonan: (state) => (pencairanId: string) => state.riwayatPerbaikanList.filter((r) => r.referensiId === pencairanId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notifikasiByRole: (state) => (role: TargetRoleNotifikasi) => [...state.notifikasiList].filter((n) => n.targetRole === role).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    penutupanByProposal: (state) => (proposalId: string) => state.penutupanList.find((x) => x.proposalId === proposalId),
    statistikPermohonan(state) {
      const inProgress = state.permohonanList.filter((m) => m.status.startsWith('DIPROSES') || m.status === 'DIAJUKAN').length;
      const perluPerbaikan = state.tahapList.filter((t) => t.status === 'DITOLAK_PERBAIKAN').length + state.pengembalianList.filter((p) => p.status === 'DIKEMBALIKAN').length;
      const danaMasuk = state.tahapList.reduce((s, t) => s + (t.status === 'DITRANSFER' && t.escrow?.statusPembayaran === 'PAID' ? t.escrow.nominal : 0), 0);
      return { total: state.permohonanList.length, dalamProses: inProgress, perluPerbaikan, danaMasuk };
    },
    saldoEscrowTotal(state): number {
      return state.tahapList.reduce((s, t) => s + (t.escrow?.statusPembayaran === 'PAID' ? t.escrow.nominal : 0), 0);
    },
    proposalAntreanPks(state) {
      return state.proposals.filter((p) => !state.pksList.some((k) => k.proposalId === p.id));
    },
  },

  actions: {
    setWizardDraft(d: WizardDraft | null) {
      this.wizardDraft = d;
    },

    // ---------- helpers ----------
    pushTimeline(referensiId: string, aktor: string, kejadian: string) {
      this.timelineEvents.push({ id: `TL-${this.seq.timeline++}`, referensiId, aktor, kejadian, waktu: nowIso() });
    },
    pushNotif(referensiId: string, tipe: TipeNotifikasi, targetRole: TargetRoleNotifikasi, judul: string, pesan: string) {
      this.notifikasiList.push({ id: `N-${this.seq.notifikasi++}`, referensiId, tipe, targetRole, judul, pesan, createdAt: nowIso() });
    },
    pushRiwayat(referensiId: string, gerbang: string, catatan: string, aktor: string) {
      this.riwayatPerbaikanList.push({ id: `RW-${this.seq.riwayat++}`, referensiId, gerbang, catatan, aktor, createdAt: nowIso() });
    },

    // ---------- PKS 3 Pihak (US1) ----------
    prosesDokumenPks(proposalId: string): PKS3Pihak {
      const proposal = this.proposals.find((p) => p.id === proposalId);
      if (!proposal) throw new Error('Proposal tidak ditemukan');
      const existing = this.pksList.find((k) => k.proposalId === proposalId);
      if (existing) return existing;
      const pks: PKS3Pihak = {
        id: `PKS-${this.seq.pks++}-${proposalId}`,
        proposalId,
        status: 'DIPROSES',
        kopSuratB: { ...seedKop('', ''), namaKp: proposal.namaKp, noSkDirut: proposal.noSkDirut, tglSkDirut: proposal.tglSkDirut },
        createdAt: nowIso(),
      };
      this.pksList.push(pks);
      this.pushTimeline(proposalId, 'BPDP', 'Dokumen PKS 3 Pihak diproses (generate dokumen)');
      return pks;
    },
    submitKomparisi(pksId: string, pihak: PihakKomparisi, payload: Komparisi['payload']) {
      const pks = this.pksList.find((k) => k.id === pksId);
      if (!pks) throw new Error('PKS tidak ditemukan');
      const idx = this.komparisiList.findIndex((k) => k.pksId === pksId && k.pihak === pihak);
      const entry: Komparisi = { pksId, pihak, payload, submittedAt: nowIso() };
      if (idx >= 0) this.komparisiList[idx] = entry;
      else this.komparisiList.push(entry);
      if (pihak === 'A1_KP' && payload.noPks) pks.noPksKp = payload.noPks;
      if (pihak === 'A2_BPDP' && payload.noPks) pks.noPksBpdp = payload.noPks;
      if (pihak === 'A3_BANK' && payload.noPks) pks.noPksBank = payload.noPks;
      const lengkap = (['A1_KP', 'A2_BPDP', 'A3_BANK'] as PihakKomparisi[]).every((p) => this.komparisiList.some((k) => k.pksId === pksId && k.pihak === p));
      if (lengkap && pks.status === 'DIPROSES') pks.status = 'KOMPARISI';
      this.pushTimeline(pks.proposalId, pihak === 'A1_KP' ? 'KP' : pihak === 'A2_BPDP' ? 'BPDP' : 'BANK', `Komparisi ${pihak} disubmit`);
    },
    uploadSuratKuasa(pksId: string, fileName: string) {
      const pks = this.pksList.find((k) => k.id === pksId);
      if (!pks) throw new Error('PKS tidak ditemukan');
      pks.suratKuasaFile = fileName;
    },
    setJadwalTtd(pksId: string, jadwal: string) {
      const pks = this.pksList.find((k) => k.id === pksId);
      if (!pks) throw new Error('PKS tidak ditemukan');
      pks.jadwalTtd = jadwal;
      if (pks.status === 'KOMPARISI') pks.status = 'PENJADWALAN';
      this.pushTimeline(pks.proposalId, 'BPDP', 'Penjadwalan tanda tangan PKS 3 pihak');
      this.pushNotif(pks.proposalId, 'JADWAL_TTD', 'KELEMBAGAAN_PEKEBUN', LOCALIZATION.penyaluranDana.notifikasi.jadwalTtd, `${pks.kopSuratB.namaKp} — ${new Date(jadwal).toLocaleString('id-ID')}`);
      this.pushNotif(pks.proposalId, 'JADWAL_TTD', 'BANK_MITRA', LOCALIZATION.penyaluranDana.notifikasi.jadwalTtd, `${pks.kopSuratB.namaKp} — ${new Date(jadwal).toLocaleString('id-ID')}`);
    },
    uploadHasilTtd(pksId: string, fileName: string) {
      const pks = this.pksList.find((k) => k.id === pksId);
      if (!pks) throw new Error('PKS tidak ditemukan');
      pks.dokumenPksFile = fileName;
      if (pks.status === 'PENJADWALAN') pks.status = 'DITANDATANGANI';
      this.pushTimeline(pks.proposalId, 'BPDP', 'Hasil penandatanganan PKS diunggah');
    },
    konfirmasiPksAktif(pksId: string) {
      const pks = this.pksList.find((k) => k.id === pksId);
      if (!pks) throw new Error('PKS tidak ditemukan');
      if (pks.status === 'DITANDATANGANI') pks.status = 'AKTIF';
      this.pushTimeline(pks.proposalId, 'BPDP', 'PKS 3 Pihak berstatus AKTIF');
    },

    // ---------- Wizard Permohonan (US2) ----------
    nextNomorPermohonan(): string {
      return `SRPR-KLPA/DANA/${new Date().getFullYear()}/${String(this.seq.permohonan++).padStart(3, '0')}`;
    },
    nextIdPenyaluranBasis(proposal: ProposalRingkas): string {
      const count = this.permohonanList.filter((m) => m.proposalId === proposal.id).length;
      return count === 0 ? proposal.nomorProposal : `${proposal.nomorProposal}-M${count + 1}`;
    },
    createPermohonan(input: {
      proposalId: string;
      jenisPembelian: JenisPembelian;
      peruntukan: PeruntukanDana;
      divisiItems: PencairanDivisiItem[];
      rekeningTujuan: RekeningTujuan;
    }): Pencairan {
      const proposal = this.proposals.find((p) => p.id === input.proposalId);
      const pks = this.pksByProposal(input.proposalId);
      if (!proposal) throw new Error('Proposal tidak ditemukan');
      if (!pks || pks.status !== 'AKTIF') throw new Error('PKS 3 Pihak belum AKTIF');
      const total = input.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0);
      const terpakai = this.permohonanList.filter((m) => m.proposalId === proposal.id).reduce((s, m) => s + m.divisiItems.reduce((a, d) => a + d.nilaiPermohonan, 0), 0);
      const sisaSaldo = Math.max(proposal.saldoPernyataan - terpakai, 0);
      if (total > sisaSaldo) throw new Error(`Total nilai divisi melebihi sisa saldo (Rp ${sisaSaldo.toLocaleString('id-ID')})`);

      const pencairanId = `PD-${this.seq.permohonan.toString().padStart(3, '0')}-${proposal.id}`;
      const m: Pencairan = {
        id: pencairanId,
        nomorPermohonan: this.nextNomorPermohonan(),
        idPenyaluranBasis: this.nextIdPenyaluranBasis(proposal),
        proposalId: proposal.id,
        pksId: pks.id,
        jenisPembelian: input.jenisPembelian,
        peruntukan: input.peruntukan,
        divisiItems: input.divisiItems,
        rekeningTujuan: input.rekeningTujuan,
        dataGenerated: {
          dataA: this.komparisiList.find((k) => k.pksId === pks.id && k.pihak === 'A1_KP')?.payload.legalitas ?? {
            namaKp: proposal.namaKp,
            aktaAtauSk: '-',
            instansiPengesahan: '-',
            npwp: '-',
            ketuaNama: '-',
            ketuaNik: '-',
            alamat: '-',
          },
          dataB: pks.kopSuratB,
          pagu: proposal.pagu,
          luasHektar: proposal.luasHektar,
          saldoPernyataan: proposal.saldoPernyataan,
          sisaSaldo,
          namaPemohon: pks.kopSuratB.namaKetua,
          jabatanPemohon: 'Ketua KP',
          tanggalPermohonan: new Date().toISOString().slice(0, 10),
          jumlahPekebun: proposal.jumlahPekebun,
          jumlahKK: proposal.jumlahKK,
          escrowNoRekening: this.komparisiList.find((k) => k.pksId === pks.id && k.pihak === 'A3_BANK')?.payload.noRekeningKp ?? '-',
          escrowBank: '-',
        },
        status: 'DIAJUKAN',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      this.permohonanList.push(m);
      ([1, 2, 3] as const).forEach((n) => {
        const tahapId = `TAHAP-${m.id}-${n}`;
        this.tahapList.push({
          id: tahapId,
          pencairanId: m.id,
          tahap: n,
          persen: n === 1 ? 0.4 : 0.3,
          idPenyaluran: `${m.idPenyaluranBasis}.T${n}`,
          nominal: 0,
          gateProgress: n === 2 ? 0.7 : n === 3 ? 1.0 : null,
          progressMonitoring: 0,
          status: 'TERKUNCI',
        });
        CHECKLIST_TEMPLATE_TAHAP[n].forEach((tpl) => {
          this.dokumenList.push({
            tahapId,
            jenis: tpl.jenis,
            tipeDokumen: tpl.tipeDokumen,
            required: tpl.required,
            // Dokumen GENERATED tersedia otomatis oleh sistem (SK Dirut, Penelitian, Rekomtek)
            ...(tpl.jenis === 'GENERATED' ? { fileName: `Generated_${tpl.tipeDokumen}.pdf`, uploadedAt: nowIso(), uploadedBy: 'SISTEM' } : {}),
          });
        });
      });
      this.pushTimeline(m.id, 'KP', `Permohonan pencairan ${m.nomorPermohonan} dibuat & diajukan (total Rp ${total.toLocaleString('id-ID')})`);
      return m;
    },

    // ---------- Tahap & Escrow (US3/US5) ----------
    // DIAGRAM (FINAL Probis Penyaluran dan Pencairan Dana):
    // - Pengajuan tahap n≥2 hanya menunggu tahap n-1 selesai (DITRANSFER) — monitoring dilakukan SETELAH diajukan.
    // - Penyaluran ke escrow (input nominal + Odoo) dilakukan BPDP setelah dokumen diajukan, TIDAK menunggu rantai verifikasi.
    // - Rantai verifikasi SCI→BPDP + Surat Persetujuan mengatur PENCAIRAN (transfer Bank dari escrow ke rekening tujuan).
    isTahapUnlocked(pencairanId: string, n: 1 | 2 | 3): { unlocked: boolean; alasan?: string } {
      const tahapList = this.tahapByPermohonan(pencairanId);
      const t = tahapList.find((x) => x.tahap === n);
      if (!t) return { unlocked: false, alasan: 'Tahap tidak ditemukan' };
      if (n === 1) return { unlocked: t.status !== 'DITOLAK' };
      const prev = tahapList.find((x) => x.tahap === (n - 1) as 1 | 2);
      if (!prev || prev.status !== 'DITRANSFER') return { unlocked: false, alasan: `Tahap ${n - 1} belum selesai (DITRANSFER)` };
      return { unlocked: true };
    },
    checklistLengkap(tahapId: string): boolean {
      return this.dokumenByTahap(tahapId).filter((d) => d.required).every((d) => !!d.fileName);
    },
    uploadDokumenTahap(tahapId: string, tipeDokumen: TipeDokumen, fileName: string) {
      const d = this.dokumenList.find((x) => x.tahapId === tahapId && x.tipeDokumen === tipeDokumen);
      if (!d) throw new Error('Item checklist tidak ditemukan');
      d.fileName = fileName;
      d.uploadedAt = nowIso();
      d.uploadedBy = 'KP';
    },
    ajukanTahap(pencairanId: string, n: 1 | 2 | 3) {
      const t = this.tahapByPermohonan(pencairanId).find((x) => x.tahap === n);
      if (!t) throw new Error('Tahap tidak ditemukan');
      const gate = this.isTahapUnlocked(pencairanId, n);
      if (!gate.unlocked) throw new Error(gate.alasan ?? LOCALIZATION.penyaluranDana.toast.gateLocked);
      // FR-019: pratinjau PKS dari Tahap 1 (dapat diganti bila ada perubahan)
      if (n >= 2) {
        const t1 = this.tahapByPermohonan(pencairanId).find((x) => x.tahap === 1);
        const pksT1 = t1 ? this.dokumenList.find((d) => d.tahapId === t1.id && d.tipeDokumen === 'PKS_3PIHAK')?.fileName : undefined;
        const pksTarget = this.dokumenList.find((d) => d.tahapId === t.id && d.tipeDokumen === 'PKS_3PIHAK');
        if (pksTarget && !pksTarget.fileName && pksT1) {
          pksTarget.fileName = pksT1;
          pksTarget.uploadedAt = nowIso();
          pksTarget.uploadedBy = 'SISTEM (pratinjau T1)';
        }
      }
      if (n >= 2) {
        // DIAGRAM: pengajuan tahap n≥2 diajukan dengan Surat Permohonan "C"/"F";
        // dokumen pembayaran lengkap menyusul SETELAH monitoring diverifikasi (gate dana, bukan gate pengajuan).
        const surat = this.dokumenList.find((d) => d.tahapId === t.id && d.tipeDokumen === 'SURAT_PERMOHONAN');
        if (!surat?.fileName) throw new Error(LOCALIZATION.penyaluranDana.toast.perluSuratPermohonanTahap);
      } else if (!this.checklistLengkap(t.id)) throw new Error(LOCALIZATION.penyaluranDana.toast.checklistIncomplete);
      const m = this.permohonanList.find((x) => x.id === pencairanId)!;
      const total = this.totalPermohonanById(pencairanId);
      t.nominal = Math.round(total * t.persen);
      t.status = 'DIAJUKAN';
      const statusMap: Record<1 | 2 | 3, Pencairan['status']> = { 1: 'DIPROSES_TAHAP1', 2: 'DIPROSES_TAHAP2', 3: 'DIPROSES_TAHAP3' };
      m.status = m.status === 'DIAJUKAN' && n === 1 ? 'DIPROSES_TAHAP1' : statusMap[n];
      m.updatedAt = nowIso();
      this.pushTimeline(pencairanId, 'KP', `Tahap ${n} diajukan — ID Penyaluran ${t.idPenyaluran} (checklist lengkap)`);
    },
    resubmitTahap(pencairanId: string, n: 1 | 2 | 3) {
      const t = this.tahapByPermohonan(pencairanId).find((x) => x.tahap === n);
      if (!t || t.status !== 'DITOLAK_PERBAIKAN') throw new Error('Tahap tidak dalam status perbaikan');
      t.status = 'DIAJUKAN';
      this.pushTimeline(pencairanId, 'KP', `Tahap ${n} diajukan ulang setelah perbaikan`);
    },
    setNominalTahap(tahapId: string, nominal: number) {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      t.nominal = nominal;
    },

    // ---------- Verifikasi rantai (US4) ----------
    tingkatSebelumnyaSelesai(tahapId: string, tingkat: TingkatVerifikasi): boolean {
      const idx = URUTAN_VERIFIKASI.indexOf(tingkat);
      if (idx <= 0) return true;
      const prev = URUTAN_VERIFIKASI[idx - 1];
      return this.verifikasiList.some((v) => v.tahapId === tahapId && v.tingkat === prev && v.hasil === 'SESUAI');
    },
    verifikasiDokumen(tahapId: string, tingkat: TingkatVerifikasi, hasil: HasilVerifikasi, catatan?: string, actor = 'SCI') {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      if (!this.tingkatSebelumnyaSelesai(tahapId, tingkat)) throw new Error('Tingkat verifikasi sebelumnya belum selesai');
      if (hasil === 'TIDAK_SESUAI' && (!catatan || catatan.trim().length < 5)) throw new Error(LOCALIZATION.penyaluranDana.toast.catatanWajib);
      this.verifikasiList.push({ id: `VER-${this.seq.verifikasi++}`, tahapId, tingkat, hasil, catatan, actor, actedAt: nowIso() });
      if (hasil === 'TIDAK_SESUAI') {
        t.status = 'DITOLAK_PERBAIKAN';
        const m = this.permohonanList.find((x) => x.id === t.pencairanId)!;
        this.pushRiwayat(t.pencairanId, tingkat, catatan ?? '', actor);
        this.pushNotif(t.pencairanId, 'CATATAN_PERBAIKAN', 'KELEMBAGAAN_PEKEBUN', LOCALIZATION.penyaluranDana.notifikasi.catatanPerbaikan, `${m.nomorPermohonan} — Tahap ${t.tahap}: ${catatan ?? ''}`);
        this.pushTimeline(t.pencairanId, actor === 'BPDP' ? 'BPDP' : 'SCI', `Tahap ${t.tahap} dikembalikan untuk perbaikan (${tingkat}): ${catatan ?? ''}`);
      } else {
        if (tingkat === 'PENDOK') t.status = 'VERIF_SCI';
        if (tingkat === 'SCI_PUSAT') t.status = 'VERIF_BPDP';
        if (tingkat === 'BPDP_STAFF') t.status = 'VERIF_BPDP';
        if (tingkat === 'BPDP_KADIV') {
          t.status = 'DISETUJUI';
          const nomor = `SPR-KLPA/DANA/${new Date().getFullYear()}/${String(this.seq.suratPersetujuan++).padStart(3, '0')}`;
          this.suratPersetujuanList.push({ tahapId, nomor, generatedAt: nowIso() });
          this.pushNotif(t.pencairanId, 'PERSETUJUAN', 'BANK_MITRA', LOCALIZATION.penyaluranDana.notifikasi.persetujuan, `${t.idPenyaluran} — ${nomor}`);
          this.pushTimeline(t.pencairanId, 'BPDP', `Kadiv menyetujui — Surat Persetujuan ${nomor} ter-generate`);
        }
      }
    },
    uploadVpd(tahapId: string, fileName: string) {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      this.verifikasiList.push({ id: `VER-${this.seq.verifikasi++}`, tahapId, tingkat: 'SCI_PUSAT', hasil: 'SESUAI', catatan: 'VPD terunggah', vpdFile: fileName, actor: 'SCI_PUSAT', actedAt: nowIso() });
      this.pushTimeline(t.pencairanId, 'SCI', 'Laporan & Lampiran VPD terunggah — dokumen dipush ke Staff BPDP');
    },
    uploadSuratPersetujuan(tahapId: string, fileName: string) {
      const s = this.suratPersetujuanList.find((x) => x.tahapId === tahapId);
      if (!s) throw new Error('Surat Persetujuan belum ter-generate');
      s.fileName = fileName;
      s.uploadedAt = nowIso();
      s.uploadedBy = 'BPDP';
    },
    prosesPenyaluranEscrow(tahapId: string) {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      if (t.escrow) throw new Error(LOCALIZATION.penyaluranDana.toast.escrowSudahDiproses);
      // DIAGRAM: penyaluran ke escrow dilakukan setelah dokumen diajukan — tidak menunggu rantai verifikasi
      // (rantai verifikasi + Surat Persetujuan mengatur pencairan/transfer oleh Bank Mitra).
      if (!['DIAJUKAN', 'VERIF_SCI', 'VERIF_BPDP', 'DISETUJUI'].includes(t.status)) throw new Error(LOCALIZATION.penyaluranDana.toast.checklistIncomplete);
      if (!this.checklistLengkap(tahapId)) throw new Error(LOCALIZATION.penyaluranDana.toast.checklistIncomplete);
      if (t.tahap >= 2) {
        const mon = this.monitoringByTahap(tahapId);
        if (!mon || !mon.verified || (t.gateProgress && mon.progress / 100 < t.gateProgress)) {
          throw new Error(t.gateProgress === 0.7 ? LOCALIZATION.penyaluranDana.tahap.gate70 : LOCALIZATION.penyaluranDana.tahap.gate100);
        }
      }
      const m = this.permohonanList.find((x) => x.id === t.pencairanId)!;
      const spp = `SPP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.seq.spp++).padStart(3, '0')}`;
      t.escrow = {
        tahapId,
        odooSppNo: spp,
        statusPembayaran: 'PAID',
        nominal: t.nominal,
        rekeningEscrow: m.dataGenerated.escrowNoRekening,
        bank: m.dataGenerated.escrowBank === '-' ? 'BRI' : m.dataGenerated.escrowBank,
        waktu: nowIso(),
      };
      this.pushTimeline(t.pencairanId, 'BPDP', `Penyaluran tahap ${t.tahap} diproses ke escrow — ${spp} (status PAID)`);
      this.pushNotif(t.pencairanId, 'DANA_MASUK_ESCROW', 'KELEMBAGAAN_PEKEBUN', LOCALIZATION.penyaluranDana.notifikasi.danaMasuk, `${t.idPenyaluran} — Rp ${t.nominal.toLocaleString('id-ID')} masuk rekening escrow`);
    },
    konfirmasiTransferBank(tahapId: string) {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      if (t.status !== 'DISETUJUI') throw new Error('Tahap belum DISETUJUI');
      // DIAGRAM: Bank mentransfer setelah menerima (unggahan) Surat Persetujuan Pencairan Dana
      const s = this.suratPersetujuanByTahap(tahapId);
      if (!s?.fileName) throw new Error(LOCALIZATION.penyaluranDana.toast.suratPersetujuanBelumDiunggah);
      t.status = 'DITRANSFER';
      const m = this.permohonanList.find((x) => x.id === t.pencairanId)!;
      if (t.tahap === 3) m.status = 'SELESAI';
      m.updatedAt = nowIso();
      this.pushTimeline(t.pencairanId, 'BANK', `Bank Mitra mengonfirmasi transfer ke rekening tujuan (${m.rekeningTujuan.bankTujuan}) — status DITRANSFER`);
    },
    tolakFinal(tahapId: string, alasan: string) {
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!t) throw new Error('Tahap tidak ditemukan');
      t.status = 'DITOLAK';
      const m = this.permohonanList.find((x) => x.id === t.pencairanId)!;
      this.pushRiwayat(t.pencairanId, 'BPDP_KADIV', alasan, 'BPDP');
      this.pushNotif(t.pencairanId, 'PENOLAKAN', 'KELEMBAGAAN_PEKEBUN', LOCALIZATION.penyaluranDana.notifikasi.penolakan, `${m.nomorPermohonan} — Tahap ${t.tahap}: ${alasan}`);
    },

    // ---------- Monitoring lapangan (US5) ----------
    uploadSuratTugas(tahapId: string, fileName: string) {
      let mon = this.monitoringByTahap(tahapId);
      if (!mon) {
        mon = { id: `MON-${this.seq.monitoring++}`, tahapId, progress: 0, verified: false, createdAt: nowIso() };
        this.monitoringReports.push(mon);
      }
      mon.suratTugasFile = fileName;
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (t) this.pushTimeline(t.pencairanId, 'SCI', `Surat tugas kunjungan lapangan diunggah (${fileName})`);
    },
    uploadLaporanMonitoring(tahapId: string, progress: number, files: { laporan?: string; ba?: string; dokumentasi?: string }) {
      let mon = this.monitoringByTahap(tahapId);
      if (!mon) {
        mon = { id: `MON-${this.seq.monitoring++}`, tahapId, progress: 0, verified: false, createdAt: nowIso() };
        this.monitoringReports.push(mon);
      }
      mon.progress = progress;
      mon.laporanFile = files.laporan ?? mon.laporanFile;
      mon.baMonitoringFile = files.ba ?? mon.baMonitoringFile;
      mon.dokumentasiFile = files.dokumentasi ?? mon.dokumentasiFile;
      mon.verified = false;
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (t) {
        t.progressMonitoring = progress / 100;
        this.pushTimeline(t.pencairanId, 'SCI', `Laporan monitoring tahap ${t.tahap} terunggah — progres ${progress}%`);
      }
    },
    verifikasiMonitoring(tahapId: string, setuju: boolean, alasan?: string) {
      const mon = this.monitoringByTahap(tahapId);
      const t = this.tahapList.find((x) => x.id === tahapId);
      if (!mon || !t) throw new Error('Laporan monitoring tidak ditemukan');
      if (setuju) {
        mon.verified = true;
        t.progressMonitoring = mon.progress / 100;
        // Sinkron dokumen monitoring ke checklist tahap (SURAT_TUGAS, LAP_MON_SCI, BA_MON, DOK_KEGIATAN)
        const sync: Array<[string, string | undefined]> = [
          ['SURAT_TUGAS', mon.suratTugasFile],
          ['LAP_MON_SCI', mon.laporanFile],
          ['BA_MON', mon.baMonitoringFile],
          ['DOK_KEGIATAN', mon.dokumentasiFile],
        ];
        for (const [tipe, file] of sync) {
          if (!file) continue;
          const d = this.dokumenList.find((x) => x.tahapId === tahapId && x.tipeDokumen === tipe);
          if (d && !d.fileName) {
            d.fileName = file;
            d.uploadedAt = nowIso();
            d.uploadedBy = 'SISTEM (monitoring SCI)';
          }
        }
        this.pushTimeline(t.pencairanId, 'BPDP', `Verifikasi monitoring Ya — progres ${mon.progress}% tervalidasi, dokumen pembayaran tahap ${t.tahap} dapat dilengkapi`);
      } else {
        mon.verified = false;
        mon.alasanTolak = alasan ?? '';
        this.pushRiwayat(t.pencairanId, 'MONITORING', alasan ?? '', 'BPDP');
        this.pushNotif(t.pencairanId, 'CATATAN_PERBAIKAN', 'SURVEYOR_SCI', LOCALIZATION.penyaluranDana.notifikasi.catatanPerbaikan, `Laporan monitoring tahap ${t.tahap}: ${alasan ?? ''}`);
      }
    },

    // ---------- Pengembalian dana (US6) ----------
    ajukanPengembalian(proposalId: string, fileName: string) {
      const existing = this.pengembalianList.find((p) => p.proposalId === proposalId);
      if (existing && existing.status !== 'DIKEMBALIKAN') throw new Error('Pengembalian dana sudah ada untuk proposal ini');
      const entry: PengembalianDana = { proposalId, suratPermohonanFile: fileName, status: 'DIAJUKAN', createdAt: nowIso() };
      if (existing) Object.assign(existing, entry);
      else this.pengembalianList.push(entry);
      this.pushTimeline(proposalId, 'KP', 'Permohonan pengembalian dana diajukan');
    },
    telitiPengembalian(proposalId: string, lengkapSesuai: boolean, catatan: string) {
      const p = this.pengembalianList.find((x) => x.proposalId === proposalId);
      if (!p) throw new Error('Permohonan pengembalian tidak ditemukan');
      p.hasilPenelitian = catatan;
      if (lengkapSesuai) {
        p.status = 'SELESAI';
        p.suratPemberitahuanFile = `Surat_Pemberitahuan_Pengembalian_${proposalId}.pdf`;
        p.skPembatalanFile = `SK_Pembatalan_${proposalId}.pdf`;
        this.pushTimeline(proposalId, 'BPDP', 'Penelitian: Lengkap & Sesuai — Surat Pemberitahuan + SK Pembatalan terbit');
      } else {
        p.status = 'DIKEMBALIKAN';
        this.pushRiwayat(proposalId, 'PENGEMBALIAN_DANA', catatan, 'BPDP');
        this.pushNotif(proposalId, 'CATATAN_PERBAIKAN', 'KELEMBAGAAN_PEKEBUN', LOCALIZATION.penyaluranDana.notifikasi.catatanPerbaikan, `Pengembalian dana: ${catatan}`);
      }
    },
    resubmitPengembalian(proposalId: string, fileName: string) {
      const p = this.pengembalianList.find((x) => x.proposalId === proposalId);
      if (!p) throw new Error('Permohonan pengembalian tidak ditemukan');
      p.suratPermohonanFile = fileName;
      p.status = 'DIAJUKAN';
    },

    // ---------- Penutupan rekening (US7) ----------
    uploadBuktiSisaDana(proposalId: string, fileName: string) {
      let p = this.penutupanList.find((x) => x.proposalId === proposalId);
      if (!p) {
        p = { proposalId, gerbangSisaDanaSelesai: false, status: 'DIAJUKAN', createdAt: nowIso() };
        this.penutupanList.push(p);
      }
      p.buktiPencairanSisaDanaFile = fileName;
      p.gerbangSisaDanaSelesai = true;
      this.pushTimeline(proposalId, 'KP', 'Bukti pencairan sisa dana diunggah — gerbang penutupan rekening terbuka');
    },
    ajukanPenutupan(proposalId: string, fileName: string) {
      const p = this.penutupanList.find((x) => x.proposalId === proposalId);
      if (!p) throw new Error('Unggah bukti sisa dana terlebih dahulu');
      if (!p.gerbangSisaDanaSelesai) throw new Error('Gerbang pencairan sisa dana belum selesai');
      p.suratPenutupanFile = fileName;
      p.status = 'DIAJUKAN';
      this.pushTimeline(proposalId, 'KP', 'Surat permohonan penutupan rekening diajukan');
    },
    terimaPenutupanBpdp(proposalId: string) {
      const p = this.penutupanList.find((x) => x.proposalId === proposalId);
      if (!p) throw new Error('Permohonan penutupan tidak ditemukan');
      p.status = 'DITERIMA_BPDP';
      this.pushTimeline(proposalId, 'BPDP', 'BPDP menerima & meneruskan surat permohonan penutupan ke Bank Mitra');
      this.pushNotif(proposalId, 'PERSETUJUAN', 'BANK_MITRA', 'Surat Permohonan Penutupan Rekening diterima', `Proposal ${proposalId} — silakan proses penutupan rekening escrow`);
    },
    prosesPenutupanBank(proposalId: string) {
      const p = this.penutupanList.find((x) => x.proposalId === proposalId);
      if (!p) throw new Error('Permohonan penutupan tidak ditemukan');
      p.status = 'SELESAI';
      this.pushTimeline(proposalId, 'BANK', 'Bank Mitra memproses penutupan rekening escrow — SELESAI');
    },
  },
});
