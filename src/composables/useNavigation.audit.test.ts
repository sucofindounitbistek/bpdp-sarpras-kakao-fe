// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useNavigation } from './useNavigation';
import { useAuthStore } from '@/stores/auth';

describe('audit log navigation access', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('shows audit log only to BPDP roles', () => {
    const auth = useAuthStore();
    auth.$patch({
      user: { id: 1, name: 'BPDP', email: 'bpdp@example.test', role: 'BPDP_VERIFIKATOR' },
    });

    let navigation!: ReturnType<typeof useNavigation>;
    const wrapper = mount(defineComponent({
      setup() {
        navigation = useNavigation();
        return () => h('div');
      },
    }));

    expect(navigation.filteredNavSections.value.flatMap((section) => section.items).map((item) => item.to)).toContain('/bpdp/audit-logs');

    auth.setRole('PEMOHON');
    expect(navigation.filteredNavSections.value.flatMap((section) => section.items).map((item) => item.to)).not.toContain('/bpdp/audit-logs');

    wrapper.unmount();
  });

  it('configures BPDP Verifikator and Approval specific menu items', () => {
    const auth = useAuthStore();
    const { filteredNavSections } = useNavigation();

    // BPDP Verifikator
    auth.setRole('BPDP_VERIFIKATOR');
    const verifItems = filteredNavSections.value.flatMap((section) => section.items).map((item) => item.to);
    expect(verifItems).toContain('/bpdp/antrean');
    expect(verifItems).toContain('/bpdp/revisi-penelitian');
    expect(verifItems).toContain('/bpdp/sk-dirut');
    expect(verifItems).toContain('/bpdp/riwayat-selesai');

    // BPDP Approval
    auth.setRole('BPDP_APPROVAL');
    const apprItems = filteredNavSections.value.flatMap((section) => section.items).map((item) => item.to);
    expect(apprItems).toContain('/bpdp/antrean');
    expect(apprItems).toContain('/bpdp/riwayat-selesai');
    expect(apprItems).not.toContain('/bpdp/revisi-penelitian');
    expect(apprItems).not.toContain('/bpdp/sk-dirut');
  });
});
