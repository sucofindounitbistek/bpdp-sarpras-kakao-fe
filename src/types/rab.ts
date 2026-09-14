export enum RabFlag {
  PROPOSAL = 'PROPOSAL',
  VERIFIKASI = 'VERIFIKASI',
  REKOMTEK = 'REKOMTEK',
  FINAL = 'FINAL',
}

export enum RabItemType {
  BARANG = 'BARANG',
  JASA = 'JASA',
  LAINNYA = 'LAINNYA',
}

export interface RabItemStageDetails {
  jenis?: string;
  varietas?: string;
  varietasCustom?: string;
  jumlahTahap1?: number | null;
  jumlahTahap2?: number | null;
  jumlahTahap3?: number | null;
  jumlahTahap4?: number | null;
  spesifikasi?: string;
  alasan_revisi?: string;
  [key: string]: any;
}

export interface RabItem {
  id: string;
  rab_proposal_id?: number | null;
  uraian: string;
  volume?: number | null;
  unit?: string;
  price_per_unit?: number | null;
  item_type?: RabItemType | string;
  total_price?: number;
  details?: RabItemStageDetails | null;

  // Transitional/frontend-compatibility fields
  tahap?: string;
  satuan?: string;
  hargaSatuan: number | null;
  subTotal: number;
  jenis?: string;
  varietas?: string;
  varietasCustom?: string;
  spesifikasi?: string;
  jumlahTahap1?: number | null;
  jumlahTahap2?: number | null;
  jumlahTahap3?: number | null;
  jumlahTahap4?: number | null;
  jumlahTotal?: number | null;
}

export function getRabTahapCount(paket?: string | null, customJumlahTahap?: number | null): number {
  if (typeof customJumlahTahap === 'number' && customJumlahTahap >= 1) {
    return customJumlahTahap;
  }
  if (!paket) return 1;
  const p = String(paket).toUpperCase().trim();
  if (p.includes('INTENSIFIKASI')) return 4;
  if (p.includes('EKSTENSIFIKASI')) return 2;
  return 1;
}

export interface RabProposal {
  id: number | string;
  proposal_id: number | string;
  flag: RabFlag | string;
  items: RabItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateRabItemPayload {
  uraian: string;
  volume: number;
  unit: string;
  price_per_unit: number;
  item_type: string;
  details?: Record<string, any> | null;
}

export interface CreateRabPayload {
  proposal_id: number;
  flag?: string;
  items: CreateRabItemPayload[];
}

export interface UpdateRabPayload {
  flag?: string;
  items: CreateRabItemPayload[];
}

export interface RabResponse {
  data: RabProposal;
  message: string;
}
