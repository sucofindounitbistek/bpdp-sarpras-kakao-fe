// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DropdownEksporPekebun from './DropdownEksporPekebun.vue';
import * as exporter from '@/utils/exportPekebunExcel';

describe('DropdownEksporPekebun.vue', () => {
  it('renders correctly and toggles dropdown on button click', async () => {
    const wrapper = mount(DropdownEksporPekebun, {
      props: {
        proposal: { nomor_proposal: 'PROP-01' },
        pekebuns: [{ id: 1, nama: 'Budi' }],
        lahans: [{ id: 10, luas_lahan: 2 }],
      },
    });

    expect(wrapper.text()).toContain('Ekspor Data Pekebun');
    // Initially closed
    expect(wrapper.find('.origin-top-right').exists()).toBe(false);

    // Click to open
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.origin-top-right').exists()).toBe(true);
    expect(wrapper.text()).toContain('1. Laporan Titik Koordinat');
    expect(wrapper.text()).toContain('2. Laporan Profil Pekebun');
  });

  it('triggers exportLaporanTitikKoordinat when first option clicked', async () => {
    const spy = vi.spyOn(exporter, 'exportLaporanTitikKoordinat').mockImplementation(() => '');
    const wrapper = mount(DropdownEksporPekebun, {
      props: {
        proposal: { nomor_proposal: 'PROP-01' },
        pekebuns: [{ id: 1, nama: 'Budi' }],
        lahans: [{ id: 10, luas_lahan: 2 }],
      },
    });

    await wrapper.find('button').trigger('click');
    const buttons = wrapper.findAll('.origin-top-right button');
    expect(buttons.length).toBe(2);

    await buttons[0].trigger('click');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        proposal: { nomor_proposal: 'PROP-01' },
      })
    );
  });

  it('triggers exportLaporanProfilPekebun when second option clicked', async () => {
    const spy = vi.spyOn(exporter, 'exportLaporanProfilPekebun').mockImplementation(() => '');
    const wrapper = mount(DropdownEksporPekebun, {
      props: {
        proposal: { nomor_proposal: 'PROP-01' },
        pekebuns: [{ id: 1, nama: 'Budi' }],
        lahans: [{ id: 10, luas_lahan: 2 }],
      },
    });

    await wrapper.find('button').trigger('click');
    const buttons = wrapper.findAll('.origin-top-right button');
    await buttons[1].trigger('click');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not open when disabled', async () => {
    const wrapper = mount(DropdownEksporPekebun, {
      props: {
        disabled: true,
      },
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.origin-top-right').exists()).toBe(false);
  });
});
