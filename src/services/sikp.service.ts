import api from './api';

// Payload contract for POST /sikp/validate-nik (see BE internal/sikp/dto.go).
// alamat/kode_pos/kode_wilayah are static BE values and the SIKP bearer token
// is fetched internally by the backend — FE never handles tokens.
export interface ValidateNikPayload {
  nik: string;
  kk: string;
  nama: string;
  tgl_lahir: string; // "YYYY-MM-DD" atau "DDMMYYYY"
  jns_kelamin: '1' | '2'; // "1" laki-laki | "2" perempuan
  email: string;
  no_hp: string;
}

export const sikpService = {
  // Returns the SIKP/Dukcapil passthrough response: { status, data: { success, code, ... } }
  async validateNik(payload: ValidateNikPayload) {
    const response: any = await api.post('/sikp/validate-nik', payload);
    return response?.data ?? response;
  },
};
