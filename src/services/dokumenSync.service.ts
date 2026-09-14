import api from './api';
import type {
  InitialDocumentsResponse,
  ReSyncIamResponse,
  ProposalDocumentItem,
} from '@/types/dokumenSync';

export const dokumenSyncService = {
  /**
   * Mengambil dokumen legalitas awal yang tersinkronisasi dari master IAM
   * @param kelembagaanId ID Kelembagaan Pemohon
   */
  async getInitialDocuments(kelembagaanId: number): Promise<InitialDocumentsResponse> {
    const response = await api.get(`/proposals/initial-documents?kelembagaan_id=${kelembagaanId}`);
    return response.data?.data || response.data;
  },

  /**
   * Memicu sinkronisasi ulang dokumen dari IAM untuk proposal yang sedang direvisi
   * @param proposalId ID Proposal
   * @param documentTypes Opsional list tipe dokumen spesifik yang ingin disinkronkan ulang
   */
  async reSyncIamDocuments(
    proposalId: number,
    documentTypes?: string[]
  ): Promise<ReSyncIamResponse> {
    const response = await api.post(`/proposals/${proposalId}/re-sync-iam`, {
      document_types: documentTypes,
    });
    return response.data?.data || response.data;
  },

  /**
   * Mengambil riwayat versi dokumen tertentu untuk perbandingan oleh verifikator/pemohon
   * @param proposalId ID Proposal
   * @param documentType Tipe dokumen (misal: 'AKTA_LEMBAGA', 'PENUNJUKAN_KETUA')
   */
  async getDocumentVersionHistory(
    proposalId: number,
    documentType: string
  ): Promise<ProposalDocumentItem[]> {
    const response = await api.get(
      `/proposals/${proposalId}/documents/${documentType}/history`
    );
    return response.data?.data || response.data;
  },
};

export default dokumenSyncService;
