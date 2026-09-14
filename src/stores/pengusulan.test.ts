import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { proposalService } from '@/services/proposal.service';
import { usePengusulanStore } from './pengusulan';

describe('usePengusulanStore - proposal CPCL mapping', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('maps pekebuns into daftarCPCL when proposal detail has no top-level lahans', async () => {
    vi.spyOn(proposalService, 'getById').mockResolvedValue({
      data: {
        id: 12,
        nomor_proposal: 'SPKA120001',
        kelembagaan_id: 5,
        paket_sarpras: 'EKSTENSIFIKASI',
        detail_usulan: 'Usulan bantuan kelapa',
        total_anggaran: 0,
        status: 'DRAFT',
        created_at: '2026-09-10T00:00:00Z',
        updated_at: '2026-09-10T00:00:00Z',
        pekebuns: [
          {
            id: 8,
            nik: '6101012345670001',
            name: 'Ahmad Dahlan',
            nomor_kk: '6101012345670002',
          },
        ],
        documents: [],
        rabs: [],
      },
      message: 'success',
    } as any);

    const store = usePengusulanStore();
    const proposal = await store.getProposalDetail(12);

    expect(proposal?.daftarCPCL).toHaveLength(1);
    expect(proposal?.daftarCPCL[0]).toMatchObject({
      id: '8',
      namaPekebun: 'Ahmad Dahlan',
      nik: '6101012345670001',
      nomorKK: '6101012345670002',
    });
  });
});