import axios from 'axios';
import { Province, Regency } from '@/types/region';

const iamBaseURL = (
  import.meta.env.VITE_IAM_API_URL || 'https://sso-local.scitechnology.id/api/api/v1'
).trim();

const regionClient = axios.create({
  baseURL: iamBaseURL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export const regionService = {
  /**
   * Fetch all 38 Indonesian provinces from BPDP IAM Public Region API
   */
  async fetchProvinces(): Promise<Province[]> {
    const response = await regionClient.get('/public/regions/provinces');
    const result = response.data;
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  },

  /**
   * Fetch regencies / cities filtered by province ID from BPDP IAM Public Region API
   */
  async fetchRegenciesByProvinceId(provinceId: number | string): Promise<Regency[]> {
    const response = await regionClient.get('/public/regions/regencies', {
      params: { province_id: provinceId },
    });
    const result = response.data;
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  },
};

export default regionService;
