// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RabTable from './RabTable.vue';
import type { RabItem } from '@/types/rab';

describe('RabTable Satuan by Jenis Selection', () => {
  const createItem = (overrides: Partial<RabItem> = {}): RabItem => ({
    id: 'rab-1',
    jenis: '',
    uraian: '',
    satuan: '',
    hargaSatuan: 10000,
    subTotal: 10000,
    volume: 1,
    ...overrides,
  });

  it('filters satuan dropdown and auto-selects Batang when Jenis is Benih', async () => {
    const items = [createItem()];
    const wrapper = mount(RabTable, {
      props: {
        items,
        readonly: false,
      },
    });

    const selects = wrapper.findAll('select');
    const jenisSelect = selects[0]; // First select is Jenis

    await jenisSelect.setValue('Benih');

    // Emitted update event should set satuan and unit to Batang
    const updateEvents = wrapper.emitted('update');
    expect(updateEvents).toBeTruthy();
    const lastUpdate = updateEvents![updateEvents!.length - 1];
    expect(lastUpdate[0]).toBe('rab-1');
    expect(lastUpdate[1]).toMatchObject({
      jenis: 'Benih',
      satuan: 'Batang',
      unit: 'Batang',
    });

    // Verify Satuan dropdown options for Benih
    const satuanSelect = selects[3]; // 0: Jenis, 1: Uraian, 2: Varietas, 3: Satuan
    const options = satuanSelect.findAll('option').map((o) => o.text()).filter((t) => t !== 'Pilih Satuan');
    expect(options).toEqual(['Batang']);
  });

  it('filters satuan dropdown to Kg and Liter for Pupuk and resets invalid previous satuan', async () => {
    const items = [createItem({ jenis: 'Benih', satuan: 'Batang' })];
    const wrapper = mount(RabTable, {
      props: {
        items,
        readonly: false,
      },
    });

    const selects = wrapper.findAll('select');
    const jenisSelect = selects[0];

    await jenisSelect.setValue('Pupuk');

    const updateEvents = wrapper.emitted('update');
    expect(updateEvents).toBeTruthy();
    const lastUpdate = updateEvents![updateEvents!.length - 1];
    expect(lastUpdate[1]).toMatchObject({
      jenis: 'Pupuk',
      satuan: '', // Batang is invalid for Pupuk, reset to empty
    });

    const satuanSelect = selects[3];
    const options = satuanSelect.findAll('option').map((o) => o.text()).filter((t) => t !== 'Pilih Satuan');
    expect(options).toEqual(['Kg', 'Liter']);
  });

  it('filters satuan dropdown to 5 units for Pestisida including Buah and Sachet', async () => {
    const items = [createItem({ jenis: 'Pestisida' })];
    const wrapper = mount(RabTable, {
      props: {
        items,
        readonly: false,
      },
    });

    const selects = wrapper.findAll('select');
    const satuanSelect = selects[3];
    const options = satuanSelect.findAll('option').map((o) => o.text()).filter((t) => t !== 'Pilih Satuan');
    expect(options).toEqual(['Kg', 'Liter', 'Buah', 'Sachet', 'Unit']);
  });

  it('displays the 4 approved Kakao Pupuk options (Urea, SP 36, KCl, Kieserit) in Uraian dropdown', async () => {
    const items = [createItem({ jenis: 'Pupuk' })];
    const wrapper = mount(RabTable, {
      props: {
        items,
        readonly: false,
      },
    });

    const selects = wrapper.findAll('select');
    const uraianSelect = selects[1]; // 0: Jenis, 1: Uraian, 2: Varietas, 3: Satuan
    const options = uraianSelect.findAll('option').map((o) => o.text()).filter((t) => t !== 'Pilih Uraian');
    expect(options).toEqual(['Urea', 'SP 36', 'KCl', 'Kieserit']);
  });

  it('renders historical pupuk items correctly in readonly mode', async () => {
    const items = [createItem({ jenis: 'Pupuk', uraian: 'Rock Phospate' })];
    const wrapper = mount(RabTable, {
      props: {
        items,
        readonly: true,
      },
    });

    expect(wrapper.text()).toContain('Rock Phospate');
  });
});
