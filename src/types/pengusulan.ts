import { LOCALIZATION } from '@/config/localization';
import { Coords, DokumenPekebun } from './pekebun';
import type { RabItem, RabProposal, CreateRabItemPayload, CreateRabPayload } from './rab';

export * from './rab';

// ─── Status & Role Enums ──────────────────────────────────────────────────────

export enum PengajuanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  KAB_SUBMITTED = 'KAB_SUBMITTED',
  REV_FROM_KAB = 'REV_FROM_KAB',
  REV_FROM_PROV = 'REV_FROM_PROV',
  PROV_SUBMITTED = 'PROV_SUBMITTED',
  REV_FROM_DITJEN_VERIF = 'REV_FROM_DITJEN_VERIF',
  DITJEN_VERIF_SUBMITTED = 'DITJEN_VERIF_SUBMITTED',
  DITJEN_APPR_SUBMITTED = 'DITJEN_APPR_SUBMITTED',
  REV_FROM_DITJEN_APPR = 'REV_FROM_DITJEN_APPR',
  BPDP_VERIF_SUBMITTED = 'BPDP_VERIF_SUBMITTED',
  REV_FROM_BPDP_APPR = 'REV_FROM_BPDP_APPR',
  BPDP_APPR_SUBMITTED = 'BPDP_APPR_SUBMITTED',
  SK_DIRUT_PUBLISHED = 'SK_DIRUT_PUBLISHED',
  SELESAI = 'SELESAI',
  SK_DIRUT_ISSUED = 'SK_DIRUT_ISSUED',
  REVISION_ADMIN = 'REVISION_ADMIN',
  VERIFIED_ADMIN = 'VERIFIED_ADMIN',
  VERIFIED_FIELD = 'VERIFIED_FIELD',
  REKOMTEK_KAB_ISSUED = 'REKOMTEK_KAB_ISSUED',
  VALIDATED_PROV = 'VALIDATED_PROV',
  SK_DITJENBUN_ISSUED = 'SK_DITJENBUN_ISSUED',
  PKS_BPDP_SIGNED = 'PKS_BPDP_SIGNED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  KAB_SUBMITTED = 'KAB_SUBMITTED',
  REV_FROM_KAB = 'REV_FROM_KAB',
  REV_FROM_PROV = 'REV_FROM_PROV',
  PROV_SUBMITTED = 'PROV_SUBMITTED',
  REV_FROM_DITJEN_VERIF = 'REV_FROM_DITJEN_VERIF',
  DITJEN_VERIF_SUBMITTED = 'DITJEN_VERIF_SUBMITTED',
  DITJEN_APPR_SUBMITTED = 'DITJEN_APPR_SUBMITTED',
  REV_FROM_DITJEN_APPR = 'REV_FROM_DITJEN_APPR',
  BPDP_VERIF_SUBMITTED = 'BPDP_VERIF_SUBMITTED',
  REV_FROM_BPDP_APPR = 'REV_FROM_BPDP_APPR',
  BPDP_APPR_SUBMITTED = 'BPDP_APPR_SUBMITTED',
  SK_DIRUT_PUBLISHED = 'SK_DIRUT_PUBLISHED',
  SELESAI = 'SELESAI',
  SK_DIRUT_ISSUED = 'SK_DIRUT_ISSUED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ─── Canonical JenisSarpras ──────────────────────────────────────────────────
export enum JenisSarpras {
  // Legacy values
  BENIH_PUPUK = 'BENIH_PUPUK',
  ALSINTAN = 'ALSINTAN',
  JALAN_PERKEBUNAN = 'JALAN_PERKEBUNAN',
  DRAINASE = 'DRAINASE',
  UPH_KAKAO = 'UPH_KAKAO',

  // Canonical 9-paket values
  EKSTENSIFIKASI = 'EKSTENSIFIKASI',
  INTENSIFIKASI = 'INTENSIFIKASI',
  ALAT_PASCAPANEN = 'ALAT_PASCAPANEN',
  UPH = 'UPH',
  JALAN_KEBUN = 'JALAN_KEBUN',
  ALAT_ANGKUT_LANGSIR = 'ALAT_ANGKUT_LANGSIR',
  GEROBAK_BERMOTOR = 'GEROBAK_BERMOTOR',
  TRUK = 'TRUK',
  MESIN_PERTANIAN = 'MESIN_PERTANIAN',
  INFRASTRUKTUR_PASAR = 'INFRASTRUKTUR_PASAR',
  VERIFIKASI_TEKNIS = 'VERIFIKASI_TEKNIS',

  // Tambahan
  UPH_1_JENIS = 'UPH_1_JENIS',
  UPH_MULTI_JENIS = 'UPH_MULTI_JENIS',
  PIKAP = 'PIKAP',
}

export enum UserRole {
  PEMOHON = 'PEMOHON',
  DINAS_KAB = 'DINAS_KAB',
  DINAS_PROV = 'DINAS_PROV',
  DITJENBUN = 'DITJENBUN',
  BPDPKS = 'BPDPKS',
}

// ─── Canonical Document Types ─────────────────────────────────────────────────

export type CanonicalDocumentType = 'SURAT_PERMOHONAN' | 'DOKUMEN_LEGALITAS_KELEMBAGAAN' | 'SURAT_PERNYATAAN_KEABSAHAN' | 'PROPOSAL_TEKNIS' | 'SPTJM' | 'DOKUMEN_PENDUKUNG' | 'RAB_PROPOSAL' | 'RAB_FINAL' | string;

export interface CreateProposalDocumentValidationPayload {
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string;
  validated_by_role?: string;
}

// ─── Existing & Contract Interfaces ──────────────────────────────────────────

export interface LembagaPengusul {
  id: string;
  namaLembaga: string;
  jenisLembaga: 'KOPERASI' | 'POKTAN' | 'GAPOKTAN';
  nomorAkta: string;
  nikKetua: string;
  namaKetua: string;
  telepon: string;
  alamatLengkap: string;
  kabupatenKode: string;
  provinsiKode: string;
  namaBank: string;
  nomorRekening: string;
  namaPemilikRekening: string;
}

export interface CoordinatePoint {
  order: number;
  lat: number | null;
  lng: number | null;
}

export interface LandBoundaryPolygon {
  points: CoordinatePoint[];
  isValid: boolean;
  validationMessages: string[];
}

export interface DataCPCL {
  id: string;
  pengajuanId?: string;
  namaPekebun: string;
  nik: string;
  nomorKK: string;
  luasLahanHektar: number;
  jenisHakLahan: 'SHM' | 'SKT' | 'STDB';
  nomorSuratLahan: string;
  coordinates: Coords[];
  dokumen?: DokumenPekebun[];
  documents?: DokumenPekebun[];
}

export interface DokumenPersyaratan {
  id: string;
  pengajuanId?: string;
  persyaratanId?: string;
  tipeDokumen:
    | 'KTP'
    | 'KK'
    | 'STDB'
    | 'PROPOSAL'
    | 'AKTA_LEMBAGA'
    | 'BAHV'
    | 'REKOMTEK'
    | 'SK_PENETAPAN'
    | 'PKS'
    | 'BAST'
    | 'LPJ'
    | 'LEGALITAS_KP'
    | 'SIMLUHTAN'
    | 'LEGALITAS_LAHAN'
    | 'SURAT_BEDA_NAMA'
    | 'GAMBAR_LAHAN'
    | 'RAB_RK'
    | 'PERNYATAAN_LUAS'
    | 'REFERENSI_HARGA'
    | 'PERNYATAAN_TANPA_BAKAR'
    | 'DETAIL_PEKEBUN'
    | 'RAB_DETAIL'
    | 'DOKUMEN_SID'
    | 'FOTO_JALAN'
    | 'PENUNJUKAN_KETUA'
    | CanonicalDocumentType;
  namaFile: string;
  urlFile: string;
  ukuranBytes: number;
  uploadedAt: string;
  isValid: boolean;
  catatanRevisi?: string;
  source?: 'IAM_SYNC' | 'MANUAL';
  isVerifiedFromIam?: boolean;
}

/** Storage Area entity matching backend contract and supporting wizard bindings */
export interface StorageArea {
  id?: number;
  proposal_id?: number;
  address?: string;
  coordinate?: string;
  interior_photo_file_id?: number | null;
  interior_photo_file_url?: string | null;
  exterior_photo_file_id?: number | null;
  exterior_photo_file_url?: string | null;
  coordinate_is_valid?: boolean | null;
  address_is_valid?: boolean | null;
  interior_photo_is_valid?: boolean | null;
  exterior_photo_is_valid?: boolean | null;

  // Frontend-compatibility aliases & file uploads
  alamat: string;
  koordinat: string;
  fotoTampakDepan?: DokumenUpload | null;
  fotoTampakDalam?: DokumenUpload | null;
  exterior_photo_file?: File | null;
  interior_photo_file?: File | null;
  interiro_photo_file?: File | null;
}

/** Alias for backward compatibility */
export type GudangSerahTerima = StorageArea;

/** Proposal Document attachment */
export interface ProposalDocument {
  id: number;
  proposal_id: number;
  file_id: number;
  document_type: CanonicalDocumentType;
  file_name: string;
  file_url: string;
  file_size: string | number;
  file_extension: string;
  mime_type: string;
  created_by?: number;
  updated_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
  uploadedBy?: string;
  uploaded_at?: string;
  uploaded_at_formatted?: string;
  uploadedAtFormatted?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProposalLahanDocumentResponse {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: string;
  file_extension: string;
  mime_type: string;
  created_at: string;
}

export interface ProposalLahanResponse {
  id: number;
  pekebun_id: number;
  jenis_legalitas: string;
  nomor_legalitas: string;
  tanggal_penerbitan_legalitas: string;
  luas_lahan: number;
  kode_provinsi: string;
  kode_kabupaten: string;
  kode_kecamatan: string;
  kode_desa: string;
  alamat_kebun: string;
  tahun_tanam: number;
  jenis_bibit: string;
  nomor_surat_beda_nama: string | null;
  coordinates: Array<{ lat: number; lng: number }>;
  documents: ProposalLahanDocumentResponse[];
  created_at: string;
  updated_at: string;
}

/** Proposal Aggregate interface (matching PROPOSAL_API_CONTRACT.md with backward compat) */
export interface Proposal {
  id: string;
  nomor_proposal: string;
  kelembagaan_id: number | string;
  paket_sarpras: string;
  total_luas_lahan?: number;
  total_pekebun?: number;
  detail_usulan: string;
  total_anggaran: number;
  no_rekomtek?: string | null;
  no_sk_dirut?: string | null;
  tanggal_sk_dirut?: string | null;
  bentuk_bantuan?: string | null;
  jumlah_pekebun?: number | null;
  status: string;
  is_draft?: boolean;
  nama_dinas_kabupaten?: string | null;
  no_surat_provinsi?: string | null;
  tgl_surat_provinsi?: string | null;
  nama_dinas_provinsi?: string | null;
  created_at: string;
  updated_at: string;

  storage_area?: StorageArea | null;
  documents?: ProposalDocument[];
  rabs?: RabProposal[];
  rab_proposal?: RabProposal | null;
  rab_final?: RabProposal | null;
  pekebuns?: any[];
  lahans?: ProposalLahanResponse[];

  // Backward compatibility aliases
  nomorProposal: string;
  lembagaId: string;
  lembaga: LembagaPengusul;
  jenisSarpras: JenisSarpras;
  isDraft?: boolean;
  detailUsulan: string;
  totalLuasLahan?: number;
  totalPekebun?: number;
  totalAnggaranPengajuan: number;
  currentStatus: PengajuanStatus | string;
  catatanDinas?: string;
  daftarCPCL: DataCPCL[];
  dokumen: DokumenPersyaratan[];
  gudangSerahTerima?: StorageArea | null;
  rabItems?: RabItem[];
  rabProposalItems?: RabItem[];
  rabFinalItems?: RabItem[];
  rabDitandatangani?: DokumenUpload | null;
  createdAt: string;
  updatedAt: string;
}

/** Backward compatibility alias */
export type PengajuanSarpras = Proposal;

export interface WorkflowHistoryLog {
  id: string;
  pengajuanId: string;
  statusFrom: PengajuanStatus;
  statusTo: PengajuanStatus;
  actorRole: UserRole;
  actorName: string;
  catatan?: string;
  timestamp: string;
}

// ─── Interfaces for 3-step wizard (006-pengusulan-baru-revamp) ───────────────

/** One item in the per-paket required-document list */
export interface PersyaratanDokumen {
  id: string;
  nama: string;
  formatDownloadUrl: string | null;
  wajib: boolean;
}

/** Selectable paket card metadata */
export interface PaketSarprasOption {
  id: JenisSarpras;
  label: string;
  icon: string;
  description: string;
  isPupuk: boolean;
  persyaratan: PersyaratanDokumen[];
}

/** An uploaded document stored client-side as dataUrl or fileId */
export interface DokumenUpload {
  id?: number | string;
  persyaratanId: string;
  namaFile: string;
  mimeType: string;
  ukuranBytes: number;
  dataUrl: string;
  uploadedAt: string;
  fileId?: number;
  file?: File;
  source?: 'IAM_SYNC' | 'MANUAL';
  fileUrl?: string;
  isVerifiedFromIam?: boolean;
  created_by?: number;
  updated_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
  uploadedBy?: string;
  uploaded_at?: string;
  uploaded_at_formatted?: string;
  uploadedAtFormatted?: string;
}

/** Per-lahan document ownership stored in draft store */
export interface LahanDokumenOwnership {
  jenisDokumen: 'SHM' | 'DOKUMEN_LAINNYA';
  nomorDokumen: string;
  jenisDokumenLainnya: string;
}

/** Minimum requirement rule for a single paket sarpras */
export interface PaketMinimumRule {
  minimalPekebun: number | null;
  minimalLuasHa: number | null;
  jarakAntarKebunKm: number | null;
  keterangan: string;
}

/** Result of minimum requirement validation check */
export interface Step3ValidationResult {
  isValid: boolean;
  totalPekebun: number;
  totalLuasHa: number;
  minimalPekebun: number | null;
  minimalLuasHa: number | null;
  pekebunDefisit: number;
  luasDefisit: number;
  jarakAntarKebunKm: number | null;
  message: string;
}

export type Step2ValidationResult = Step3ValidationResult;

/** Complete draft state for the 3-step wizard */
export interface PengusulanDraftState {
  selectedPaket: JenisSarpras | null;
  dokumenUploads: DokumenUpload[];
  storage_area: StorageArea | null;
  gudangSerahTerima: StorageArea | null;
  rabItems: RabItem[];
  rabDitandatangani: DokumenUpload | null;
  selectedPekebunIds: string[];
  selectedLahanIds: string[];
  currentStep: 1 | 2 | 3;
  stepValidation: {
    step1Valid: boolean;
    step2Valid: boolean;
  };
}

// ─── API Payloads & Envelopes ─────────────────────────────────────────────────

export interface CreateProposalPayload {
  kelembagaan_id: number;
  paket_sarpras: string;
  nomor_proposal?: string;
  detail_usulan?: string;
  no_rekomtek?: string;
  bentuk_bantuan?: string;
  status?: string;
  is_draft?: boolean;
  total_anggaran?: number;
  lahan_ids?: number[];
  storage_area?:
    | {
        address?: string;
        coordinate?: string;
        alamat?: string;
        koordinat?: string;
        interior_photo_file_id?: number | null;
        exterior_photo_file_id?: number | null;
        exterior_photo_file?: File | null;
        interior_photo_file?: File | null;
        fotoTampakDepan?: DokumenUpload | null;
        fotoTampakDalam?: DokumenUpload | null;
      }
    | StorageArea
    | null;
}

export interface SubmitProposalResponse {
  id: number;
  nomor_proposal: string;
  status: string;
  submitted_at: string;
}

export interface CreateFullProposalPayload {
  proposal: CreateProposalPayload;
  documents?: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] | FormData;
  rab?:
    | {
        flag?: string;
        items: CreateRabItemPayload[];
      }
    | CreateRabPayload;
}

export interface UpdateProposalPayload {
  paket_sarpras?: string;
  detail_usulan?: string;
  nomor_proposal?: string;
  no_rekomtek?: string;
  bentuk_bantuan?: string;
  status?: string;
  is_draft?: boolean;
  total_anggaran?: number;
  notes?: string;
  catatan?: string;
  lahan_ids?: number[];
  storage_area?:
    | StorageArea
    | {
        address?: string;
        coordinate?: string;
        alamat?: string;
        koordinat?: string;
        interior_photo_file_id?: number | null;
        exterior_photo_file_id?: number | null;
        exterior_photo_file?: File | null;
        interior_photo_file?: File | null;
        fotoTampakDepan?: DokumenUpload | null;
        fotoTampakDalam?: DokumenUpload | null;
      }
    | null;
}

export interface SyncProposalDocumentItem {
  file_id?: number;
  document_type: string;
  file?: File | null;
  file_header?: File | null;
  fileHeader?: File | null;
  created_by?: number;
  updated_by?: number;
}

export interface BulkCreateDocumentItem {
  file_id?: number;
  document_type: string;
  file?: File | null;
  file_header?: File | null;
  fileHeader?: File | null;
  created_by?: number;
  updated_by?: number;
}

export interface BulkCreateDocumentsRequest {
  documents: BulkCreateDocumentItem[];
  created_by?: number;
  updated_by?: number;
}

export interface BulkCreateDocumentsResponse {
  data: {
    inserted: number;
    documents?: ProposalDocument[];
  };
  message: string;
}

export interface SyncProposalDocumentsRequest {
  documents: BulkCreateDocumentItem[];
  created_by?: number;
  updated_by?: number;
}

export interface SyncProposalDocumentsResponse {
  data: ProposalDocument[];
  message: string;
}

export interface UpdateProposalDocumentPayload {
  document_type?: string;
  file_id?: number;
  file?: File | null;
  attachment?: File | null;
  created_by?: number;
  updated_by?: number;
  [key: string]: any;
}

export interface UpdateProposalDocumentResponse {
  data: ProposalDocument;
  message: string;
}

export interface ProposalListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | string[];
  is_draft?: boolean;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  kelembagaan_id?: string | number;
}

export interface ProposalListResponse {
  data: Proposal[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProposalDetailResponse {
  data: Proposal;
  message: string;
}

// ─── Spatial Overlap Analysis DTOs ───────────────────────────────────────────

export interface PolygonResponse {
  coordinates: number[][];
  label: string;
}

export interface OtherProposalResponse {
  proposalId: number;
  proposalNumber: string;
  proposalName: string;
  polygons: PolygonResponse[];
}

export interface SpatialOverlapResponse {
  active_polygons: PolygonResponse[];
  other_proposals: OtherProposalResponse[];
}

// ─── Proposal Document Validation DTOs ──────────────────────────────────────

export interface ProposalDocumentValidationResponse {
  id: number;
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string | null;
  created_by?: number | null;
  validated_by_role?: string | null;
  validated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ListProposalDocumentValidationQueryParams {
  page?: number;
  limit?: number;
  dokumen_proposal_id?: number | string;
  proposal_id?: number | string;
  pengusulan_id?: number | string;
  pengajuan_id?: number | string;
  is_valid?: boolean;
  validated_by_role?: string;
}

export interface ListProposalDocumentValidationResponse {
  data: ProposalDocumentValidationResponse[];
  meta: PaginationMeta;
}

// ─── Localization & Label Helpers ─────────────────────────────────────────────

export const PengajuanStatusLabel: Record<string, string> = LOCALIZATION.proposalStatus;

export const JenisSarprasLabel: Record<string, string> = LOCALIZATION.jenisSarpras;

export const getStatusLabel = (status: string) => PengajuanStatusLabel[status] ?? status;

export const getJenisSarprasLabel = (jenis: string) => JenisSarprasLabel[jenis] ?? (jenis as string);

// ─── Lahan Polygon Revision Types ──────────────────────────────────────────

export interface LahanPolygonRevisionState {
  lahanId: number | string;
  coordinateRows: CoordinatePoint[];
  rejectedPoints: CoordinatePoint[];
  calculatedAreaHa: number;
  isValid: boolean;
  validationMessages: string[];
}

export interface UpdatedLandDataPayload {
  land_id: number;
  luas_lahan?: number;
  jenis_legalitas?: string;
  nomor_legalitas?: string;
  nomor_surat_beda_nama?: string;
  coordinates?: string;
  polygon?: string;
}
