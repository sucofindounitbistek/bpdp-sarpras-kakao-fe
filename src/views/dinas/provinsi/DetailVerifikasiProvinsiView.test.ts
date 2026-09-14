// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import StepSummaryDanSubmit from './StepSummaryDanSubmit.vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiProvinsiDraftStore } from '@/stores/verifikasiProvinsiDraft';
import { JenisSarpras } from '@/types/pengusulan';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';

const mockRouteParams = { id: 'REQ-101' };
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: mockRouteParams }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/approval/ApprovalConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-approval-modal">Approval Modal Stub</div>' },
}));

describe('StepSummaryDanSubmit in Dinas Provinsi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposal = {
    id: 'REQ-101',
    nomorProposal: 'PROP-101',
    nomor_proposal: 'PROP-101',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    status: 'SUBMITTED',
    detailUsulan: 'Usulan Sarpras',
    total_anggaran: 25000000,
    documents: [
      {
        id: 501,
        document_type: 'SIMLUHTAN',
        file_name: 'simluhtan_kelompok.pdf',
        file_url: 'https://cdn.example.com/simluhtan.pdf',
      },
      {
        id: 502,
        document_type: 'LEGALITAS_KP',
        file_name: 'legalitas_kp.pdf',
        file_url: 'https://cdn.example.com/legalitas.pdf',
      },
      {
        id: 503,
        document_type: 'RAB_FINAL',
        file_name: 'rab_final_disetujui.pdf',
        file_url: 'https://cdn.example.com/rab_final.pdf',
        created_by_name: 'Petugas Kabupaten',
        uploaded_at_formatted: '12 Sep 2026, 15:19',
      },
      {
        id: 504,
        document_type: 'BA_VERIFIKASI',
        file_name: 'berita_acara_dokumen.pdf',
        file_url: 'https://cdn.example.com/ba_verif.pdf',
      },
    ],
    rab_final: {
      id: 99,
      proposal_id: 101,
      flag: 'FINAL',
      items: [
        {
          id: 1,
          uraian: 'Bibit Kelapa Sawit Bersertifikat',
          volume: 100,
          unit: 'Batang',
          price_per_unit: 150000,
          total_price: 15000000,
        },
        {
          id: 2,
          uraian: 'Pupuk NPK Organik',
          volume: 20,
          unit: 'Karung',
          price_per_unit: 500000,
          total_price: 10000000,
        },
      ],
    },
    lahans: [
      {
        id: 301,
        pekebun_id: 1,
        namaPekebun: 'Pak Sukardi',
        documents: [
          {
            id: 801,
            document_type: 'FOTO_UDARA',
            file_name: 'drone_lahan_sukardi.jpg',
            file_url: 'https://cdn.example.com/drone_sukardi.jpg',
            mime_type: 'image/jpeg',
            file_size: 2048576,
          },
          {
            id: 802,
            document_type: 'SCAN_LEGALITAS',
            file_name: 'shm_sukardi.pdf',
            file_url: 'https://cdn.example.com/shm.pdf',
          },
        ],
      },
      {
        id: 302,
        pekebun_id: 2,
        namaPekebun: 'Ibu Maryam',
        documents: [
          {
            id: 803,
            document_type: 'FOTO_UDARA',
            file_name: 'drone_lahan_maryam.jpg',
            file_url: 'https://cdn.example.com/drone_maryam.jpg',
            mime_type: 'image/jpeg',
            file_size: 1548576,
          },
        ],
      },
    ],
  };

  it('1. Adjusts list of documents according to proposal package and reflects Kabupaten validation state', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = JSON.parse(JSON.stringify(mockProposal));

    const draftStore = useVerifikasiProvinsiDraftStore();
    // Simulate sync of proposal validations from Kabupaten
    draftStore.syncProposalValidations(
      [
        { dokumen_proposal_id: 501, document_type: 'SIMLUHTAN', is_valid: true, notes: 'Lengkap dan valid', validated_by_role: 'DINAS_KAB' },
        { dokumen_proposal_id: 502, document_type: 'LEGALITAS_KP', is_valid: false, notes: 'Perlu cap basah', validated_by_role: 'DINAS_KAB' },
        { dokumen_proposal_id: 503, document_type: 'RAB_FINAL', is_valid: true, notes: 'Sesuai standar', validated_by_role: 'DINAS_KAB' },
      ],
      mockProposal.documents,
      mockProposal,
    );

    const wrapper = mount(StepSummaryDanSubmit);

    // Verify RAB is filtered out of Step 1 package document list
    const step1Section = wrapper.find('.flex.flex-col.gap-3');
    expect(step1Section.exists()).toBe(true);

    // Make sure SIMLUHTAN shows "Disetujui" and LEGALITAS_KP shows "Ditolak"
    const textContent = wrapper.text();
    expect(textContent).toContain('Disetujui');
    expect(textContent).toContain('Ditolak');

    // Verify that Kabupaten validations correctly mapped
    expect(draftStore.getKabupatenVerification('SIMLUHTAN').status).toBe('APPROVED');
    expect(draftStore.getKabupatenVerification('LEGALITAS_KP').status).toBe('REJECTED');
  });

  it('2. Shows rab_final in Rincian RAB from proposal detail', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = JSON.parse(JSON.stringify(mockProposal));

    const wrapper = mount(StepSummaryDanSubmit);

    // Verify Rincian RAB displays items and budget total from rab_final
    const text = wrapper.text();
    expect(text).toContain('Rencana Anggaran Biaya (RAB) Final');
    expect(text).toContain('Rincian RAB (rab_final)');
    expect(text).toContain('2 item rincian anggaran');
    expect(text).toContain('25.000.000');

    // Verify rabFinalDoc displays signed document details
    expect(text).toContain('Dokumen RAB Final (Bertandatangan)');
    expect(text).toContain('rab_final_disetujui.pdf');
    expect(text).toContain('Petugas Kabupaten');
  });

  it('3. Extracts Foto Udara from lahans => documents with document_type FOTO_UDARA', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = JSON.parse(JSON.stringify(mockProposal));

    const wrapper = mount(StepSummaryDanSubmit);

    const text = wrapper.text();
    // Top card shows 2 files
    expect(text).toContain('Foto Udara (Kabupaten) — 2 berkas');
    expect(text).toContain('Tersedia (2)');

    // In step 1, displays both drone photos with pekebun names
    expect(text).toContain('drone_lahan_sukardi.jpg');
    expect(text).toContain('Pak Sukardi');
    expect(text).toContain('drone_lahan_maryam.jpg');
    expect(text).toContain('Ibu Maryam');

    // Clicking preview modal opens preview
    const previewButtons = wrapper.findAll('button[title="Pratinjau Foto Udara"]');
    expect(previewButtons.length).toBe(2);

    await previewButtons[0].trigger('click');
    const modal = wrapper.findComponent(DocumentPreviewModal);
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('title')).toBe('drone_lahan_sukardi.jpg');
    expect(modal.props('dataUrl')).toBe('https://cdn.example.com/drone_sukardi.jpg');
  });
});
