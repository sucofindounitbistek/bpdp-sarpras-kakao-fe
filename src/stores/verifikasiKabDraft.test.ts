// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVerifikasiKabDraftStore } from './verifikasiKabDraft';

describe('useVerifikasiKabDraftStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('syncs proposal document validations and mirrors alias keys', () => {
    const store = useVerifikasiKabDraftStore();
    store.initForProposal('REQ-001');

    const documents = [
      {
        id: 101,
        document_type: 'LEGALITAS_KP',
      },
      {
        id: 102,
        document_type: 'SURAT_PERNYATAAN_LUAS',
      },
    ];

    const validations = [
      {
        id: 1,
        dokumen_proposal_id: 101,
        is_valid: true,
        notes: '',
      },
      {
        id: 2,
        dokumen_proposal_id: 102,
        is_valid: false,
        notes: 'Dokumen buram',
      },
    ];

    store.syncProposalValidations(validations, documents);

    // LEGALITAS_KP should be APPROVED
    expect(store.getVerification('LEGALITAS_KP').status).toBe('APPROVED');
    // Mirror alias DOKUMEN_LEGALITAS_KELEMBAGAAN should also be APPROVED
    expect(store.getVerification('DOKUMEN_LEGALITAS_KELEMBAGAAN').status).toBe('APPROVED');

    // SURAT_PERNYATAAN_LUAS should be REJECTED with note
    expect(store.getVerification('SURAT_PERNYATAAN_LUAS').status).toBe('REJECTED');
    expect(store.getVerification('SURAT_PERNYATAAN_LUAS').notes).toBe('Dokumen buram');
    // Mirror alias PERNYATAAN_LUAS should also be REJECTED
    expect(store.getVerification('PERNYATAAN_LUAS').status).toBe('REJECTED');
  });

  it('syncs farmer document validations using cpcl.id, farmer_id, and NIK', () => {
    const store = useVerifikasiKabDraftStore();
    store.initForProposal('REQ-001');

    const cpclList = [
      {
        id: 99, // Lahan / CPCL row ID
        nama: 'Budi Santoso',
        nik: '1234567890123456',
        pekebun_id: 10,
        lahan: {
          id: 99,
          dokumen: [{ id: 501, jenis_dokumen: 'SURAT_KEPEMILIKAN' }],
        },
      },
    ];

    const farmerValidations = [
      {
        dokumen_pekebun_id: 301,
        is_valid: false,
        notes: 'Foto KTP tidak jelas',
        details: [
          { field_name: 'namaLengkap', is_valid: true },
          { field_name: 'nik', is_valid: false, notes: 'NIK kabur' },
        ],
      },
    ];

    const pekebunList = [
      {
        id: 10,
        namaLengkap: 'Budi Santoso',
        nik: '1234567890123456',
        documents: [{ id: 301, document_type: 'KTP' }],
      },
    ];

    store.syncFarmerDocumentValidations(farmerValidations, pekebunList, cpclList);

    // Should be set on targetId = 10 (farmer_id)
    expect(store.getVerification('doc-10-301').status).toBe('REJECTED');
    expect(store.getVerification('doc-10-301').notes).toBe('Foto KTP tidak jelas');
    expect(store.getVerification('doc-10-301-namaLengkap').status).toBe('APPROVED');
    expect(store.getVerification('doc-10-301-nik').status).toBe('REJECTED');

    // Should be set on targetId = 99 (cpcl.id)
    expect(store.getVerification('doc-99-301').status).toBe('REJECTED');
    expect(store.getVerification('doc-99-301').notes).toBe('Foto KTP tidak jelas');
    expect(store.getVerification('doc-99-301-nik').status).toBe('REJECTED');

    // Should be set on targetId = NIK
    expect(store.getVerification('doc-1234567890123456-301').status).toBe('REJECTED');
  });

  it('syncs land document validations to both lahanId and cpcl row', () => {
    const store = useVerifikasiKabDraftStore();
    store.initForProposal('REQ-001');

    const cpclList = [
      {
        id: 88,
        nama: 'Ahmad',
        nik: '3201000000000001',
        pekebun_id: 15,
      },
    ];

    const lahans = [
      {
        id: 88,
        pekebun_id: 15,
        dokumen: [
          { id: 701, jenis_dokumen: 'SURAT_KEPEMILIKAN' },
        ],
      },
    ];

    const landValidations = [
      {
        dokumen_lahan_id: 701,
        is_valid: true,
        notes: '',
      },
    ];

    store.syncLandDocumentValidations(landValidations, [], lahans, cpclList);

    expect(store.getVerification('doc-88-701').status).toBe('APPROVED');
    expect(store.getVerification('doc-88-701-luas_lahan').status).toBe('APPROVED');
    expect(store.getVerification('doc-15-701').status).toBe('APPROVED');
    expect(store.getVerification('doc-3201000000000001-701').status).toBe('APPROVED');
  });

  it('synchronizes alias keys when calling setVerificationStatus directly', () => {
    const store = useVerifikasiKabDraftStore();
    store.initForProposal('REQ-001');

    store.setVerificationStatus('LEGALITAS_KP', 'REJECTED');
    store.verifications['LEGALITAS_KP'].notes = 'Kurang stempel';
    expect(store.getVerification('DOKUMEN_LEGALITAS_KELEMBAGAAN').status).toBe('REJECTED');

    store.setVerificationStatus('LEGALITAS_KP', 'APPROVED');
    expect(store.getVerification('DOKUMEN_LEGALITAS_KELEMBAGAAN').status).toBe('APPROVED');
  });

  it('syncs polygon verification from details to lahan-{id}-polygon and doc keys', () => {
    const store = useVerifikasiKabDraftStore();
    store.initForProposal('REQ-001');

    const cpclList = [
      {
        id: 77,
        nama: 'Siti',
        nik: '3201000000000002',
        pekebun_id: 20,
      },
    ];

    const lahans = [
      {
        id: 77,
        pekebun_id: 20,
        dokumen: [{ id: 801, jenis_dokumen: 'SURAT_KEPEMILIKAN' }],
      },
    ];

    const landValidations = [
      {
        dokumen_lahan_id: 801,
        is_valid: false,
        notes: 'Koordinat tidak sesuai dengan batas fisik',
        details: [
          { field_name: 'polygon', is_valid: false, notes: 'Poligon overlap ke kawasan lindung' },
        ],
      },
    ];

    store.syncLandDocumentValidations(landValidations, [], lahans, cpclList);

    expect(store.getVerification('lahan-77-polygon').status).toBe('REJECTED');
    expect(store.getVerification('lahan-77-polygon').notes).toBe('Poligon overlap ke kawasan lindung');
    expect(store.getVerification('doc-77-801-polygon').status).toBe('REJECTED');
    expect(store.getVerification('doc-77-801-polygon').notes).toBe('Poligon overlap ke kawasan lindung');
  });
});
