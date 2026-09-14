import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { pekebunService } from '@/services/pekebun.service';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';
import { identitasPekebunSikpSchema } from '@/schemas/pekebun.schema';

import { JenisKelamin, StatusPernikahan } from '@/types/pekebun';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('FormPekebun submission error handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    useToast().toasts.value = [];
  });

  it('pekebunService.create throws error instead of swallowing it with null', async () => {
    const errorPayload = new Error('surat_kuasa: file size exceeds maximum allowed size of 5 MB');
    (api.post as any).mockRejectedValueOnce(errorPayload);

    const fd = new FormData();
    await expect(pekebunService.create(fd)).rejects.toThrow(
      'surat_kuasa: file size exceeds maximum allowed size of 5 MB'
    );
  });

  it('pekebunService.update throws error instead of swallowing it with null', async () => {
    const errorPayload = new Error('surat_kuasa: file size exceeds maximum allowed size of 5 MB');
    (api.put as any).mockRejectedValueOnce(errorPayload);

    const fd = new FormData();
    await expect(pekebunService.update('123', fd)).rejects.toThrow(
      'surat_kuasa: file size exceeds maximum allowed size of 5 MB'
    );
  });

  it('store.createPekebunWithLahan propagates the error from pekebunService', async () => {
    const errorPayload = new Error('surat_kuasa: file size exceeds maximum allowed size of 5 MB');
    (api.post as any).mockRejectedValueOnce(errorPayload);

    const store = usePekebunStore();
    const identitas = {
      nik: '1234567890123456',
      nama: 'John Doe',
      nomorKK: '1234567890123456',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      statusPernikahan: StatusPernikahan.MENIKAH,
      tempatLahir: 'Jakarta',
      tanggalLahir: '1990-01-01',
      alamat: 'Jl. Merdeka',
      kodepos: '12345',
      nomorHP: '081234567890',
    };
    const dokumen = {
      scanKTP: null,
      scanKK: null,
      swafoto: null,
      suratKuasa: null,
    };

    await expect(
      store.createPekebunWithLahan(identitas, dokumen, [], true)
    ).rejects.toThrow('surat_kuasa: file size exceeds maximum allowed size of 5 MB');
  });

  it('toast notification receives the exact error message from backend error response', () => {
    const toast = useToast();
    const errorResponse = {
      response: {
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'surat_kuasa: file size exceeds maximum allowed size of 5 MB',
          },
        },
      },
    };

    // Helper logic matching FormPekebunView
    const getErrorMessage = (err: any, fallback: string): string => {
      if (!err) return fallback;
      if (typeof err === 'string') return err;
      let data = err.response?.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {}
      }
      return (
        data?.error?.message ||
        (typeof data?.error === 'string' ? data.error : null) ||
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        err.message ||
        fallback
      );
    };

    const msg = getErrorMessage(errorResponse, 'Gagal menyimpan draft pekebun');
    toast.error(msg, 'Error');

    expect(toast.toasts.value.length).toBe(1);
    expect(toast.toasts.value[0].title).toBe('Error');
    expect(toast.toasts.value[0].message).toBe(
      'surat_kuasa: file size exceeds maximum allowed size of 5 MB'
    );
  });

  it('isNikRegistered correctly excludes own id when updating', () => {
    const store = usePekebunStore();
    store.setListPekebun([
      {
        id: '1',
        nik: '1234567890123456',
        nama: 'Petani A',
        kelembagaanId: 'INS001',
        nomorKK: '',
        statusPernikahan: StatusPernikahan.MENIKAH,
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        kodepos: '',
        nomorHP: '',
        dokumen: [],
        lahan: {} as any,
        createdAt: '',
      },
      {
        id: '2',
        nik: '6543210987654321',
        nama: 'Petani B',
        kelembagaanId: 'INS001',
        nomorKK: '',
        statusPernikahan: StatusPernikahan.MENIKAH,
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        kodepos: '',
        nomorHP: '',
        dokumen: [],
        lahan: {} as any,
        createdAt: '',
      },
    ]);

    // Checking own NIK while editing Pekebun 1 should be FALSE (allowed)
    expect(store.isNikRegistered('1234567890123456', '1')).toBe(false);

    // Checking another farmer's NIK while editing Pekebun 1 should be TRUE (rejected)
    expect(store.isNikRegistered('6543210987654321', '1')).toBe(true);

    // Checking new NIK should be FALSE
    expect(store.isNikRegistered('9999999999999999', '1')).toBe(false);

    // Checking without excludeId should detect duplicate
    expect(store.isNikRegistered('1234567890123456')).toBe(true);
  });
});

describe('SIKP validate-nik integration', () => {
  const validIdentitas = {
    nik: '1234567890123456',
    nama: 'John Doe',
    nomorKK: '1234567890123456',
    jenisKelamin: JenisKelamin.LAKI_LAKI,
    statusPernikahan: StatusPernikahan.MENIKAH,
    tempatLahir: 'Jakarta',
    tanggalLahir: '1990-01-01',
    alamat: 'Jl. Merdeka No. 1',
    kodepos: '12345',
    nomorHP: '081234567890',
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    useToast().toasts.value = [];
    useAuthStore().user = {
      id: '1',
      name: 'Admin Lembaga',
      email: 'admin@lembaga.id',
      role: 'KELEMBAGAAN_PEKEBUN',
      phone_number: '0899111222333',
    } as any;
  });

  it('store.validateNikSikp sends the /sikp/validate-nik payload (email & no_hp from auth user, not form) and returns valid on success', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { status: 1, data: { success: true, code: '00', bearer: 'token' } },
      message: 'success',
    });

    const store = usePekebunStore();
    const res = await store.validateNikSikp(validIdentitas as any);

    expect(res.valid).toBe(true);
    expect(api.post).toHaveBeenCalledWith('/sikp/validate-nik', {
      nik: '1234567890123456',
      kk: '1234567890123456',
      nama: 'John Doe',
      tgl_lahir: '1990-01-01',
      jns_kelamin: '1',
      email: 'admin@lembaga.id',
      no_hp: '0899111222333',
    });
  });

  it('store.validateNikSikp maps jns_kelamin "2" for PEREMPUAN', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { status: 1, data: { success: true, code: '00' } },
    });

    const store = usePekebunStore();
    await store.validateNikSikp({ ...validIdentitas, jenisKelamin: JenisKelamin.PEREMPUAN } as any);

    expect((api.post as any).mock.calls[0][1].jns_kelamin).toBe('2');
  });

  it('store.validateNikSikp returns invalid with the SIKP failure message', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { status: 1, data: { success: false, code: '01', message: 'data tidak sesuai dengan dukcapil' } },
    });

    const store = usePekebunStore();
    const res = await store.validateNikSikp(validIdentitas as any);

    expect(res.valid).toBe(false);
    expect(res.message).toBe('data tidak sesuai dengan dukcapil');
  });

  it('store.validateNikSikp returns invalid when the backend is unreachable', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('failed to reach sikp bridge'));

    const store = usePekebunStore();
    const res = await store.validateNikSikp(validIdentitas as any);

    expect(res.valid).toBe(false);
    expect(res.message).toBe('failed to reach sikp bridge');
  });

  it('identitasPekebunSikpSchema requires jenisKelamin', () => {
    const { jenisKelamin: _jk, ...baseWithoutJenisKelamin } = validIdentitas;

    const missing = identitasPekebunSikpSchema.safeParse(baseWithoutJenisKelamin);
    expect(missing.success).toBe(false);

    const complete = identitasPekebunSikpSchema.safeParse(validIdentitas);
    expect(complete.success).toBe(true);
  });
});

describe('Pekebun draft and duplicate handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('isNikRegistered returns false for draft pekebuns (isDraft = true)', () => {
    const store = usePekebunStore();
    store.setListPekebun([
      {
        id: '1',
        nik: '1234567890123456',
        nama: 'Draft Petani',
        isDraft: true,
        kelembagaanId: 'INS001',
        nomorKK: '',
        statusPernikahan: StatusPernikahan.MENIKAH,
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        kodepos: '',
        nomorHP: '',
        dokumen: [],
        lahan: {} as any,
        createdAt: '',
      },
      {
        id: '2',
        nik: '6543210987654321',
        nama: 'Registered Petani',
        isDraft: false,
        kelembagaanId: 'INS001',
        nomorKK: '',
        statusPernikahan: StatusPernikahan.MENIKAH,
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        kodepos: '',
        nomorHP: '',
        dokumen: [],
        lahan: {} as any,
        createdAt: '',
      },
    ]);

    // Draft NIK should NOT be reported as registered in Master Data
    expect(store.isNikRegistered('1234567890123456')).toBe(false);

    // Registered NIK should be reported as registered
    expect(store.isNikRegistered('6543210987654321')).toBe(true);
  });

  it('findDraftByNik returns the draft matching NIK', () => {
    const store = usePekebunStore();
    store.setListPekebun([
      {
        id: 'draft-101',
        nik: '1234567890123456',
        nama: 'Draft Petani',
        isDraft: true,
        kelembagaanId: 'INS001',
        nomorKK: '',
        statusPernikahan: StatusPernikahan.MENIKAH,
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        kodepos: '',
        nomorHP: '',
        dokumen: [],
        lahan: {} as any,
        createdAt: '',
      },
    ]);

    const found = store.findDraftByNik('1234567890123456');
    expect(found).toBeDefined();
    expect(found?.id).toBe('draft-101');

    const notFound = store.findDraftByNik('9999999999999999');
    expect(notFound).toBeUndefined();
  });

  it('createPekebunWithLahan attaches createdPekebun when lahan creation fails', async () => {
    const store = usePekebunStore();

    // Mock pekebunService.create to succeed
    (api.post as any).mockImplementation((url: string) => {
      if (url === '/pekebun') {
        return Promise.resolve({
          data: {
            id: 999,
            nik: '1234567890123456',
            name: 'Petani Test',
            address: 'Alamat',
            postcode: '12345',
            phone_number: '081234567890',
            is_draft: true,
          },
        });
      }
      if (url === '/lahan') {
        return Promise.reject(new Error('coordinates must have at least 3 points'));
      }
      return Promise.resolve({ data: {} });
    });

    const identitas = {
      nik: '1234567890123456',
      nama: 'Petani Test',
      nomorKK: '1234567890123456',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      statusPernikahan: StatusPernikahan.MENIKAH,
      tempatLahir: 'Jakarta',
      tanggalLahir: '1990-01-01',
      alamat: 'Jl. Merdeka',
      kodepos: '12345',
      nomorHP: '081234567890',
    };
    const dokumen = { scanKTP: null, scanKK: null, swafoto: null, suratKuasa: null };
    const dummyLahan: any = [{ jenisLegalitas: 'SHM', nomorLegalitas: '123' }];

    try {
      await store.createPekebunWithLahan(identitas as any, dokumen, dummyLahan, true);
      expect.fail('Should have thrown lahan creation error');
    } catch (err: any) {
      expect(err.message).toBe('coordinates must have at least 3 points');
      expect(err.createdPekebun).toBeDefined();
      expect(err.createdPekebun.id).toBe('999');
    }
  });
});
