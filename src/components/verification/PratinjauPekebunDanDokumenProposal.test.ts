// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PratinjauPekebunDanDokumenProposal from './PratinjauPekebunDanDokumenProposal.vue';
import ProvinsiPratinjauView from '@/views/dinas/provinsi/PratinjauPekebunDanDokumenProposal.vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { JenisSarpras, PengajuanStatus } from '@/types/pengusulan';
import RabTable from '@/components/pengusulan/RabTable.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'REQ-PROV-001' } }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/verification/VerificationOverlapMap.vue', () => ({
  default: { template: '<div class="mock-map">Map Stub</div>' },
}));

vi.mock('@/components/verification/PratinjauPekebunModal.vue', () => ({
  default: { template: '<div class="mock-pekebun-modal">Pekebun Modal Stub</div>' },
}));

describe('PratinjauPekebunDanDokumenProposal RAB Detailing in All Validators', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposalWithRabFinal = {
    id: 'REQ-PROV-001',
    nomorProposal: 'PROP-PROV-001',
    nomor_proposal: 'PROP-PROV-001',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    status: 'KAB_SUBMITTED',
    currentStatus: PengajuanStatus.KAB_SUBMITTED,
    documents: [
      {
        id: 201,
        document_type: 'RAB_KAB_SIGNED',
        file_name: 'rab_kabupaten_signed.pdf',
        file_size: 15360,
        file_url: 'https://storage.example.com/docs/rab_kabupaten_signed.pdf',
      },
    ],
    rabFinalItems: [
      {
        id: 'item-final-1',
        jenis: 'BARANG',
        uraian: 'Bibit Kelapa Hibrida',
        varietas: 'Kelapa Hibrida Varietas A',
        varietasCustom: '',
        jumlahTahap1: 60,
        jumlahTahap2: 40,
        jumlahTotal: 100,
        volume: 100,
        satuan: 'Batang',
        hargaSatuan: 50000,
        subTotal: 5000000,
      },
      {
        id: 'item-final-2',
        jenis: 'BARANG',
        uraian: 'Pupuk Organik',
        varietas: 'Kelapa Varietas Lainnya',
        varietasCustom: 'Lokal Unggul',
        jumlahTahap1: 500,
        jumlahTahap2: 500,
        jumlahTotal: 1000,
        volume: 1000,
        satuan: 'Kg',
        hargaSatuan: 10000,
        subTotal: 10000000,
      },
    ],
  };

  it('renders RabTable with stage detailing (Tahap 1, Tahap 2) and varietas, without Tahap Final column', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithRabFinal as any];
    pengusulanStore.activePengajuan = mockProposalWithRabFinal as any;

    const wrapper = mount(PratinjauPekebunDanDokumenProposal, {
      props: {
        proposalId: 'REQ-PROV-001',
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Verify RabTable component is used
    const rabTable = wrapper.findComponent(RabTable);
    expect(rabTable.exists()).toBe(true);
    expect(rabTable.props('readonly')).toBe(true);

    const text = wrapper.text();
    // Header for RAB Final section
    expect(text).toContain('Rencana Anggaran Biaya (RAB) Final');
    expect(text).toContain('Tabel Rincian RAB Final');
    expect(text).toContain('Total Anggaran RAB Final');
    expect(text).toContain('Rp 15.000.000');

    // Should contain detailing columns in RabTable
    expect(text).toContain('Jenis');
    expect(text).toContain('Barang');
    expect(text).toContain('Varietas');
    expect(text).toContain('Jumlah Tahap 1');
    expect(text).toContain('Jumlah Tahap 2');

    // Should NOT contain a standalone "Tahap" column or "Tahap FINAL" text from old table
    const ths = rabTable.findAll('th').map((th) => th.text());
    expect(ths).not.toContain('Tahap');

    // Should display items and their varietas
    expect(text).toContain('Bibit Kelapa Hibrida');
    expect(text).toContain('Kelapa Hibrida Varietas A');
    expect(text).toContain('Pupuk Organik');
    expect(text).toContain('Kelapa Varietas Lainnya (Lokal Unggul)');

    // Should display signed document
    expect(text).toContain('Dokumen RAB Bertandatangan');
    expect(text).toContain('rab_kabupaten_signed.pdf');
  });

  it('works identically when wrapped in views/dinas/provinsi/PratinjauPekebunDanDokumenProposal.vue', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithRabFinal as any];
    pengusulanStore.activePengajuan = mockProposalWithRabFinal as any;

    const wrapper = mount(ProvinsiPratinjauView, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const rabTable = wrapper.findComponent(RabTable);
    expect(rabTable.exists()).toBe(true);
    expect(rabTable.props('readonly')).toBe(true);

    const text = wrapper.text();
    expect(text).toContain('Tabel Rincian RAB Final');
    expect(text).toContain('Tahap 1');
    expect(text).toContain('Tahap 2');
    expect(text).toContain('Kelapa Hibrida Varietas A');
  });
});
