import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  buildBulkDocumentsFormData,
  buildProposalFormData,
  hasDocumentFiles,
  proposalService,
} from '@/services/proposal.service';
import { mapToCanonicalDocumentType } from '@/stores/pengusulanDraft';
import { usePengusulanStore } from '@/stores/pengusulan';
import api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Proposal Bulk Document Upload', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('mapToCanonicalDocumentType', () => {
    it('maps requirement IDs correctly', () => {
      expect(mapToCanonicalDocumentType('LEGALITAS_KP')).toBe('LEGALITAS_KP');
      expect(mapToCanonicalDocumentType('SIMLUHTAN')).toBe('SIMLUHTAN');
      expect(mapToCanonicalDocumentType('GAMBAR_LAHAN')).toBe('GAMBAR_LAHAN');
      expect(mapToCanonicalDocumentType('RAB_RK')).toBe('RAB_RK');
      expect(mapToCanonicalDocumentType('PERNYATAAN_LUAS')).toBe('PERNYATAAN_LUAS');
      expect(mapToCanonicalDocumentType('REFERENSI_HARGA')).toBe('REFERENSI_HARGA');
      expect(mapToCanonicalDocumentType('PERNYATAAN_TANPA_BAKAR')).toBe('PERNYATAAN_TANPA_BAKAR');
      expect(mapToCanonicalDocumentType('DETAIL_PEKEBUN')).toBe('DETAIL_PEKEBUN');
      expect(mapToCanonicalDocumentType('SURAT_KET_KADES')).toBe('SURAT_KET_KADES');
    });

    it('maps signed RAB variants to RAB_PROPOSAL', () => {
      expect(mapToCanonicalDocumentType('RAB_PROPOSAL')).toBe('RAB_PROPOSAL');
      expect(mapToCanonicalDocumentType('RAB_SIGNED')).toBe('RAB_PROPOSAL');
      expect(mapToCanonicalDocumentType('rab-signed')).toBe('RAB_PROPOSAL');
      expect(mapToCanonicalDocumentType('rabproposal')).toBe('RAB_PROPOSAL');
    });
  });

  describe('hasDocumentFiles', () => {
    it('returns false when no files are present', () => {
      const docs = [
        { document_type: 'SIMLUHTAN', file_id: 501 },
        { document_type: 'LEGALITAS_KP', file_id: 502 },
      ];
      expect(hasDocumentFiles(docs)).toBe(false);
    });

    it('returns true when a File object is present', () => {
      const dummyFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const docs = [
        { document_type: 'LEGALITAS_KP', file: dummyFile },
        { document_type: 'SIMLUHTAN', file_id: 501 },
      ];
      expect(hasDocumentFiles(docs)).toBe(true);
    });

    it('returns true when a base64 dataUrl is present in doc item', () => {
      const docs = [
        {
          document_type: 'LEGALITAS_KP',
          dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6g==',
          namaFile: 'legalitas.pdf',
        },
        { document_type: 'SIMLUHTAN', file_id: 501 },
      ];
      expect(hasDocumentFiles(docs)).toBe(true);
    });
  });

  describe('buildBulkDocumentsFormData', () => {
    it('creates FormData with parallel slices, named parts, and documents JSON metadata', () => {
      const dummyFile = new File(['pdf-content'], 'surat_permohonan.pdf', { type: 'application/pdf' });
      const docs = [
        { document_type: 'SURAT_PERMOHONAN', file: dummyFile },
        { document_type: 'SIMLUHTAN', file_id: 501 },
      ];

      const formData = buildBulkDocumentsFormData(docs);

      // Verify files slice
      expect(formData.get('files')).toBeTruthy();
      expect(formData.get('document_types')).toBe('SURAT_PERMOHONAN');
      // Verify named file part
      expect(formData.get('SURAT_PERMOHONAN')).toBeTruthy();
      // Verify documents JSON string for file_id item
      const jsonStr = formData.get('documents') as string;
      expect(jsonStr).toBeTruthy();
      const parsed = JSON.parse(jsonStr);
      expect(parsed).toEqual([{ document_type: 'SIMLUHTAN', file_id: 501 }]);
    });
  });

  describe('proposalService.bulkCreateDocuments', () => {
    it('sends FormData when File instances exist', async () => {
      const dummyFile = new File(['pdf-content'], 'legalitas.pdf', { type: 'application/pdf' });
      const docs = [
        { document_type: 'LEGALITAS_KP', file: dummyFile },
        { document_type: 'SIMLUHTAN', file_id: 501 },
      ];

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { inserted: 2, documents: [] },
        message: 'Documents created successfully',
      });

      const res = await proposalService.bulkCreateDocuments(10, docs);

      expect(api.post).toHaveBeenCalledTimes(1);
      const [url, body] = vi.mocked(api.post).mock.calls[0];
      expect(url).toBe('/proposals/10/documents/bulk');
      expect(body instanceof FormData).toBe(true);
      expect(res.data.inserted).toBe(2);
    });

    it('sends JSON when only file_id metadata is provided', async () => {
      const docs = [
        { document_type: 'SIMLUHTAN', file_id: 501 },
        { document_type: 'RAB_PROPOSAL', file_id: 301 },
      ];

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { inserted: 2, documents: [] },
        message: 'Documents created successfully',
      });

      const res = await proposalService.bulkCreateDocuments(10, docs);

      expect(api.post).toHaveBeenCalledTimes(1);
      const [url, body] = vi.mocked(api.post).mock.calls[0];
      expect(url).toBe('/proposals/10/documents/bulk');
      expect(body).toEqual({
        documents: [
          { document_type: 'SIMLUHTAN', file_id: 501 },
          { document_type: 'RAB_PROPOSAL', file_id: 301 },
        ],
      });
      expect(res.data.inserted).toBe(2);
    });
  });

  describe('pengusulanStore.createProposal with bulk document upload', () => {
    it('executes sequential creation including bulk document upload', async () => {
      const dummyFile = new File(['content'], 'rab_proposal.pdf', { type: 'application/pdf' });
      const store = usePengusulanStore();

      vi.mocked(api.post)
        // 1. Create proposal
        .mockResolvedValueOnce({
          data: { id: 99, nomor_proposal: 'BPDP-TEST-001', status: 'SUBMITTED' },
          message: 'Proposal created',
        })
        // 2. Bulk create documents
        .mockResolvedValueOnce({
          data: { inserted: 1, documents: [] },
          message: 'Documents created successfully',
        });

      const created = await store.createProposal(
        {
          kelembagaan_id: 1,
          paket_sarpras: 'EKSTENSIFIKASI',
          detail_usulan: 'Usulan Paket',
          lahan_ids: [1],
        },
        [
          { document_type: 'RAB_PROPOSAL', file: dummyFile },
        ]
      );

      expect(created.id).toBe(99);
      expect(api.post).toHaveBeenCalledTimes(2);
      expect(vi.mocked(api.post).mock.calls[0][0]).toBe('/proposals');
      expect(vi.mocked(api.post).mock.calls[1][0]).toBe('/proposals/99/documents/bulk');
    });
  });

  describe('pengusulanStore.getProposalDetail RAB normalization', () => {
    it('normalizes rab_proposal payload correctly into rabItems', async () => {
      const store = usePengusulanStore();
      const mockPayload = {
        data: {
          id: 23,
          nomor_proposal: 'SPKA108260010',
          kelembagaan_id: 1,
          paket_sarpras: 'INTENSIFIKASI',
          total_anggaran: 6072264,
          status: 'REV_FROM_PROV',
          rab_proposal: {
            id: 22,
            proposal_id: 23,
            flag: 'PROPOSAL',
            items: [
              {
                id: 27,
                rab_proposal_id: 22,
                uraian: 'Benih',
                volume: 492,
                unit: 'Btg',
                price_per_unit: 12342,
                item_type: 'BARANG',
                total_price: 6072264,
                details: {
                  jenis: 'Benih',
                  jumlahTahap1: 123,
                  jumlahTahap2: 123,
                  jumlahTahap3: 123,
                  jumlahTahap4: 123,
                },
              },
            ],
          },
          rab_final: null,
        },
        message: 'success',
      };

      vi.mocked(api.get).mockResolvedValueOnce(mockPayload);

      const result = await store.getProposalDetail(23);

      expect(result).not.toBeNull();
      expect(result?.rabItems).toHaveLength(1);
      expect(result?.rabItems?.[0]).toMatchObject({
        id: '27',
        uraian: 'Benih',
        volume: 492,
        satuan: 'Btg',
        hargaSatuan: 12342,
        subTotal: 6072264,
        jenis: 'Benih',
        jumlahTahap1: 123,
        jumlahTahap2: 123,
        jumlahTahap3: 123,
        jumlahTahap4: 123,
      });
    });
  });

  describe('proposalService.updateProposalDocument', () => {
    it('calls PUT /proposals/:proposalId/documents/:documentId when updating existing document', async () => {
      const dummyFile = new File(['sk-content'], 'sk_cpcl.pdf', { type: 'application/pdf' });
      vi.mocked(api.put).mockResolvedValueOnce({
        data: { id: 69, document_type: 'SK_CPCL' },
        message: 'Document updated successfully',
      });

      const res = await proposalService.updateProposalDocument(23, 69, {
        document_type: 'SK_CPCL',
        file: dummyFile,
      });

      expect(api.put).toHaveBeenCalledTimes(1);
      const [url, body] = vi.mocked(api.put).mock.calls[0];
      expect(url).toBe('/proposals/23/documents/69');
      expect(body instanceof FormData).toBe(true);
      expect(res.data.id).toBe(69);
    });
  });

  describe('buildProposalFormData', () => {
    it('appends interior_photo_file and exterior_photo_file when storage area photos are provided', () => {
      const extFile = new File(['exterior'], 'depan.jpg', { type: 'image/jpeg' });
      const intFile = new File(['interior'], 'dalam.jpg', { type: 'image/jpeg' });

      const formData = buildProposalFormData({
        kelembagaan_id: 10,
        paket_sarpras: 'INTENSIFIKASI',
        lahan_ids: [1, 2],
        storage_area: {
          address: 'Jl Kebun No 1',
          coordinate: '-6.2, 106.8',
          exterior_photo_file: extFile,
          interior_photo_file: intFile,
        },
      });

      expect(formData.get('kelembagaan_id')).toBe('10');
      expect(formData.get('paket_sarpras')).toBe('INTENSIFIKASI');
      expect(formData.get('address')).toBe('Jl Kebun No 1');
      expect(formData.get('coordinate')).toBe('-6.2, 106.8');
      expect(formData.get('exterior_photo_file')).toBe(extFile);
      expect(formData.get('exterior_photo')).toBe(extFile);
      expect(formData.get('interior_photo_file')).toBe(intFile);
      expect(formData.get('interior_photo')).toBe(intFile);
      expect(formData.get('interiro_photo_file')).toBe(intFile);
    });

    it('appends photo IDs when only IDs are provided', () => {
      const formData = buildProposalFormData({
        kelembagaan_id: 10,
        paket_sarpras: 'INTENSIFIKASI',
        lahan_ids: [1],
        storage_area: {
          address: 'Jl Kebun No 1',
          coordinate: '-6.2, 106.8',
          interior_photo_file_id: 501,
          exterior_photo_file_id: 502,
        },
      });

      expect(formData.get('interior_photo_file_id')).toBe('501');
      expect(formData.get('exterior_photo_file_id')).toBe('502');
    });
  });
});
