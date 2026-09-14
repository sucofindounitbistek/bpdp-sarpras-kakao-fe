import { toRaw } from 'vue';
import api from './api';
import { useAuthStore } from '@/stores/auth';

export function getCurrentUserId(): number | undefined {
  try {
    const authStore = useAuthStore();
    if (authStore.user?.id) {
      const parsed = Number(authStore.user.id);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // pinia might not be initialized
  }
  return undefined;
}
import type {
  CreateProposalPayload,
  UpdateProposalPayload,
  ProposalDocument,
  ProposalListResponse,
  ProposalDetailResponse,
  SyncProposalDocumentItem,
  BulkCreateDocumentItem,
  BulkCreateDocumentsResponse,
  UpdateProposalDocumentPayload,
  UpdateProposalDocumentResponse,
  ListProposalDocumentValidationQueryParams,
  ListProposalDocumentValidationResponse,
  SubmitProposalResponse,
} from '@/types/pengusulan';

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

export interface ProposalExportQueryParams {
  search?: string;
  status?: string | string[];
  is_draft?: boolean;
  start_date?: string;
  end_date?: string;
  paket_sarpras?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  format?: 'csv' | 'json';
  regency_id?: number | string;
  kabupaten?: string;
}

export function hasStorageAreaFiles(storageArea: any): boolean {
  if (!storageArea) return false;
  if (storageArea.exterior_photo_file instanceof File) return true;
  if (storageArea.interior_photo_file instanceof File) return true;
  if (storageArea.interiro_photo_file instanceof File) return true;
  if (storageArea.fotoTampakDepan instanceof File || storageArea.fotoTampakDepan?.file instanceof File) return true;
  if (storageArea.fotoTampakDalam instanceof File || storageArea.fotoTampakDalam?.file instanceof File) return true;
  return false;
}

export function dataUrlToFile(dataUrl: string, fileName: string = 'document.pdf'): File | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  } catch (e) {
    console.warn('Failed to convert dataUrl to File:', e);
    return null;
  }
}

export function extractFileObject(item: any): File | null {
  if (!item) return null;
  const rawItem = toRaw(item);
  if (rawItem instanceof File) return rawItem;
  if (typeof Blob !== 'undefined' && rawItem instanceof Blob) {
    return new File([rawItem], (rawItem as any).name || 'document.pdf', { type: rawItem.type || 'application/pdf' });
  }

  const candidate = rawItem.file || rawItem.file_header || rawItem.fileHeader || rawItem.rawFile || null;
  const rawCandidate = candidate ? toRaw(candidate) : null;
  if (rawCandidate instanceof File) return rawCandidate;
  if (typeof Blob !== 'undefined' && rawCandidate instanceof Blob) {
    return new File([rawCandidate], rawItem.namaFile || rawItem.name || (rawCandidate as any).name || 'document.pdf', { type: rawCandidate.type || 'application/pdf' });
  }

  if (typeof rawCandidate === 'object' && rawCandidate !== null) {
    if (rawCandidate instanceof File) return rawCandidate;
    if (typeof (rawCandidate as any).name === 'string' && typeof (rawCandidate as any).size === 'number') {
      return rawCandidate as File;
    }
  }

  if (typeof rawItem === 'object' && rawItem !== null) {
    if (typeof (rawItem as any).name === 'string' && typeof (rawItem as any).size === 'number' && typeof (rawItem as any).slice === 'function') {
      return rawItem as File;
    }
  }

  // Fallback to base64 dataUrl if file instance is missing or serialized
  if (typeof rawItem.dataUrl === 'string' && rawItem.dataUrl.startsWith('data:')) {
    return dataUrlToFile(rawItem.dataUrl, rawItem.namaFile || rawItem.name || 'document.pdf');
  }
  if (rawCandidate && typeof (rawCandidate as any).dataUrl === 'string' && (rawCandidate as any).dataUrl.startsWith('data:')) {
    return dataUrlToFile((rawCandidate as any).dataUrl, (rawCandidate as any).namaFile || (rawCandidate as any).name || rawItem.namaFile || rawItem.name || 'document.pdf');
  }

  return null;
}

export function hasDocumentFiles(documents: any): boolean {
  if (!documents) return false;
  if (typeof FormData !== 'undefined' && documents instanceof FormData) return true;
  const items = Array.isArray(documents) ? documents : documents?.documents;
  if (!Array.isArray(items)) return false;
  return items.some((it) => extractFileObject(it) !== null);
}

export function buildBulkDocumentsFormData(
  documents: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[],
  userId?: number | string,
): FormData {
  const fd = new FormData();
  const currentUserId = userId || getCurrentUserId();
  const jsonDocs: Array<{ document_type: string; file_id: number; created_by?: number; updated_by?: number }> = [];

  documents.forEach((doc) => {
    const docType = (doc.document_type || doc.persyaratanId || '').toUpperCase().trim();
    if (!docType) return;

    const file = extractFileObject(doc);

    if (file) {
      // 1. Parallel slices format (files + document_types)
      fd.append('files', file, file.name);
      fd.append('document_types', docType);
      // 2. Named file part format ([document_type]: file)
      fd.append(docType, file, file.name);
    } else if (doc.file_id || doc.fileId) {
      jsonDocs.push({
        document_type: docType,
        file_id: Number(doc.file_id || doc.fileId),
        ...((doc.created_by || currentUserId) ? { created_by: Number(doc.created_by || currentUserId) } : {}),
        ...((doc.updated_by || currentUserId) ? { updated_by: Number(doc.updated_by || currentUserId) } : {}),
      });
    }
  });

  if (currentUserId) {
    fd.append('created_by', String(currentUserId));
    fd.append('updated_by', String(currentUserId));
    fd.append('user_id', String(currentUserId));
  }

  // 3. JSON metadata string for pre-existing file IDs
  if (jsonDocs.length > 0) {
    fd.append('documents', JSON.stringify(jsonDocs));
  }

  return fd;
}

export function buildProposalFormData(payload: CreateProposalPayload | UpdateProposalPayload): FormData {
  const fd = new FormData();
  if ('kelembagaan_id' in payload && payload.kelembagaan_id) {
    fd.append('kelembagaan_id', String(payload.kelembagaan_id));
  }
  if (payload.paket_sarpras) fd.append('paket_sarpras', payload.paket_sarpras);
  if (payload.nomor_proposal) fd.append('nomor_proposal', payload.nomor_proposal);
  if (payload.detail_usulan) fd.append('detail_usulan', payload.detail_usulan);
  if (payload.no_rekomtek) fd.append('no_rekomtek', payload.no_rekomtek);
  if (payload.bentuk_bantuan) fd.append('bentuk_bantuan', payload.bentuk_bantuan);
  if ('status' in payload && payload.status) fd.append('status', payload.status);
  if ('is_draft' in payload && payload.is_draft !== undefined) {
    fd.append('is_draft', String(payload.is_draft));
  }
  if (payload.total_anggaran !== undefined && payload.total_anggaran !== null) {
    fd.append('total_anggaran', String(payload.total_anggaran));
  }

  if (payload.lahan_ids && payload.lahan_ids.length > 0) {
    payload.lahan_ids.forEach((id) => {
      fd.append('lahan_ids', String(id));
    });
  }

  if (payload.storage_area) {
    const sa = payload.storage_area as any;
    const addr = sa.address || sa.alamat || '';
    const coord = sa.coordinate || sa.koordinat || '';
    if (addr) {
      fd.append('address', addr);
      fd.append('storage_area_address', addr);
    }
    if (coord) {
      fd.append('coordinate', coord);
      fd.append('storage_area_coordinate', coord);
    }
    if (sa.interior_photo_file_id) fd.append('interior_photo_file_id', String(sa.interior_photo_file_id));
    if (sa.exterior_photo_file_id) fd.append('exterior_photo_file_id', String(sa.exterior_photo_file_id));

    // Exterior photo file (form request field: exterior_photo_file / exterior_photo)
    const extFile = sa.exterior_photo_file || (sa.fotoTampakDepan instanceof File ? sa.fotoTampakDepan : sa.fotoTampakDepan?.file);
    if (extFile instanceof File) {
      fd.append('exterior_photo_file', extFile);
      fd.append('exterior_photo', extFile);
    }

    // Interior photo file (form request field: interior_photo_file / interior_photo, with interiro_photo_file for fallback)
    const intFile = sa.interior_photo_file || sa.interiro_photo_file || (sa.fotoTampakDalam instanceof File ? sa.fotoTampakDalam : sa.fotoTampakDalam?.file);
    if (intFile instanceof File) {
      fd.append('interior_photo_file', intFile);
      fd.append('interior_photo', intFile);
      fd.append('interiro_photo_file', intFile);
    }
  }

  return fd;
}

export const proposalService = {
  /** Retrieves a paginated list of proposals with search, filter, and multi-field sorting */
  async getList(params?: ProposalListQueryParams): Promise<ProposalListResponse> {
    const response = await api.get('/proposals', { params });
    return response as unknown as ProposalListResponse;
  },

  /** Exports proposals to CSV stream directly from backend without pagination limits */
  async exportCsv(params?: ProposalExportQueryParams, filename = 'daftar-proposal'): Promise<void> {
    const response = await api.get('/proposals/export', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });

    const blob = new Blob([response as any], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${filename}-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /** Retrieves full unpaginated proposal dataset from backend for client PDF printing */
  async exportJson(params?: ProposalExportQueryParams): Promise<any[]> {
    const response = await api.get('/proposals/export', {
      params: { ...params, format: 'json' },
    });
    return (response as any)?.data || [];
  },

  /** Retrieves the complete aggregate of a proposal */
  async getById(id: string | number): Promise<ProposalDetailResponse> {
    const response = await api.get(`/proposals/${id}`);
    return response as unknown as ProposalDetailResponse;
  },

  /** Creates a new proposal aggregate (with land plots and optional storage area) */
  async create(payload: CreateProposalPayload | FormData): Promise<{ data: { id: number; nomor_proposal: string; status: string }; message: string }> {
    let body: any = payload;

    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      body = payload;
    } else if (hasStorageAreaFiles((payload as CreateProposalPayload)?.storage_area)) {
      body = buildProposalFormData(payload as CreateProposalPayload);
    }

    const response = await api.post('/proposals', body);
    return response as unknown as { data: { id: number; nomor_proposal: string; status: string }; message: string };
  },

  /** Submits a draft proposal to SUBMITTED status */
  async submitDraft(id: string | number): Promise<{ data: SubmitProposalResponse; message: string }> {
    const response = await api.post(`/proposals/${id}/submit`);
    return response as unknown as { data: SubmitProposalResponse; message: string };
  },

  /** Performs a partial update on proposal metadata, land plots, or storage area */
  async update(id: string | number, payload: UpdateProposalPayload | FormData): Promise<ProposalDetailResponse> {
    let body: any = payload;

    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      body = payload;
    } else if (hasStorageAreaFiles((payload as UpdateProposalPayload)?.storage_area)) {
      body = buildProposalFormData(payload as UpdateProposalPayload);
    }

    const response = await api.patch(`/proposals/${id}`, body);
    return response as unknown as ProposalDetailResponse;
  },

  /** Soft-deletes a proposal by ID */
  async delete(id: string | number): Promise<{ data: { id: number; deleted: boolean }; message: string }> {
    const response = await api.delete(`/proposals/${id}`);
    return response as unknown as { data: { id: number; deleted: boolean }; message: string };
  },

  /** Retrieves all document attachments for a proposal with active presigned download URLs */
  async getDocuments(proposalId: string | number): Promise<{ data: ProposalDocument[]; message: string }> {
    const response = await api.get(`/proposals/${proposalId}/documents`);
    return response as unknown as { data: ProposalDocument[]; message: string };
  },

  /** Attaches multiple uploaded files to a proposal in a single transaction (supports multipart/form-data and JSON) */
  async bulkCreateDocuments(
    proposalId: string | number,
    documents: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] | FormData | { documents: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] },
  ): Promise<BulkCreateDocumentsResponse> {
    let body: any;
    const currentUserId = getCurrentUserId();

    if (typeof FormData !== 'undefined' && documents instanceof FormData) {
      body = documents;
      if (currentUserId) {
        if (!body.has('created_by')) body.append('created_by', String(currentUserId));
        if (!body.has('updated_by')) body.append('updated_by', String(currentUserId));
        if (!body.has('user_id')) body.append('user_id', String(currentUserId));
      }
    } else {
      const items = Array.isArray(documents) ? documents : typeof documents === 'object' && documents !== null && 'documents' in documents ? documents.documents : [];
      if (hasDocumentFiles(items)) {
        body = buildBulkDocumentsFormData(items, currentUserId);
      } else {
        body = {
          ...(currentUserId ? { created_by: currentUserId, updated_by: currentUserId } : {}),
          documents: items.map((it: any) => ({
            document_type: (it.document_type || '').toUpperCase().trim(),
            ...(it.file_id ? { file_id: Number(it.file_id) } : {}),
            ...((it.created_by || currentUserId) ? { created_by: Number(it.created_by || currentUserId) } : {}),
            ...((it.updated_by || currentUserId) ? { updated_by: Number(it.updated_by || currentUserId) } : {}),
          })),
        };
      }
    }

    const response = await api.post(`/proposals/${proposalId}/documents/bulk`, body);
    return response as unknown as BulkCreateDocumentsResponse;
  },

  /** Performs full synchronization / bulk update (upsert + delete omitted) of proposal documents (supports multipart/form-data and JSON) */
  async syncDocuments(
    proposalId: string | number,
    documents: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[] | FormData | { documents: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[] },
  ): Promise<{ data: ProposalDocument[]; message: string }> {
    let body: any;
    const currentUserId = getCurrentUserId();

    if (typeof FormData !== 'undefined' && documents instanceof FormData) {
      body = documents;
      if (currentUserId) {
        if (!body.has('updated_by')) body.append('updated_by', String(currentUserId));
        if (!body.has('created_by')) body.append('created_by', String(currentUserId));
        if (!body.has('user_id')) body.append('user_id', String(currentUserId));
      }
    } else {
      const items = Array.isArray(documents) ? documents : typeof documents === 'object' && documents !== null && 'documents' in documents ? documents.documents : [];
      if (hasDocumentFiles(items)) {
        body = buildBulkDocumentsFormData(items, currentUserId);
      } else {
        body = {
          ...(currentUserId ? { created_by: currentUserId, updated_by: currentUserId } : {}),
          documents: items.map((it: any) => ({
            document_type: (it.document_type || it.persyaratanId || '').toUpperCase().trim(),
            ...(it.file_id || it.fileId ? { file_id: Number(it.file_id || it.fileId) } : {}),
            ...((it.created_by || currentUserId) ? { created_by: Number(it.created_by || currentUserId) } : {}),
            ...((it.updated_by || currentUserId) ? { updated_by: Number(it.updated_by || currentUserId) } : {}),
          })),
        };
      }
    }

    const response = await api.put(`/proposals/${proposalId}/documents`, body);
    return response as unknown as { data: ProposalDocument[]; message: string };
  },

  /** Updates a single proposal document's file association or document type (PUT /proposals/{proposal_id}/documents/{id}) */
  async updateProposalDocument(proposalId: string | number, documentId: string | number, payload: UpdateProposalDocumentPayload | FormData): Promise<UpdateProposalDocumentResponse> {
    let body: any;
    const currentUserId = getCurrentUserId();

    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      body = payload;
      if (currentUserId) {
        if (!body.has('updated_by')) body.append('updated_by', String(currentUserId));
        if (!body.has('user_id')) body.append('user_id', String(currentUserId));
      }
    } else {
      const p = payload as UpdateProposalDocumentPayload;
      const file = extractFileObject(p);
      const docType = (p.document_type || p.persyaratanId || '').toUpperCase().trim();
      const fileId = p.file_id || p.fileId;
      const updatedBy = p.updated_by || currentUserId;

      if (file) {
        const fd = new FormData();
        fd.append('file', file, file.name);
        fd.append('attachment', file, file.name);
        if (docType) {
          fd.append('document_type', docType);
          fd.append(docType, file, file.name);
        }
        if (updatedBy) {
          fd.append('updated_by', String(updatedBy));
          fd.append('user_id', String(updatedBy));
        }
        if (p.created_by) {
          fd.append('created_by', String(p.created_by));
        }
        body = fd;
      } else {
        body = {
          ...(docType ? { document_type: docType } : {}),
          ...(fileId ? { file_id: Number(fileId) } : {}),
          ...(updatedBy ? { updated_by: Number(updatedBy) } : {}),
          ...(p.created_by ? { created_by: Number(p.created_by) } : {}),
        };
      }
    }

    const response = await api.put(`/proposals/${proposalId}/documents/${documentId}`, body);
    return response as unknown as UpdateProposalDocumentResponse;
  },

  /** Retrieves spatial polygon boundary overlap datasets */
  async getSpatialOverlap(id: string | number): Promise<any> {
    return api.get(`/proposals/${id}/spatial-overlap`);
  },

  /** Submits bulk farmer document and field-level validations */
  async bulkFarmerValidations(payload: any[]): Promise<any> {
    return api.post('/farmer-document-validations/bulk', payload);
  },

  /** Submits bulk land document validations */
  async bulkLandValidations(payload: any[]): Promise<any> {
    return api.post('/land-document-validations/bulk', payload);
  },

  async bulkProposalValidations(payload: any[]): Promise<any> {
    return api.post('/proposal-document-validations/bulk', payload);
  },

  /** Retrieves list of proposal document validations */
  async getProposalDocumentValidations(params?: ListProposalDocumentValidationQueryParams): Promise<ListProposalDocumentValidationResponse> {
    const response = await api.get('/proposal-document-validations', { params });
    return response as unknown as ListProposalDocumentValidationResponse;
  },

  /** Retrieves list of farmer document validations */
  async getFarmerDocumentValidations(params?: any): Promise<any> {
    const response = await api.get('/farmer-document-validations', { params });
    return response;
  },

  /** Retrieves list of land document validations */
  async getLandDocumentValidations(params?: any): Promise<any> {
    const response = await api.get('/land-document-validations', { params });
    return response;
  },

  /** Retrieves proposal revision detail with document-level validation feedback */
  async getRevisionDetail(id: string | number): Promise<any> {
    const response = await api.get(`/proposals/${id}/revisi-detail`);
    return response;
  },

  /** Replaces a single rejected document attachment with a newly uploaded file ID */
  async replaceRejectedDocument(proposalId: string | number, documentId: string | number, newFileId: number): Promise<any> {
    const response = await api.post(`/proposals/${proposalId}/documents/${documentId}/replace`, {
      new_file_id: newFileId,
    });
    return response;
  },

  /** Direct re-submission of revised proposal to Kabupaten queue */
  async resubmitProposal(
    proposalId: string | number,
    updatedDocuments: Array<{ dokumen_proposal_id: number; file_id: number }>,
    storageArea?: {
      address?: string;
      coordinate?: string;
      exterior_photo_file_id?: number;
      interior_photo_file_id?: number;
    },
    updatedFarmerDocuments?: Array<{ farmer_document_id?: number; pekebun_id?: number; document_type?: string; file_id: number }>,
    updatedLandDocuments?: Array<{ land_document_id?: number; lahan_id?: number; document_type?: string; file_id: number }>,
    updatedRabDocument?: { rab_proposal_id: number; file_id: number },
    updatedRabItems?: Array<{ rab_item_id: number; uraian?: string; volume?: number; unit?: string; price_per_unit?: number }>,
    updatedFarmerData?: Array<{ farmer_id: number; name?: string; nik?: string; nomor_kk?: string; address?: string }>,
    updatedLandData?: Array<{ land_id: number; luas_lahan?: number; jenis_legalitas?: string; nomor_legalitas?: string; nomor_surat_beda_nama?: string; coordinates?: string; polygon?: string }>,
    isDraft?: boolean
  ): Promise<any> {
    const response = await api.put(`/proposals/${proposalId}/revisi`, {
      is_draft: isDraft,
      updated_documents: updatedDocuments,
      storage_area: storageArea,
      updated_farmer_data: updatedFarmerData,
      updated_farmer_documents: updatedFarmerDocuments,
      updated_land_data: updatedLandData,
      updated_land_documents: updatedLandDocuments,
      updated_rab_document: updatedRabDocument,
      updated_rab_items: updatedRabItems,
    });
    return response;
  },
};

