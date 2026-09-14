/**
 * Region domain interfaces and state types for IAM Master Region integration.
 */

export interface Province {
  id: number;
  name: string;
}

export interface Regency {
  id: number;
  province_id: number;
  name: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

export interface RegionState {
  provinces: Province[];
  regenciesByProvince: Record<string, Regency[]>;
  isLoadingProvinces: boolean;
  loadingRegencies: Record<string, boolean>;
  error: string | null;
}
