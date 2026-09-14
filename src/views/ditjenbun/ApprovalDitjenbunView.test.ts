// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ApprovalDitjenbunView from './ApprovalDitjenbunView.vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useAuthStore } from '@/stores/auth';
import { useVerifikasiDitjenbunStore } from '@/stores/verifikasiDitjenbun';
import { useRekomtekStore } from '@/stores/rekomtek';
import { PengajuanStatus, JenisSarpras } from '@/types/pengusulan';

const mockRouteParams = { id: 'REQ-100' };
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: mockRouteParams, path: '/ditjenbun/rekomtek/approval/REQ-100' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/ui/Breadcrumb.vue', () => ({
  default: { template: '<div class="mock-breadcrumb">Breadcrumb</div>' },
}));

vi.mock('@/components/verification/PratinjauPekebunDanDokumenProposal.vue', () => ({
  default: { template: '<div class="mock-pratinjau">Pratinjau</div>' },
}));

vi.mock('@/components/rekomtek/LogStatusUsulan.vue', () => ({
  default: { template: '<div class="mock-logs">Logs</div>' },
}));

vi.mock('@/components/approval/ApprovalConfirmationModal.vue', () => ({
  default: {
    template: '<div class="mock-confirm-modal" v-if="isOpen"><button class="confirm-btn" @click="$emit(\'confirm\')">Confirm</button></div>',
    props: ['isOpen', 'actionType', 'destinationStage', 'notes'],
    emits: ['confirm', 'close'],
  },
}));

vi.mock('@/components/ui/DocumentPreviewModal.vue', () => ({
  default: { template: '<div class="mock-preview-modal">Preview</div>' },
}));

vi.mock('@/components/ui/AuditTrailSidebar.vue', () => ({
  default: { template: '<div class="mock-audit">Audit</div>' },
}));

describe('ApprovalDitjenbunView Document (REKOMTEK) Validation State', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposal: any = {
    id: 'REQ-100',
    nomorProposal: 'PROP-100',
    nomor_proposal: 'PROP-100',
    currentStatus: PengajuanStatus.DITJEN_VERIF_SUBMITTED,
    status: 'DITJEN_VERIF_SUBMITTED',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    no_rekomtek: '001/REK/2026',
    bentuk_bantuan: 'BARANG',
    documents: [
      { id: 10, document_type: 'REKOMTEK', file_name: 'rekomtek.pdf', file_url: 'https://example.com/rekomtek.pdf' },
      { id: 11, document_type: 'SK_CPCL', file_name: 'sk_cpcl.pdf', file_url: 'https://example.com/sk_cpcl.pdf' },
      { id: 12, document_type: 'SURAT_PENGANTAR_SK_CPCL', file_name: 'surat.pdf', file_url: 'https://example.com/surat.pdf' },
      { id: 13, document_type: 'BA_VERIFIKASI', file_name: 'ba.pdf', file_url: 'https://example.com/ba.pdf' },
      { id: 14, document_type: 'BA_VERIFIKASI_LAPANGAN', file_name: 'ba_lap.pdf', file_url: 'https://example.com/ba_lap.pdf' },
    ],
  };

  it('sets REKOMTEK validation state to APPROVED and REJECTED via user toggle in active review', async () => {
    const authStore = useAuthStore();
    authStore.setRole('DITJENBUN_APPROVAL');

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = { ...mockProposal };
    pengusulanStore.getProposalDetail = vi.fn().mockImplementation(async () => {
      pengusulanStore.activePengajuan = { ...mockProposal };
      return mockProposal;
    });
    pengusulanStore.getSpatialOverlap = vi.fn().mockResolvedValue({ active_polygons: [], other_proposals: [] });
    pengusulanStore.getProposalDocumentValidations = vi.fn().mockResolvedValue([]);

    const wrapper = mount(ApprovalDitjenbunView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    await vi.dynamicImportSettled();
    await new Promise((r) => setTimeout(r, 50));

    // Move to step 2 (Review Rekomtek)
    const nextStepBtn = wrapper.findAll('button').find((b) => b.text().includes('Lanjut ke Review Rekomtek'));
    expect(nextStepBtn?.exists()).toBe(true);
    await nextStepBtn!.trigger('click');

    // Find Setuju and Tolak buttons
    const setujuBtn = wrapper.findAll('button').find((b) => b.text().includes('Setuju'));
    const tolakBtn = wrapper.findAll('button').find((b) => b.text().includes('Tolak'));
    expect(setujuBtn?.exists()).toBe(true);
    expect(tolakBtn?.exists()).toBe(true);

    // Initial state: push button disabled
    const pushBtn = wrapper.findAll('button').find((b) => b.text().includes('Push ke BPDP'));
    expect(pushBtn?.attributes('disabled')).toBeDefined();

    // Click Setuju -> REKOMTEK validated as APPROVED
    await setujuBtn!.trigger('click');
    expect(setujuBtn!.classes()).toContain('bg-emerald-600');
    expect(pushBtn?.attributes('disabled')).toBeUndefined();

    // Click Tolak -> REKOMTEK validated as REJECTED
    await tolakBtn!.trigger('click');
    expect(tolakBtn!.classes()).toContain('bg-rose-600');

    // Rejection textarea should be visible
    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    await textarea.setValue('Catatan perbaikan nomor');

    // Revision button should appear
    const revisiBtn = wrapper.findAll('button').find((b) => b.text().includes('Revisi Kembali ke Verifikator'));
    expect(revisiBtn?.exists()).toBe(true);
  });

  it('loads existing REKOMTEK validation from DITJENBUN_APPROVAL', async () => {
    const authStore = useAuthStore();
    authStore.setRole('DITJENBUN_APPROVAL');

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = { ...mockProposal };
    pengusulanStore.getProposalDetail = vi.fn().mockImplementation(async () => {
      pengusulanStore.activePengajuan = { ...mockProposal };
      return mockProposal;
    });
    pengusulanStore.getSpatialOverlap = vi.fn().mockResolvedValue({ active_polygons: [], other_proposals: [] });
    pengusulanStore.getProposalDocumentValidations = vi.fn().mockResolvedValue([
      {
        id: 1,
        dokumen_proposal_id: 10,
        document_type: 'REKOMTEK',
        is_valid: true,
        notes: 'Dokumen Rekomtek disetujui',
        validated_by_role: 'DITJENBUN_APPROVAL',
        created_at: '2026-08-01T10:00:00Z',
      },
    ]);

    const wrapper = mount(ApprovalDitjenbunView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    await vi.dynamicImportSettled();
    await new Promise((r) => setTimeout(r, 50));

    // Move to step 2
    const nextStepBtn = wrapper.findAll('button').find((b) => b.text().includes('Lanjut ke Review Rekomtek'));
    expect(nextStepBtn?.exists()).toBe(true);
    await nextStepBtn!.trigger('click');

    const setujuBtn = wrapper.findAll('button').find((b) => b.text().includes('Setuju'));
    expect(setujuBtn!.classes()).toContain('bg-emerald-600');

    const pushBtn = wrapper.findAll('button').find((b) => b.text().includes('Push ke BPDP'));
    expect(pushBtn?.attributes('disabled')).toBeUndefined();
  });

  it('loads existing REKOMTEK rejection from BPDP when proposal is returned from BPDP', async () => {
    const authStore = useAuthStore();
    authStore.setRole('DITJENBUN_APPROVAL');

    const returnedProposal = {
      ...mockProposal,
      status: 'REV_FROM_BPDP_VERIF',
      currentStatus: 'REV_FROM_BPDP_VERIF',
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = { ...returnedProposal };
    pengusulanStore.getProposalDetail = vi.fn().mockImplementation(async () => {
      pengusulanStore.activePengajuan = { ...returnedProposal };
      return returnedProposal;
    });
    pengusulanStore.getSpatialOverlap = vi.fn().mockResolvedValue({ active_polygons: [], other_proposals: [] });
    pengusulanStore.getProposalDocumentValidations = vi.fn().mockResolvedValue([
      {
        id: 5,
        dokumen_proposal_id: 10,
        document_type: 'REKOMTEK',
        is_valid: false,
        notes: 'Format nomor Rekomtek tidak sesuai permentan',
        validated_by_role: 'BPDP_VERIFIKATOR',
        created_at: '2026-08-02T10:00:00Z',
      },
    ]);

    const wrapper = mount(ApprovalDitjenbunView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    await vi.dynamicImportSettled();
    await new Promise((r) => setTimeout(r, 50));

    // Move to step 2
    const nextStepBtn = wrapper.findAll('button').find((b) => b.text().includes('Lanjut ke Review Rekomtek'));
    expect(nextStepBtn?.exists()).toBe(true);
    await nextStepBtn!.trigger('click');

    const tolakBtn = wrapper.findAll('button').find((b) => b.text().includes('Tolak'));
    expect(tolakBtn!.classes()).toContain('bg-rose-600');

    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Format nomor Rekomtek tidak sesuai permentan');
  });

  it('submits REKOMTEK validation payload when approving proposal to BPDP', async () => {
    const authStore = useAuthStore();
    authStore.setRole('DITJENBUN_APPROVAL');

    const verifStore = useVerifikasiDitjenbunStore();
    const submitToBPDPSpy = vi.spyOn(verifStore, 'submitToBPDP').mockResolvedValue({} as any);

    const rekomtekStore = useRekomtekStore();
    vi.spyOn(rekomtekStore, 'approveDitjenbun').mockResolvedValue({} as any);

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = { ...mockProposal };
    pengusulanStore.getProposalDetail = vi.fn().mockImplementation(async () => {
      pengusulanStore.activePengajuan = { ...mockProposal };
      return mockProposal;
    });
    pengusulanStore.getSpatialOverlap = vi.fn().mockResolvedValue({ active_polygons: [], other_proposals: [] });
    pengusulanStore.getProposalDocumentValidations = vi.fn().mockResolvedValue([]);

    const wrapper = mount(ApprovalDitjenbunView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    await vi.dynamicImportSettled();
    await new Promise((r) => setTimeout(r, 50));

    // Move to step 2 and approve
    const nextStepBtn = wrapper.findAll('button').find((b) => b.text().includes('Lanjut ke Review Rekomtek'));
    expect(nextStepBtn?.exists()).toBe(true);
    await nextStepBtn!.trigger('click');

    const setujuBtn = wrapper.findAll('button').find((b) => b.text().includes('Setuju'));
    await setujuBtn!.trigger('click');

    const pushBtn = wrapper.findAll('button').find((b) => b.text().includes('Push ke BPDP'));
    await pushBtn!.trigger('click');

    // Confirm modal should open
    const confirmModal = wrapper.findComponent({ name: 'ApprovalConfirmationModal' });
    expect(confirmModal.exists()).toBe(true);
    await confirmModal.vm.$emit('confirm');

    expect(submitToBPDPSpy).toHaveBeenCalledWith(
      'REQ-100',
      expect.objectContaining({
        rekomtekDocId: 10,
        validations: expect.arrayContaining([
          expect.objectContaining({
            dokumen_proposal_id: 10,
            document_type: 'REKOMTEK',
            is_valid: true,
            validated_by_role: 'DITJENBUN_APPROVAL',
          }),
        ]),
      }),
    );
  });

  it('renders validation state badge in readonly mode for DITJEN_APPR_SUBMITTED', async () => {
    const authStore = useAuthStore();
    authStore.setRole('DITJENBUN_APPROVAL');

    const approvedProposal = {
      ...mockProposal,
      status: 'DITJEN_APPR_SUBMITTED',
      currentStatus: 'DITJEN_APPR_SUBMITTED',
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.activePengajuan = { ...approvedProposal };
    pengusulanStore.getProposalDetail = vi.fn().mockImplementation(async () => {
      pengusulanStore.activePengajuan = { ...approvedProposal };
      return approvedProposal;
    });
    pengusulanStore.getSpatialOverlap = vi.fn().mockResolvedValue({ active_polygons: [], other_proposals: [] });
    pengusulanStore.getProposalDocumentValidations = vi.fn().mockResolvedValue([]);

    const wrapper = mount(ApprovalDitjenbunView, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    await vi.dynamicImportSettled();
    await new Promise((r) => setTimeout(r, 50));

    // Move to step 2
    const nextStepBtn = wrapper.findAll('button').find((b) => b.text().includes('Lanjut ke Review Rekomtek'));
    expect(nextStepBtn?.exists()).toBe(true);
    await nextStepBtn!.trigger('click');

    // In readonly mode, action buttons (Setuju/Tolak) should NOT exist, but "Disetujui" badge should exist
    const setujuBtn = wrapper.findAll('button').find((b) => b.text() === 'Setuju');
    expect(setujuBtn).toBeUndefined();

    const badge = wrapper.findAll('span').find((s) => s.text().includes('Disetujui'));
    expect(badge?.exists()).toBe(true);
  });
});
