// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import CekiDitjenbunView from './CekiDitjenbunView.vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useAuthStore } from '@/stores/auth';
import { PengajuanStatus, JenisSarpras } from '@/types/pengusulan';

const mockRouteParams = { id: 'REQ-100' };
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: mockRouteParams, path: '/ditjenbun/rekomtek/REQ-100' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/ui/Breadcrumb.vue', () => ({
  default: { template: '<div class="mock-breadcrumb">Breadcrumb Stub</div>' },
}));

vi.mock('@/components/verification/PratinjauPekebunDanDokumenProposal.vue', () => ({
  default: { template: '<div class="mock-pratinjau">Pratinjau Stub</div>' },
}));

vi.mock('@/components/rekomtek/LogStatusUsulan.vue', () => ({
  default: { template: '<div class="mock-logs">Logs Stub</div>' },
}));

vi.mock('@/components/rekomtek/FormPengembalianModal.vue', () => ({
  default: { template: '<div class="mock-return-modal">Return Modal Stub</div>' },
}));

vi.mock('@/components/approval/ApprovalConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-approval-modal">Approval Modal Stub</div>' },
}));

vi.mock('@/components/ui/DocumentPreviewModal.vue', () => ({
  default: { template: '<div class="mock-preview-modal">Preview Modal Stub</div>' },
}));

vi.mock('@/components/ui/AuditTrailSidebar.vue', () => ({
  default: { template: '<div class="mock-audit">Audit Stub</div>' },
}));

describe('CekiDitjenbunView Validation State Role Filtering', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposal = {
    id: 'REQ-100',
    nomorProposal: 'PROP-100',
    nomor_proposal: 'PROP-100',
    currentStatus: PengajuanStatus.PROV_SUBMITTED,
    status: 'PROV_SUBMITTED',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    documents: [
      { id: 10, document_type: 'SK_CPCL', file_name: 'sk_cpcl.pdf', file_url: 'https://example.com/sk_cpcl.pdf' },
      { id: 11, document_type: 'SURAT_PENGANTAR_SK_CPCL', file_name: 'surat_pengantar.pdf', file_url: 'https://example.com/sp.pdf' },
      { id: 12, document_type: 'BERITA_ACARA_DOKUMEN', file_name: 'ba_verifikasi.pdf', file_url: 'https://example.com/ba.pdf' },
      { id: 13, document_type: 'BERITA_ACARA_LAPANGAN', file_name: 'ba_lapangan.pdf', file_url: 'https://example.com/ba_lap.pdf' },
      { id: 14, document_type: 'REKOMTEK', file_name: 'rekomtek.pdf', file_url: 'https://example.com/rekomtek.pdf' },
    ],
    daftarCPCL: [],
    lahans: [],
  };

  it('ignores validations from KABUPATEN and PROVINSI roles', async () => {
    const authStore = useAuthStore();
    authStore.user = { id: 1, name: 'Verifikator Ditjenbun', email: 'verif@ditjenbun.go.id', role: 'DITJENBUN_VERIFIKATOR' };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    // Simulate backend returning validations created by Kabupaten and Provinsi
    vi.spyOn(pengusulanStore, 'getProposalDetail').mockResolvedValue(mockProposal as any);
    vi.spyOn(pengusulanStore, 'getSpatialOverlap').mockResolvedValue(null as any);
    vi.spyOn(pengusulanStore, 'getProposalDocumentValidations').mockResolvedValue([
      {
        id: 1,
        dokumen_proposal_id: 10,
        document_type: 'SK_CPCL',
        is_valid: true,
        notes: 'Disetujui oleh Kabupaten',
        validated_by_role: 'DINAS_KABUPATEN',
        created_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 2,
        dokumen_proposal_id: 11,
        document_type: 'SURAT_PENGANTAR_SK_CPCL',
        is_valid: true,
        notes: 'Disetujui oleh Provinsi',
        validated_by_role: 'PROVINSI',
        created_at: '2026-08-02T10:00:00Z',
      },
      {
        id: 3,
        dokumen_proposal_id: 12,
        document_type: 'BERITA_ACARA_DOKUMEN',
        is_valid: true,
        notes: 'Disetujui oleh Kabupaten',
        validated_by_role: 'KABUPATEN',
        created_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 4,
        dokumen_proposal_id: 13,
        document_type: 'BERITA_ACARA_LAPANGAN',
        is_valid: false,
        notes: 'Ditolak oleh Provinsi',
        validated_by_role: 'DINAS_PROVINSI',
        created_at: '2026-08-02T10:00:00Z',
      },
    ]);

    const wrapper = mount(CekiDitjenbunView, {
      global: {
        stubs: {
          teleport: true,
          'router-link': { template: '<a><slot /></a>' },
        },
      },
    });

    // Wait for onMounted async calls
    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as any;

    // All Ditjenbun document validation states should remain null (unverified)
    expect(vm.validations.skCpcl.valid).toBeNull();
    expect(vm.validations.skCpcl.note).toBe('');

    expect(vm.validations.suratPengantarProv.valid).toBeNull();
    expect(vm.validations.suratPengantarProv.note).toBe('');

    expect(vm.validations.beritaAcara.valid).toBeNull();
    expect(vm.validations.beritaAcara.note).toBe('');

    expect(vm.validations.beritaAcaraLapangan.valid).toBeNull();
    expect(vm.validations.beritaAcaraLapangan.note).toBe('');

    expect(vm.rekomtekValidationNote).toBe('');
  });

  it('populates validation states from DITJENBUN and BPDP roles (verif & approval)', async () => {
    const authStore = useAuthStore();
    authStore.user = { id: 1, name: 'Verifikator Ditjenbun', email: 'verif@ditjenbun.go.id', role: 'DITJENBUN_VERIFIKATOR' };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    vi.spyOn(pengusulanStore, 'getProposalDetail').mockResolvedValue(mockProposal as any);
    vi.spyOn(pengusulanStore, 'getSpatialOverlap').mockResolvedValue(null as any);
    vi.spyOn(pengusulanStore, 'getProposalDocumentValidations').mockResolvedValue([
      // Older validation from KABUPATEN (should be ignored)
      {
        id: 1,
        dokumen_proposal_id: 10,
        document_type: 'SK_CPCL',
        is_valid: true,
        notes: 'Kabupaten approved',
        validated_by_role: 'DINAS_KABUPATEN',
        created_at: '2026-08-01T10:00:00Z',
      },
      // DITJENBUN_VERIFIKATOR validation
      {
        id: 2,
        dokumen_proposal_id: 10,
        document_type: 'SK_CPCL',
        is_valid: true,
        notes: 'SK CPCL lengkap dan sah',
        validated_by_role: 'DITJENBUN_VERIFIKATOR',
        created_at: '2026-08-03T10:00:00Z',
      },
      // DITJENBUN_APPROVAL rejection on Rekomtek
      {
        id: 3,
        dokumen_proposal_id: 14,
        document_type: 'REKOMTEK',
        is_valid: false,
        notes: 'Revisi draf rekomtek: nomor belum sesuai format',
        validated_by_role: 'DITJENBUN_APPROVAL',
        created_at: '2026-08-04T10:00:00Z',
      },
      // BPDP_VERIFIKATOR validation
      {
        id: 4,
        dokumen_proposal_id: 11,
        document_type: 'SURAT_PENGANTAR_SK_CPCL',
        is_valid: false,
        notes: 'Tanda tangan gubernur/kadis belum terlampir',
        validated_by_role: 'BPDP_VERIFIKATOR',
        created_at: '2026-08-05T10:00:00Z',
      },
      // BPDP_APPROVAL validation
      {
        id: 5,
        dokumen_proposal_id: 12,
        document_type: 'BERITA_ACARA_DOKUMEN',
        is_valid: true,
        notes: 'BA Verifikasi valid',
        validated_by_role: 'BPDP_APPROVAL',
        created_at: '2026-08-06T10:00:00Z',
      },
    ]);

    const wrapper = mount(CekiDitjenbunView, {
      global: {
        stubs: {
          teleport: true,
          'router-link': { template: '<a><slot /></a>' },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as any;

    // SK CPCL populated from DITJENBUN_VERIFIKATOR
    expect(vm.validations.skCpcl.valid).toBe(true);
    expect(vm.validations.skCpcl.note).toBe('SK CPCL lengkap dan sah');

    // Surat Pengantar populated from BPDP_VERIFIKATOR
    expect(vm.validations.suratPengantarProv.valid).toBe(false);
    expect(vm.validations.suratPengantarProv.note).toBe('Tanda tangan gubernur/kadis belum terlampir');

    // BA Verifikasi populated from BPDP_APPROVAL
    expect(vm.validations.beritaAcara.valid).toBe(true);
    expect(vm.validations.beritaAcara.note).toBe('BA Verifikasi valid');

    // BA Lapangan has no Ditjenbun/BPDP validation -> remains null
    expect(vm.validations.beritaAcaraLapangan.valid).toBeNull();
    expect(vm.validations.beritaAcaraLapangan.note).toBe('');

    // REKOMTEK note populated from DITJENBUN_APPROVAL rejection
    expect(vm.rekomtekValidationNote).toBe('Revisi draf rekomtek: nomor belum sesuai format');
  });
});
