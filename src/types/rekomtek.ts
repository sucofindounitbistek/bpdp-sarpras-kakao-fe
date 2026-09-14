export type UsulanStatus =
  | 'DRAFT'
  | 'VERIFIKASI_DITJENBUN'
  | 'PERBAIKAN_DINAS_KAB'
  | 'PERBAIKAN_DINAS_PROV'
  | 'APPROVAL_DITJENBUN'
  | 'VERIFIKASI_BPDP'
  | 'APPROVAL_BPDP'
  | 'GENERATE_SK_DIRUT'
  | 'SELESAI';

import type { Pekebun } from './pekebun';
import type { DataCPCL, DokumenPersyaratan, GudangSerahTerima, StorageArea, ProposalDocument, RabItem, DokumenUpload, JenisSarpras } from './pengusulan';

export type BantuanType = 'UANG' | 'BARANG';

export interface AsistensiDocValidation {
  valid: boolean | null;
  note: string;
}

export interface AsistensiFileValidation extends AsistensiDocValidation {
  url: string;
}

export interface PekebunValidationItem {
  pekebunId: string;
  valid: boolean | null;
  note: string;
}

export interface BpdpDocValidation {
  valid: boolean | null;
  note: string;
  url?: string;
}

export interface StatusLog {
  id: string;
  usulanId: string;
  fromStatus: UsulanStatus;
  toStatus: UsulanStatus;
  actorName: string;
  actorRole: 'VERIFIKATOR_DITJENBUN' | 'APPROVAL_DITJENBUN' | 'VERIFIKATOR_BPDP' | 'APPROVAL_BPDP' | 'DITJENBUN_VERIFIKATOR' | 'DITJENBUN_APPROVAL' | 'BPDP_VERIFIKATOR' | 'BPDP_APPROVAL' | 'SYSTEM';
  note: string;
  createdAt: string;
}

export interface UsulanRekomtek {
  id: string;
  nomorUsulan: string;
  nomor_proposal?: string;
  namaKelompokTani: string;
  komoditas: string;
  status: UsulanStatus;
  bantuanType?: BantuanType;
  nama_dinas_kabupaten?: string | null;
  no_surat_provinsi?: string | null;
  tgl_surat_provinsi?: string | null;
  nama_dinas_provinsi?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Asistensi Ditjenbun
  asistensiChecklist?: {
    skCpcl: AsistensiFileValidation;
    suratPengantarProv: AsistensiFileValidation;
    beritaAcara?: AsistensiFileValidation;
    beritaAcaraLapangan?: AsistensiFileValidation;
    pekebun: PekebunValidationItem[];
  };

  pekebunList?: Pekebun[];

  jenisSarpras?: JenisSarpras;
  paket_sarpras?: string;
  daftarCPCL?: DataCPCL[];
  dokumen?: DokumenPersyaratan[];
  documents?: ProposalDocument[];
  gudangSerahTerima?: GudangSerahTerima;
  storage_area?: StorageArea | null;
  rabItems?: RabItem[];
  rabDitandatangani?: DokumenUpload | null;

  // Rekomtek Dokumen (Ditjenbun)
  rekomtek?: {
    nomorRekomtek: string;
    draftUrl?: string;
    signedUrl?: string;
    uploadedAt?: string;
  };

  // Verifikasi BPDP
  bpdpChecklist?: {
    rekomtek: BpdpDocValidation;
    skCpcl: BpdpDocValidation;
    suratPengantarProv: BpdpDocValidation;
    beritaAcaraVerifikasi: BpdpDocValidation;
    catatan?: string;
  };

  // Kelayakan Rekomtek Dokumen (BPDP)
  kelayakan?: {
    statusKelayakan: 'LAYAK' | 'TIDAK_LAYAK';
    draftUrl?: string;
    signedUrl?: string;
    isSubmitted: boolean;
    createdAt?: string;
  };

  // SK Dirut Dokumen (BPDP)
  skDirut?: {
    nomorSk?: string;
    draftUrl?: string;
    signedUrl?: string;
    uploadedAt?: string;
  };

  logs?: StatusLog[];
}
