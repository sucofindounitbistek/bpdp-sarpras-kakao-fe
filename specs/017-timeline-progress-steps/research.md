# Research: Pekebun Timeline Step View & Wording Refinement

## Status Mapping & Decisions

### Proposed Status Mapping Logic
Untuk merepresentasikan 5 langkah stepper secara akurat berdasarkan `PengajuanStatus` dari proposal yang dipilih, logika status berikut akan diimplementasikan:

1. **Langkah 1: Submit Proposal**
   - **Wording**: `Submit Proposal`
   - **Completed**: Selalu `true` (karena tracking hanya menampilkan proposal yang sudah tersimpan/di-submit).
   - **Active**: `false`.

2. **Langkah 2: Verifikasi Dinas Kab/Kota**
   - **Wording**: `Verifikasi Dinas Kab/Kota`
   - **Completed**: Jika `currentStatus` berada di salah satu status berikut (telah melewati tahap kabupaten):
     `['REKOMTEK_KAB_ISSUED', 'VALIDATED_PROV', 'SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`
   - **Active**: Jika `currentStatus` adalah `SUBMITTED`, `VERIFIED_ADMIN`, atau `VERIFIED_FIELD` (sedang dalam proses dinas kabupaten).

3. **Langkah 3: Asistensi Dinas Provinsi**
   - **Wording**: `Asistensi Dinas Provinsi`
   - **Completed**: Jika `currentStatus` berada di salah satu status berikut:
     `['VALIDATED_PROV', 'SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`
   - **Active**: Jika `currentStatus` adalah `REKOMTEK_KAB_ISSUED` (menunggu validasi/asistensi dinas provinsi).

4. **Langkah 4: Penerbitan Rekomtek Ditjenbun**
   - **Wording**: `Penerbitan Rekomtek Ditjenbun`
   - **Completed**: Jika `currentStatus` berada di salah satu status berikut:
     `['SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`
   - **Active**: Jika `currentStatus` adalah `VALIDATED_PROV` (provinsi selesai, menunggu penerbitan Ditjenbun).

5. **Langkah 5: Penerbitan SK Dirut BPDP**
   - **Wording**: `Penerbitan SK Dirut BPDP`
   - **Completed**: Jika `currentStatus` berada di salah satu status berikut:
     `['PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`
   - **Active**: Jika `currentStatus` adalah `SK_DITJENBUN_ISSUED` (Rekomtek Ditjenbun selesai, menunggu proses di BPDP).

---

## Edge Cases Handling

Jika status pengajuan adalah **`REVISION_ADMIN`** atau **`REJECTED`**:
- **REVISION_ADMIN**: Status ini menunjukkan usulan dikembalikan ke pemohon untuk revisi administrasi. Dalam kondisi ini, kita akan menandai Langkah 1 (`Submit Proposal`) dengan visual status khusus (misal warna Amber dengan ikon `AlertTriangle` / `Clock` dan label "Perlu Perbaikan").
- **REJECTED**: Jika usulan ditolak total, langkah aktif terakhir akan ditampilkan dengan warna merah (`danger` / `text-rose-600`) dengan ikon penolakan (`XCircle` / `AlertTriangle`).

---

## UI Layout & Component Strategy

### Desktop Layout (Horizontal Stepper)
- Stepper disusun menggunakan kontainer flex horizontal (`md:flex-row md:items-center md:justify-between`).
- Garis penghubung berada di belakang simpul-simpul langkah menggunakan `absolute w-full h-[2px] bg-slate-200 top-1/2 -translate-y-1/2 -z-10`.
- Progres garis diisi secara dinamis dengan transisi lebar (`transition-all duration-300`) menggunakan warna hijau hutan `#066C2A` sesuai dengan jumlah langkah yang telah diselesaikan.

### Mobile Layout (Vertical Stepper)
- Stepper bertransformasi menjadi daftar vertikal stacked (`flex-col gap-6`).
- Garis penghubung vertikal diletakkan di sebelah kiri setiap simpul langkah dengan `absolute left-[18px] top-9 bottom-[-24px] w-[2px]`.
- Pendekatan mobile-first ini menjamin tidak ada teks terpotong atau overflow horizontal pada viewport terkecil (375px).

### Alternatives Considered
1. **Menggunakan Horizontal Scrollable Grid**: Grid horizontal dengan scroll bar di mobile.
   - *Ditolak karena*: Melanggar prinsip kegunaan yang baik di mobile. Pengguna harus menggeser layar untuk melihat progres lengkap, sedangkan vertikal stacked memberikan gambaran instan yang jauh lebih baik.
2. **Library Stepper Pihak Ketiga (seperti Vuetify Stepper)**:
   - *Ditolak karena*: Proyek menggunakan pure Tailwind CSS & standard SFC Vue. Mengimpor library baru melanggar prinsip V (Simplicity/YAGNI) dan menambah bloat pada bundel.
