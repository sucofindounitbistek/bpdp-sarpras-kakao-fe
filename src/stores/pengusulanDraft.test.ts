import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePengusulanDraftStore } from './pengusulanDraft';
import { useAuthStore } from './auth';
import { JenisSarpras } from '@/types/pengusulan';

describe('usePengusulanDraftStore - Step 2 (Pekebun & Lahan) & Step 3 (RAB & Submit)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with currentStep = 1', () => {
    const store = usePengusulanDraftStore();
    expect(store.currentStep).toBe(1);
    expect(store.isStep2Valid).toBe(false);
    expect(store.isStep3Valid).toBe(false);
  });

  it('validates Step 2 (Pekebun & Lahan) correctly', () => {
    const store = usePengusulanDraftStore();
    store.setPaket(JenisSarpras.VERIFIKASI_TEKNIS);

    // No pekebun or lahan selected
    expect(store.isStep2Valid).toBe(false);

    // Pekebun and lahan selected
    store.selectedPekebunIds = ['1', '2'];
    store.selectedLahanIds = ['101', '102'];
    expect(store.isStep2Valid).toBe(true);
    expect(store.isPekebunLahanValid).toBe(true);
  });

  it('validates Step 3 (RAB & Submit) correctly', () => {
    const store = usePengusulanDraftStore();
    store.setPaket(JenisSarpras.EKSTENSIFIKASI);

    expect(store.isStep3Valid).toBe(false);
    expect(store.isRabValid).toBe(false);

    // Add RAB item
    store.addRabItem();
    const itemId = store.rabItems[0].id;
    store.updateRabItem(itemId, {
      jenis: 'BARANG',
      uraian: 'Bibit Kelapa',
      satuan: 'Batang',
      hargaSatuan: 50000,
      jumlahTahap1: 100,
    });

    // Still invalid because signed RAB not uploaded
    expect(store.isStep3Valid).toBe(false);

    // Upload signed RAB
    store.setRabDitandatangani({
      persyaratanId: 'RAB_PROPOSAL',
      namaFile: 'rab_signed.pdf',
      mimeType: 'application/pdf',
      ukuranBytes: 200000,
      dataUrl: 'data:application/pdf;base64,JVBERi0xL...',
      uploadedAt: new Date().toISOString(),
      fileId: 301,
    });

    expect(store.isStep3Valid).toBe(true);
    expect(store.isRabValid).toBe(true);
  });

  it('generates consistent submission payload regardless of step ordering', () => {
    const store = usePengusulanDraftStore();
    store.setPaket(JenisSarpras.INTENSIFIKASI);

    // Step 2 data
    store.selectedPekebunIds = ['5'];
    store.selectedLahanIds = ['201'];

    // Step 3 data
    store.addRabItem();
    const itemId = store.rabItems[0].id;
    store.updateRabItem(itemId, {
      jenis: 'BARANG',
      uraian: 'Pupuk NPK',
      satuan: 'Kg',
      hargaSatuan: 15000,
      jumlahTahap1: 50,
      jumlahTahap2: 50,
    });

    store.setRabDitandatangani({
      persyaratanId: 'RAB_PROPOSAL',
      namaFile: 'rab_ditandatangani.pdf',
      mimeType: 'application/pdf',
      ukuranBytes: 150000,
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBSIHR5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1IDg0MiBdID4+IGVuZG9iagp0cmFpbGVyCiAgPDwgL1Jvb3QgMSAwIFIgPj4KJSVFT0Y=',
      uploadedAt: new Date().toISOString(),
      fileId: 401,
    });

    const payload = store.getSubmissionPayload(10);
    expect(payload.proposal.kelembagaan_id).toBe(10);
    expect(payload.proposal.paket_sarpras).toBe(JenisSarpras.INTENSIFIKASI);
    expect(payload.proposal.lahan_ids).toEqual([201]);
    expect(payload.rab?.flag).toBe('PROPOSAL');
    expect(payload.rab?.items.length).toBe(1);
    expect(payload.rab?.items[0].uraian).toBe('Pupuk NPK');
    expect(payload.rab?.items[0].volume).toBe(100);
    expect(Array.isArray(payload.documents)).toBe(true);
    if (Array.isArray(payload.documents)) {
      expect(payload.documents.some((d) => d.document_type === 'RAB_PROPOSAL')).toBe(true);
    }
  });

  it('uses kelembagaan_id from authStore when kelembagaanId argument is omitted', () => {
    const authStore = useAuthStore();
    authStore.setAuth('sample-token', {
      id: 'usr-1',
      name: 'Koperasi Kelapa Maju',
      email: 'koperasi@example.com',
      role: 'KELEMBAGAAN_PEKEBUN',
      kelembagaan_id: 88,
    });

    const store = usePengusulanDraftStore();
    store.setPaket(JenisSarpras.EKSTENSIFIKASI);
    const payload = store.getSubmissionPayload();

    expect(payload.proposal.kelembagaan_id).toBe(88);
  });
});
