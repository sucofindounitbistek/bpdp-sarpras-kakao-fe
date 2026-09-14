import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface SimulatedUser {
  id: string;
  name: string;
  email: string;
  role: 'PEMOHON' | 'DINAS_KAB' | 'DINAS_PROV' | 'DITJENBUN' | 'BPDPKS';
  status: 'ACTIVE' | 'INACTIVE';
  region: string;
  lastActive: string;
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<SimulatedUser[]>([
    { id: 'USR-001', name: 'Andi Wijaya', email: 'andi.wijaya@pekebun.or.id', role: 'PEMOHON', status: 'ACTIVE', region: 'Koperasi Tani Jaya, Bone', lastActive: '2 jam yang lalu' },
    { id: 'USR-002', name: 'Siti Rahma', email: 'siti.rahma@dinas-kab.go.id', role: 'DINAS_KAB', status: 'ACTIVE', region: 'Dinas Pertanian Bone', lastActive: '10 menit yang lalu' },
    { id: 'USR-003', name: 'Budi Santoso', email: 'budi.santoso@dinas-prov.go.id', role: 'DINAS_PROV', status: 'ACTIVE', region: 'Dinas Perkebunan Sulawesi Selatan', lastActive: '1 hari yang lalu' },
    { id: 'USR-004', name: 'Hendra Gunawan', email: 'hendra.g@ditjenbun.go.id', role: 'DITJENBUN', status: 'ACTIVE', region: 'Ditjenbun Jakarta', lastActive: '3 jam yang lalu' },
    { id: 'USR-005', name: 'Rani Safitri', email: 'rani.safitri@bpdp.go.id', role: 'BPDPKS', status: 'ACTIVE', region: 'BPDPKS Keuangan Jakarta', lastActive: 'Baru saja' },
    { id: 'USR-006', name: 'Koperasi Kelapa Prima', email: 'Kelapa.prima@koperasi.id', role: 'PEMOHON', status: 'ACTIVE', region: 'Koperasi Kelapa Prima, Luwu', lastActive: '5 jam yang lalu' },
    { id: 'USR-007', name: 'Ir. Ahmad Sobari', email: 'ahmad.sobari@dinas-kab.go.id', role: 'DINAS_KAB', status: 'INACTIVE', region: 'Dinas Pertanian Luwu Utara', lastActive: '3 minggu yang lalu' },
    { id: 'USR-008', name: 'Dr. Diana Putri', email: 'diana.putri@bpdp.go.id', role: 'BPDPKS', status: 'ACTIVE', region: 'BPDPKS Verifikasi Akses', lastActive: '1 jam yang lalu' },
  ]);

  function addUser(newUser: Omit<SimulatedUser, 'id' | 'lastActive'>) {
    const id = `USR-0${users.value.length + 1}`;
    users.value.push({
      ...newUser,
      id,
      lastActive: 'Baru saja',
    });
  }

  function toggleStatus(id: string) {
    const user = users.value.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }
  }

  return { users, addUser, toggleStatus };
});

