import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type AppRole =
  | 'KELEMBAGAAN_PEKEBUN'
  | 'PEMOHON'
  | 'DINAS_KAB'
  | 'DINAS_PROV'
  | 'DITJENBUN_VERIFIKATOR'
  | 'DITJENBUN_APPROVAL'
  | 'BPDP_VERIFIKATOR'
  | 'BPDP_APPROVAL'
  | 'BPDP_PPK'
  | 'BPDP_ULP'
  | 'BPDP_STAFF'
  | 'BPDP_KADIV'
  | 'SURVEYOR_SCI'
  | 'BANK_MITRA';

export interface User {
  id: string | number;
  iam_id?: string | number;
  iamId?: string | number;
  name: string;
  email: string;
  role: AppRole;
  nik?: string;
  phone_number?: string;
  registrant_type?: string;
  province_id?: number;
  regency_id?: number;
  kelembagaan_id?: number | string;
  kelembagaanId?: number | string;
  nomenklatur_dinas?: string;
  kelembagaan_name?: string;
  kelembagaanName?: string;
  roles?: string[];
}

export function normalizeRole(rawRole: any): AppRole {
  if (!rawRole) return 'KELEMBAGAAN_PEKEBUN';
  let roleStr = '';
  if (typeof rawRole === 'string') {
    roleStr = rawRole;
  } else if (typeof rawRole === 'object') {
    roleStr = rawRole.code || rawRole.name || rawRole.role_code || rawRole.role_name || '';
  } else {
    roleStr = String(rawRole);
  }

  if (!roleStr) return 'KELEMBAGAAN_PEKEBUN';

  const clean = roleStr.toUpperCase().trim();
  if (clean.includes('SUPERADMIN') || clean.includes('ADMIN') || clean === 'BPDP_APPROVAL') return 'BPDP_APPROVAL';
  if (clean.includes('PPK') || clean === 'BPDP_PPK') return 'BPDP_PPK';
  if (clean.includes('ULP') || clean === 'BPDP_ULP') return 'BPDP_ULP';
  if (clean.includes('KADIV') || clean === 'BPDP_KADIV') return 'BPDP_KADIV';
  if (clean.includes('STAFF') || clean === 'BPDP_STAFF') return 'BPDP_STAFF';
  if (clean.includes('SURVEYOR') || clean === 'SURVEYOR_SCI' || clean.includes('SCI')) return 'SURVEYOR_SCI';
  if (clean.includes('BANK') || clean === 'BANK_MITRA') return 'BANK_MITRA';
  if (clean.includes('DINAS') && (clean.includes('KAB') || clean.includes('KOTA') || clean === 'DINAS_KAB')) return 'DINAS_KAB';
  if (clean.includes('DINAS') && (clean.includes('PROV') || clean === 'DINAS_PROV')) return 'DINAS_PROV';
  if (clean.includes('DITJENBUN') && (clean.includes('VERIFIKATOR') || clean.includes('VERIFIKASI') || clean === 'DITJENBUN_VERIFIKATOR')) return 'DITJENBUN_VERIFIKATOR';
  if (clean.includes('DITJENBUN') || clean.includes('DITJEN PERKEBUNAN') || clean === 'DITJENBUN_APPROVAL') return 'DITJENBUN_APPROVAL';
  if (clean.includes('BPDP') && (clean.includes('VERIFIKATOR') || clean.includes('VERIFIKASI') || clean === 'BPDP_VERIFIKATOR')) return 'BPDP_VERIFIKATOR';
  if (clean.includes('BPDP') || clean.includes('APPROVAL') || clean.includes('DIREKSI') || clean.includes('DIRUT')) return 'BPDP_APPROVAL';
  if (clean.includes('PEKEBUN') || clean.includes('PEMOHON') || clean.includes('LEMBAGA') || clean.includes('USER') || clean === 'KELEMBAGAAN_PEKEBUN') return 'KELEMBAGAAN_PEKEBUN';

  const validRoles: AppRole[] = [
    'KELEMBAGAAN_PEKEBUN',
    'PEMOHON',
    'DINAS_KAB',
    'DINAS_PROV',
    'DITJENBUN_VERIFIKATOR',
    'DITJENBUN_APPROVAL',
    'BPDP_VERIFIKATOR',
    'BPDP_APPROVAL',
    'BPDP_PPK',
    'BPDP_ULP',
    'BPDP_STAFF',
    'BPDP_KADIV',
    'SURVEYOR_SCI',
    'BANK_MITRA',
  ];
  return validRoles.includes(clean as AppRole) ? (clean as AppRole) : 'KELEMBAGAAN_PEKEBUN';
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const user = ref<User | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    const activeRole = computed<AppRole>(() => {
      if (!user.value?.role) return 'KELEMBAGAAN_PEKEBUN';
      return normalizeRole(user.value.role);
    });

    function setRole(role: AppRole) {
      if (user.value) {
        user.value = {
          ...user.value,
          role: role,
        };
      } else {
        user.value = {
          id: 'simulated-user',
          name: 'Simulated User',
          email: 'user@example.com',
          role: role,
        };
      }
    }

    function parseJwtClaims(tokenStr: string): Record<string, any> | null {
      if (!tokenStr || typeof tokenStr !== 'string') return null;
      try {
        const parts = tokenStr.split('.');
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch {
        return null;
      }
    }

    function setAuth(newToken: string, rawUserData: any, newRefreshToken?: string | null) {
      token.value = newToken;
      if (newRefreshToken !== undefined) {
        refreshToken.value = newRefreshToken;
      }
      const roleRaw =
        rawUserData.role_code ||
        (typeof rawUserData.role === 'string' ? rawUserData.role : rawUserData.role?.code || rawUserData.role?.name) ||
        (rawUserData.roles && (typeof rawUserData.roles[0] === 'string' ? rawUserData.roles[0] : rawUserData.roles[0]?.code || rawUserData.roles[0]?.name)) ||
        rawUserData.role_name;
      const normalizedRole = normalizeRole(roleRaw || rawUserData.role);

      const jwtClaims = parseJwtClaims(newToken);

      const kelembagaanId =
        rawUserData.kelembagaan_id ??
        rawUserData.kelembagaanId ??
        rawUserData.kelembagaan_pekebun_id ??
        (typeof rawUserData.kelembagaan === 'object' ? rawUserData.kelembagaan?.id : undefined) ??
        jwtClaims?.kelembagaan_id ??
        jwtClaims?.kelembagaan_pekebun_id;
      const normalizedKelembagaanId =
        kelembagaanId !== undefined && kelembagaanId !== null && kelembagaanId !== ''
          ? Number(kelembagaanId)
          : undefined;

      const rawKPName =
        rawUserData.kelembagaan_name ||
        rawUserData.kelembagaanName ||
        rawUserData.kelembagaan_pekebun_name ||
        (typeof rawUserData.kelembagaan === 'object'
          ? rawUserData.kelembagaan?.institution_name || rawUserData.kelembagaan?.nama || rawUserData.kelembagaan?.name
          : undefined) ||
        jwtClaims?.kelembagaan_name ||
        jwtClaims?.kelembagaan_pekebun_name;

      const normalizedKelembagaanName =
        rawKPName && typeof rawKPName === 'string' && rawKPName.trim() !== ''
          ? rawKPName.trim()
          : undefined;

      const localId = rawUserData.id ?? jwtClaims?.id ?? jwtClaims?.user_id;
      const iamId = rawUserData.iam_id ?? rawUserData.iam_user_id ?? jwtClaims?.iam_id ?? jwtClaims?.iam_user_id;

      user.value = {
        id: localId,
        iam_id: iamId,
        iamId: iamId,
        name: rawUserData.full_name || rawUserData.name || 'Pengguna Sarpras',
        email: rawUserData.email || '',
        role: normalizedRole,
        nik: rawUserData.nik,
        phone_number: rawUserData.phone_number,
        registrant_type: rawUserData.registrant_type,
        province_id: rawUserData.province_id,
        regency_id: rawUserData.regency_id,
        kelembagaan_id: normalizedKelembagaanId,
        kelembagaanId: normalizedKelembagaanId,
        kelembagaan_name: normalizedKelembagaanName,
        kelembagaanName: normalizedKelembagaanName,
        roles: Array.isArray(rawUserData.roles) ? rawUserData.roles.map((r: any) => (typeof r === 'string' ? r : r?.code || r?.name || String(r))) : [normalizedRole],
      };
    }

    async function logout() {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        if (token.value) {
          await fetch(`${baseURL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
          }).catch(() => { });
        }
      } catch {
        // Ignore network errors
      } finally {
        token.value = null;
        refreshToken.value = null;
        user.value = null;
        if (typeof window !== 'undefined') {
          const iamUrl = import.meta.env.VITE_IAM_FRONTEND_URL || 'https://bpdp-iam-dev.scitechnology.id';
          window.location.href = `${iamUrl}/login`;
        }
      }
    }

    return { token, refreshToken, user, isAuthenticated, activeRole, setRole, setAuth, logout };
  },
  {
    persist: {
      pick: ['token', 'refreshToken', 'user'],
    },
  },
);
