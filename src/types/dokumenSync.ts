export type DocumentSource = 'IAM_SYNC' | 'MANUAL';
export type DocumentReviewStatus = 'PENDING' | 'SESUAI' | 'PERLU_REVISI' | 'SUPERSEDED';

export interface IamSyncedDocument {
  uploadName: 'legalitas_kp' | 'penunjukan_ketua';
  documentType: 'AKTA_LEMBAGA' | 'PENUNJUKAN_KETUA';
  fileId?: number;
  objectKey: string;
  originalName: string;
  filesize: string;
  contentType: string;
  fileUrl?: string;
  syncedAt?: string;
}

export interface ProposalDocumentItem {
  id: number;
  proposalId: number;
  fileId: number;
  documentType: string;
  source: DocumentSource;
  version: number;
  isActive: boolean;
  reviewStatus: DocumentReviewStatus;
  reviewNotes?: string;
  replacedReason?: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  contentType: string;
  uploadedAt: string;
}

export interface InitialDocumentsResponse {
  kelembagaanId?: number;
  kelembagaan_id?: number;
  documents: {
    documentType?: string;
    document_type?: string;
    source?: DocumentSource;
    fileName?: string;
    file_name?: string;
    fileUrl?: string;
    file_url?: string;
    fileSize?: string;
    file_size?: string;
    contentType?: string;
    content_type?: string;
    isAvailable?: boolean;
    is_available?: boolean;
  }[];
}

export interface ReSyncIamResponse {
  proposalId: number;
  hasChanges: boolean;
  changedDocuments: {
    documentType: string;
    oldFileName: string;
    newFileName: string;
    version: number;
  }[];
}
