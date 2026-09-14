import api from './api';

export interface RoleMatrixItem {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface MenuMatrixItem {
  id: number;
  code: string;
  name: string;
  group_name: string;
  path: string;
  icon: string;
  sort_order: number;
}

export interface PermissionMatrixData {
  roles: RoleMatrixItem[];
  menus: MenuMatrixItem[];
  permissions: Record<string, boolean>; // e.g. "1_1": true
}

export interface PermissionUpdateItem {
  role_id: number;
  menu_id: number;
  is_allowed: boolean;
}

export interface MyPermissionsData {
  role_code: string;
  allowed_menus: string[];
  allowed_paths: string[];
}

export const rolePermissionService = {
  async getMatrix(): Promise<PermissionMatrixData> {
    const res: any = await api.get('/role-permissions');
    return res?.data || res || { roles: [], menus: [], permissions: {} };
  },

  async updatePermissions(permissions: PermissionUpdateItem[]): Promise<any> {
    const res: any = await api.put('/role-permissions', { permissions });
    return res?.data || res;
  },

  async getMyPermissions(roleCode?: string): Promise<MyPermissionsData> {
    const params: Record<string, string> = {};
    if (roleCode) {
      params.role = roleCode;
    }
    const res: any = await api.get('/role-permissions/my-permissions', { params });
    return res?.data || res || { role_code: '', allowed_menus: [], allowed_paths: [] };
  },
};
