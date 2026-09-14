# Feature Specification: Modul Penyaluran & Pencairan Dana (SARPRAS Kelapa)

**Feature Branch**: `074-penyaluran-pencairan-dana`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "Create the specification for the new module using the requirements documented in /Downloads/PENYALURAN & PENCAIRAN DANA - Implementation Plan.md"

---

## Latar Belakang & Konteks Bisnis

Modul **Penyaluran & Pencairan Dana** adalah satu-satunya proses bisnis V3 Layanan Mandiri Perkebunan (SARPRAS) yang belum diimplementasikan sama sekali (belum ada menu maupun entitas). Sumber kebenaran proses: diagram *FINAL Probis Penyaluran dan Pencairan Dana* (159 node). Proses dimulai setelah proposal berstatus **"SK Dirut Terbit"**.

Dana SARPRAS disalurkan bertahap sesuai dasar hukum (Peraturan Direktur Utama No. 10 & No. 11 pasal 10 ayat 3): **Tahap 1 = 40%**, **Tahap 2 = 30%** (gate kemajuan pekerjaan ≥ 70%), **Tahap 3 = 30%** (gate 100%), ke **rekening escrow** KP di Bank Mitra.

> **Revisi FINAL (vs V3 lama):** "Input Nilai Permohonan (Rp)" menjadi "Input Nilai Permohonan **per divisi** (Rp)" — nilai diisi untuk **setiap divisi pekerjaan yang dipilih**, lalu sistem melakukan *Generate Total* (penjumlahan nilai seluruh divisi).

Peran yang terlibat:

- **Kelembagaan Pekebun (KP)**: pengajuan PKS 3 Pihak (komparisi A.1), pengajuan pencairan, upload dokumen per tahap, pengembalian dana, penutupan rekening.
- **BPDP Verifikator**: proses dokumen PKS 3 Pihak, komparisi A.2, penjadwalan tanda tangan.
- **BPDP Staff & Kadiv**: pemeriksaan dan persetujuan pencairan (Staff review → Kadiv approve).
- **Surveyor SCI** (sub-peran: Pendok, Verdok, QC, Kantor Pusat): rantai verifikasi dokumen pencairan + monitoring lapangan (tahap 2 & 3).
- **Bank Mitra**: komparisi A.3, konfirmasi transfer dana, penutupan rekening escrow.

---

## Clarifications

### Session 2026-09-04

- Q: Kardinalitas Proposal ↔ Permohonan Pencairan — satu alur pencairan per proposal, atau beberapa permohonan? → A: **B — Beberapa permohonan per proposal**; tiap permohonan bernomor sendiri (mengikuti pola penomoran existing, mis. `SRPR-KLPA/DANA/2026/001`) dan masing-masing memiliki 3 tahap 40/30/30 (keputusan berlaku untuk fase FE).
- Q: Bagaimana mekanisme "Pencairan Sisa Dana" sebelum Penutupan Rekening di aplikasi? → A: **A — Gerbang status saja**: KP mengunggah bukti pencairan sisa dana; sistem mencatat status "Pencairan Sisa Dana selesai" sebagai prasyarat membuka form Penutupan Rekening (proses fisik pencairan sisa dana terjadi di bank).
- Q: (Realign 2026-09-05, cross-check diagram FINAL) Kapan penyaluran ke escrow dilakukan dan kapan gate 70%/100% berlaku? → A: **Sesuai diagram**: (1) penyaluran ke escrow (input nominal + Odoo) dilakukan BPDP setelah dokumen tahap diajukan — TIDAK menunggu rantai verifikasi; rantai verifikasi SCI→BPDP + Surat Persetujuan mengatur **pencairan** (transfer Bank dari escrow ke rekening tujuan, syarat: Surat Persetujuan terunggah); (2) Tahap 2/3 **diajukan dulu** oleh KP setelah tahap sebelumnya DITRANSFER, monitoring lapangan dilakukan setelahnya, dan gate ≥70%/100% berlaku pada **pemrosesan penyaluran dana** (bukan pada pengajuan).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proses PKS 3 Pihak (KP, BPDP, Bank Mitra) (Priority: P1)

Sebagai BPDP Verifikator, KP, dan Bank Mitra, saya ingin memproses pembuatan, komparisi, dan penjadwalan penandatanganan Perjanjian Kerjasama (PKS) 3 Pihak secara digital, sehingga perjanjian yang menjadi prasyarat penyaluran dana dapat terbentuk dengan data legalitas yang terverifikasi dari ketiga pihak.

**Why this priority**: PKS 3 Pihak adalah prasyarat mutlak seluruh alur pencairan dana; tanpa PKS aktif tidak ada tahapan dana yang bisa berjalan.

**Independent Test**: Masuk sebagai BPDP Verifikator pada usulan proposal SK Dirut Terbit, klik "Proses Dokumen PKS 3 Pihak", unduh dokumen PKS hasil generate; kemudian login sebagai KP (unduh template surat kuasa, upload surat kuasa, isi & submit Komparisi A.1) dan Bank Mitra (isi & submit Komparisi A.3); kembali sebagai BPDP untuk penjadwalan tanda tangan — notifikasi jadwal diterima KP & Bank.

**Acceptance Scenarios**:

1. **Given** proposal berstatus "SK Dirut Terbit", **When** KP dan Bank Mitra login, **Then** keduanya menerima notifikasi "menerima SK Dirut" sebagai pemicu memulai proses PKS 3 Pihak.
2. **Given** KP membuka menu terkait PKS, **When** mengunduh template surat kuasa pekebun → ketua → bank mitra, **Then** template dengan format resmi tersedia untuk diunduh, lalu KP dapat mengunggah surat kuasa yang telah diisi/ditandatangani.
3. **Given** BPDP Verifikator membuka usulan, **When** menekan "Proses Dokumen PKS 3 Pihak", **Then** sistem meng-generate dokumen PKS 3 Pihak dalam format siap unduh beserta kelengkapan dokumen "B" (kop surat: nama KP, telp/email kantor, no. & tanggal SK Dirut, no. & tanggal PKS, nama & no. HP ketua).
4. **Given** PKS sedang diproses, **When** KP submit Komparisi A.1 (legalitas KP: nomor PKS KP, dokumen legalitas badan hukum dari profil, penunjukkan Ketua KP), BPDP submit Komparisi A.2 (nomor PKS BPDP, narasi badan hukum BPDP), dan Bank Mitra submit Komparisi A.3 (nomor PKS Bank, narasi badan hukum Bank, **nomor rekening KP**), **Then** seluruh data komparisi ketiga pihak terekam dengan waktu submit masing-masing.
5. **Given** komparisi ketiga pihak lengkap, **When** BPDP menjadwalkan tanda tangan PKS 3 pihak, **Then** KP dan Bank Mitra menerima notifikasi jadwal; setelah penandatanganan fisik (di luar aplikasi), PKS berstatus AKTIF.

---

### User Story 2 - Pengajuan Pencairan oleh KP (Wizard "Tambah Permohonan") (Priority: P1)

Sebagai Ketua/Pengurus KP, saya ingin mengajukan permohonan pencairan dana melalui wizard bertahap — memilih proposal, mengisi jenis pembelian, memilih divisi pekerjaan beserta **nilai permohonan per divisi** dengan total yang di-generate otomatis, mengisi rekening tujuan & skema transfer, lalu mengunduh/mengunggah surat permohonan dan dokumen pendukung — sehingga permohonan pencairan sah secara administratif dan siap diverifikasi.

**Why this priority**: Pengajuan pencairan adalah inti modul; wizard menurunkan beban administrasi KP dan menjamin kelengkapan data (termasuk revisi FINAL nilai per divisi → total otomatis).

**Independent Test**: Login sebagai KP, buka menu "Penyaluran Dana" → "Tambah Permohonan", pilih nomor proposal (hanya SK Dirut Terbit), verifikasi Data A & B yang ter-generate, pilih jenis pembelian & divisi + nilai per divisi (total muncul otomatis), isi rekening & skema, unduh surat permohonan (PDF & Word), unggah surat berttd basah + dokumen "D" + Surat Berita Acara, lalu submit.

**Acceptance Scenarios**:

1. **Given** KP memulai "Tambah Permohonan", **When** memilih nomor proposal, **Then** hanya proposal berstatus "SK Dirut Terbit" yang tersedia, dan sistem men-generate Data "A" (legalitas KP utuh dari profil terverifikasi) dan Data "B" (kop surat) secara otomatis, termasuk data permohonan: nilai dana (pagu), luas hektar, saldo pernyataan, sisa saldo permohonan, nama & jabatan pemohon, tanggal permohonan, jumlah pekebun, jumlah KK, tahap permohonan, no. & bank rekening escrow.
2. **Given** wizard step pembelian, **When** KP memilih jenis pembelian (`Pembelian`/`Reimbursement`/`UMK`), peruntukan (`Beneficier`/`Operasional KP`), dan satu atau beberapa dari 10 divisi pekerjaan lalu mengisi **nilai permohonan untuk setiap divisi yang dipilih**, **Then** total permohonan di-generate otomatis sebagai penjumlahan nilai seluruh divisi (tidak dapat diinput manual).
3. **Given** step rekening tujuan, **When** KP mengisi nama & nomor rekening, memilih bank tujuan, skema transfer (`Transfer Online (Eksternal)`/`SKN (Eksternal)`), dan alamat/kota/kodepos/email tujuan, **Then** data rekening tervalidasi dan tersimpan.
4. **Given** wizard step dokumen, **When** KP menekan unduh, **Then** surat permohonan tersedia dalam format PDF **dan** Word; setelah ditandatangani basah KP mengunggahnya kembali, beserta dokumen "D" (bukti tagihan kontraktor; kwitansi/invoice/nota; perjanjian kontraktor/mitra/supplier; daftar upah; foto kegiatan) dan Surat Berita Acara (diunduh format Word lalu diunggah kembali).
5. **Given** seluruh step selesai, **When** KP menekan "Simpan & Lanjutkan" dan "Cek", **Then** sistem menampilkan hasil pemeriksaan (Sesuai/Tidak Sesuai); bila Tidak Sesuai KP dapat memperbaiki ulang sebelum melanjutkan ke Penyaluran Tahap 1.

---

### User Story 3 - Penyaluran Uang Tahap 1 (40%) ke Rekening Escrow (Priority: P1)

Sebagai BPDP Verifikator, saya ingin memproses penyaluran tahap pertama (40%) berdasarkan dokumen persyaratan yang diunggah KP, sehingga dana masuk ke rekening escrow KP dengan ID Penyaluran yang unik dan terlacak.

**Why this priority**: Tahap 1 adalah penyaluran dana pertama yang menjadi dasar kegiatan sarpras KP; tanpa ini seluruh pekerjaan lapangan tidak dimulai.

**Independent Test**: Login sebagai KP untuk mengunggah 10 dokumen persyaratan Tahap 1; login sebagai BPDP untuk input nominal penyaluran 40% dan memproses penyaluran; verifikasi ID Penyaluran berformat `<NomorProposal>.T1` (contoh `SPKA106260001.T1`) dan saldo tahap 1 (40%) tercatat masuk rekening escrow.

**Acceptance Scenarios**:

1. **Given** pengajuan pencairan telah dibuat, **When** KP membuka checklist dokumen Tahap 1, **Then** sistem menampilkan dokumen yang di-generate sistem (SK Dirut; Dokumen Hasil Penelitian Kelengkapan & Kesesuaian Rekomtek; Salinan Rekomtek + lampiran CPCL & BA Hasil Verifikasi) dan dokumen yang wajib diunggah KP (Surat Permohonan Penyaluran Tahap 1; Salinan PKS 3 Pihak; Kuitansi bermeterai dittd Ketua KP; SPTJM bermeterai; BA Pembayaran Tahap 1; Salinan Surat Kuasa anggota→ketua; Rencana Penggunaan Dana Tahap I 40% + rincian RAB).
2. **Given** seluruh dokumen persyaratan terunggah, **When** permohonan diproses, **Then** sistem meng-generate ID Penyaluran = Nomor Proposal + Tahap (contoh `SPKA106260001.T1`).
3. **Given** ID Penyaluran terbit, **When** BPDP menginput nominal penyaluran tahap 1 (40%) dan memproses penyaluran ke rekening escrow, **Then** saldo tahap 1 sebesar 40% tercatat masuk rekening escrow KP dan status pembayaran terpantau.

---

### User Story 4 - Rantai Verifikasi Dokumen (SCI) & Approval Pencairan (BPDP) hingga Transfer Bank Mitra (Priority: P2)

Sebagai Surveyor SCI (Pendok → Verdok → QC → Kantor Pusat) dan BPDP (Staff → Kadiv), saya ingin memverifikasi dokumen pencairan secara berjenjang dengan catatan yang jelas, sehingga hanya dokumen yang sah yang menghasilkan Surat Persetujuan Pencairan Dana dan transfer dana oleh Bank Mitra.

**Why this priority**: Rantai verifikasi adalah gerbang mutu dan kepatuhan setiap tahap pencairan; loop perbaikan dengan catatan mencegah dokumen cacat masuk ke tahap pembayaran.

**Independent Test**: Login berurutan sebagai SCI Pendok, Verdok, QC, dan Kantor Pusat pada satu berkas: setiap tingkat memberi keputusan Sesuai/Tidak Sesuai + catatan; Kantor Pusat mengunggah Laporan & Lampiran VPD; lanjut sebagai BPDP Staff (review) → BPDP Kadiv (approve) → sistem meng-generate Surat Persetujuan Pencairan Dana → BPDP mengunggahnya → Bank Mitra menerima notifikasi dan mengonfirmasi transfer ke rekening tujuan.

**Acceptance Scenarios**:

1. **Given** dokumen pencairan disubmit, **When** Pendok (SURVEYOR) menerima dokumen asli dan memeriksa kelengkapan, **Then** hasil verifikasi + catatan tercatat; bila Tidak Sesuai, KP menerima catatan perbaikan, memperbaiki dokumen, dan submit ulang.
2. **Given** dokumen lolos Pendok, **When** Verdok dan QC memverifikasi masing-masing dengan catatan, lalu Kantor Pusat SCI menerima push dokumen dan menyetujui, **Then** Laporan & Lampiran VPD terbit/terunggah dan diteruskan ke Staff BPDP.
3. **Given** Staff BPDP menerima dokumen + laporan/lampiran VPD, **When** Kadiv BPDP melakukan approval (Cek: Ya/Tidak), **Then** sistem meng-generate Surat Persetujuan Pencairan Dana untuk diunggah BPDP; Ya melanjutkan ke transfer, Tidak mengembalikan dengan alasan.
4. **Given** Surat Persetujuan Pencairan Dana terunggah, **When** Bank Mitra menerima notifikasi penerimaan Surat Persetujuan, **Then** Bank Mitra memproses transfer dana ke rekening tujuan KP dan proses pencairan tahap tersebut selesai (status DITRANSFER).

---

### User Story 5 - Penyaluran Tahap 2 (30%, Gate ≥ 70%) & Tahap 3 (30%, Gate 100%) dengan Monitoring Lapangan (Priority: P3)

Sebagai KP dan Surveyor SCI, saya ingin mengajukan penyaluran tahap 2 dan 3 yang hanya terbuka setelah kemajuan pekerjaan terverifikasi (≥ 70% untuk Tahap 2; 100% untuk Tahap 3) melalui monitoring lapangan, sehingga pencairan dana proporsional dengan realisasi pekerjaan.

**Why this priority**: Gate 70%/100% adalah kontrol dasar hukum yang mencegah pencairan dana tanpa progres pekerjaan nyata; menutup siklus distribusi 100% dana.

**Independent Test**: Coba ajukan Tahap 2 sebelum laporan monitoring valid → tombol terkunci; lengkapi Surat Tugas + Laporan monitoring ≥ 70% oleh Surveyor, verifikasi BPDP → dana tahap 2 (30%) masuk escrow; ulangi untuk Tahap 3 dengan laporan 100% → dana tahap 3 (30%) masuk escrow.

**Acceptance Scenarios**:

1. **Given** Tahap 1 selesai, **When** KP membuka detail penyaluran, **Then** tombol "Ajukan Tahap 2" hanya aktif bila laporan kemajuan pekerjaan ≥ 70% telah diverifikasi; sebelum itu tombol terkunci beserta penjelasan syarat.
2. **Given** permohonan tahap 2 diajukan (permohonan "C" + dokumen pembayaran tahap 2: salinan PKS mode pratinjau, Surat Permohonan/Kuitansi/SPTJM/BA Pembayaran Tahap 2, Laporan Penggunaan Dana Tahap 1, Laporan kemajuan ≥ 70% dittd Ketua KP & diketahui Dinas Perkebunan Kab/Kota, Rencana Penggunaan 30% + RAB), **When** BPDP/Surveyor mengunggah Surat Tugas dan Surveyor melaksanakan kunjungan lapangan (di luar aplikasi), **Then** Surveyor mengunggah Dokumen Pelaporan "E" (Laporan Hasil Monitoring & Evaluasi, BA Monitoring, Dokumentasi Kegiatan) pada aplikasi.
3. **Given** laporan monitoring tahap 2 terunggah, **When** BPDP melakukan Cek/Verifikasi, **Then** Ya → dana tahap 2 masuk rekening escrow sebesar 30%; Tidak → BPDP menginput alasan pengembalian dokumen ke KP.
4. **Given** Tahap 2 selesai, **When** KP mengajukan permohonan tahap 3 ("F" + dokumen pembayaran tahap 3) dan Surveyor mengunggah Dokumen Pelaporan "G" (Laporan Monitoring penyelesaian 100%, BA Monitoring, Dokumentasi), **Then** setelah verifikasi, dana tahap 3 (30%) masuk rekening escrow — total distribusi 100%.

---

### User Story 6 - Pengembalian Dana (Priority: P4)

Sebagai KP dan BPDP-Teknis, saya ingin memproses pengembalian dana yang telah diterima KP (upload permohonan → penelitian → terbitnya dokumen pengembalian), sehingga pengembalian dana negara tercatat resmi dan terlacak.

**Why this priority**: Cabang proses untuk kasus penerima dana yang dibatalkan; penting secara kepatuhan namun frekuensinya lebih rendah daripada alur utama.

**Independent Test**: Login sebagai KP, unggah Dokumen Permohonan Pengembalian; login sebagai BPDP-Teknis, teliti surat permohonan (Lengkap dan Sesuai / loop perbaikan), lalu verifikasi Surat Pemberitahuan Pengembalian Dana dan SK Dirut tentang Pembatalan Penerima Dana terbit.

**Acceptance Scenarios**:

1. **Given** KP bermaksud mengembalikan dana, **When** mengunggah Dokumen Permohonan Pengembalian, **Then** permohonan berstatus DIAJUKAN dan masuk antrean penelitian BPDP-Teknis.
2. **Given** BPDP-Teknis meneliti surat permohonan, **When** hasil penelitian "Tidak Lengkap/Tidak Sesuai", **Then** dokumen kembali ke KP untuk perbaikan (loop); bila "Lengkap dan Sesuai", sistem menerbitkan Surat Pemberitahuan Pengembalian Dana dan SK Dirut tentang Pembatalan Penerima Dana.

---

### User Story 7 - Pencairan Sisa Dana & Penutupan Rekening Escrow (Priority: P4)

Sebagai KP, BPDP, dan Bank Mitra, saya ingin menutup rekening escrow setelah seluruh dana selesai (pencairan sisa dana), sehingga siklus hidup penerimaan dana SARPRAS berakhir secara resmi.

**Why this priority**: Tahap penutup akhir siklus; menyempurnakan tata kelola, bukan blocker alur utama.

**Independent Test**: Login sebagai KP, unggah Surat Permohonan Penutupan Rekening "A"; verifikasi BPDP menerima surat, lalu Bank Mitra menerima Surat Permohonan Penutupan dari BPDP dan status menjadi Selesai (rekening escrow ditutup).

**Acceptance Scenarios**:

1. **Given** tahap 3 selesai, **When** KP mengunggah bukti pencairan sisa dana, **Then** sistem mencatat status "Pencairan Sisa Dana selesai" dan form Permohonan Penutupan Rekening terbuka; saat KP mengunggah Surat Permohonan Penutupan Rekening, status penutupan menjadi DIAJUKAN dan BPDP menerima Surat Permohonan Penutupan Rekening KP.
2. **Given** BPDP menerima surat permohonan, **When** diteruskan ke Bank Mitra, **Then** Bank Mitra menerima Surat Permohonan Penutupan dari BPDP, memproses penutupan rekening escrow, dan status menjadi SELESAI.

---

### User Story 8 - Tracking, Notifikasi & Dashboard Alur Dana (Priority: P2)

Sebagai KP maupun para pihak (BPDP, SCI, Bank Mitra), saya ingin memantau posisi setiap permohonan pencairan pada satu halaman tracking dengan timeline multi-aktor, progres tahap 40/30/30, saldo escrow, dan menerima notifikasi di setiap milestone, sehingga tidak ada kebingungan status antar pihak.

**Why this priority**: Transparansi lintas 4 aktor (KP→SCI→BPDP→Bank) menekan back-and-forth dan menjadi pembeda utama dibanding proses manual.

**Independent Test**: Buka detail permohonan sebagai KP: timeline 6-aktor, progress bar tahap, saldo escrow, ID Penyaluran `.T1/.T2/.T3`, dan riwayat "Dikembalikan untuk Perbaikan (catatan)" tampil; picu event (jadwal TTD, dokumen ditolak, persetujuan, dana masuk) dan pastikan notifikasi in-app/email/WhatsApp diterima pihak terkait.

**Acceptance Scenarios**:

1. **Given** permohonan pencairan berjalan, **When** KP membuka halaman detail & tracking, **Then** tampil timeline gabungan KP→SCI→BPDP→Bank, progress tahap 40/30/30, saldo escrow, dan statistik daftar permohonan (Total, Dalam Proses, Perlu Perbaikan, Dana Masuk).
2. **Given** event penting terjadi (SK Dirut terbit, jadwal ttd PKS, catatan perbaikan, persetujuan/penolakan, dana masuk escrow), **When** pihak terkait login / membuka kanal notifikasi, **Then** notifikasi in-app (bell) serta email/WhatsApp diterima oleh pihak yang berhak.
3. **Given** pipeline dashboard status antrean/beranda, **When** modul diaktifkan, **Then** tersedia stage "Pencairan Dana: PKS 3 Pihak / Tahap 1 / Tahap 2 / Tahap 3 / Selesai" pada dashboard pipeline yang ada.

---

### Edge Cases

- Apa yang terjadi bila KP mencoba mengajukan Tahap 2/3 sebelum gate kemajuan (≥70% / 100%) terverifikasi? → Tombol ajukan terkunci + penjelasan syarat yang belum terpenuhi.
- Bagaimana bila total nilai per divisi melebihi sisa saldo permohonan/pagu? → Validasi menolak submit dan menampilkan sisa saldo yang tersedia.
- Bagaimana bila dokumen ditolak pada salah satu tingkat verifikasi (Pendok/Verdok/QC/Kantor Pusat/Staff/Kadiv)? → Catatan wajib, status "Dikembalikan untuk Perbaikan", KP memperbaiki dan submit ulang tanpa kehilangan riwayat.
- Bagaimana bila terjadi perubahan PKS setelah Tahap 1? → Salinan PKS pada Tahap 2/3 ditampilkan mode pratinjau dari Tahap 1, menu upload tetap tersedia bila ada perubahan PKS.
- Bagaimana bila KP memilih rekening tujuan yang tidak sesuai dengan rekening escrow KP pada Bank Mitra? → Sistem memvalidasi kecocokan rekening escrow hasil komparisi A.3 dan memperingatkan/menolak.
- Bagaimana bila berkas diunggah salah format/melebihi batas ukuran? → Validasi tipe & ukuran berkas dengan pesan kesalahan yang jelas; upload ditolak sebelum menyimpan.
- Bagaimana bila integrasi sistem pembayaran escrow (Odoo) tidak tersedia/gangguan? → Tersedia mode fallback (mock untuk dev / pencatatan manual) dan status pembayaran ditandai tertunda, bukan gagal diam-diam.
- Bagaimana bila satu KP memiliki lebih dari satu proposal SK Dirut Terbit? → Dropdown pemilihan proposal hanya menampilkan proposal yang eligible beserta sisa saldo masing-masing.
- Bagaimana bila notifikasi email/WhatsApp gagal terkirim? → Notifikasi in-app tetap tercatat; kegagalan kanal eksternal terlihat pada riwayat notifikasi dan dapat dikirim ulang.
- Bagaimana bila nilai nominal penyaluran yang diinput BPDP tidak persis 40/30/30? → Sistem menampilkan persentase hasil hitung terhadap pagu dan meminta konfirmasi sebelum diproses.

---

## Requirements *(mandatory)*

### Functional Requirements

**Peran & Akses**

- **FR-001**: Sistem HARUS mendukung peran baru beserta cakupan aksesnya: BPDP Verifikator (semua proposal SK Dirut Terbit), BPDP Staff & Kadiv (antrean approval pencairan), Surveyor SCI dengan sub-peran Pendok/Verdok/QC/Kantor Pusat (dokumen pencairan), dan Bank Mitra (KP binaan bank tersebut), di samping peran KP yang sudah ada.
- **FR-002**: Sistem HARUS menyediakan menu sesuai peran: KP → "Penyaluran Dana" (list, Tambah Permohonan, tracking); BPDP Verifikator → "PKS 3 Pihak" & "Verifikasi Pencairan"; BPDP Staff/Kadiv → "Approval Pencairan"; SCI → "Verifikasi Dokumen" & "Monitoring Lapangan"; Bank Mitra → "Komparisi & Transfer" dan "Penutupan Rekening".

**PKS 3 Pihak**

- **FR-003**: Sistem HARUS mengirim notifikasi "menerima SK Dirut" kepada KP dan Bank Mitra sebagai pemicu proses PKS 3 Pihak pada proposal berstatus SK Dirut Terbit.
- **FR-004**: Sistem HARUS menyediakan unduhan template surat kuasa (pekebun → ketua → bank mitra) dan penerimaan unggahan surat kuasa oleh KP.
- **FR-005**: Sistem HARUS meng-generate dokumen PKS 3 Pihak (format siap unduh) beserta dokumen pendukung "B" saat BPDP menekan "Proses Dokumen PKS 3 Pihak".
- **FR-006**: Sistem HARUS mencatat Komparisi tiga pihak secara terpisah: A.1 (KP — nomor PKS KP, legalitas badan hukum dari profil, penunjukkan Ketua KP), A.2 (BPDP — nomor PKS BPDP, narasi badan hukum BPDP), A.3 (Bank — nomor PKS Bank, narasi badan hukum Bank, nomor rekening KP), masing-masing dengan waktu submit.
- **FR-007**: Sistem HARUS memungkinkan BPDP menjadwal tanda tangan PKS 3 pihak dan mengirim notifikasi jadwal kepada KP & Bank Mitra; status PKS berkembang: DIPROSES → KOMPARISI → PENJADWALAN → DITANDATANGANI → AKTIF.

**Pengajuan Pencairan (Wizard)**

- **FR-008**: Sistem HARUS membatasi pilihan nomor proposal hanya pada proposal berstatus "SK Dirut Terbit" dan men-generate Data "A" (legalitas KP) serta Data "B" (kop surat) dari profil KP terverifikasi.
- **FR-009**: Sistem HARUS menampilkan data per permohonan yang digenerate: nilai dana (pagu), luas hektar, saldo pernyataan, sisa saldo permohonan, nama & jabatan pemohon, tanggal permohonan, jumlah pekebun, jumlah KK, tahap permohonan, serta nomor & bank rekening escrow.
- **FR-010**: Sistem HARUS menyediakan pilihan jenis pembelian (`Pembelian`/`Reimbursement`/`UMK`) dan peruntukan (`Beneficier`/`Operasional KP`).
- **FR-011**: Sistem HARUS menyediakan pilihan divisi pekerjaan (10 divisi: Umum; Drainase; Pekerjaan Tanah & Geosintetik; Pelebaran Perkerasan & Bahu Jalan; Perkerasan Berbutir & Beton Semen; Perkerasan Aspal; Struktur; Pengembangan Kondisi & Pekerjaan Minor; Pekerjaan Harian; Pekerjaan Pemeliharaan Rutin) dengan input **nilai permohonan per divisi yang dipilih**, dan meng-generate total sebagai penjumlahan seluruh nilai divisi (tidak diinput manual).
- **FR-012**: Sistem HARUS menerima input rekening tujuan (nama rekening, nomor rekening, bank tujuan), skema transfer (`Transfer Online (Eksternal)`/`SKN (Eksternal)`), dan alamat tujuan (alamat/kota/kodepos/email).
- **FR-013**: Sistem HARUS menyediakan unduhan surat permohonan dalam format PDF **dan** Word, penerimaan unggahan surat permohonan yang sudah ditandatangani basah, penerimaan dokumen "D" (bukti tagihan kontraktor; kwitansi/invoice/nota pembelian; surat perjanjian kontraktor/mitra kerja/supplier; daftar upah pekerjaan; foto kegiatan), serta unduhan (format Word) dan unggahan Surat Berita Acara.
- **FR-014**: Sistem HARUS menjalankan pemeriksaan "Cek" kelengkapan (Sesuai/Tidak Sesuai) sebelum melanjutkan, dengan kesempatan perbaikan ulang.
- **FR-032**: Sistem HARUS mengizinkan lebih dari satu permohonan pencairan per proposal (SK Dirut Terbit), dengan nomor permohonan unik per permohonan (mengikuti pola penomoran existing, mis. `SRPR-KLPA/DANA/2026/001`); masing-masing permohonan menjalankan 3 tahap 40/30/30 dan tervalidasi terhadap sisa saldo permohonan.

**Penyaluran Bertahap & Escrow**

- **FR-015**: Sistem HARUS meng-generate ID Penyaluran unik **per permohonan pencairan** dengan format kode permohonan + `Tahap` (contoh `SPKA106260001.T1`, `.T2`, `.T3`); ID tidak boleh bertabrakan antar permohonan pada proposal yang sama.
- **FR-016**: Sistem HARUS menampilkan checklist dokumen persyaratan per tahap — dokumen generated sistem (SK Dirut; Dokumen Hasil Penelitian; Salinan Rekomtek + CPCL + BA) dan dokumen wajib diunggah KP sesuai Lampiran A (Tahap 1: 7 dokumen; Tahap 2: + Laporan Penggunaan Dana T1, Laporan kemajuan ≥70%, Rencana 30%; Tahap 3: + Laporan Penggunaan Dana T2, Laporan kemajuan 100%).
- **FR-017**: Sistem HARUS memungkinkan BPDP menginput nominal penyaluran per tahap dan memproses penyaluran ke rekening escrow KP (40% / 30% / 30%) dengan status pembayaran yang terpantau; integrasi sistem pembayaran escrow eksternal dengan mode fallback bila integrasi belum siap.
- **FR-018**: Sistem HARUS memungkinkan pengajuan Tahap 2/3 setelah tahap sebelumnya `DITRANSFER` (dengan Surat Permohonan tahap); **pemrosesan penyaluran dana** tahap 2/3 baru dapat dijalankan BPDP setelah laporan kemajuan ≥ 70% / 100% diverifikasi dan seluruh dokumen pembayaran terunggah, dengan penjelasan syarat pada aksi yang terblokir.
- **FR-019**: Sistem HARUS menampilkan salinan PKS 3 Pihak mode pratinjau dari Tahap 1 pada Tahap 2/3, dengan menu upload tetap tersedia bila ada perubahan PKS.

**Verifikasi & Approval**

- **FR-020**: Sistem HARUS mendukung rantai verifikasi SCI berjenjang per dokumen: Pendok → Verdok → QC → Kantor Pusat (push + Approval Dokumen, terbit Laporan & Lampiran VPD), masing-masing dengan keputusan Sesuai/Tidak Sesuai dan catatan wajib saat tidak sesuai.
- **FR-021**: Sistem HARUS mendukung approval BPDP: Staff BPDP menerima dokumen + laporan/lampiran VPD, Kadiv BPDP memutuskan (Ya/Tidak); hasil "Tidak" wajib disertai alasan pengembalian.
- **FR-022**: Sistem HARUS meng-generate Surat Persetujuan Pencairan Dana setelah approval Kadiv dan menerima unggahannya oleh BPDP.
- **FR-023**: Sistem HARUS mengirim notifikasi penerimaan Surat Persetujuan kepada Bank Mitra dan mencatat konfirmasi transfer dana ke rekening tujuan (status DITRANSFER).
- **FR-024**: Sistem HARUS mengirim catatan perbaikan kepada KP pada setiap gerbang verifikasi yang menolak, memungkinkan perbaikan dokumen dan submit ulang dengan riwayat audit yang utuh.

**Monitoring Lapangan (Tahap 2 & 3)**

- **FR-025**: Sistem HARUS memungkinkan BPDP/Surveyor mengunggah Surat Tugas untuk kunjungan lapangan dan menerima Dokumen Pelaporan kunjungan: laporan "E" (Monitoring & Evaluasi, penyelesaian ≥ 70%, tahap 2) dan "G" (Monitoring penyelesaian 100%, tahap 3) beserta BA Monitoring dan dokumentasi kegiatan.

**Pengembalian Dana & Penutupan Rekening**

- **FR-026**: Sistem HARUS mendukung pengajuan Pengembalian Dana: unggah Dokumen Permohonan Pengembalian (KP), Penelitian BPDP-Teknis dengan loop perbaikan, lalu terbitnya Surat Pemberitahuan Pengembalian Dana dan SK Dirut tentang Pembatalan Penerima Dana (termasuk Surat Permohonan Penghentian Penerima Dana).
- **FR-027**: Sistem HARUS mendukung gerbang Pencairan Sisa Dana — KP mengunggah bukti pencairan sisa dana, sistem mencatat status "Pencairan Sisa Dana selesai" dan baru membuka form Penutupan Rekening — serta alur Penutupan Rekening itu sendiri: unggah Surat Permohonan Penutupan Rekening (KP), penerimaan oleh BPDP, penerusan ke Bank Mitra, hingga status SELESAI (rekening escrow ditutup).

**Tracking, Notifikasi & Dashboard**

- **FR-028**: Sistem HARUS menyediakan halaman tracking per permohonan berisi timeline gabungan lintas aktor (KP→SCI→BPDP→Bank), progres tahap 40/30/30, saldo escrow, dan riwayat pengembalian untuk perbaikan.
- **FR-029**: Sistem HARUS menyediakan daftar permohonan dengan statistik (Total, Dalam Proses, Perlu Perbaikan, Dana Masuk) dan penomoran dokumen penyaluran dana yang konsisten dengan pola penomoran modul penyaluran barang.
- **FR-030**: Sistem HARUS mengirim notifikasi (in-app, email, WhatsApp) untuk: SK Dirut terbit, jadwal ttd PKS, catatan perbaikan, persetujuan/penolakan, dan dana masuk escrow.
- **FR-031**: Sistem HARUS menambahkan stage "Pencairan Dana" (PKS 3 Pihak / Tahap 1 / Tahap 2 / Tahap 3 / Selesai) pada pipeline dashboard yang ada.

### Key Entities *(include if feature involves data)*

- **PKS3Pihak**: Perjanjian 3 pihak (KP–BPDP–Bank) untuk satu proposal; atribut: nomor PKS per pihak, status (DIPROSES/KOMPARISI/PENJADWALAN/DITANDATANGANI/AKTIF), jadwal ttd, berkas PKS & surat kuasa.
- **Komparisi**: Data perbandingan para pihak pada satu PKS; pihak A.1 (KP) / A.2 (BPDP) / A.3 (Bank), muatan data per pihak, waktu submit.
- **Pencairan (Permohonan)**: Pengajuan pencairan dana oleh KP; satu proposal dapat memiliki **banyak permohonan** (nomor permohonan unik per permohonan); jenis pembelian, divisi pekerjaan terpilih + nilai permohonan per divisi, total (hasil generate), peruntukan, rekening tujuan + skema transfer + alamat, status.
- **PencairanTahap**: Realisasi tahap penyaluran (1/2/3; 40/30/30) **per permohonan**; ID Penyaluran (`.T1/.T2/.T3`, unik per permohonan), nominal, status (DIAJUKAN/VERIF_SCI/VERIF_BPDP/DISETUJUI/DITRANSFER/DITOLAK), gate progres (0.7/1.0), info escrow.
- **DokumenPencairan**: Berkas per tahap; jenis (generated/upload), tipe dokumen (SK Dirut, Penelitian Rekomtek, Rekomtek, Surat Permohonan, PKS 3 Pihak, Kuitansi, SPTJM, BA Pembayaran, Surat Kuasa, Rencana Penggunaan Dana, Laporan Penggunaan, Laporan Kemajuan, Laporan Monitoring SCI, BA Monitoring, Dokumentasi Kegiatan, Dokumen D, BA, Surat Tugas), berkas, wajib/opsional.
- **VerifikasiRantai**: Keputusan verifikasi per tahap pencairan; aktor (Pendok/Verdok/QC/Kantor Pusat SCI/Staff BPDP/Kadiv BPDP), hasil (Sesuai/Tidak), catatan, berkas VPD, waktu.
- **SuratPersetujuanPencairan**: Surat persetujuan per tahap; nomor, berkas, pengunggah.
- **TransferEscrow**: Rekaman penyaluran ke rekening escrow; nomor SPP sistem pembayaran, status pembayaran, nominal, rekening & bank escrow, waktu.
- **PengembalianDana**: Permohonan pengembalian dana per proposal; surat permohonan, status (DIAJUKAN/DITELITI/DIKEMBALIKAN), Surat Pemberitahuan & SK Pembatalan.
- **PenutupanRekening**: Permohonan penutupan rekening escrow; bukti pencairan sisa dana (gerbang), surat penutupan, status (DIAJUKAN/DITERIMA_BPDP/DITERIMA_BANK/SELESAI).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: KP dapat menyelesaikan wizard "Tambah Permohonan" pencairan (di luar waktu tanda tangan basah & pengumpulan dokumen fisik) dalam ≤ 30 menit effektif per permohonan.
- **SC-002**: 100% permohonan memiliki total nilai permohonan yang identik dengan penjumlahan nilai per divisi (total selalu di-generate sistem, tanpa input manual).
- **SC-003**: 0 (nol) penyaluran/pencairan dana Tahap 2/3 yang dapat diproses sebelum gate kemajuan ≥ 70% / 100% diverifikasi — gate tidak dapat dilewati lewat UI mana pun.
- **SC-004**: 100% penolakan dokumen pada setiap tingkat verifikasi disertai catatan yang sampai ke KP, dan KP dapat mengajukan ulang tanpa membuat permohonan baru (loop perbaikan) — tidak ada penolakan diam-diam.
- **SC-005**: Seluruh distribusi dana 40% + 30% + 30% per permohonan tercatat masuk rekening escrow dengan status pembayaran yang dapat dipantau pada halaman tracking (satu permohonan = satu sumber kebenaran status).
- **SC-006**: Setiap milestone (SK Dirut terbit, jadwal TTD PKS, catatan perbaikan, persetujuan/penolakan, dana masuk escrow) menghasilkan notifikasi yang diterima pihak berhak (in-app + minimal satu kanal eksternal) dalam ≤ 5 menit.
- **SC-007**: Seluruh alur dari SK Dirut Terbit → PKS 3 Pihak → Tahap 1–3 → Penutupan Rekening (termasuk cabang Pengembalian Dana) dapat dipantau end-to-end dari satu halaman tracking per permohonan.
- **SC-008**: Semua peran (KP, BPDP Verifikator/Staff/Kadiv, SCI 4 sub-peran, Bank Mitra) hanya melihat dan memproses antrean sesuai cakupan aksesnya — 0 akses silang antar peran.

---

## Assumptions

- **Format dokumen keluaran final** (PKS 3 Pihak, SPTJM, Kuitansi, Rencana Penggunaan Dana, Surat Persetujuan, Surat Pemberitahuan Pengembalian, SK Pembatalan) beberapa ditandai "perlu disepakati kembali" pada diagram — template dokumen dibuat dapat dikonfigurasi dan dimulai dari format existing/draft; format final Ditjenbun/BPDP dikonfirmasi sebelum milestone 1 tanpa memblokir pengembangan.
- **Cakupan komoditas**: modul dibangun pertama untuk Kelapa (SPKA) pada aplikasi Sarpras Kelapa; pola yang sama direplikasi ke Kakao (SPKO) di aplikasi kakao menyusul; aplikasi sawit lama tidak disentuh.
- **Data Bank Mitra** (daftar bank, pemetaan KP↔bank, nomor rekening escrow) bersumber dari input komparisi A.3 oleh Bank Mitra dan dikukuhkan saat penjadwalan tanda tangan; seed data bank mitra & rekening escrow per KP disiapkan untuk pengujian.
- **Daftar 10 divisi pekerjaan** dijadikan konfigurasi (dapat disesuaikan per komoditas), dengan seed awal sesuai diagram.
- **Integrasi pembayaran escrow (Odoo)**: kunci integrasi adalah nomor permohonan/ID Penyaluran dengan balasan nomor SPP + status pembayaran; tersedia mode mock untuk development dan fallback manual bila integrasi belum siap (pola DUKCAPIL mock diikuti).
- **Posisi SCI di IAM**: satu peran Surveyor SCI dengan empat sub-peran (pendok/verdok/qc/kantor_pusat), sesuai rekomendasi rencana implementasi.
- **Penomoran dokumen** keluaran (Surat Persetujuan, PKS 3 Pihak) mengikuti pola penomoran existing (mis. `SRPR-KLPA/DANA/2026/001`); format final dikonfirmasi menyusul — hanya ID Penyaluran `.Tn` yang terdefinisi baku di diagram.
- **Pipeline dashboard** Satker/KP disepakati menambah stage "Pencairan Dana" pada dashboard yang sudah ada.
- **Proses tanda tangan basah** dokumen PKS + kelengkapannya terjadi di luar aplikasi; aplikasi mencatat jadwal, menerima unggahan hasil, dan mengelola dokumen digital.
- **Kanal notifikasi email + WhatsApp** memakai kanal yang sudah terbukti berjalan (kanal OTP WhatsApp existing); notifikasi in-app (bell) tetap menjadi kanal utama.
- **Dependensi backend & IAM**: endpoint backend baru (mengikuti pola integrasi layanan existing), peran IAM baru, dan integrasi pembayaran disediakan tim backend; frontend mengikuti pola wizard 3-step, verifikasi per-dokumen "Sesuai/Tidak Sesuai" + catatan + riwayat audit, serta pola dokumen "Unduh Format" yang sudah ada di aplikasi (kontrak endpoint diverifikasi langsung ke sumber backend sebelum implementasi, sesuai konstitusi proyek).
- **Akun uji** disiapkan untuk semua peran: BPDP Verifikator, BPDP Staff, BPDP Kadiv, SCI Pendok/Verdok/QC/Kantor Pusat, Bank Mitra (+ seed bank mitra & rekening escrow per KP).
