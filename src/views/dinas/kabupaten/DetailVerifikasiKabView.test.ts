// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import StepVerifikasiPekebunDanDokumenProposal from './StepVerifikasiPekebunDanDokumenProposal.vue';
import StepSummaryDanSubmit from './StepSummaryDanSubmit.vue';
import VerifikasiPekebunDetailView from './VerifikasiPekebunDetailView.vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import { JenisSarpras, PengajuanStatus } from '@/types/pengusulan';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';

const mockRouteParams = { id: 'REQ-001', cpclId: '101' };
const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: mockRouteParams }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/verification/VerificationOverlapMap.vue', () => ({
  default: { template: '<div class="mock-map">Map Stub</div>' },
}));

vi.mock('@/components/verification/VerificationDocViewer.vue', () => ({
  default: { template: '<div class="mock-doc-viewer">Doc Viewer Stub</div>' },
}));

vi.mock('@/components/pengusulan/RabTable.vue', () => ({
  default: { template: '<div class="mock-rab">Rab Stub</div>' },
}));

vi.mock('@/components/approval/KabupatenRevisiConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-revisi-modal">Revisi Modal Stub</div>' },
}));

vi.mock('@/components/pengusulan/DocumentVersionHistoryModal.vue', () => ({
  default: { template: '<div class="mock-history-modal">History Modal Stub</div>' },
}));

vi.mock('@/components/approval/ApprovalConfirmationModal.vue', () => ({
  default: { template: '<div class="mock-approval-modal">Approval Modal Stub</div>' },
}));

describe('Warehouse Photo Preview in Kabupaten Verification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposal = {
    id: 'REQ-001',
    nomorProposal: 'PROP-001',
    nomor_proposal: 'PROP-001',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    status: 'SUBMITTED',
    currentStatus: PengajuanStatus.SUBMITTED,
    detailUsulan: 'Usulan Gudang dan Sarpras',
    totalAnggaranPengajuan: 100000000,
    daftarCPCL: [],
    dokumen: [],
    documents: [],
    storage_area: {
      address: 'Jl. Perkebunan No. 5',
      coordinate: '-6.200000, 106.816666',
      exterior_photo_file_url: 'https://storage.example.com/photos/exterior-gudang.jpg',
      interior_photo_file_url: 'https://storage.example.com/photos/interior-gudang.png',
      fotoTampakDepan: {
        persyaratanId: 'gudang-depan',
        namaFile: 'foto_depan_asli.jpg',
        mimeType: 'image/jpeg',
        ukuranBytes: 1024,
        dataUrl: 'https://storage.example.com/photos/exterior-gudang.jpg',
      },
      fotoTampakDalam: {
        persyaratanId: 'gudang-dalam',
        namaFile: 'foto_dalam_asli.png',
        mimeType: 'image/png',
        ukuranBytes: 2048,
        dataUrl: 'https://storage.example.com/photos/interior-gudang.png',
      },
    },
  };

  it('renders and previews exterior and interior photos in Step 1 (StepVerifikasiPekebunDanDokumenProposal)', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    // Verify storage area photo rows exist
    const text = wrapper.text();
    expect(text).toContain('Foto Tampak Depan Gudang');
    expect(text).toContain('Foto Tampak Dalam Gudang');
    expect(text).toContain('foto_depan_asli.jpg');
    expect(text).toContain('foto_dalam_asli.png');

    // DocumentPreviewModal should be in the DOM
    const modal = wrapper.findComponent(DocumentPreviewModal);
    expect(modal.exists()).toBe(true);
    expect(modal.props('isOpen')).toBe(false);

    // Find preview buttons within warehouse section
    const buttons = wrapper.findAll('button');
    const previewButtons = buttons.filter((b) => b.text().includes('Pratinjau'));
    expect(previewButtons.length).toBeGreaterThanOrEqual(2);

    // Click exterior photo preview
    await previewButtons[0].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/exterior-gudang.jpg');
    expect(modal.props('mimeType')).toBe('image/jpeg');

    // Close preview modal
    await modal.vm.$emit('close');
    expect(modal.props('isOpen')).toBe(false);

    // Click interior photo preview
    await previewButtons[1].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/interior-gudang.png');
    expect(modal.props('mimeType')).toBe('image/png');
  });

  it('renders and previews exterior and interior photos in Step 3 (StepSummaryDanSubmit)', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    const wrapper = mount(StepSummaryDanSubmit, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    // Storage summary should show both photo rows
    const text = wrapper.text();
    expect(text).toContain('Gudang: Foto Tampak Depan');
    expect(text).toContain('Gudang: Foto Tampak Dalam');

    const modal = wrapper.findComponent(DocumentPreviewModal);
    expect(modal.exists()).toBe(true);
    expect(modal.props('isOpen')).toBe(false);

    // Find warehouse preview buttons in summary
    const buttons = wrapper.findAll('button');
    const previewButtons = buttons.filter((b) => b.text().includes('Pratinjau'));
    expect(previewButtons.length).toBeGreaterThanOrEqual(2);

    // Click exterior photo preview
    await previewButtons[0].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/exterior-gudang.jpg');
    expect(modal.props('mimeType')).toBe('image/jpeg');

    // Close modal
    await modal.vm.$emit('close');
    expect(modal.props('isOpen')).toBe(false);

    // Click interior photo preview
    await previewButtons[1].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/interior-gudang.png');
    expect(modal.props('mimeType')).toBe('image/png');
  });

  it('handles raw API storage_area without pre-mapped subobjects gracefully', async () => {
    const rawProposal = {
      ...mockProposal,
      storage_area: {
        address: 'Jl. Poros No. 10',
        coordinate: '-2.5, 120.3',
        exterior_photo_file_url: 'https://storage.example.com/photos/exterior-raw.webp',
        interior_photo_file_url: 'https://storage.example.com/photos/interior-raw.jpg',
      },
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [rawProposal as any];
    pengusulanStore.activePengajuan = rawProposal as any;

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const modal = wrapper.findComponent(DocumentPreviewModal);
    expect(modal.exists()).toBe(true);

    const buttons = wrapper.findAll('button').filter((b) => b.text().includes('Pratinjau'));
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Preview exterior
    await buttons[0].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/exterior-raw.webp');
    expect(modal.props('mimeType')).toBe('image/webp');

    // Preview interior
    await buttons[1].trigger('click');
    expect(modal.props('isOpen')).toBe(true);
    expect(modal.props('dataUrl')).toBe('https://storage.example.com/photos/interior-raw.jpg');
    expect(modal.props('mimeType')).toBe('image/jpeg');
  });
});

describe('RAB Proposal Verification Removal and Final PDF Generation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposalWithRab = {
    id: 'REQ-001',
    nomorProposal: 'PROP-001',
    nomor_proposal: 'PROP-001',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    status: 'SUBMITTED',
    currentStatus: PengajuanStatus.SUBMITTED,
    dokumen: [
      {
        id: '101',
        tipeDokumen: 'RAB_RK',
        persyaratanId: 'RAB_RK',
        namaFile: 'rab_usulan_petani.pdf',
        ukuranBytes: 10240,
        fileUrl: 'https://storage.example.com/docs/rab_usulan.pdf',
      },
      {
        id: '102',
        tipeDokumen: 'LEGALITAS_KP',
        persyaratanId: 'LEGALITAS_KP',
        namaFile: 'legalitas_lembaga.pdf',
        ukuranBytes: 5120,
        fileUrl: 'https://storage.example.com/docs/legalitas.pdf',
      },
    ],
    documents: [
      {
        id: 101,
        document_type: 'RAB_RK',
        file_name: 'rab_usulan_petani.pdf',
        file_size: 10240,
        file_url: 'https://storage.example.com/docs/rab_usulan.pdf',
      },
      {
        id: 102,
        document_type: 'LEGALITAS_KP',
        file_name: 'legalitas_lembaga.pdf',
        file_size: 5120,
        file_url: 'https://storage.example.com/docs/legalitas.pdf',
      },
    ],
    rabProposalItems: [
      {
        jenis: 'BARANG',
        uraian: 'Bibit Kelapa Sawit/Kelapa',
        subTotal: 50000000,
      },
    ],
  };

  it('renders RAB proposal document as read-only reference without validation buttons', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithRab as any];
    pengusulanStore.activePengajuan = mockProposalWithRab as any;

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const text = wrapper.text();
    // Verify informational label and file details exist
    expect(text).toContain('Dokumen RAB Usulan Bertandatangan');
    expect(text).toContain('Dokumen Referensi');
    expect(text).toContain('rab_usulan_petani.pdf');

    // Verify preview button is present for RAB proposal doc
    const rabPreviewBtn = wrapper.findAll('button').find((b) => b.text().includes('Pratinjau'));
    expect(rabPreviewBtn).toBeDefined();

    // Verify that NO rejection notes textarea for rabDocument exists
    const textareas = wrapper.findAll('textarea');
    const rabTextarea = textareas.find((t) => t.attributes('placeholder')?.includes('dokumen RAB'));
    expect(rabTextarea).toBeUndefined();
  });

  it('renders confirmation popup directly below RAB Final table and prints via iframe on confirm', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithRab as any];
    pengusulanStore.activePengajuan = mockProposalWithRab as any;

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    // Add a RAB item to unlock Step 2
    const { useVerifikasiKabDraftStore } = await import('@/stores/verifikasiKabDraft');
    const verifikasiStore = useVerifikasiKabDraftStore();
    verifikasiStore.rabItems = [
      {
        id: 'rab-1',
        tahap: 'Semua Tahap',
        uraian: 'Bibit Kelapa Genjah',
        volume: 100,
        satuan: 'Batang',
        hargaSatuan: 50000,
        subTotal: 5000000,
        jenis: 'BARANG',
        varietas: 'Genjah Salak',
        varietasCustom: '',
        jumlahTahap1: 100,
        jumlahTahap2: null,
        jumlahTahap3: null,
        jumlahTahap4: null,
        jumlahTotal: 100,
      },
    ];

    await wrapper.vm.$nextTick();

    // Find the Generate & Unduh RAB (PDF) button
    const generateBtn = wrapper.findAll('button').find((b) => b.text().includes('Generate & Unduh RAB (PDF)'));
    expect(generateBtn).toBeDefined();
    expect(generateBtn?.attributes('disabled')).toBeUndefined();

    // Click Generate & Unduh button
    await generateBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    // Confirmation popup should appear below the table
    const confirmPopup = wrapper.find('[data-testid="rab-download-confirm"]');
    expect(confirmPopup.exists()).toBe(true);
    expect(confirmPopup.text()).toContain('Sistem akan meng-generate dan mencetak dokumen RAB Final dalam format PDF');

    // Confirm button should be "Ya, Generate PDF"
    const confirmBtn = confirmPopup.findAll('button').find((b) => b.text().includes('Ya, Generate PDF'));
    expect(confirmBtn).toBeDefined();

    // Intercept iframe write to verify PDF HTML output
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

    // Trigger confirmation
    await confirmBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    // Confirmation popup should close
    expect(wrapper.find('[data-testid="rab-download-confirm"]').exists()).toBe(false);

    // Verify generated HTML removes Pembulatan and has the correct signature format
    expect(generatedHtml).not.toContain('Pembulatan Kebawah');
    expect(generatedHtml).toContain('Total Anggaran');
    expect(generatedHtml).toContain('Mengetahui,');
    expect(generatedHtml).toContain('Ketua');
  });

  it('excludes RAB documents from verification checklist and payloads in StepSummaryDanSubmit', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithRab as any];
    pengusulanStore.activePengajuan = mockProposalWithRab as any;

    const wrapper = mount(StepSummaryDanSubmit, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    const currentPersyaratanIds = vm.currentPersyaratan.map((p: any) => p.id);
    expect(currentPersyaratanIds.some((id: string) => id.toUpperCase().includes('RAB'))).toBe(false);

    const payloads = vm.buildValidationPayloads();
    expect(payloads.proposalDocPayload.some((p: any) => p.dokumen_proposal_id === 101)).toBe(false);
  });
});

describe('Pekebun Verification Status Synchronization in Modul 1 Table', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('synchronizes pekebun status as "Tidak Sesuai" when farmer document validation contains rejection', async () => {
    const pengusulanStore = usePengusulanStore();
    const verifikasiStore = (await import('@/stores/verifikasiKabDraft')).useVerifikasiKabDraftStore();

    const mockProposal = {
      id: 'REQ-001',
      nomorProposal: 'PROP-001',
      jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
      paket_sarpras: 'Ekstensifikasi Kelapa',
      status: 'SUBMITTED',
      daftarCPCL: [
        {
          id: '101',
          nik: '1234567890123456',
          namaPekebun: 'Budi Santoso',
          luasLahanHektar: 2.5,
          pekebun_id: 5,
        },
      ],
    };

    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    verifikasiStore.initForProposal('REQ-001');

    // Sync rejection from backend validation
    verifikasiStore.syncFarmerDocumentValidations(
      [
        {
          id: 1,
          farmer_profile_id: 5,
          document_id: 201,
          is_valid: false,
          notes: 'KTP buram',
        },
      ],
      [{ id: 5, nik: '1234567890123456', namaLengkap: 'Budi Santoso' }],
      mockProposal.daftarCPCL,
    );

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
          VerificationOverlapMap: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.groupedPekebunList[0].status).toBe('Tidak Sesuai');
  });

  it('synchronizes pekebun status as "Sesuai" when all farmer and land validations are valid', async () => {
    const pengusulanStore = usePengusulanStore();
    const verifikasiStore = (await import('@/stores/verifikasiKabDraft')).useVerifikasiKabDraftStore();

    const mockProposal = {
      id: 'REQ-001',
      nomorProposal: 'PROP-001',
      jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
      paket_sarpras: 'Ekstensifikasi Kelapa',
      status: 'SUBMITTED',
      daftarCPCL: [
        {
          id: '101',
          nik: '1234567890123456',
          namaPekebun: 'Budi Santoso',
          luasLahanHektar: 2.5,
          pekebun_id: 5,
        },
      ],
    };

    pengusulanStore.listPengajuan = [mockProposal as any];
    pengusulanStore.activePengajuan = mockProposal as any;

    verifikasiStore.initForProposal('REQ-001');

    // Sync approvals from backend validation
    verifikasiStore.syncFarmerDocumentValidations(
      [
        {
          id: 1,
          farmer_profile_id: 5,
          document_id: 201,
          is_valid: true,
          notes: '',
        },
      ],
      [{ id: 5, nik: '1234567890123456', namaLengkap: 'Budi Santoso' }],
      mockProposal.daftarCPCL,
    );

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
          VerificationOverlapMap: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.groupedPekebunList[0].status).toBe('Sesuai');
  });
});

describe('VerifikasiPekebunDetailView Next Pekebun Navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockRouteParams.id = 'REQ-001';
    mockRouteParams.cpclId = '101';
  });

  const mockMultiPekebunProposal = {
    id: 'REQ-001',
    nomorProposal: 'PROP-001',
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    status: 'SUBMITTED',
    currentStatus: PengajuanStatus.SUBMITTED,
    daftarCPCL: [
      {
        id: '101',
        nik: '1111111111111111',
        namaPekebun: 'Pekebun Satu',
        luasLahanHektar: 2.0,
        pekebun_id: 1,
        documents: [
          {
            id: '1001',
            documentType: 'SCAN_KTP',
            file_url: 'https://example.com/ktp1.pdf',
          },
        ],
      },
      {
        id: '102',
        nik: '2222222222222222',
        namaPekebun: 'Pekebun Dua',
        luasLahanHektar: 1.5,
        pekebun_id: 2,
        documents: [
          {
            id: '1002',
            documentType: 'SCAN_KTP',
            file_url: 'https://example.com/ktp2.pdf',
          },
        ],
      },
      {
        id: '103',
        nik: '3333333333333333',
        namaPekebun: 'Pekebun Tiga',
        luasLahanHektar: 3.0,
        pekebun_id: 3,
        documents: [
          {
            id: '1003',
            documentType: 'SCAN_KTP',
            file_url: 'https://example.com/ktp3.pdf',
          },
        ],
      },
    ],
    lahans: [
      { id: '101', pekebun_id: 1, documents: [] },
      { id: '102', pekebun_id: 2, documents: [] },
      { id: '103', pekebun_id: 3, documents: [] },
    ],
  };

  it('identifies hasNextPekebun and navigates to the next pekebun on button click', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockMultiPekebunProposal as any];
    pengusulanStore.activePengajuan = mockMultiPekebunProposal as any;

    const wrapper = mount(VerifikasiPekebunDetailView, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    vi.spyOn(pengusulanStore, 'bulkFarmerValidations').mockResolvedValue({});
    vi.spyOn(pengusulanStore, 'bulkLandValidations').mockResolvedValue({});

    const vm = wrapper.vm as any;
    expect(vm.hasNextPekebun).toBe(true);
    expect(vm.nextCpcl.id).toBe('102');

    await vm.goToNextPekebun();
    expect(mockPush).toHaveBeenCalledWith('/dinas/verifikasi/kabupaten/REQ-001/pekebun/102');
  });

  it('hides "Kembali ke Usulan" and shows "Simpan Validasi & Kembali ke Usulan" on the last pekebun', async () => {
    const singleProposal = {
      ...mockMultiPekebunProposal,
      daftarCPCL: [mockMultiPekebunProposal.daftarCPCL[0]],
      lahans: [mockMultiPekebunProposal.lahans[0]],
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [singleProposal as any];
    pengusulanStore.activePengajuan = singleProposal as any;
    vi.spyOn(pengusulanStore, 'bulkFarmerValidations').mockResolvedValue({});
    vi.spyOn(pengusulanStore, 'bulkLandValidations').mockResolvedValue({});

    const wrapper = mount(VerifikasiPekebunDetailView, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.hasNextPekebun).toBe(false);
    expect(vm.nextCpcl).toBeNull();

    // Check bottom action buttons
    const bottomBarText = wrapper.text();
    expect(bottomBarText).toContain('Simpan Validasi & Kembali ke Usulan');
    expect(bottomBarText).not.toContain('Lanjut ke Pekebun Berikutnya');

    // Calling goBack saves validation and returns
    await vm.goBack();
    expect(mockPush).toHaveBeenCalledWith('/dinas/verifikasi/kabupaten/REQ-001');
  });
});

describe('Foto Udara Upload Gating on Next Step in Kabupaten Verification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockProposalWithPekebun = {
    id: 'REQ-001',
    nomorProposal: 'PROP-001',
    nomor_proposal: 'PROP-001',
    status: 'SUBMITTED',
    currentStatus: PengajuanStatus.SUBMITTED,
    jenisSarpras: JenisSarpras.EKSTENSIFIKASI,
    paket_sarpras: 'Ekstensifikasi Kelapa',
    daftarCPCL: [
      {
        id: '101',
        namaPekebun: 'Budi Santoso',
        nik: '1234567890123456',
        luasLahanHektar: 2.5,
        jenisHakLahan: 'SHM',
        nomorSuratLahan: 'SHM-001',
      },
      {
        id: '102',
        namaPekebun: 'Siti Rahma',
        nik: '2345678901234567',
        luasLahanHektar: 1.5,
        jenisHakLahan: 'SKT',
        nomorSuratLahan: 'SKT-002',
      },
    ],
    lahans: [
      { id: '101', luasLahanHektar: 2.5, jenisHakLahan: 'SHM', nomorSuratLahan: 'SHM-001' },
      { id: '102', luasLahanHektar: 1.5, jenisHakLahan: 'SKT', nomorSuratLahan: 'SKT-002' },
    ],
    dokumen: [],
    documents: [],
  };

  it('disables next step button and warns when foto udara is not uploaded for all pekebun', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithPekebun as any];
    pengusulanStore.activePengajuan = mockProposalWithPekebun as any;

    const verifikasiStore = useVerifikasiKabDraftStore();
    verifikasiStore.initForProposal('REQ-001');

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.allFotoUdaraUploaded).toBe(false);
    expect(vm.missingFotoUdaraCount).toBe(2);

    // Find the next step button
    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Simpan & Lanjut ke SK CPCL'));
    expect(nextButton).toBeDefined();
    expect(nextButton!.attributes('disabled')).toBeDefined();

    // Verify warning text is displayed
    expect(wrapper.text()).toContain('Foto Udara belum lengkap');

    // Trying to proceed should not advance step
    await vm.validateAndProceed();
    expect(verifikasiStore.currentStep).toBe(1);
  });

  it('enables next step button when all foto udara are uploaded', async () => {
    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [mockProposalWithPekebun as any];
    pengusulanStore.activePengajuan = mockProposalWithPekebun as any;

    const verifikasiStore = useVerifikasiKabDraftStore();
    verifikasiStore.initForProposal('REQ-001');

    // Simulate uploaded foto udara for both pekebun
    verifikasiStore.fotoUdaraPerPekebun['101'] = {
      persyaratanId: 'foto-udara-101',
      namaFile: 'foto_udara_budi.jpg',
      mimeType: 'image/jpeg',
      ukuranBytes: 1024,
      dataUrl: 'data:image/jpeg;base64,...',
      uploadedAt: '12/12/2003',
    };
    verifikasiStore.fotoUdaraPerPekebun['102'] = {
      persyaratanId: 'foto-udara-102',
      namaFile: 'foto_udara_siti.jpg',
      mimeType: 'image/jpeg',
      ukuranBytes: 1024,
      dataUrl: 'data:image/jpeg;base64,...',
      uploadedAt: '12/12/2003',
    };
    verifikasiStore.rabDitandatangani = {
      persyaratanId: 'RAB_KAB_SIGNED',
      namaFile: 'rab_signed.pdf',
      mimeType: 'application/pdf',
      ukuranBytes: 2048,
      dataUrl: 'data:application/pdf;base64,...',
      uploadedAt: '12/12/2003',
    };

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.allFotoUdaraUploaded).toBe(true);
    expect(vm.missingFotoUdaraCount).toBe(0);

    // Find the next step button
    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Simpan & Lanjut ke SK CPCL'));
    expect(nextButton).toBeDefined();
    expect(nextButton!.attributes('disabled')).toBeUndefined();
  });

  it('requires foto udara for every lahan when a pekebun has multiple registered lahans', async () => {
    const multiLahanProposal = {
      ...mockProposalWithPekebun,
      daftarCPCL: [
        {
          id: '101',
          namaPekebun: 'Budi Santoso',
          nik: '1234567890123456',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-001',
        },
        {
          id: '103',
          namaPekebun: 'Budi Santoso',
          nik: '1234567890123456',
          luasLahanHektar: 1.0,
          jenisHakLahan: 'HGU',
          nomorSuratLahan: 'HGU-002',
        },
      ],
      lahans: [
        { id: 101, luas_lahan: 2.5, nomor_legalitas: 'SHM-001', documents: [] },
        { id: 103, luas_lahan: 1.0, nomor_legalitas: 'HGU-002', documents: [] },
      ],
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [multiLahanProposal as any];
    pengusulanStore.activePengajuan = multiLahanProposal as any;

    const verifikasiStore = useVerifikasiKabDraftStore();
    verifikasiStore.initForProposal('REQ-001');

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: { teleport: true },
      },
    });

    const vm = wrapper.vm as any;
    // Neither uploaded
    expect(vm.allFotoUdaraUploaded).toBe(false);

    // Upload for first lahan only (101)
    verifikasiStore.fotoUdaraPerPekebun['101'] = {
      persyaratanId: 'foto-udara-101',
      namaFile: 'foto_udara_bidang1.jpg',
      mimeType: 'image/jpeg',
      ukuranBytes: 1024,
      dataUrl: 'data:image/jpeg;base64,...',
      uploadedAt: '12/12/2026',
    };

    await wrapper.vm.$nextTick();

    // Still not complete because 103 is missing
    expect(vm.allFotoUdaraUploaded).toBe(false);

    // Now upload for second lahan (103)
    verifikasiStore.fotoUdaraPerPekebun['103'] = {
      persyaratanId: 'foto-udara-103',
      namaFile: 'foto_udara_bidang2.jpg',
      mimeType: 'image/jpeg',
      ukuranBytes: 1024,
      dataUrl: 'data:image/jpeg;base64,...',
      uploadedAt: '12/12/2026',
    };

    await wrapper.vm.$nextTick();

    // Now both lahans are covered, so complete!
    expect(vm.allFotoUdaraUploaded).toBe(true);
    expect(vm.missingFotoUdaraCount).toBe(0);
  });

  it('recognizes foto udara preloaded in proposal lahans documents', async () => {
    const preloadedProposal = {
      ...mockProposalWithPekebun,
      daftarCPCL: [
        {
          id: '101',
          namaPekebun: 'Budi Santoso',
          nik: '1234567890123456',
          luasLahanHektar: 2.5,
          jenisHakLahan: 'SHM',
          nomorSuratLahan: 'SHM-001',
        },
        {
          id: '103',
          namaPekebun: 'Budi Santoso',
          nik: '1234567890123456',
          luasLahanHektar: 1.0,
          jenisHakLahan: 'HGU',
          nomorSuratLahan: 'HGU-002',
        },
      ],
      lahans: [
        {
          id: 101,
          luas_lahan: 2.5,
          nomor_legalitas: 'SHM-001',
          documents: [
            {
              id: 991,
              document_type: 'FOTO_UDARA',
              file_name: 'foto_udara_101.jpg',
              file_url: 'https://storage.example.com/fu101.jpg',
            },
          ],
        },
        {
          id: 103,
          luas_lahan: 1.0,
          nomor_legalitas: 'HGU-002',
          documents: [
            {
              id: 992,
              document_type: 'FOTO_UDARA',
              file_name: 'foto_udara_103.jpg',
              file_url: 'https://storage.example.com/fu103.jpg',
            },
          ],
        },
      ],
    };

    const pengusulanStore = usePengusulanStore();
    pengusulanStore.listPengajuan = [preloadedProposal as any];
    pengusulanStore.activePengajuan = preloadedProposal as any;

    const verifikasiStore = useVerifikasiKabDraftStore();
    verifikasiStore.initForProposal('REQ-001');

    const wrapper = mount(StepVerifikasiPekebunDanDokumenProposal, {
      global: {
        stubs: { teleport: true },
      },
    });

    const vm = wrapper.vm as any;
    expect(vm.allFotoUdaraUploaded).toBe(true);
    expect(vm.missingFotoUdaraCount).toBe(0);
  });
});
