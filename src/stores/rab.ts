import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  RabProposal,
  RabItem,
  CreateRabPayload,
  UpdateRabPayload,
  CreateRabItemPayload,
} from '@/types/rab';
import { rabService } from '@/services/rab.service';

export const useRabStore = defineStore('rab', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const activeRab = ref<RabProposal | null>(null);
  const rabItems = ref<RabItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ── Getters ───────────────────────────────────────────────────────────────
  const totalAnggaran = computed(() =>
    rabItems.value.reduce((sum, item) => sum + (item.total_price || item.subTotal || 0), 0)
  );

  const totalItems = computed(() => rabItems.value.length);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch complete RAB for a proposal */
  async function fetchRabByProposalId(proposalId: string | number) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await rabService.getByProposalId(proposalId);
      if (response && response.data) {
        activeRab.value = response.data;
        rabItems.value = (response.data.items || []).map((item) => ({
          ...item,
          id: String(item.id),
          satuan: item.unit || item.satuan,
          hargaSatuan: item.price_per_unit ?? item.hargaSatuan ?? 0,
          subTotal: item.total_price ?? item.subTotal ?? 0,
          jenis: item.details?.jenis || item.jenis,
          spesifikasi: item.details?.spesifikasi || item.spesifikasi,
          jumlahTahap1: item.details?.jumlahTahap1 ?? item.jumlahTahap1 ?? null,
          jumlahTahap2: item.details?.jumlahTahap2 ?? item.jumlahTahap2 ?? null,
          jumlahTotal: item.volume ?? item.jumlahTotal ?? 0,
        }));
        return response.data;
      }
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat RAB';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Create new RAB with stage serialization */
  async function createRab(payload: CreateRabPayload) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await rabService.create(payload);
      if (response && response.data) {
        activeRab.value = response.data;
        rabItems.value = response.data.items || [];
      }
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat RAB';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Update existing RAB */
  async function updateRab(id: string | number, payload: UpdateRabPayload) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await rabService.update(id, payload);
      if (response && response.data) {
        activeRab.value = response.data;
        rabItems.value = response.data.items || [];
      }
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memperbarui RAB';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Delete RAB by ID */
  async function deleteRab(id: string | number) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await rabService.delete(id);
      activeRab.value = null;
      rabItems.value = [];
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Gagal menghapus RAB';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Add an empty or template item in local editor */
  function addItem(template?: Partial<RabItem>) {
    const newItem: RabItem = {
      id: `rab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uraian: template?.uraian || '',
      volume: template?.volume || null,
      unit: template?.unit || template?.satuan || '',
      satuan: template?.satuan || template?.unit || '',
      price_per_unit: template?.price_per_unit || template?.hargaSatuan || null,
      hargaSatuan: template?.hargaSatuan || template?.price_per_unit || null,
      item_type: template?.item_type || 'BARANG',
      total_price: template?.total_price || template?.subTotal || 0,
      subTotal: template?.subTotal || template?.total_price || 0,
      jenis: template?.jenis || '',
      spesifikasi: template?.spesifikasi || '',
      jumlahTahap1: template?.jumlahTahap1 ?? null,
      jumlahTahap2: template?.jumlahTahap2 ?? null,
      jumlahTotal: template?.jumlahTotal || 0,
      details: template?.details || null,
    };
    rabItems.value.push(newItem);
    return newItem;
  }

  /** Update an item by ID and recalculate volume/subtotal */
  function updateItem(id: string | number, patch: Partial<RabItem>) {
    const item = rabItems.value.find((r) => String(r.id) === String(id));
    if (!item) return;
    Object.assign(item, patch);

    const q1 = item.jumlahTahap1 ?? 0;
    const q2 = item.jumlahTahap2 ?? 0;
    item.jumlahTotal = q1 + q2;
    item.volume = item.jumlahTotal;
    item.unit = item.satuan || item.unit || '';
    item.price_per_unit = item.hargaSatuan;
    item.subTotal = item.jumlahTotal * (item.hargaSatuan ?? 0);
    item.total_price = item.subTotal;
    item.item_type = item.jenis === 'JASA' ? 'JASA' : 'BARANG';
    item.details = {
      jenis: item.jenis,
      jumlahTahap1: item.jumlahTahap1,
      jumlahTahap2: item.jumlahTahap2,
      spesifikasi: item.spesifikasi,
    };
  }

  /** Remove item by ID */
  function removeItem(id: string | number) {
    rabItems.value = rabItems.value.filter((r) => String(r.id) !== String(id));
  }

  /** Serialize current state items into CreateRabPayload format */
  function serializeRabPayload(proposalId: number, flag: string = 'PROPOSAL'): CreateRabPayload {
    const items: CreateRabItemPayload[] = rabItems.value.map((r) => ({
      uraian: r.uraian,
      volume: r.volume || r.jumlahTotal || (r.jumlahTahap1 || 0) + (r.jumlahTahap2 || 0) || 1,
      unit: r.satuan || r.unit || 'unit',
      price_per_unit: r.hargaSatuan || r.price_per_unit || 0,
      item_type: r.jenis === 'JASA' ? 'JASA' : (r.item_type as string) || 'BARANG',
      details: {
        jenis: r.jenis,
        jumlahTahap1: r.jumlahTahap1,
        jumlahTahap2: r.jumlahTahap2,
        spesifikasi: r.spesifikasi,
      },
    }));

    return {
      proposal_id: proposalId,
      flag,
      items,
    };
  }

  return {
    activeRab,
    rabItems,
    isLoading,
    error,
    totalAnggaran,
    totalItems,
    fetchRabByProposalId,
    createRab,
    updateRab,
    deleteRab,
    addItem,
    updateItem,
    removeItem,
    serializeRabPayload,
  };
});
