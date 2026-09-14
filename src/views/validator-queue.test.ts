// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { proposalService } from '@/services/proposal.service';
import QueueVerifikasiKabView from '@/views/dinas/kabupaten/QueueVerifikasiKabView.vue';
import QueueVerifikasiProvinsiView from '@/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue';
import AntreanRekomtekView from '@/views/ditjenbun/AntreanRekomtekView.vue';
import AntreanBpdpView from '@/views/bpdp/AntreanBpdpView.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div>home</div>' } }],
});

describe('Validator Queue Table Adjustments', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(proposalService, 'getList').mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    } as any);
  });

  describe('Kabupaten Queue', () => {
    it('renders Bahasa tabs without (My Task) or (Whole Task)', async () => {
      const wrapper = mount(QueueVerifikasiKabView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
            Badge: true,
          },
        },
      });

      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Tugas Saya');
      expect(text).toContain('Semua Usulan');
      expect(text).not.toContain('My Task');
      expect(text).not.toContain('Whole Task');
    });

    it('fetches only SUBMITTED and REV_FROM_PROV in Tugas Saya and displays Perlu Perbaikan', async () => {
      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          {
            id: 1,
            nomor_proposal: 'PROP-KAB-001',
            status: 'REV_FROM_PROV',
            currentStatus: 'REV_FROM_PROV',
            paket_sarpras: 'BENIH_PUPUK',
            total_anggaran: 10000000,
          },
        ],
        meta: { page: 1, limit: 10, total: 1 },
      } as any);

      const wrapper = mount(QueueVerifikasiKabView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['SUBMITTED', 'REV_FROM_PROV'],
        })
      );

      // Verify REV_FROM_PROV badge says "Perlu Perbaikan" without "(Provinsi)"
      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).not.toContain('Perlu Perbaikan (Provinsi)');
    });

    it('displays Sedang Perbaikan di Pemohon for REV_FROM_KAB and Perlu Perbaikan for REV_FROM_PROV in Semua Usulan', async () => {
      vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          { id: 1, nomor_proposal: 'P1', status: 'REV_FROM_PROV', currentStatus: 'REV_FROM_PROV' },
          { id: 2, nomor_proposal: 'P2', status: 'REV_FROM_KAB', currentStatus: 'REV_FROM_KAB' },
        ],
        meta: { page: 1, limit: 10, total: 2 },
      } as any);

      const wrapper = mount(QueueVerifikasiKabView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      const tabs = wrapper.findAll('button');
      const wholeTaskBtn = tabs.find((b) => b.text().includes('Semua Usulan'));
      await wholeTaskBtn?.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).toContain('Sedang Perbaikan di Pemohon');
    });
  });

  describe('Provinsi Queue', () => {
    it('renders Bahasa tabs without (My Task) or (Whole Task)', async () => {
      const wrapper = mount(QueueVerifikasiProvinsiView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
            Badge: true,
          },
        },
      });

      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Tugas Saya');
      expect(text).toContain('Semua Usulan');
      expect(text).not.toContain('My Task');
      expect(text).not.toContain('Whole Task');
    });

    it('fetches only KAB_SUBMITTED, REKOMTEK_KAB_ISSUED, REV_FROM_DITJEN_VERIF (no REV_FROM_PROV) and displays Perlu Perbaikan', async () => {
      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          {
            id: 2,
            nomor_proposal: 'PROP-PROV-001',
            status: 'REV_FROM_DITJEN_VERIF',
            currentStatus: 'REV_FROM_DITJEN_VERIF',
            paket_sarpras: 'BENIH_PUPUK',
            total_anggaran: 20000000,
          },
        ],
        meta: { page: 1, limit: 10, total: 1 },
      } as any);

      const wrapper = mount(QueueVerifikasiProvinsiView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['KAB_SUBMITTED', 'REKOMTEK_KAB_ISSUED', 'REV_FROM_DITJEN_VERIF'],
        })
      );

      // Verify REV_FROM_DITJEN_VERIF badge says "Perlu Perbaikan" without "(Ditjenbun)"
      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).not.toContain('Perlu Perbaikan (Ditjenbun)');
    });

    it('displays Sedang Perbaikan di Kabupaten for REV_FROM_PROV and Perlu Perbaikan for REV_FROM_DITJEN_VERIF in Semua Usulan', async () => {
      vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          { id: 1, nomor_proposal: 'P1', status: 'REV_FROM_PROV', currentStatus: 'REV_FROM_PROV' },
          { id: 2, nomor_proposal: 'P2', status: 'REV_FROM_DITJEN_VERIF', currentStatus: 'REV_FROM_DITJEN_VERIF' },
        ],
        meta: { page: 1, limit: 10, total: 2 },
      } as any);

      const wrapper = mount(QueueVerifikasiProvinsiView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: { template: '<div><slot /></div>' },
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      const tabs = wrapper.findAll('button');
      const wholeTaskBtn = tabs.find((b) => b.text().includes('Semua Usulan'));
      await wholeTaskBtn?.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Sedang Perbaikan di Kabupaten');
      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).not.toContain('Perlu Perbaikan (Provinsi)');
    });
  });

  describe('Ditjenbun Queue', () => {
    it('renders Bahasa tabs without (My Task) or (Whole Task)', () => {
      const wrapper = mount(AntreanRekomtekView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      const text = wrapper.text();
      expect(text).toContain('Tugas Saya');
      expect(text).toContain('Semua Usulan');
      expect(text).not.toContain('My Task');
      expect(text).not.toContain('Whole Task');
    });

    it('fetches PROV_SUBMITTED and REV_FROM_DITJEN_APPR for Verifikator and renders Perlu Perbaikan badge', async () => {
      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          {
            id: 3,
            nomor_proposal: 'PROP-DITJEN-001',
            status: 'REV_FROM_DITJEN_APPR',
            currentStatus: 'REV_FROM_DITJEN_APPR',
            paket_sarpras: 'BENIH_PUPUK',
          },
        ],
        meta: { page: 1, limit: 10, total: 1 },
      } as any);

      const wrapper = mount(AntreanRekomtekView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['PROV_SUBMITTED', 'REV_FROM_DITJEN_APPR'],
        })
      );

      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).not.toContain('Perbaikan (Dari Ketua)');
    });

    it('fetches DITJEN_VERIF_SUBMITTED and REV_FROM_BPDP_VERIF for Approval', async () => {
      const authStore = (await import('@/stores/auth')).useAuthStore();
      authStore.user = { id: 10, name: 'Ditjen Approval', email: 'ditjen@test.com', role: 'DITJENBUN_APPROVAL' };

      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0 },
      } as any);

      mount(AntreanRekomtekView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['DITJEN_VERIF_SUBMITTED', 'REV_FROM_BPDP_VERIF'],
        })
      );
    });

    it('displays Sedang Perbaikan di Provinsi for REV_FROM_DITJEN_VERIF and Menunggu Perbaikan for REV_FROM_DITJEN_APPR in Approval', async () => {
      const authStore = (await import('@/stores/auth')).useAuthStore();
      authStore.user = { id: 10, name: 'Ditjen Approval', email: 'ditjen@test.com', role: 'DITJENBUN_APPROVAL' };

      vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          { id: 1, nomor_proposal: 'P1', status: 'REV_FROM_DITJEN_VERIF', currentStatus: 'REV_FROM_DITJEN_VERIF' },
          { id: 2, nomor_proposal: 'P2', status: 'REV_FROM_DITJEN_APPR', currentStatus: 'REV_FROM_DITJEN_APPR' },
        ],
        meta: { page: 1, limit: 10, total: 2 },
      } as any);

      const wrapper = mount(AntreanRekomtekView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      const tabs = wrapper.findAll('button');
      const wholeTaskBtn = tabs.find((b) => b.text().includes('Semua Usulan'));
      await wholeTaskBtn?.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Sedang Perbaikan di Provinsi');
      expect(wrapper.text()).toContain('Menunggu Perbaikan');
    });
  });

  describe('BPDP Queue', () => {
    it('renders Bahasa tabs without (My Task) or (Whole Task)', () => {
      const wrapper = mount(AntreanBpdpView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      const text = wrapper.text();
      expect(text).toContain('Tugas Saya');
      expect(text).toContain('Semua Usulan');
      expect(text).not.toContain('My Task');
      expect(text).not.toContain('Whole Task');
    });

    it('fetches DITJEN_APPR_SUBMITTED and REV_FROM_BPDP_APPR for BPDP Verifikator and renders Perlu Perbaikan badge', async () => {
      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          {
            id: 4,
            nomor_proposal: 'PROP-BPDP-001',
            status: 'REV_FROM_BPDP_APPR',
            currentStatus: 'REV_FROM_BPDP_APPR',
            paket_sarpras: 'BENIH_PUPUK',
          },
        ],
        meta: { page: 1, limit: 10, total: 1 },
      } as any);

      const wrapper = mount(AntreanBpdpView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['DITJEN_APPR_SUBMITTED', 'REV_FROM_BPDP_APPR'],
        })
      );

      expect(wrapper.text()).toContain('Perlu Perbaikan');
      expect(wrapper.text()).not.toContain('Perbaikan (Revisi Kadiv)');
    });

    it('fetches only BPDP_VERIF_SUBMITTED for BPDP Approval (excluding REV_FROM_BPDP_APPR)', async () => {
      const authStore = (await import('@/stores/auth')).useAuthStore();
      authStore.user = { id: 20, name: 'BPDP Approval', email: 'bpdp@test.com', role: 'BPDP_APPROVAL' };

      const getListSpy = vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0 },
      } as any);

      mount(AntreanBpdpView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      expect(getListSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['BPDP_VERIF_SUBMITTED'],
        })
      );
    });

    it('displays Sedang Perbaikan di Ditjenbun for REV_FROM_BPDP_VERIF and Menunggu Perbaikan for REV_FROM_BPDP_APPR in Approval', async () => {
      const authStore = (await import('@/stores/auth')).useAuthStore();
      authStore.user = { id: 20, name: 'BPDP Approval', email: 'bpdp@test.com', role: 'BPDP_APPROVAL' };

      vi.spyOn(proposalService, 'getList').mockResolvedValue({
        data: [
          { id: 1, nomor_proposal: 'P1', status: 'REV_FROM_BPDP_VERIF', currentStatus: 'REV_FROM_BPDP_VERIF' },
          { id: 2, nomor_proposal: 'P2', status: 'REV_FROM_BPDP_APPR', currentStatus: 'REV_FROM_BPDP_APPR' },
        ],
        meta: { page: 1, limit: 10, total: 2 },
      } as any);

      const wrapper = mount(AntreanBpdpView, {
        global: {
          plugins: [router],
          stubs: {
            Breadcrumb: true,
            Button: true,
            Card: true,
            QueueFilter: true,
            Pagination: true,
            ExportProposalModal: true,
            ProposalWorkflowStaticStepper: true,
            Skeleton: true,
          },
        },
      });

      await flushPromises();

      const tabs = wrapper.findAll('button');
      const wholeTaskBtn = tabs.find((b) => b.text().includes('Semua Usulan'));
      await wholeTaskBtn?.trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Sedang Perbaikan di Ditjenbun');
      expect(wrapper.text()).toContain('Menunggu Perbaikan');
    });
  });
});
