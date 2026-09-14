# Technical Research: Simpan Sebagai Draft pada Proses Revisi Proposal (Role KP)

## 1. Problem & Context
Pada alur pengajuan revisi proposal saat ini (`/proposals/:id/revisi`), pemohon dari Kelembagaan Pekebun (KP) hanya dapat menekan tombol **"Kirim Ulang Revisi"** setelah **seluruh item perbaikan terselesaikan (`isAllRejectedResolved == true`)**. Ketika terdapat banyak catatan penolakan (misal belasan dokumen identitas pekebun dan alas hak lahan), pemohon tidak dapat menyimpan progres sebagian jika ingin mencicil pekerjaannya.

## 2. Technical Findings & Decisions

### Decision 1: Penambahan flag `is_draft` pada Payload `ResubmitProposalRequest`
- **Pilihan Terpilih**: Menambahkan field `IsDraft *bool json:"is_draft"` pada struct `ResubmitProposalRequest` di backend (`internal/proposal/dto.go`).
- **Rationale**:
  - Endpoint `PUT /proposals/:id/revisi` sudah memiliki logic komprehensif untuk menerima update teks pekebun, teks lahan, dokumen proposal, storage area, dan rincian RAB.
  - Memanfaatkan endpoint yang sama dengan flag `is_draft: true` menghindari pembuatan endpoint baru yang redundan (DRY principle).
  - Jika `is_draft: true`, backend menyimpan seluruh update entitas ke database, namun **tidak mengubah status proposal** (`status` tetap `REV_FROM_KAB` dsb., tidak beralih ke `SUBMITTED`) dan **tidak mereset catatan penolakan verifikator**.
- **Alternatif Ditolak**:
  - *Membuat endpoint terpisah `POST /proposals/:id/revisi-draft`*: Redundan, menduplikasi kode payload parser dan transaksi update database.

### Decision 2: Penanganan di Sisi Repository (`internal/proposal/repository.go`)
- **Pilihan Terpilih**: Menyesuaikan method `ResubmitProposalRevisionWithUpdatesTx` agar menerima parameter `isDraft bool`.
  - Jika `isDraft == true`:
    - `tx.Model(&model.Proposal{}).Where("id = ?", proposalID).Updates(map[string]interface{}{"updated_at": time.Now()})` (jangan ubah status).
    - Simpan data dokumen, pekebun, lahan, storage area, RAB seperti biasa.
    - **JANGAN** hapus validasi (`FarmerDocumentValidation`, `LandDocumentValidation`, `ProposalDocumentValidation`) saat draft. Validasi verifikator baru di-resolve saat pengiriman final (`isDraft == false`).
  - Jika `isDraft == false`:
    - Jalankan alur existing (ubah status ke `SUBMITTED`, hapus validasi rejected yang sudah di-resolve).

### Decision 3: Penambahan Method di Frontend Store & Service
- **Service (`proposal.service.ts`)**:
  - Menambahkan parameter opsional `isDraft?: boolean` pada `proposalService.resubmitProposal(...)`.
- **Store (`proposalRevisionStore.ts`)**:
  - Menambahkan state `isDrafting = ref(false)`.
  - Menambahkan action `saveDraftRevision(storageAreaPayload?: any): Promise<boolean>`.
  - Action ini memanggil `proposalService.resubmitProposal(..., isDraft = true)`.
  - Tidak mengecek `isAllRejectedResolved`, sehingga dapat dipanggil kapan pun pemohon melakukan perubahan sebagian.
- **View (`RevisiProposalView.vue`)**:
  - Menambahkan tombol sekunder:
    ```html
    <button
      @click="handleSaveDraft"
      :disabled="revisionStore.isSubmitting || revisionStore.isDrafting"
      class="px-5 py-2.5 text-xs font-bold text-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2"
    >
      <Save class="w-4 h-4" />
      <span>{{ revisionStore.isDrafting ? 'Menyimpan Draf...' : 'Simpan Draf' }}</span>
    </button>
    ```
  - Setelah sukses, pemohon tetap di halaman revisi dan muncul toast: `Draf revisi berhasil disimpan`.

## 3. Risk Assessment & Mitigations
- **Risiko Overwriting**: Konflik saat verifikator membuka proposal.
  - *Mitigasi*: Proposal yang sedang direvisi berstatus revisi (`REV_FROM_KAB` dll) dan hanya dapat diedit oleh pemohon KP terkait. Row locking transaksi (`clause.Locking{Strength: "UPDATE"}`) di backend mencegah race condition.
- **Risiko Perubahan Status Prematur**:
  - *Mitigasi*: Guard ketat di backend `if !isDraft { updates["status"] = newStatus }`.
