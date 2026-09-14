import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth';

describe('useAuthStore - Authentication and Kelembagaan Pekebun Name', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with null credentials and default role', () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.activeRole).toBe('KELEMBAGAAN_PEKEBUN');
  });

  it('sets kelembagaan_name and kelembagaan_id from rawUserData payload', () => {
    const store = useAuthStore();
    store.setAuth(
      'sample-token',
      {
        id: 10,
        full_name: 'Ketua Koperasi',
        email: 'koperasi@example.com',
        role: 'KELEMBAGAAN_PEKEBUN',
        kelembagaan_id: 42,
        kelembagaan_name: 'Koperasi Kelapa Mandiri Jaya',
      },
      'sample-refresh'
    );

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('sample-token');
    expect(store.refreshToken).toBe('sample-refresh');
    expect(store.user?.kelembagaan_id).toBe(42);
    expect((store.user as any)?.kelembagaan_pekebun_id).toBeUndefined();
    expect((store.user as any)?.kelembagaan_pekebun_name).toBeUndefined();
    expect(store.user?.kelembagaan_name).toBe('Koperasi Kelapa Mandiri Jaya');
    expect(store.user?.kelembagaanName).toBe('Koperasi Kelapa Mandiri Jaya');
  });

  it('extracts kelembagaan_name and kelembagaan_id from aliases and nested object', () => {
    const store = useAuthStore();
    store.setAuth('sample-token-2', {
      id: 11,
      name: 'Anggota Lembaga',
      email: 'anggota@example.com',
      role: 'PEMOHON',
      kelembagaan: {
        id: 77,
        institution_name: 'KUD Tunas Harapan',
      },
    });

    expect(store.user?.kelembagaan_id).toBe(77);
    expect(store.user?.kelembagaan_name).toBe('KUD Tunas Harapan');
    expect((store.user as any)?.kelembagaan_pekebun_id).toBeUndefined();
    expect(store.activeRole).toBe('KELEMBAGAAN_PEKEBUN');
  });

  it('falls back to JWT claims if rawUserData lacks kelembagaan_name', () => {
    // Generate a valid base64url encoded JWT payload
    const payload = {
      user_id: 12,
      kelembagaan_id: 99,
      kelembagaan_name: 'Gapoktan Sumber Rejeki',
      role: 'KELEMBAGAAN_PEKEBUN',
    };
    const base64UrlPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const dummyJwt = `header.${base64UrlPayload}.signature`;

    const store = useAuthStore();
    store.setAuth(dummyJwt, {
      id: 12,
      full_name: 'Budi Sumber',
      email: 'budi@sumber.com',
      role: 'KELEMBAGAAN_PEKEBUN',
    });

    expect(store.user?.kelembagaan_id).toBe(99);
    expect(store.user?.kelembagaan_name).toBe('Gapoktan Sumber Rejeki');
    expect((store.user as any)?.kelembagaan_pekebun_id).toBeUndefined();
  });

  it('handles logout gracefully without throwing error when window is undefined', async () => {
    const store = useAuthStore();
    store.setAuth('token-to-clear', {
      id: 1,
      email: 'test@clear.com',
      role: 'DINAS_KAB',
    });

    expect(store.isAuthenticated).toBe(true);
    await store.logout();
    expect(store.token).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
