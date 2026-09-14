# Phase 0 Research: Modal Konfirmasi Penolakan Terkelompok Dinas Kabupaten

## 1. Table Grouping & Layout Strategy

### Decision
Membangun tabel modal dengan dua sub-tabel terpisah:
1. **Tabel Dokumen Usulan & Kelembagaan**:
   - Kolom: `No` (w-12 text-center), `Nama Dokumen / Item` (w-1/3), `Keterangan Penolakan` (w-auto).
   - Menangani dokumen persyaratan proposal, RAB bertandatangan, serta area gudang penyimpanan (alamat, koordinat, foto).
2. **Tabel Data & Dokumen Pekebun & Lahan (CPCL)**:
   - Kolom: `No` (w-12 text-center), `Nama Pekebun` (w-1/4), `Jenis Dokumen / Objek` (w-1/3), `Keterangan Penolakan` (w-auto).
   - Pengelompokan: Untuk setiap pekebun yang memiliki > 1 item penolakan (misal: Scan KTP dan SHM Lahan), baris pertama mencantumkan Nama Pekebun dengan `rowspan="N"` (atau visual sub-table grouping), sehingga nama pekebun tidak berulang-ulang di setiap baris.

### Rationale
- Format ini mereplikasi kejelasan pembacaan pada dokumen fisik PKD / CAR (Permintaan Kelengkapan Data) yang biasa diterbitkan Sucofindo / IDSurvey.
- Membantu verifikator mengecek konsistensi penolakan secara komprehensif sebelum mengembalikan proposal ke pemohon.

---

## 2. Integration with `verifikasiKabDraftStore`

### Decision
Membuat computed property pembantu (`rejectedProposalDocs` dan `groupedPekebunRejections`) yang mengekstrak langsung dari `verifikasiStore.verifications` dan data proposal aktif:
- Proposal docs: Memetakan key yang berstatus `REJECTED` (persyaratan, `rabDocument`, `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) dengan label nama dokumen resmi.
- Pekebun & Lahan: Memetakan key berawalan `doc-${cpclId}-` yang berstatus `REJECTED`, mengekstrak nama pekebun dari `daftarCPCL`, menentukan nama dokumen/field (misal `SHM - 188 / ADE`, `Scan KTP`, `NIK`), dan memuat catatan penolakan.

### Rationale
- Menjaga prinsip Single Source of Truth tanpa menduplikasi state store.
- Reaktif secara real-time terhadap perubahan status verifikasi di step 1.

---

## 3. UI/UX & Modal Sizing

### Decision
- Menggunakan ukuran dialog `max-w-4xl` (lebar mencukupi untuk tabel multi-kolom).
- Container isi tabel diberi `max-h-[65vh] overflow-y-auto` agar tidak meluap keluar layar pada proposal dengan puluhan pekebun.
- Warna badge / indikator: Menampilkan badge jumlah item ditolak (misal `3 Dokumen &bull; 8 Data Pekebun`) di header modal.
