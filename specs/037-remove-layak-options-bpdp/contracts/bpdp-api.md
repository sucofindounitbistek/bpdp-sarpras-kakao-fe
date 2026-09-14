# Interface Contract: BPDP Verifikator Action Card (037-remove-layak-options-bpdp)

## Component Contract: `CekiBpdpView.vue`

The "Keputusan Kelayakan" card renders the simplified flow:

```html
<!-- Case 4: All checked & valid - Generate/upload -->
<div v-else class="flex flex-col gap-5">
  <!-- Report download & upload block -->
  <div v-if="activeUsulan.kelayakan?.draftUrl" class="flex flex-col gap-3 dark:border-slate-800/80">
    <div class="flex items-center gap-2 py-3 border-y border-slate-100">
      <a :href="activeUsulan.kelayakan.draftUrl" download ...>
        <span>Unduh Laporan Penelitian Rekomendasi Teknis</span>
      </a>
    </div>

    <!-- Upload Signed Document -->
    <FileUpload id="kelayakanUpload" label="Dokumen Kelayakan Ditandatangani" ... />

    <!-- Action Button -->
    <button type="button" @click="handleAjukanKelayakan" ...>
      Teruskan ke BPDP Approval
    </button>
  </div>
</div>
```
