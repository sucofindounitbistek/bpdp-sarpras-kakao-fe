import api from '@/services/api';

export interface SSOExchangeResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number | string;
    full_name: string;
    email: string;
    nik?: string;
    phone_number?: string;
    role_name: string;
    registrant_type?: string;
    province_id?: number;
    regency_id?: number;
    kelembagaan_id?: number | string;
    kelembagaan_name?: string;
    kelembagaan_pekebun_id?: number;
    kelembagaan_pekebun_name?: string;
    roles?: string[];
  };
}

export interface RefreshTokenPayload {
  refresh_token: string;
  device_id: string;
}

export type RefreshTokenResponse = SSOExchangeResponse;

export const authService = {
  /**
   * Exchange one-time SSO callback token from BPDP IAM with Sarpras Backend
   */
  async exchangeSSO(token: string, deviceId: string = 'sarpras-kelapa-web'): Promise<SSOExchangeResponse> {
    const response: any = await api.post('/auth/sso/exchange', {
      token,
      device_id: deviceId,
    });
    // If unwrapped by response interceptor
    return response.data || response;
  },

  /**
   * Refresh Sarpras Access Token using rotated IAM Refresh Token
   */
  async refreshToken(refreshToken: string, deviceId: string = 'sarpras-kelapa-web'): Promise<RefreshTokenResponse> {
    const response: any = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
      device_id: deviceId,
    });
    return response.data || response;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response: any = await api.get('/auth/me');
    return response.data || response;
  },

  /**
   * Log out user from Sarpras backend
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response: any = await api.post('/auth/logout');
      return response.data || response;
    } catch {
      return { message: 'Logout completed locally' };
    }
  },
};

export default authService;
