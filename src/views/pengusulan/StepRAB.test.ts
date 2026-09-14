// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import StepRAB from './StepRAB.vue';
import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';
import { useAuthStore } from '@/stores/auth';
import { JenisSarpras } from '@/types/pengusulan';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/pengusulan/RabTable.vue', () => ({
  default: { template: '<div class="mock-rab-table">Rab Table Stub</div>' },
}));

vi.mock('@/components/ui/FileUpload.vue', () => ({
  default: { template: '<div class="mock-file-upload">Upload Stub</div>' },
}));

vi.mock('@/components/ui/DocumentPreviewModal.vue', () => ({
  default: { template: '<div class="mock-doc-preview">Preview Stub</div>' },
}));

vi.mock('@/components/pengusulan/ProposalPreviewModal.vue', () => ({
  default: { template: '<div class="mock-prop-preview">Prop Preview Stub</div>' },
}));

vi.mock('@/components/approval/ApprovalConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-approval-modal">Approval Stub</div>' },
}));

describe('StepRAB Proposal PDF Generation and Signature Design', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('generates proposal RAB without Pembulatan Kebawah row and with the updated signature design', async () => {
    const draftStore = usePengusulanDraftStore();
    const authStore = useAuthStore();

    authStore.user = {
      id: 'usr-1',
      name: 'Budi Akun Personal',
      email: 'sawit@makmur.id',
      role: 'PEMOHON',
      kelembagaan_id: 88,
      kelembagaan_name: 'Koperasi Sawit Makmur',
      nama_ketua: 'Haji Ahmad Dahlan',
    } as any;

    draftStore.selectedPaket = JenisSarpras.INTENSIFIKASI;
    draftStore.rabItems = [
      {
        id: 'item-1',
        jenis: 'Pupuk NPK',
        uraian: 'Pupuk Tambahan',
        varietas: '-',
        jumlahTahap1: 10,
        jumlahTahap2: 10,
        jumlahTotal: 20,
        satuan: 'Zak',
        hargaSatuan: 500000,
        subTotal: 10000000,
      },
    ];

    let generatedHtml = '';
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: any) => {
      const element = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'iframe') {
        const mockDoc = {
          open: vi.fn(),
          write: vi.fn((content: string) => {
            generatedHtml = content;
          }),
          close: vi.fn(),
        };
        Object.defineProperty(element, 'contentDocument', {
          value: mockDoc,
          writable: true,
        });
        Object.defineProperty(element, 'contentWindow', {
          value: {
            document: mockDoc,
            focus: vi.fn(),
            print: vi.fn(),
          },
          writable: true,
        });
      }
      return element;
    });

    const wrapper = mount(StepRAB, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    // Find the download button
    const downloadBtn = wrapper.findAll('button').find((b) => b.text().includes('Generate & Unduh RAB'));
    expect(downloadBtn).toBeDefined();

    // Trigger download request
    await downloadBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    // Confirm modal / popup appears
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('Ya, Generate'));
    expect(confirmBtn).toBeDefined();

    // Trigger confirm download
    await confirmBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    // Verify generated HTML content
    expect(generatedHtml).not.toContain('Pembulatan Kebawah');
    expect(generatedHtml).not.toContain('Total Pembulatan');
    expect(generatedHtml).toContain('Total Harga');

    // Verify signature format and alignment
    expect(generatedHtml).toContain('text-align: right');
    expect(generatedHtml).toContain('Mengetahui,');
    expect(generatedHtml).toContain('Koperasi Sawit Makmur');
    expect(generatedHtml).not.toContain('Budi Akun Personal');
    expect(generatedHtml).toContain('Haji Ahmad Dahlan');
    expect(generatedHtml).toContain('Ketua');

    // Signature structure order check
    const knowingIdx = generatedHtml.indexOf('Mengetahui,');
    const groupIdx = generatedHtml.indexOf('Koperasi Sawit Makmur', knowingIdx);
    const ketuaNameIdx = generatedHtml.indexOf('Haji Ahmad Dahlan', groupIdx);
    const ketuaRoleIdx = generatedHtml.indexOf('<p>Ketua</p>', ketuaNameIdx);

    expect(knowingIdx).toBeGreaterThan(-1);
    expect(groupIdx).toBeGreaterThan(knowingIdx);
    expect(ketuaNameIdx).toBeGreaterThan(groupIdx);
    expect(ketuaRoleIdx).toBeGreaterThan(ketuaNameIdx);
  });
});
