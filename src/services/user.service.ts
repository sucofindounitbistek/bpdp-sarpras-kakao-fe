import api from './api';

export interface UserRoleItem {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface UserManagementItem {
  id: number;
  iam_user_id: number;
  email: string;
  full_name: string;
  nik?: string;
  phone_number?: string;
  role_id: number;
  role?: UserRoleItem;
  registrant_type?: string;
  province_id?: number;
  regency_id?: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ListUserParams {
  page?: number;
  limit?: number;
  search?: string;
  role_code?: string;
  status?: string;
}

export const userService = {
  async listUsers(params?: ListUserParams) {
    const res: any = await api.get('/users', { params });
    if (res && res.data && Array.isArray(res.data)) {
      return { data: res.data as UserManagementItem[], meta: res.meta || { page: 1, limit: 10, total: res.data.length } };
    }
    if (Array.isArray(res)) {
      return { data: res as UserManagementItem[], meta: { page: 1, limit: 10, total: res.length } };
    }
    return { data: [] as UserManagementItem[], meta: { page: 1, limit: 10, total: 0 } };
  },

  async getUserById(id: number) {
    const res: any = await api.get(`/users/${id}`);
    return (res?.data || res) as UserManagementItem;
  },

  async updateUserRole(id: number, payload: { role_id: number; status?: string }) {
    const res: any = await api.put(`/users/${id}`, payload);
    return (res?.data || res) as UserManagementItem;
  },

  async updateUserStatus(id: number, status: 'ACTIVE' | 'INACTIVE') {
    const res: any = await api.patch(`/users/${id}/status`, { status });
    return (res?.data || res) as UserManagementItem;
  },

  async listRoles() {
    const res: any = await api.get('/roles');
    if (res && res.data && Array.isArray(res.data)) {
      return res.data as UserRoleItem[];
    }
    if (Array.isArray(res)) {
      return res as UserRoleItem[];
    }
    return [] as UserRoleItem[];
  },
};
