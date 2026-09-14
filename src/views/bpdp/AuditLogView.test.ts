// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '@/services/api';
import AuditLogView from './AuditLogView.vue';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);

const summary = {
  id: 1,
  request_id: 'REQ-API-001',
  actor_id: 8,
  actor_name: 'Adi Pratama',
  actor_role: 'BPDP_VERIFIKATOR',
  method: 'PATCH',
  path: '/api/v1/pekebun/:id',
  status_code: 200,
  duration_ms: 86,
  change_count: 1,
  created_at: '2026-08-28T02:42:18Z',
};

const detail = {
  ...summary,
  ip_address: '10.24.8.14',
  user_agent: 'Mozilla/5.0 Chrome/140.0',
  request_size_bytes: 428,
  response_size_bytes: 982,
  changes: [
    {
      entity_type: 'pekebun',
      entity_id: '12',
      action: 'UPDATE',
      before: { name: 'Ahmad Supardi', access_token: '[REDACTED]' },
      after: { name: 'Ahmad Suparno', access_token: '[REDACTED]' },
    },
  ],
};

beforeEach(() => {
  apiGet.mockReset();
  apiGet.mockImplementation(async (url) => {
    if (url === '/audit-logs/1') return { success: true, data: detail } as never;
    return {
      success: true,
      data: [summary, { ...summary, id: 2, request_id: 'REQ-API-002', actor_id: null, actor_name: null, actor_role: null, method: 'GET', status_code: 500, change_count: 0 }],
      meta: { page: 1, limit: 20, total: 2 },
    } as never;
  });
});

it('renders audit summaries from the API and fetches change details on demand', async () => {
  const wrapper = mount(AuditLogView, {
    global: { stubs: { Breadcrumb: true } },
  });
  await flushPromises();

  expect(wrapper.findAll('[data-testid="audit-row"]')).toHaveLength(2);
  expect(wrapper.text()).toContain('REQ-API-001');
  expect(wrapper.text()).toContain('REQ-API-002');
  expect(wrapper.text()).toContain('Sistem');
  expect(wrapper.text()).not.toContain('Preview Data Dummy');

  await wrapper.get('[data-testid="audit-detail-1"]').trigger('click');
  await flushPromises();

  const dialog = wrapper.get('[role="dialog"]');
  const scrollArea = dialog.get('[data-testid="audit-detail-scroll"]');
  expect(scrollArea.classes()).toContain('min-h-0');
  expect(scrollArea.classes()).toContain('overflow-y-auto');
  expect(dialog.text()).toContain('Perubahan Data');
  expect(dialog.text()).toContain('Ahmad Supardi');
  expect(dialog.text()).toContain('Ahmad Suparno');
  expect(dialog.text()).toContain('Disensor');

  await dialog.get('[data-testid="audit-raw-toggle"]').trigger('click');
  expect(dialog.find('pre').text()).toContain('"request_id": "REQ-API-001"');
});
