// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import StepPilihPekebunLahan from './StepPilihPekebunLahan.vue';
import { JenisLegalitas } from '@/types/pekebun';
import { useLahanStore } from '@/stores/lahan';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/components/ui/DocumentPreviewModal.vue', () => ({
  default: { template: '<div class="mock-doc-preview">Doc Preview Stub</div>' },
}));

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('StepPilihPekebunLahan Pagination', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  function createMockPekebun(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `pekebun-${i + 1}`,
      nama: `Pekebun ${String(i + 1).padStart(2, '0')}`,
      nik: `12345678901234${String(i + 1).padStart(2, '0')}`,
      lahan: [],
    }));
  }

  it('renders only 10 pekebun initially when there are 16 pekebun and shows "Lihat lebih banyak pekebun" button', async () => {
    const authStore = useAuthStore();
    authStore.user = { kelembagaan_id: 1 } as any;

    const lahanStore = useLahanStore();
    vi.spyOn(lahanStore, 'getPekebunLandsByKelembagaanId').mockResolvedValue([] as any);
    vi.spyOn(lahanStore, 'getPekebunLands').mockReturnValue([
      { id: 'lahan-1', luasLahan: 2, jenisLegalitas: JenisLegalitas.SHM, nomorLegalitas: '123' } as any,
    ]);

    const mockData = createMockPekebun(16);
    lahanStore.pekebunList = mockData as any;

    const wrapper = mount(StepPilihPekebunLahan);

    // Initial visible items should be 10
    const pekebunCards = wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun '));
    expect(pekebunCards.length).toBe(10);

    // The load more button should be present
    const loadMoreBtn = wrapper.findAll('button').find(btn => btn.text().includes('Lihat lebih banyak pekebun'));
    expect(loadMoreBtn).toBeDefined();
    expect(loadMoreBtn?.exists()).toBe(true);

    // Click "Lihat lebih banyak pekebun" -> loads 5 more (15 visible)
    await loadMoreBtn?.trigger('click');
    const pekebunCardsAfterFirstClick = wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun '));
    expect(pekebunCardsAfterFirstClick.length).toBe(15);

    // Button should still be visible because 15 < 16
    const loadMoreBtn2 = wrapper.findAll('button').find(btn => btn.text().includes('Lihat lebih banyak pekebun'));
    expect(loadMoreBtn2).toBeDefined();
    expect(loadMoreBtn2?.exists()).toBe(true);

    // Click again -> loads remaining (16 visible)
    await loadMoreBtn2?.trigger('click');
    const pekebunCardsAfterSecondClick = wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun '));
    expect(pekebunCardsAfterSecondClick.length).toBe(16);

    // Button should now be hidden because all 16 pekebun are displayed
    const loadMoreBtnFinal = wrapper.findAll('button').find(btn => btn.text().includes('Lihat lebih banyak pekebun'));
    expect(loadMoreBtnFinal).toBeUndefined();
  });

  it('hides "Lihat lebih banyak pekebun" button when total pekebun is <= 10', async () => {
    const authStore = useAuthStore();
    authStore.user = { kelembagaan_id: 1 } as any;

    const lahanStore = useLahanStore();
    vi.spyOn(lahanStore, 'getPekebunLandsByKelembagaanId').mockResolvedValue([] as any);
    vi.spyOn(lahanStore, 'getPekebunLands').mockReturnValue([
      { id: 'lahan-1', luasLahan: 2, jenisLegalitas: JenisLegalitas.SHM, nomorLegalitas: '123' } as any,
    ]);

    const mockData = createMockPekebun(8);
    lahanStore.pekebunList = mockData as any;

    const wrapper = mount(StepPilihPekebunLahan);

    const pekebunCards = wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun '));
    expect(pekebunCards.length).toBe(8);

    const loadMoreBtn = wrapper.findAll('button').find(btn => btn.text().includes('Lihat lebih banyak pekebun'));
    expect(loadMoreBtn).toBeUndefined();
  });

  it('resets visible pekebun count to 10 when search query changes', async () => {
    const authStore = useAuthStore();
    authStore.user = { kelembagaan_id: 1 } as any;

    const lahanStore = useLahanStore();
    vi.spyOn(lahanStore, 'getPekebunLandsByKelembagaanId').mockResolvedValue([] as any);
    vi.spyOn(lahanStore, 'getPekebunLands').mockReturnValue([
      { id: 'lahan-1', luasLahan: 2, jenisLegalitas: JenisLegalitas.SHM, nomorLegalitas: '123' } as any,
    ]);

    const mockData = createMockPekebun(20);
    lahanStore.pekebunList = mockData as any;

    const wrapper = mount(StepPilihPekebunLahan);

    // Click load more -> 15 visible
    const loadMoreBtn = wrapper.findAll('button').find(btn => btn.text().includes('Lihat lebih banyak pekebun'));
    await loadMoreBtn?.trigger('click');
    expect(wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun ')).length).toBe(15);

    // Type in search box
    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('Pekebun');

    // Should reset to 10
    expect(wrapper.findAll('button[type="button"]').filter(btn => btn.text().includes('Pekebun ')).length).toBe(10);
  });
});
