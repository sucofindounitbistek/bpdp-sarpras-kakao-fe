export const LOCALIZATION = {
  // Pekebun Draft Wording
  pekebunDraft: {
    resumeDraft: 'Lanjutkan Pengisian',
    deleteDraft: 'Hapus Draft',
    saveDraftSuccess: 'Draft Pekebun berhasil disimpan.',
    updateDraftSuccess: 'Draft Pekebun berhasil diperbarui.',
    deleteDraftSuccess: 'Draft Pekebun berhasil dihapus.',
    submitSuccess: 'Data Pekebun berhasil disimpan.',
    draftBadge: 'Draft',
    tabAll: 'Semua',
    tabRegistered: 'Terdaftar',
    tabDraft: 'Draft Pekebun',
    editTitle: 'Edit / Melanjutkan Pengisian Draft Pekebun',
    createTitle: 'Pendaftaran Pekebun Baru',
    totalLuasLahanHeader: 'Total Luas Lahan',
    totalLuasLahanUnit: 'Ha',
    noLahanDash: '-',
  },
  // Stepper Workflow Steps Wording
  workflowSteps: {
    submitPemohon: 'Submit Proposal',
    rekomtekKab: 'Verifikasi Dinas Kab/Kota',
    asistensiProv: 'Asistensi Dinas Provinsi',
    rekomtekDitjenbun: 'Asistensi dan Penerbitan Rekomtek Ditjenbun',
    skDirutBpdp: 'Penelitian Rekomtek dan Penerbitan SK Dirut BPDP',
  },
  // Workflow Step Status Sub-labels
  stepStatus: {
    active: 'Sedang Diproses',
    warning: 'Perlu Perbaikan',
    error: 'Ditolak',
    completed: 'Selesai',
    pending: 'Belum Mulai',
  },
  // Dinas Kabupaten/Kota Queue Statuses
  kabQueueStatus: {
    submitted: 'Menunggu Verifikasi',
    onProgress: 'Sedang Verifikasi',
    rekomtekKabIssued: 'Submit Provinsi',
    needToFix: 'Perlu Revisi',
  },
  proposalStatus: {
    DRAFT: 'Draft',
    SUBMITTED: 'Verifikasi Dinas Kab/Kota',
    KAB_SUBMITTED: 'Asistensi Dinas Provinsi',
    REV_FROM_KAB: 'Perlu Perbaikan',
    REV_FROM_PROV: 'Perlu Perbaikan',
    PROV_SUBMITTED: 'Asistensi dan Penerbitan Rekomtek Ditjenbun',
    REV_FROM_DITJEN_VERIF: 'Perlu Perbaikan',
    DITJEN_VERIF_SUBMITTED: 'Menunggu Approval Ketua Ditjenbun',
    DITJEN_APPR_SUBMITTED: 'Disetujui Kadiv Ditjenbun',
    REV_FROM_DITJEN_APPR: 'Perlu Perbaikan',
    BPDP_VERIF_SUBMITTED: 'Menunggu Approval BPDP',
    BPDP_APPR_SUBMITTED: 'Disetujui BPDP (Finalisasi SK Dirut)',
    REV_FROM_BPDP_VERIF: 'Perlu Perbaikan',
    REV_FROM_BPDP_APPR: 'Perlu Perbaikan',
    GENERATE_SK_DIRUT: 'Penelitian Rekomtek dan Penerbitan SK Dirut BPDP',
    SK_DIRUT_PUBLISHED: 'SK Dirut Terbit',
    SK_DIRUT_ISSUED: 'SK Dirut Terbit',
    REVISION_ADMIN: 'Perlu Perbaikan',
    VERIFIED_ADMIN: 'Verifikasi Dinas Kab/Kota',
    VERIFIED_FIELD: 'Verifikasi Dinas Kab/Kota',
    REKOMTEK_KAB_ISSUED: 'Asistensi Dinas Provinsi',
    VALIDATED_PROV: 'Asistensi dan Penerbitan Rekomtek Ditjenbun',
    SK_DITJENBUN_ISSUED: 'Penelitian Rekomtek dan Penerbitan SK Dirut BPDP',
    PKS_BPDP_SIGNED: 'Selesai',
    DISBURSED: 'Selesai',
    COMPLETED: 'Selesai',
    SELESAI: 'Selesai',
  },
  // Jenis Sarpras Labels
  jenisSarpras: {
    BENIH_PUPUK: 'Benih dan Pupuk',
    ALSINTAN: 'Alat dan Mesin Pertanian',
    JALAN_PERKEBUNAN: 'Jalan Perkebunan',
    DRAINASE: 'Drainase',
    UPH_KAKAO: 'Unit Pengolahan Hasil Kelapa',
    EKSTENSIFIKASI: 'Ekstensifikasi',
    INTENSIFIKASI: 'Intensifikasi',
    ALAT_PASCAPANEN: 'Alat Pascapanen',
    UPH: 'Pengolahan Hasil (UPH)',
    UPH_1_JENIS: 'Unit Pengolahan Hasil (1 Jenis Produk)',
    UPH_MULTI_JENIS: 'Unit Pengolahan Hasil (Multi-Jenis / Skala Besar)',
    JALAN_KEBUN: 'Jalan Kebun dan Akses ke Jalan Umum/Pelabuhan',
    ALAT_ANGKUT_LANGSIR: 'Alat Transportasi Alat Angkut Langsir',
    GEROBAK_BERMOTOR: 'Alat Transportasi Gerobak Bermotor',
    PIKAP: 'Alat Transportasi Pikap',
    TRUK: 'Alat Transportasi Truk',
    MESIN_PERTANIAN: 'Mesin Pertanian',
    INFRASTRUKTUR_PASAR: 'Pembentukan Infrastruktur Pasar',
    VERIFIKASI_TEKNIS: 'Verifikasi atau Penelusuran Teknis',
  },
  pipeline: {
    title: 'Tampilan Alur Kerja Pipeline (Dinas & Pusat)',
    pekebunLabel: 'Jumlah Pekebun',
    lahanLabel: 'Luas Lahan',
    proposalLabel: 'Jumlah Proposal',
    pengembalianLabel: 'Pengembalian Proposal',
    stages: {
      pengajuanProposal: 'Pengajuan Proposal',
      verifikasiKab: 'Verifikasi Dinas Kabupaten/Kota',
      approvalSkCpcl: 'Approval SK CPCL',
      asistensiProv: 'Asistensi Dinas Provinsi',
      asistensiDitjenbun: 'Asistensi Ditjenbun',
      penerbitanRekomtek: 'Penerbitan Rekomtek',
      approvalRekomtek: 'Approval Rekomtek',
      penelitianBpdp: 'Penelitian BPDP',
      approvalBpdp: 'Approval BPDP',
      penerbitanSkDirut: 'Penerbitan SK Dirut',
    },
  },
  filter: {
    searchPlaceholder: 'Cari nomor proposal / lembaga...',
    allStatuses: 'Semua Status',
    allJenisSarpras: 'Semua Jenis Sarpras',
    resetLabel: 'Reset Filter',
  },
  confirmationModal: {
    approveTitle: 'Konfirmasi Persetujuan',
    approveDescription: 'Anda akan meneruskan proposal ke tahap:',
    rejectTitle: 'Konfirmasi Pengembalian',
    rejectDescription: 'Anda akan mengembalikan proposal ke tahap:',
    submitTitle: 'Konfirmasi Pengajuan',
    submitDescription: 'Anda akan mengirimkan proposal ini ke:',
    notesLabel: 'Catatan:',
    confirmApprove: 'Ya, Setujui',
    confirmReject: 'Ya, Kembalikan',
    confirmSubmit: 'Ya, Kirim',
    cancel: 'Batal',
    errorDefault: 'Terjadi kesalahan. Silakan coba lagi.',
  },
  kabupatenRejectionModal: {
    title: 'Konfirmasi Pengembalian Berkas Usulan (Revisi)',
    description: 'Proposal ini akan dikembalikan ke Kelembagaan Pemohon dengan rincian catatan penolakan berikut:',
    destinationStage: 'Pemohon (Revisi)',
    sectionA: 'A. Data dan Dokumen Usulan & Kelembagaan',
    sectionB: 'B. Data dan Dokumen Pekebun & Lahan (CPCL)',
    noDocRejections: 'Tidak ada catatan penolakan pada dokumen usulan.',
    noPekebunRejections: 'Tidak ada catatan penolakan pada data pekebun/lahan.',
    thNo: 'No',
    thDocName: 'Nama Dokumen / Item',
    thPekebunName: 'Nama Pekebun',
    thDocType: 'Jenis Dokumen / Objek',
    thNotes: 'Keterangan Penolakan',
    confirmReject: 'Ya, Kembalikan ke Pemohon',
    cancel: 'Batal',
  },
  verificationMap: {
    sectionTitle: 'Sebaran Peta Pengusulan',
    toggleOpen: 'Buka Peta',
    toggleClose: 'Tutup Peta',
    legendActive: 'Proposal Sedang Diverifikasi',
    legendOther: 'Proposal Lain',
    noPolygon: 'Proposal ini belum memiliki data poligon lahan',
    noOtherProposals: 'Tidak ada proposal lain di area sekitar',
    overlapTitle: 'Tumpang Tindih Terdeteksi',
    overlapCount: '{count} proposal tumpang tindih',
    overlapArea: 'Luas Irisan',
    overlapPercentage: 'Persentase',
  },
  polygonVerification: {
    title: 'Verifikasi Poligon Lahan',
    approveBtn: 'Sesuai',
    rejectBtn: 'Tidak Sesuai',
    notesPlaceholder: 'Catatan alasan poligon tidak sesuai...',
    notesRequiredError: 'Harap berikan catatan alasan penolakan poligon lahan.',
    rejectionLabel: 'Poligon / Koordinat Lahan',
  },
  rabTable: {
    jenisLabel: 'Jenis',
    barangLabel: 'Barang',
    jumlahTahap1Label: 'Jumlah Tahap 1',
    jumlahTahap2Label: 'Jumlah Tahap 2',
    jumlahTahap3Label: 'Jumlah Tahap 3',
    jumlahTahap4Label: 'Jumlah Tahap 4',
    volumeLabel: 'Tahap 1',
    varietasLabel: 'Varietas',
    jumlahTotalLabel: 'Jumlah Total',
    satuanLabel: 'Satuan',
    hargaLabel: 'Harga Satuan',
    biayaLabel: 'Total Harga',
    actionLabel: 'Action',
    pembulatanKebawahLabel: 'Pembulatan Kebawah',
    tambahBaris: 'Tambah Baris',
    belumAdaBaris: 'Belum ada baris RAB. Klik "Tambah Baris" untuk memulai.',
    downloadSuccess: 'RAB berhasil dicetak sebagai PDF.',
    downloadWarning: 'Tambahkan minimal 1 baris RAB sebelum mengunduh.',
    uploadWarningPdf: 'RAB bertandatangan harus berformat PDF.',
    uploadWarningSize: 'Ukuran file melebihi 10 MB.',
    uploadSuccess: 'RAB bertandatangan "{name}" berhasil diunggah.',
    notRequiredMsg: 'Rencana Anggaran Biaya (RAB) terperinci tidak diperlukan untuk paket ini. Silakan unggah dokumen RAB yang ditandatangani langsung.',
    validationError: 'Pastikan semua baris RAB sudah terisi lengkap (Jenis, Barang, Satuan, Jumlah, dan Harga).',
  },
  rabDropdowns: {
    jenisOptions: [
      { value: 'Benih', label: 'Benih' },
      { value: 'Pupuk', label: 'Pupuk' },
      { value: 'Pestisida', label: 'Pestisida' },
    ],
    barangOptions: {
      Benih: ['Benih'],
      Pupuk: ['Rock Phospate', 'Urea', 'Kieserite', 'KCL', 'Boron'],
      Pestisida: ['Agents Hayati', 'Insektisida/Fungisida', 'Rodentisida', 'Termitisida', 'Herbisida'],
    } as Record<string, string[]>,
    varietasOptions: ['Kelapa Dalam', 'Kelapa Genjah', 'Kelapa Hibrida', 'Kelapa Varietas Lainnya'],
    satuanOptions: ['Batang', 'Kg', 'Liter', 'Buah', 'Sachet', 'Unit'],
    satuanByJenis: {
      Benih: ['Batang'],
      Pupuk: ['Kg', 'Liter'],
      Pestisida: ['Kg', 'Liter', 'Buah', 'Sachet', 'Unit'],
    } as Record<string, string[]>,
  },
  lahanPreview: {
    previewButton: 'Pratinjau Legalitas',
    noDocument: 'Belum Ada Dokumen',
    missingDocToast: 'Dokumen legalitas lahan belum diunggah.',
    modalTitlePrefix: 'Legalitas Lahan',
  },
  stepPilihPekebun: {
    sortNameAsc: 'Nama (A–Z)',
    sortNameDesc: 'Nama (Z–A)',
  },
  penyaluranBarang: {
    title: 'Penyaluran Barang',
    subtitle: 'Monitoring dan pelaksanaan penyaluran bantuan barang dari proposal sarpras kelapa yang telah selesai diverifikasi',
    emptyTitle: 'Belum Ada Usulan Penyaluran Barang',
    emptyDesc: 'Data penyaluran barang akan otomatis muncul di sini setelah proposal pengusulan sarpras Anda disetujui (Status Selesai).',
    ajukanButton: 'Ajukan Penyaluran',
    ajukanSuccess: 'Permohonan penyaluran untuk {nomor} berhasil diajukan ke Tim Teknis BPDP!',
  },
  lembagaProvinsi: {
    title: 'Daftar Akun Kelembagaan Pekebun',
    subtitle: 'Direktori akun kelembagaan pekebun (Kelompok Tani / Gapoktan / Koperasi) terdaftar di wilayah Provinsi.',
    searchPlaceholder: 'Cari nama kelembagaan, NIB/SK, atau nama ketua...',
    filterKabupaten: 'Semua Kabupaten/Kota',
    emptyText: 'Belum ada akun kelembagaan pekebun yang terdaftar di wilayah ini.',
    detailTitle: 'Detail Akun Kelembagaan Pekebun',
  },
  verificationAction: {
    returnForRevision: 'Kembalikan Untuk Revisi',
    rejectionNotesWarning: 'Harap berikan catatan alasan penolakan pada item yang ditolak.',
    rejectionSuccessToast: 'Proposal berhasil dikembalikan ke Pemohon untuk perbaikan berkas.',
  },
  stepPemilihanPaket: {
    header: {
      title: 'Pemilihan Jenis Paket Sarpras',
      subtitle: 'Pilih satu jenis paket sarana prasarana yang akan diusulkan.',
    },
    paketSelection: {
      label: 'Pilihan Paket Sarpras',
      placeholder: 'Pilih Paket Sarpras...',
      confirmButton: 'Konfirmasi Pilihan Paket',
    },
    switchConfirm: {
      title: 'Perhatian',
      message: 'Data Tempat Penyimpanan yang sudah diisi akan dihapus jika Anda mengganti paket ini. Lanjutkan?',
      confirm: 'Ya, Ganti',
      cancel: 'Batal',
    },
    rekening: {
      title: 'Informasi Rekening',
      subtitle: 'Khusus paket jalan kebun — masukkan Nama Bank untuk penyaluran bantuan.',
      label: 'Nama Bank',
      placeholder: 'Contoh: Bank Mandiri, Bank BRI, BNI',
      required: '*',
    },
    persyaratanDokumen: {
      title: 'Persyaratan Dokumen',
      table: {
        headers: {
          nama: 'Nama Dokumen',
          format: 'Format',
          aksi: 'Aksi',
        },
        badges: {
          auto: 'Auto',
          wajib: 'Wajib',
          opsional: 'Opsional',
        },
        formatDownload: 'Unduh Format',
        upload: 'Upload',
        preview: 'Pratinjau',
        delete: 'Hapus',
        locked: '🔒',
      },
    },
    gudangSerahTerima: {
      title: 'Tempat Penyimpanan',
      subtitle: 'Khusus paket pupuk — isi data lokasi tempat penyimpanan bantuan.',
      alamat: {
        label: 'Alamat Tempat Penyimpanan',
        placeholder: 'Jl. Raya Perkebunan No. 1, Desa ...',
        required: '*',
      },
      koordinat: {
        label: 'Koordinat (Latitude, Longitude)',
        placeholder: '-2.5831, 120.3121',
        required: '*',
      },
      foto: {
        tampakDepan: {
          label: 'Foto Tampak Depan',
          required: '*',
        },
        tampakDalam: {
          label: 'Foto Tampak Dalam',
          required: '*',
        },
        upload: {
          placeholder: 'JPG / PNG / WebP (maks. 5 MB)',
          error: {
            format: 'Format foto harus JPG, PNG, atau WebP.',
            size: 'Ukuran foto melebihi 5 MB.',
          },
        },
      },
    },
    navigation: {
      nextButton: 'Lanjut ke Step 2',
    },
    toast: {
      doc: {
        uploadSuccess: 'Dokumen "{name}" berhasil diunggah.',
        uploadError: {
          format: 'Format tidak didukung. Gunakan PDF, JPG, atau PNG.',
          size: 'Ukuran file melebihi 10 MB. Pilih file yang lebih kecil.',
        },
      },
      validation: {
        noPaket: 'Pilih jenis paket sarpras terlebih dahulu.',
        noBank: 'Nama Bank harus diisi untuk paket Jalan Kebun.',
      },
    },
  },

  // // ============================================
  // // Pekebun Draft
  // // ============================================
  // pekebunDraft: {
  //   resumeDraft: 'Lanjutkan Pengisian',
  //   deleteDraft: 'Hapus Draft',
  //   saveDraftSuccess: 'Draft Pekebun berhasil disimpan.',
  //   updateDraftSuccess: 'Draft Pekebun berhasil diperbarui.',
  //   deleteDraftSuccess: 'Draft Pekebun berhasil dihapus.',
  //   submitSuccess: 'Data Pekebun berhasil disimpan.',
  //   draftBadge: 'Draft',
  //   tabAll: 'Semua',
  //   tabRegistered: 'Terdaftar',
  //   tabDraft: 'Draft Pekebun',
  //   editTitle: 'Edit / Melanjutkan Pengisian Draft Pekebun',
  //   createTitle: 'Pendaftaran Pekebun Baru',
  // },

  // // ============================================
  // // Workflow Steps
  // // ============================================
  // workflowSteps: {
  //   submitPemohon: 'Submit Proposal',
  //   rekomtekKab: 'Verifikasi Dinas Kab/Kota',
  //   asistensiProv: 'Asistensi Dinas Provinsi',
  //   rekomtekDitjenbun: 'Penerbitan Rekomtek Ditjenbun',
  //   skDirutBpdp: 'Penerbitan SK Dirut BPDP',
  // },

  // // ============================================
  // // Step Status
  // // ============================================
  // stepStatus: {
  //   active: 'Sedang Diproses',
  //   warning: 'Perlu Perbaikan',
  //   error: 'Ditolak',
  //   completed: 'Selesai',
  //   pending: 'Belum Mulai',
  // },

  // // ============================================
  // // Kab Queue Status
  // // ============================================
  // kabQueueStatus: {
  //   submitted: 'Menunggu Verifikasi',
  //   onProgress: 'Sedang Verifikasi',
  //   rekomtekKabIssued: 'Submit Provinsi',
  //   needToFix: 'Perlu Revisi',
  // },

  // // ============================================
  // // Proposal Status
  // // ============================================
  // proposalStatus: {
  //   DRAFT: 'Draft',
  //   SUBMITTED: 'Verifikasi Dinas Kab/Kota',
  //   REVISION_ADMIN: 'Perlu Perbaikan',
  //   VERIFIED_ADMIN: 'Verifikasi Dinas Kab/Kota',
  //   VERIFIED_FIELD: 'Verifikasi Dinas Kab/Kota',
  //   REKOMTEK_KAB_ISSUED: 'Asistensi Dinas Provinsi',
  //   VALIDATED_PROV: 'Penerbitan Rekomtek Ditjenbun',
  //   SK_DITJENBUN_ISSUED: 'Penerbitan SK Dirut BPDP',
  //   PKS_BPDP_SIGNED: 'Selesai',
  //   DISBURSED: 'Selesai',
  //   COMPLETED: 'Selesai',
  //   REJECTED: 'Ditolak',
  // },

  // // ============================================
  // // Jenis Sarpras Labels
  // // ============================================
  // jenisSarpras: {
  //   BENIH_PUPUK: 'Benih dan Pupuk',
  //   ALSINTAN: 'Alat dan Mesin Pertanian',
  //   JALAN_PERKEBUNAN: 'Jalan Perkebunan',
  //   DRAINASE: 'Drainase',
  //   UPH_KAKAO: 'Unit Pengolahan Hasil Kelapa',
  //   EKSTENSIFIKASI: 'Ekstensifikasi',
  //   INTENSIFIKASI: 'Intensifikasi',
  //   ALAT_PASCAPANEN: 'Alat Pascapanen',
  //   UPH: 'Pengolahan Hasil (UPH)',
  //   UPH_1_JENIS: 'Unit Pengolahan Hasil (1 Jenis Produk)',
  //   UPH_MULTI_JENIS: 'Unit Pengolahan Hasil (Multi-Jenis / Skala Besar)',
  //   JALAN_KEBUN: 'Jalan Kebun dan Akses ke Jalan Umum/Pelabuhan',
  //   ALAT_ANGKUT_LANGSIR: 'Alat Transportasi Alat Angkut Langsir',
  //   GEROBAK_BERMOTOR: 'Alat Transportasi Gerobak Bermotor',
  //   PIKAP: 'Alat Transportasi Pikap',
  //   TRUK: 'Alat Transportasi Truk',
  //   MESIN_PERTANIAN: 'Mesin Pertanian',
  //   INFRASTRUKTUR_PASAR: 'Pembentukan Infrastruktur Pasar',
  //   VERIFIKASI_TEKNIS: 'Verifikasi atau Penelusuran Teknis',
  // },

  // // ============================================
  // // Pipeline
  // // ============================================
  // pipeline: {
  //   title: 'Tampilan Alur Kerja Pipeline (Dinas & Pusat)',
  //   pekebunLabel: 'Jumlah Pekebun',
  //   lahanLabel: 'Luas Lahan',
  //   proposalLabel: 'Jumlah Proposal',
  //   stages: {
  //     pengajuanProposal: 'Pengajuan Proposal',
  //     verifikasiKab: 'Verifikasi Dinas Kabupaten/Kota',
  //     approvalSkCpcl: 'Approval SK CPCL',
  //     asistensiProv: 'Asistensi Dinas Provinsi',
  //     asistensiDitjenbun: 'Asistensi Ditjenbun',
  //     penerbitanRekomtek: 'Penerbitan Rekomtek',
  //     approvalRekomtek: 'Approval Rekomtek',
  //     penelitianBpdp: 'Penelitian BPDP',
  //     approvalBpdp: 'Approval BPDP',
  //     penerbitanSkDirut: 'Penerbitan SK Dirut',
  //   },
  // },

  // // ============================================
  // // Filter
  // // ============================================
  // filter: {
  //   searchPlaceholder: 'Cari nomor proposal / lembaga...',
  //   allStatuses: 'Semua Status',
  //   allJenisSarpras: 'Semua Jenis Sarpras',
  //   resetLabel: 'Reset Filter',
  // },

  // // ============================================
  // // Confirmation Modal
  // // ============================================
  // confirmationModal: {
  //   approveTitle: 'Konfirmasi Persetujuan',
  //   approveDescription: 'Anda akan meneruskan proposal ke tahap:',
  //   rejectTitle: 'Konfirmasi Pengembalian',
  //   rejectDescription: 'Anda akan mengembalikan proposal ke tahap:',
  //   submitTitle: 'Konfirmasi Pengajuan',
  //   submitDescription: 'Anda akan mengirimkan proposal ini ke:',
  //   notesLabel: 'Catatan:',
  //   confirmApprove: 'Ya, Setujui',
  //   confirmReject: 'Ya, Kembalikan',
  //   confirmSubmit: 'Ya, Kirim',
  //   cancel: 'Batal',
  //   errorDefault: 'Terjadi kesalahan. Silakan coba lagi.',
  // },

  // // ============================================
  // // Verification Map
  // // ============================================
  // verificationMap: {
  //   sectionTitle: 'Peta Global Verifikasi',
  //   toggleOpen: 'Buka Peta',
  //   toggleClose: 'Tutup Peta',
  //   legendActive: 'Proposal Sedang Diverifikasi',
  //   legendOther: 'Proposal Lain',
  //   noPolygon: 'Proposal ini belum memiliki data poligon lahan',
  //   noOtherProposals: 'Tidak ada proposal lain di area sekitar',
  //   overlapTitle: 'Tumpang Tindih Terdeteksi',
  //   overlapCount: '{count} proposal tumpang tindih',
  //   overlapArea: 'Luas Irisan',
  //   overlapPercentage: 'Persentase',
  // },

  // // ============================================
  // // RAB Table
  // // ============================================
  // rabTable: {
  //   jenisLabel: 'Jenis',
  //   barangLabel: 'Barang',
  //   jumlahTahap1Label: 'Jumlah Tahap 1',
  //   jumlahTahap2Label: 'Jumlah Tahap 2',
  //   jumlahTotalLabel: 'Jumlah Total',
  //   satuanLabel: 'Satuan',
  //   hargaLabel: 'Harga Satuan',
  //   biayaLabel: 'Total Harga',
  //   actionLabel: 'Action',
  //   pembulatanKebawahLabel: 'Pembulatan Kebawah',
  //   tambahBaris: 'Tambah Baris',
  //   belumAdaBaris: 'Belum ada baris RAB. Klik "Tambah Baris" untuk memulai.',
  //   downloadSuccess: 'RAB berhasil dicetak sebagai PDF.',
  //   downloadWarning: 'Tambahkan minimal 1 baris RAB sebelum mengunduh.',
  //   uploadWarningPdf: 'RAB bertandatangan harus berformat PDF.',
  //   uploadWarningSize: 'Ukuran file melebihi 10 MB.',
  //   uploadSuccess: 'RAB bertandatangan "{name}" berhasil diunggah.',
  //   notRequiredMsg: 'Rencana Anggaran Biaya (RAB) terperinci tidak diperlukan untuk paket ini. Silakan unggah dokumen RAB yang ditandatangani langsung.',
  //   validationError: 'Pastikan semua baris RAB sudah terisi lengkap (Jenis, Barang, Satuan, Jumlah, dan Harga).',
  // },

  // // ============================================
  // // RAB Dropdowns
  // // ============================================
  // rabDropdowns: {
  //   jenisOptions: [
  //     { value: 'Benih', label: 'Benih' },
  //     { value: 'Pupuk', label: 'Pupuk' },
  //     { value: 'Pestisida', label: 'Pestisida' },
  //   ],
  //   barangOptions: {
  //     Benih: ['Benih'],
  //     Pupuk: ['Rock Phospate', 'Urea', 'Kieserite', 'KCL', 'Boron'],
  //     Pestisida: ['Agents Hayati', 'Insektisida/Fungisida', 'Rodentisida', 'Termitisida', 'Herbisida'],
  //   } as Record<string, string[]>,
  //   satuanOptions: ['Btg', 'Kg', 'Liter', 'Sachet', 'Unit'],
  // },

  // // ============================================
  // // Lahan Preview
  // // ============================================
  // lahanPreview: {
  //   previewButton: 'Pratinjau Legalitas',
  //   noDocument: 'Belum Ada Dokumen',
  //   missingDocToast: 'Dokumen legalitas lahan belum diunggah.',
  //   modalTitlePrefix: 'Legalitas Lahan',
  // },

  // // ============================================
  // // Lembaga Provinsi
  // // ============================================
  // lembagaProvinsi: {
  //   title: 'Daftar Akun Kelembagaan Pekebun',
  //   subtitle: 'Direktori akun kelembagaan pekebun (Kelompok Tani / Gapoktan / Koperasi) terdaftar di wilayah Provinsi.',
  //   searchPlaceholder: 'Cari nama kelembagaan, NIB/SK, atau nama ketua...',
  //   filterKabupaten: 'Semua Kabupaten/Kota',
  //   emptyText: 'Belum ada akun kelembagaan pekebun yang terdaftar di wilayah ini.',
  //   detailTitle: 'Detail Akun Kelembagaan Pekebun',
  // },

  // // ============================================
  // // Verification Action
  // // ============================================
  // verificationAction: {
  //   returnForRevision: 'Kembalikan Untuk Revisi',
  //   rejectionNotesWarning: 'Harap berikan catatan alasan penolakan pada item yang ditolak.',
  //   rejectionSuccessToast: 'Proposal berhasil dikembalikan ke Pemohon untuk perbaikan berkas.',
  // },

  // ============================================
  // BPDP Kadiv Approval
  // ============================================
  bpdpKadivApproval: {
    pageTitle: 'Review Penelitian Rekomtek',
    headerRole: 'Kadiv BPDP Approval',
    headerIdLabel: 'ID usulan:',
    headerNomorUsulan: 'Nomor Pengusulan:',
    viewAuditTrail: 'Lihat Riwayat',
    tabs: {
      review: 'Review Penelitian',
      pratinjau: 'Pratinjau Pekebun & Dokumen',
    },
    reviewPanel: {
      title: 'Hasil Asistensi & Laporan Penelitian BPDP',
      subtitle: 'Validasi laporan penelitian Rekomtek dari Verifikator BPDP.',
      documentCard: {
        title: 'Laporan Penelitian Rekomendasi Teknis Sarana dan Prasarana',
        source: 'dari Verifikator BPDP',
        nomorRekomtek: 'Nomor Rekomtek',
        statusKelayakan: 'Status Penelitian',
        statusLayak: 'LAYAK (MEMENUHI SYARAT)',
        statusTidakLayak: 'TIDAK LAYAK',
        previewButton: 'Pratinjau Laporan Penelitian Bertanda Tangan',
        notUploaded: 'Laporan Penelitian belum diunggah oleh Verifikator BPDP',
        rejectNote: 'Catatan Penolakan',
        rejectPlaceholder: 'Tuliskan alasan penolakan Laporan Penelitian...',
      },
      actions: {
        title: 'Keputusan Kepala Divisi',
        approved: 'Setuju',
        rejected: 'Tolak',
        approveButton: 'Setujui Penelitian (Terbitkan SK Dirut)',
        rejectButton: 'Kembalikan ke Ditjenbun',
        alreadyCompleted: 'Persetujuan Penelitian Selesai',
        statusInfo: 'Usulan saat ini berada pada status',
      },
    },
    toast: {
      accessDenied: 'Akses ditolak: Anda bukan Approval BPDP (Kadiv)',
      usulanNotFound: 'Usulan tidak ditemukan',
      validationError: 'Mohon berikan catatan alasan penolakan Laporan Penelitian.',
      approveSuccess: 'Penelitian rekomtek disetujui, siap diterbitkan SK Dirut.',
      rejectSuccess: 'Surat Pengembalian Rekomtek dikirim. Usulan dikembalikan ke Ditjenbun.',
    },
  },

  // ============================================
  // BPDP Verifikator
  // ============================================
  bpdpVerifikator: {
    pageTitle: 'Persetujuan Penelitian Rekomtek',
    headerRole: 'Verifikator BPDP',
    headerIdLabel: 'ID usulan:',
    headerNomorUsulan: 'Nomor Usulan:',
    viewAuditTrail: 'Lihat Riwayat',
    tabs: {
      verifikasi: 'Verifikasi Dokumen',
      pratinjau: 'Pratinjau Pekebun & Dokumen',
    },
    verifikasiPanel: {
      title: 'Penelitian Dokumen (BPDP)',
      subtitle: 'Periksa kesesuaian berkas rekomtek dari Ditjenbun beserta seluruh dokumen lampiran.',
      documents: {
        rekomtek: {
          title: 'Rekomendasi Teknis Ditjenbun',
          subtitlePrefix: 'Nomor:',
          defaultSubtitle: 'Dokumen Rekomtek Resmi Ditjenbun',
          downloadLabel: 'Download Rekomtek Ditjenbun',
          badgeType: 'emerald',
        },
        skCpcl: {
          title: 'Surat Keputusan CPCL',
          subtitle: 'Dari Dinas Kabupaten',
          downloadLabel: 'Download SK CPCL',
          badgeType: 'blue',
        },
        suratPengantar: {
          title: 'Surat Pengantar SK CPCL',
          subtitle: 'Dari Dinas Provinsi',
          downloadLabel: 'Download Surat Pengantar',
          badgeType: 'amber',
        },
        beritaAcara: {
          title: 'Berita Acara Hasil Verifikasi',
          subtitle: 'Dokumen Berita Acara Verifikasi Usulan',
          downloadLabel: 'Download Berita Acara',
          badgeType: 'slate',
        },
      },
    },
    rightPanel: {
      rekomtekReference: {
        title: 'Rujukan Rekomtek Ditjenbun',
        nomorRekomtek: 'Nomor Rekomtek',
        bantuanDikirim: 'Bantuan Dikirim',
        downloadButton: 'Unduh Rekomtek Signed',
        noData: 'Data Rekomtek belum tersedia.',
      },
      kelayakanDecision: {
        title: 'Keputusan Penelitian',
        statusCompleted: 'Tahap Pemeriksaan Selesai',
        statusInfo: 'Status usulan saat ini:',
        invalidDocuments: {
          warning: 'Ada dokumen yang ditandai <strong>tidak sesuai</strong>. Silakan isi catatan lalu kembalikan usulan ke Ketua Ditjenbun.',
          returnButton: 'Kembalikan ke Ketua Ditjenbun',
        },
        uncheckedDocuments: {
          warning: 'Masih ada dokumen yang <strong>belum diverifikasi</strong>. Silakan periksa semua 4 item di sebelah kiri sebelum melanjutkan.',
        },
        allChecked: {
          statusLabel: '1. Status Penelitian',
          layak: 'Layak',
          tidakLayak: 'Tidak Layak',
          generateButton: 'Generate Dokumen Penelitian',
          downloadKelayakan: 'Unduh Penelitian Rekomtek.pdf',
          uploadLabel: 'Unggah Dokumen Penelitian Bertanda Tangan',
          uploadPlaceholder: 'Unggah Laporan Penelitian Rekomtek yang telah ditandatangani (PDF max 10MB)',
          uploading: 'Mengunggah berkas...',
          uploadSuccess: 'Berkas Laporan Penelitian berhasil diunggah',
          submitButton: 'Ajukan Laporan Penelitian ke Kadiv BPDP',
        },
      },
    },
    toast: {
      accessDenied: 'Akses ditolak: Anda bukan Verifikator BPDP',
      usulanNotFound: 'Usulan tidak ditemukan',
      validationError: 'Mohon lengkapi catatan ketidaksesuaian untuk: {documents}',
      returnSuccess: 'Usulan berhasil dikembalikan ke Ketua Ditjenbun untuk perbaikan.',
      generateSuccess: 'Dokumen laporan Penelitian Rekomtek berhasil di-generate.',
      uploadSuccess: 'Berkas Laporan Penelitian Rekomtek berhasil diunggah.',
      submitValidation: 'Mohon unggah berkas Laporan Penelitian yang sudah ditandatangani.',
      submitSuccess: 'Penelitian rekomtek berhasil diajukan ke Kepala Divisi BPDP.',
    },
  },

  // ============================================
  // SK Dirut BPDP
  // ============================================
  skDirutBpdp: {
    pageTitle: 'Penerbitan SK Dirut',
    headerRole: 'Penerbitan SK Dirut',
    headerIdLabel: 'ID usulan:',
    headerNomorUsulan: 'Nomor Usulan:',
    leftPanel: {
      referenceTitle: 'Hasil Penelitian BPDP ',
      nomorRekomtek: 'Nomor Rekomtek Ditjenbun',
      statusKelayakan: 'Status Penelitian',
      statusLayak: 'LAYAK (DISETUJUI)',
      statusNotAvailable: '-',
    },
    rightPanel: {
      title: 'Penerbitan SK Dirut',
      completed: {
        title: 'SK Dirut Resmi Terbit',
        skNumberPrefix: 'SK Terbit dengan nomor',
      },
      actions: {
        step1: {
          label: '1. Unduh Format SK Dirut & Tanda Tangan',
          button: 'Unduh Format SK Dirut',
        },
        step2: {
          label: '2. Nomor SK Dirut',
          placeholder: 'Contoh: SK/DIRUT/BPDP/005/2026',
        },
        step3: {
          label: '3. Tanggal SK Dirut',
        },
        step4: {
          label: '4. Unggah SK Dirut Signed (Tanda Tangan)',
          placeholder: 'Pilih berkas PDF SK Dirut Signed (Max 10MB)',
        },
        submitButton: 'Selesaikan Penerbitan SK Dirut',
      },
    },
    toast: {
      accessDenied: 'Akses ditolak: Anda bukan Verifikator BPDP',
      usulanNotFound: 'Usulan tidak ditemukan',
      generateSuccess: 'Draf SK Direktur Utama berhasil di-generate.',
      uploadSuccess: 'Berkas SK Dirut bertanda tangan berhasil diunggah.',
      validationNomorSk: 'Mohon masukkan nomor SK Direktur Utama.',
      validationSignedFile: 'Mohon unggah berkas SK Dirut yang sudah ditandatangani.',
      submitSuccess: 'Penerbitan SK Dirut selesai! Usulan dialihkan ke status Selesai.',
    },
  },

  // ============================================
  // BAST & LPJ Upload
  // ============================================
  bastLpjUpload: {
    pageTitle: 'Upload BAST & LPJ',
    breadcrumbLabel: 'Upload BAST & LPJ',
    card: {
      title: 'Upload BAST & LPJ Pelaksanaan Pekerjaan',
      subtitle: 'Verifikasi Berita Acara Serah Terima Pekerjaan dan Laporan Fisik',
    },
    fileUploads: {
      bast: {
        label: 'Upload Scan BAST Pekerjaan Selesai (.pdf)',
        placeholder: 'Pilih berkas BAST yang telah ditandatangani Lembaga & Dinas',
      },
      lpj: {
        label: 'Upload Laporan Pertanggungjawaban (LPJ) Keuangan (.pdf)',
        placeholder: 'Pilih berkas LPJ keuangan & bukti fisik pekerjaan',
      },
    },
    buttons: {
      cancel: 'Batal',
      submit: 'Verifikasi Selesai (Close Project)',
    },
    toast: {
      success: 'BAST & Laporan Pertanggungjawaban (LPJ) terverifikasi selesai!',
      title: 'Pengusulan Completed',
    },
  },

  // ============================================
  // PKS & Penyaluran Dana
  // ============================================
  pksPenyaluran: {
    page: {
      title: 'Manajemen PKS & Penyaluran Dana BPDPKS',
      subtitle: 'Badan Pengelola Dana Perkebunan - Eksekusi Penyaluran Dana Bantuan',
    },
    card: {
      title: 'Daftar SK Penetapan Siap Salur',
      subtitle: 'SK Ditjenbun yang telah memenuhi syarat administrasi keuangan',
    },
    table: {
      headers: {
        lembaga: 'Koperasi / Lembaga',
        rekening: 'Bank & No Rekening',
        pagu: 'Pagu SK',
        status: 'Status BPDP',
        aksi: 'Aksi Penyaluran',
      },
    },
    buttons: {
      verifikasiLpj: 'Verifikasi LPJ',
      cairkanDana: 'Cairkan Dana',
    },
    toast: {
      success: 'Pencairan dana ke rekening escrow penampung berhasil!',
      title: 'Dana Disalurkan',
    },
  },

  // ============================================
  // User Management
  // ============================================
  userManagement: {
    page: {
      title: 'User Management & Hak Akses',
      breadcrumb: 'User Management',
    },
    header: {
      addUserButton: 'Tambah User Baru',
    },
    unauthorized: {
      title: 'Halaman Terbatas',
      description: 'Anda sedang mensimulasikan role {role}. Halaman User Management ini hanya dapat diakses secara resmi oleh peran {requiredRole}.',
      switchRoleLabel: 'Ganti Role Simulasi di Header atau Sidebar:',
      switchRoleButton: 'Simulasikan sebagai {role}',
    },
    card: {
      title: 'Daftar Akun Pengguna',
      subtitle: 'Seluruh data user simulasian modul penyaluran',
    },
    table: {
      headers: {
        userId: 'User ID',
        name: 'Nama Lengkap',
        role: 'Peran (Role)',
        status: 'Status',
        action: 'Aksi',
      },
      tooltips: {
        activate: 'Aktifkan',
        deactivate: 'Nonaktifkan',
      },
    },
    rolesPanel: {
      title: 'Deskripsi Peran & Akses',
      subtitle: 'Klik tab untuk melihat tugas & otorisasi',
      detailsLabel: 'Rincian Hak Akses:',
      scopeLabel: 'Cakupan Wilayah:',
    },
    modal: {
      title: 'Tambah User Baru',
      fields: {
        name: {
          label: 'Nama Lengkap',
          placeholder: 'Contoh: Muhammad Raihan',
        },
        email: {
          label: 'Alamat Email',
          placeholder: 'raihan@idsurvey.co.id',
        },
        role: {
          label: 'Peran Sistem (Role)',
          options: {
            PEMOHON: 'Lembaga Pekebun (PEMOHON)',
            DINAS_KAB: 'Dinas Kabupaten (DINAS_KAB)',
            DINAS_PROV: 'Dinas Provinsi (DINAS_PROV)',
            DITJENBUN: 'Ditjenbun Pusat (DITJENBUN)',
            BPDPKS: 'BPDPKS (BPDPKS)',
          },
        },
        region: {
          label: 'Instansi / Wilayah Kerja',
          placeholder: 'Contoh: Dinas Pertanian Soppeng',
        },
      },
      buttons: {
        cancel: 'Batal',
        save: 'Simpan Data',
      },
    },
    toast: {
      statusUpdate: 'User {name} berhasil {status}',
      statusActive: 'diaktifkan',
      statusInactive: 'dinonaktifkan',
      statusTitle: 'Status Diperbarui',
      addSuccess: 'User {name} berhasil ditambahkan!',
      addTitle: 'Sukses',
      validationError: 'Mohon isi semua field dengan lengkap!',
      validationTitle: 'Validasi Gagal',
      emailInvalid: 'Format email tidak valid!',
    },
  },

  // ============================================
  // Dinas Kab Verifikasi
  // ============================================
  dinasKabVerifikasi: {
    page: {
      titlePrefix: 'Verifikasi Usulan:',
      statusLabel: 'Status:',
      proposalLabel: 'Proposal:',
      ketuaLabel: 'Ketua:',
      nikLabel: 'NIK:',
      telpLabel: 'Telp:',
    },
    header: {
      viewAuditTrail: 'Lihat Riwayat',
    },
    steps: {
      title: 'Verifikasi Usulan',
      step1: {
        id: 1,
        title: 'Verifikasi Pekebun & Dokumen',
        description: 'Validasi Pekebun & Berkas',
      },
      step2: {
        id: 2,
        title: 'Verifikasi RAB',
        description: 'Periksa Rincian Anggaran',
      },
      step3: {
        id: 3,
        title: 'SK CPCL',
        description: 'Upload Dokumen SK CPCL',
      },
      step4: {
        id: 4,
        title: 'Summary & Submit',
        description: 'Submit dan Ajukan ke Provinsi',
      },
    },
    stepIndicator: {
      completed: 'Selesai',
      active: 'Sedang Berjalan',
      pending: 'Belum Mulai',
    },
    actions: {
      reject: 'Kembalikan (Revisi)',
      approve: 'Terbitkan Rekomtek',
    },
    modal: {
      revisi: {
        title: 'Konfirmasi Pengembalian',
        description: 'Anda akan mengembalikan proposal ke Pemohon untuk perbaikan berkas.',
        notesLabel: 'Catatan Revisi:',
        notesPlaceholder: 'Tuliskan catatan perbaikan yang diperlukan...',
        confirm: 'Ya, Kembalikan',
        cancel: 'Batal',
      },
    },
    toast: {
      revisionSuccess: 'Proposal dikembalikan ke Pemohon untuk perbaikan berkas.',
      revisionTitle: 'Revisi Dikirim',
      approveSuccess: 'Surat Rekomtek Kab/Kota berhasil diterbitkan dan dikirim ke Ditjenbun!',
      approveTitle: 'Disetujui',
    },
  },

  // ============================================
  // Dinas Kab Antrean
  // ============================================
  dinasKabAntrean: {
    page: {
      title: 'Antrean Verifikasi Dinas Kabupaten/Kota',
      subtitle: 'Pemeriksaan kelengkapan administrasi & penyiapan Rekomendasi Teknis (Rekomtek) daerah.',
    },
    card: {
      title: 'Daftar Pengajuan Masuk',
      subtitle: 'Klik tombol detail untuk melakukan verifikasi administrasi dan lapangan',
    },
    table: {
      headers: {
        nomorProposal: 'Nomor Proposal',
        lembaga: 'Lembaga Pengusul',
        paketUsulan: 'Paket Usulan',
        totalAnggaran: 'Total Anggaran',
        status: 'Status Saat Ini',
        aksi: 'Aksi Verifikasi',
      },
      emptyState: 'Proposal tidak ditemukan',
      actionButton: 'Proses Verifikasi',
    },
  },

  // ============================================
  // Audit Trail
  // ============================================
  auditTrail: {
    actorLabel: 'Pelaku',
    roleLabel: 'Peran',
    actionLabel: 'Tindakan',
    detailLabel: 'Detail',
    timestampLabel: 'Waktu',
    actions: {
      submit: 'Ajukan',
      change: 'Ubah',
      verify: 'Verifikasi',
      approve: 'Setujui',
      reject: 'Tolak',
      revision: 'Revisi',
    },
    entries: {
      bpdpVerifikator: 'BPDP Verifikator',
      ditjenbunApproval: 'Ditjenbun Approval',
      ditjenbunVerifikator: 'Ditjenbun Verifikator',
      dinasProvinsi: 'Dinas Provinsi',
      dinasKabupaten: 'Dinas Kabupaten',
      pemohon: 'Pemohon',
      bpdp: 'BPDP',
    },
  },

  // ============================================
  // Step Data CPCL
  // ============================================
  stepDataCpcl: {
    title: 'Upload SK CPCL',
    subtitle: 'Asistensi surat keputusan CPCL ',
    referenceTable: {
      title: 'Referensi Data CPCL',
      headers: {
        no: 'No',
        namaPekebun: 'Nama Pekebun',
        nik: 'NIK',
        luasLahan: 'Luas Lahan',
        dokumenLahan: 'Dokumen Lahan',
        koordinat: 'Koordinat',
      },
      emptyState: 'Tidak ada data CPCL. Data CPCL akan ditampilkan setelah pemohon mengisi formulir pengusulan.',
    },
    skCpcl: {
      title: 'Upload SK CPCL',
      formatLabel: 'Format Dokumen SK CPCL',
      generateButton: 'Generate SK CPCL',
      upload: {
        label: 'Dokumen SK CPCL Ditandatangani',
        placeholder: 'Unggah SK CPCL yang telah ditandatangani (PDF max 5MB)',
        accept: '.pdf',
      },
      uploaded: {
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
      toast: {
        success: 'Dokumen SK CPCL berhasil diunggah.',
        removed: 'Dokumen SK CPCL dihapus.',
      },
    },
    beritaAcaraDokumen: {
      title: 'Upload Berita Acara Verifikasi Dokumen',
      formatLabel: 'Format Dokumen Berita Acara Verifikasi Dokumen',
      templateButton: 'Format Template Berita Acara Verifikasi Dokumen',
      upload: {
        label: 'Berita Acara Verifikasi Dokumen',
        placeholder: 'Unggah Berita Acara Verifikasi Dokumen yang telah ditandatangani (PDF max 5MB)',
        accept: '.pdf',
      },
      uploaded: {
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
      toast: {
        success: 'Berita Acara Verifikasi Dokumen berhasil diunggah.',
        removed: 'Berita Acara Verifikasi Dokumen dihapus.',
      },
    },
    beritaAcaraLapangan: {
      title: 'Upload Berita Acara Verifikasi Lapangan',
      formatLabel: 'Format Dokumen Berita Acara Verifikasi Lapangan',
      templateButton: 'Format Template Berita Acara Verifikasi Lapangan',
      upload: {
        label: 'Berita Acara Verifikasi Lapangan',
        placeholder: 'Unggah Berita Acara Verifikasi Lapangan yang telah ditandatangani (PDF max 5MB)',
        accept: '.pdf',
      },
      uploaded: {
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
      toast: {
        success: 'Berita Acara Verifikasi Lapangan berhasil diunggah.',
        removed: 'Berita Acara Verifikasi Lapangan dihapus.',
      },
    },
    navigation: {
      backButton: 'Kembali',
      nextButton: 'Simpan & Lanjut ke Summary & Submit',
    },
  },

  // ============================================
  // Step Summary Submit
  // ============================================
  stepSummarySubmit: {
    title: 'Ringkasan Verifikasi',
    subtitle: 'Tinjau kembali hasil verifikasi sebelum mengajukan ke Provinsi.',
    packageInfo: {
      label: 'Jenis Paket',
      notFound: 'Paket Tidak Ditemukan',
    },
    step1: {
      title: 'Step 1: Verifikasi Dokumen & Input',
      documentLabel: 'Dokumen',
      wajib: 'Wajib',
      previewButton: 'Pratinjau',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      notVerified: 'Belum diverifikasi',
      notVerifiedShort: 'Belum',
      gudang: {
        label: 'Tempat Penyimpanan',
        alamat: 'Alamat & Koordinat',
      },
      rab: {
        label: 'RAB ({count} item)',
        documentLabel: 'Dokumen RAB Ditandatangani',
        rincian: 'Rincian RAB',
      },
      fotoUdara: {
        label: 'Foto Udara per Pekebun ({uploaded}/{total})',
        uploaded: 'Diunggah',
        empty: 'Belum ada foto udara diunggah',
      },
    },
    step2: {
      title: 'Step 2: SK CPCL',
      documentLabel: 'Dokumen SK CPCL',
      notUploaded: 'Belum diunggah',
      dataLabel: 'Data CPCL ({count} pekebun)',
      totalLuas: 'Total: {luas} Ha',
      tableHeaders: {
        no: 'No',
        nama: 'Nama',
        nik: 'NIK',
        luas: 'Luas',
        dokumen: 'Dokumen',
      },
    },
    rejectionNotes: {
      title: 'Catatan Penolakan',
    },
    navigation: {
      backButton: 'Kembali',
      submitButton: 'Ajukan Ke Provinsi',
      submitting: 'Mengirim...',
    },
    toast: {
      submitSuccess: 'Berkas berhasil diajukan ke Provinsi!',
      submitTitle: 'Pengajuan Berhasil',
      submitError: 'Terjadi kesalahan saat mengajukan ke provinsi.',
    },
  },

  // ============================================
  // Step Verifikasi Pekebun & Dokumen
  // ============================================
  stepVerifikasiPekebunDokumen: {
    title: 'Verifikasi Pekebun & Dokumen Proposal',
    subtitle: 'Periksa dan validasi data pekebun serta berkas pengajuan dari pemohon.',
    pekebunTable: {
      headers: {
        nama: 'Nama Pekebun',
        nik: 'NIK',
        lahan: 'Lahan',
        dokumen: 'Dokumen',
        fotoUdara: 'Foto Udara',
        status: 'Status',
        aksi: 'Aksi',
      },
      fotoUdaraRequired: '(Wajib Isi)',
      emptyState: 'Tidak ada data pekebun dalam pengajuan ini.',
      uploadLabel: 'Unggah',
      viewLabel: 'Lihat',
      deleteLabel: 'Hapus',
      verifikasiButton: 'Verifikasi Pekebun',
      statuses: {
        sesuai: 'Sesuai',
        tidakSesuai: 'Tidak Sesuai',
        belumDiverifikasi: 'Belum Diverifikasi',
      },
    },
    dokumenProposal: {
      title: 'Verifikasi Dokumen Proposal',
      subtitle: 'Periksa dan validasi berkas pengajuan serta data pendukung.',
      approveAllButton: 'Setujui Semua Item',
      packageLabel: 'Jenis Paket Terpilih',
      notFound: 'Paket Tidak Ditemukan',
      table: {
        headers: {
          nama: 'Nama Dokumen',
          file: 'File',
          status: 'Status',
          aksi: 'Aksi',
        },
        wajib: 'Wajib',
        belumDiunggah: 'Belum diunggah',
        verifikasiButton: 'Verifikasi Dokumen',
        statuses: {
          sesuai: 'Sesuai',
          tidakSesuai: 'Tidak Sesuai',
          belumDiverifikasi: 'Belum Diverifikasi',
        },
      },
      gudang: {
        title: 'Pemeriksaan Tempat Penyimpanan',
        alamat: 'Alamat Tempat Penyimpanan',
        koordinat: 'Koordinat (Lat, Long)',
        fotoDepan: 'Foto Tampak Depan',
        fotoDalam: 'Foto Tampak Dalam',
        belumDiunggah: 'Foto belum diunggah',
        setujuButton: 'Setuju',
        tolakButton: 'Tolak',
        previewButton: 'Lihat',
        notes: {
          alamatPlaceholder: 'Catatan penolakan alamat...',
          koordinatPlaceholder: 'Catatan penolakan koordinat...',
          fotoPlaceholder: 'Catatan penolakan foto...',
        },
      },
      rab: {
        title: 'Pemeriksaan RAB',
        documentLabel: 'Dokumen RAB Ditandatangani',
        notesPlaceholder: 'Catatan penolakan dokumen RAB...',
        setujuButton: 'Setuju',
        tolakButton: 'Tolak',
        previewButton: 'Lihat',
      },
    },
    rabInput: {
      title: 'RAB Kabupaten',
      step1: {
        title: 'Edit RAB',
        subtitle: 'Lengkapi tabel rencana anggaran biaya kegiatan.',
        tableLabel: 'Tabel RAB',
        totalLabel: 'Total Anggaran',
      },
      step2: {
        title: 'Generate & Unduh RAB',
        subtitle: 'Sistem akan meng-generate dokumen RAB berdasarkan data yang diisi.',
        button: 'Generate & Unduh RAB',
        confirmTitle: 'Konfirmasi:',
        confirmMessage: 'Sistem akan meng-generate dan mengunduh dokumen RAB. Lanjutkan?',
        confirmYes: 'Ya, Generate',
        confirmCancel: 'Batal',
      },
      step3: {
        title: 'Cetak & Tandatangani',
        subtitle: 'Cetak dokumen RAB yang telah diunduh, lalu tandatangani oleh pihak berwenang.',
        message: 'Dokumen RAB telah di-generate. Silakan cetak dan tandatangani.',
      },
      step4: {
        title: 'Upload RAB Bertandatangan',
        subtitle: 'Unggah dokumen RAB yang sudah ditandatangani dalam format PDF (maks. 10 MB).',
        uploadPlaceholder: 'Upload RAB bertandatangan oleh Kabupaten (PDF maks. 10 MB)',
        uploaded: 'Telah diunggah',
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
    },
    verifikasiModal: {
      title: 'Verifikasi Dokumen',
      notFound: 'Belum diunggah',
      setujuButton: 'Setuju',
      tolakButton: 'Tolak',
      notesPlaceholder: 'Tuliskan catatan alasan penolakan dokumen ini...',
      selesaiButton: 'Selesai',
    },
    navigation: {
      backButton: 'Kembali',
      nextButton: 'Simpan & Lanjut ke SK CPCL',
      rejectButton: 'Revisi Kembali',
    },
    toast: {
      fotoUploadSuccess: 'Foto Udara berhasil diunggah.',
      fotoRemoved: 'Foto Udara dihapus.',
      rabUploadSuccess: 'RAB bertandatangan "{name}" berhasil diunggah.',
      rabUploadErrorPdf: 'RAB bertandatangan harus berformat PDF.',
      rabUploadErrorSize: 'Ukuran file melebihi 10 MB.',
      approveAllSuccess: 'Semua item telah ditandai sebagai disetujui.',
      rejectError: 'Harap berikan catatan alasan penolakan pada item yang ditolak.',
      rejectSuccess: 'Proposal dikembalikan ke Pemohon untuk perbaikan.',
      rejectTitle: 'Revisi Dikirim',
      rabDownloadWarning: 'Tambahkan minimal 1 baris RAB sebelum mengunduh.',
      rabDownloadSuccess: 'RAB berhasil diunduh sebagai CSV.',
    },
  },

  // ============================================
  // Verifikasi Pekebun Detail
  // ============================================
  verifikasiPekebunDetail: {
    page: {
      title: 'Verifikasi Pekebun',
      notFound: 'Data pekebun tidak ditemukan.',
      loading: 'Memuat...',
    },
    backButton: 'Kembali',
    dokumen: {
      title: 'Verifikasi Dokumen',
      previewButton: 'Perbesar',
      labels: {
        // [TipeDokumenPekebun.SCAN_KTP]: 'Scan KTP',
        // [TipeDokumenPekebun.SCAN_KK]: 'Scan KK',
        // [TipeDokumenPekebun.SWAFOTO]: 'Swafoto',
        // [TipeDokumenPekebun.SURAT_KUASA]: 'Surat Kuasa'
      },
      ktp: {
        title: 'Scan KTP',
        namaLengkap: 'Nama Lengkap',
        nik: 'NIK',
        sesuai: 'Sesuai',
        tidakSesuai: 'Tidak Sesuai',
        placeholder: 'Alasan ketidaksesuaian...',
      },
      kk: {
        title: 'Scan KK',
        nomorKK: 'Nomor KK',
        sesuai: 'Sesuai',
        tidakSesuai: 'Tidak Sesuai',
        placeholder: 'Alasan ketidaksesuaian...',
      },
      swafoto: {
        title: 'Swafoto',
        description: 'Verifikasi foto swafoto pekebun.',
        sesuai: 'Sesuai',
        tidakSesuai: 'Tidak Sesuai',
        placeholder: 'Tuliskan alasan ketidaksesuaian...',
      },
      suratKuasa: {
        title: 'Surat Kuasa',
        description: 'Verifikasi dokumen surat kuasa.',
        sesuai: 'Sesuai',
        tidakSesuai: 'Tidak Sesuai',
        placeholder: 'Tuliskan alasan ketidaksesuaian...',
      },
      status: {
        approved: 'Disetujui',
        rejected: 'Ditolak',
        pending: 'Pending',
      },
    },
    identitas: {
      title: 'Identitas',
      fields: {
        nama: 'Nama',
        nik: 'NIK',
        nomorKK: 'No. KK',
        status: 'Status',
        tempatTglLahir: 'Tempat, Tgl Lahir',
        noHP: 'No. HP',
        alamat: 'Alamat',
      },
      statusPernikahan: {
        BELUM_MENIKAH: 'Belum Menikah',
        MENIKAH: 'Menikah',
        CERAI_HIDUP: 'Cerai Hidup',
        CERAI_MATI: 'Cerai Mati',
      },
    },
    lahan: {
      title: 'Lahan',
      fields: {
        luas: 'Luas Lahan',
        jenisHak: 'Jenis Hak',
        nomorSurat: 'No. Surat Lahan',
        koordinat: 'Koordinat',
        provinsi: 'Provinsi',
        kabupaten: 'Kabupaten',
        kecamatan: 'Kecamatan',
        desa: 'Desa',
        alamatKebun: 'Alamat Kebun',
        tahunTanam: 'Tahun Tanam',
        jenisBibit: 'Jenis Bibit',
      },
      mapTitle: 'Peta Poligon Lahan Kebun (Mode Satelit)',
    },
    emptyState: 'Tidak ada dokumen untuk diverifikasi.',
  },

  // ============================================
  // Dinas Prov Verifikasi
  // ============================================
  dinasProvVerifikasi: {
    page: {
      titlePrefix: 'Verifikasi Usulan:',
      statusLabel: 'Status:',
      proposalLabel: 'Proposal:',
      ketuaLabel: 'Ketua:',
      nikLabel: 'NIK:',
      telpLabel: 'Telp:',
    },
    header: {
      viewAuditTrail: 'Lihat Riwayat',
    },
    steps: {
      title: 'Verifikasi Usulan',
      step1: {
        id: 1,
        title: 'Pratinjau Pekebun & Dokumen Proposal',
        description: 'Tinjau data pekebun dan berkas',
      },
      step2: {
        id: 2,
        title: 'Verifikasi RAB',
        description: 'Periksa Rincian Anggaran',
      },
      step3: {
        id: 3,
        title: 'Surat Pengantar SK CPCL',
        description: 'Asistensi Surat Pengantar SK CPCL',
      },
      step4: {
        id: 4,
        title: 'Summary & Submit',
        description: 'Submit dan Ajukan ke Ditjenbun',
      },
    },
    stepIndicator: {
      completed: 'Selesai',
      active: 'Sedang Berjalan',
      pending: 'Belum Mulai',
    },
    actions: {
      reject: 'Kembalikan (Revisi)',
      approve: 'Terbitkan Rekomtek',
    },
    modal: {
      revisi: {
        title: 'Konfirmasi Pengembalian',
        description: 'Anda akan mengembalikan proposal ke Pemohon untuk perbaikan berkas.',
        notesLabel: 'Catatan Revisi:',
        notesPlaceholder: 'Tuliskan catatan perbaikan yang diperlukan...',
        confirm: 'Ya, Kembalikan',
        cancel: 'Batal',
      },
    },
    toast: {
      revisionSuccess: 'Proposal dikembalikan ke Pemohon untuk perbaikan berkas.',
      revisionTitle: 'Revisi Dikirim',
      approveSuccess: 'Surat Rekomtek Provinsi berhasil diterbitkan dan dikirim ke Ditjenbun!',
      approveTitle: 'Disetujui',
    },
  },

  // ============================================
  // Pratinjau Provinsi
  // ============================================
  pratinjauProvinsi: {
    title: 'Pratinjau Pekebun & Dokumen Proposal',
    subtitle: 'Tinjau data pekebun dan berkas pengajuan yang telah diverifikasi oleh Dinas Kabupaten.',
    pekebunTable: {
      headers: {
        nama: 'Nama Pekebun',
        nik: 'NIK',
        lahan: 'Lahan',
        dokumen: 'Dokumen',
        fotoUdara: 'Foto Udara',
        aksi: 'Aksi',
      },
      emptyState: 'Tidak ada data pekebun dalam pengajuan ini.',
      fotoUdaraNotUploaded: 'Belum diunggah',
      previewButton: 'Pratinjau',
      viewButton: 'Lihat',
    },
    dokumenProposal: {
      title: 'Dokumen Proposal',
      packageLabel: 'Jenis Paket Terpilih',
      notFound: 'Paket Tidak Ditemukan',
      table: {
        headers: {
          nama: 'Nama Dokumen',
          status: 'Status Dokumen',
        },
        wajib: 'Wajib',
        belumDiunggah: 'Belum diunggah',
        viewButton: 'Lihat',
      },
      gudang: {
        title: 'Data Tempat Penyimpanan',
        alamat: 'Alamat Tempat Penyimpanan',
        koordinat: 'Koordinat',
        fotoDepan: 'Foto Tampak Depan',
        fotoDalam: 'Foto Tampak Dalam',
        belumDiunggah: 'Foto belum diunggah',
        viewButton: 'Lihat',
      },
      rab: {
        title: 'RAB',
        documentLabel: 'Dokumen RAB Ditandatangani',
        rincian: 'Rincian RAB',
        viewButton: 'Lihat',
        tableHeaders: {
          tahap: 'Tahap',
          uraian: 'Uraian',
          volume: 'Volume',
          satuan: 'Satuan',
          hargaSatuan: 'Harga Satuan',
          subTotal: 'Sub Total',
        },
        total: 'Total RAB',
      },
    },
    navigation: {
      nextButton: 'Lanjut ke Surat Pengantar SK CPCL',
    },
  },

  // ============================================
  // Dinas Prov Antrean
  // ============================================
  dinasProvAntrean: {
    page: {
      title: 'Antrean Verifikasi Dinas Provinsi',
      subtitle: 'Pemeriksaan kelengkapan administrasi & penyiapan Rekomendasi Teknis (Rekomtek) daerah.',
    },
    card: {
      title: 'Daftar Pengajuan Masuk',
      subtitle: 'Klik tombol detail untuk melakukan verifikasi administrasi dan lapangan',
    },
    table: {
      headers: {
        nomorProposal: 'Nomor Proposal',
        lembaga: 'Lembaga Pengusul',
        paketUsulan: 'Paket Usulan',
        totalAnggaran: 'Total Anggaran',
        status: 'Status Saat Ini',
        aksi: 'Aksi Verifikasi',
      },
      emptyState: 'Proposal tidak ditemukan',
      actionButton: 'Proses Verifikasi',
    },
  },

  // ============================================
  // Step Data CPCL Provinsi
  // ============================================
  stepDataCpclProvinsi: {
    title: 'Asistensi Surat Pengantar SK CPCL',
    subtitle: 'Asistensi surat keputusan CPCL ',
    verifikasiSkCpcl: {
      title: 'Asistensi SK CPCL dari Dinas Kabupaten',
      documentLabel: 'SK CPCL dari Dinas Kabupaten',
      previewButton: 'Pratinjau',
      setujuButton: 'Sesuai',
      tolakButton: 'Tolak',
      notesPlaceholder: 'Tuliskan catatan alasan penolakan SK CPCL...',
      revisiButton: 'Revisi Kembali Dokumen',
      notAvailable: 'SK CPCL dari Dinas Kabupaten belum tersedia.',
    },
    referenceTable: {
      title: 'Referensi Data CPCL',
      headers: {
        no: 'No',
        namaPekebun: 'Nama Pekebun',
        nik: 'NIK',
        luasLahan: 'Luas Lahan',
        dokumenLahan: 'Dokumen Lahan',
        koordinat: 'Koordinat',
      },
      emptyState: 'Tidak ada data CPCL. Data CPCL akan ditampilkan setelah pemohon mengisi formulir pengusulan.',
    },
    suratPengantar: {
      title: 'Asistensi Surat Pengantar SK CPCL',
      formatLabel: 'Format Dokumen Surat Pengantar SK CPCL',
      templateButton: 'Unduh Template',
      upload: {
        label: 'Dokumen SK CPCL Ditandatangani',
        placeholder: 'Unggah SK CPCL yang telah ditandatangani (PDF max 5MB)',
        accept: '.pdf',
      },
      uploaded: {
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
      toast: {
        success: 'Dokumen SK CPCL berhasil diunggah.',
        removed: 'Dokumen SK CPCL dihapus.',
      },
    },
    navigation: {
      backButton: 'Kembali',
      nextButton: 'Simpan & Lanjut ke Summary & Submit',
    },
  },

  // ============================================
  // Step Summary Submit Provinsi
  // ============================================
  stepSummarySubmitProvinsi: {
    title: 'Ringkasan Verifikasi',
    subtitle: 'Tinjau kembali hasil verifikasi sebelum mengajukan ke Ditjenbun.',
    packageInfo: {
      label: 'Jenis Paket',
      notFound: 'Paket Tidak Ditemukan',
    },
    fotoUdara: {
      label: 'Foto Udara (Kabupaten) — {count} pekebun',
      allApproved: 'Semua Disetujui',
      hasRejected: 'Ada Ditolak',
      notVerified: 'Belum diverifikasi',
      noData: 'Belum ada foto udara',
    },
    step1: {
      title: 'Step 1: Verifikasi Dokumen & Input',
      documentLabel: 'Dokumen',
      wajib: 'Wajib',
      previewButton: 'Lihat',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      notVerified: 'Belum diverifikasi',
      notVerifiedShort: 'Belum',
      gudang: {
        label: 'Tempat Penyimpanan',
        alamatKoordinat: 'Alamat & Koordinat',
        fotoDepan: 'Foto Tampak Depan',
        fotoDalam: 'Foto Tampak Dalam',
      },
      rab: {
        label: 'RAB ({count} item)',
        documentLabel: 'Dokumen RAB Ditandatangani',
        rincian: 'Rincian RAB',
      },
      fotoLayout: {
        label: 'Foto Layout Udara',
        notUploaded: 'Belum diunggah',
      },
      fotoUdaraKab: {
        label: 'Foto Udara (Kabupaten) — {count} pekebun',
      },
    },
    step2: {
      title: 'Step 2: Surat Pengantar SK CPCL',
      documentLabel: 'Dokumen Surat Pengantar SK CPCL',
      notUploaded: 'Belum diunggah',
      dataLabel: 'Data CPCL ({count} pekebun)',
      totalLuas: 'Total: {luas} Ha',
      tableHeaders: {
        no: 'No',
        nama: 'Nama',
        nik: 'NIK',
        luas: 'Luas',
        dokumen: 'Dokumen',
      },
    },
    rejectionNotes: {
      title: 'Catatan Penolakan',
    },
    navigation: {
      backButton: 'Kembali',
      submitButton: 'Ajukan ke Ditjenbun',
      submitting: 'Mengirim...',
    },
    toast: {
      submitSuccess: 'Berkas berhasil diajukan ke Ditjenbun!',
      submitTitle: 'Pengajuan Berhasil',
      submitError: 'Terjadi kesalahan saat mengajukan ke Ditjenbun.',
    },
  },

  // ============================================
  // Verifikasi Rekomtek Kab
  // ============================================
  verifikasiRekomtekKab: {
    page: {
      title: 'Verifikasi & Penerbitan Rekomtek Kabupaten/Kota',
      subtitle: 'Pemeriksaan berkas administrasi, lapangan CPCL, dan rekomendasi teknis daerah.',
    },
    panel: {
      title: 'Penerbitan Rekomtek',
      nomorSurat: 'Nomor Surat Rekomtek Kabupaten',
      placeholder: 'Masukkan nomor surat rekomtek',
    },
    buttons: {
      terbitkan: 'Terbitkan Rekomtek & Teruskan ke Prov',
      kembalikan: 'Kembalikan / Catatan Revisi',
    },
    toast: {
      rekomtekSuccess: 'Surat Rekomtek {nomor} berhasil diterbitkan & dikirim ke Dinas Provinsi!',
      rekomtekTitle: 'Rekomtek Diterbitkan',
      revisiSuccess: 'Proposal dikembalikan ke Lembaga Pekebun dengan catatan: {note}',
      revisiTitle: 'Catatan Dikirim',
    },
  },

  // ============================================
  // Revisi Modal
  // ============================================
  revisiModal: {
    title: 'Kembalikan Berkas (Catatan Revisi)',
    description: 'Tuliskan secara jelas alasan pengembalian atau berkas dokumen yang perlu diperbaiki oleh Lembaga Pengusul.',
    label: 'Catatan Perbaikan / Revisi',
    placeholder: 'Contoh: Scan KTP Pengurus buram dan STDB anggota Budi belum dilampirkan...',
    buttons: {
      cancel: 'Batal',
      submit: 'Kirim Catatan Revisi',
    },
  },

  // ============================================
  // Validasi Rekomtek Prov
  // ============================================
  validasiRekomtekProv: {
    page: {
      title: 'Validasi & Rekomendasi Dinas Provinsi',
      subtitle: 'Pemeriksaan dan kaji ulang Rekomtek Kabupaten/Kota tingkat Provinsi Sulawesi Selatan.',
    },
    table: {
      title: 'Daftar Rekomtek Kabupaten Masuk',
      headers: {
        noRekomtek: 'No. Rekomtek Kab',
        lembaga: 'Lembaga Pekebun',
        kabupaten: 'Kabupaten/Kota',
        luas: 'Luas Total',
        status: 'Status Validasi',
        aksi: 'Aksi',
      },
      status: {
        menungguValidasi: 'Menunggu Validasi',
        validasiProvinsi: 'Validasi Provinsi',
        disetujui: 'Disetujui Provinsi & Teruskan Ditjenbun',
      },
      actionButton: 'Validasi & Teruskan',
    },
    toast: {
      success: 'Proposal {lembaga} berhasil divalidasi dan diteruskan ke Ditjenbun!',
      title: 'Validasi Provinsi',
    },
  },

  // ============================================
  // Antrean Rekomtek Ditjenbun
  // ============================================
  antreanRekomtekDitjenbun: {
    page: {
      title: 'Antrean Usulan Rekomtek',
      subtitle: 'Daftar pengusulan sarana prasarana kelapa yang dikelola oleh Kementerian Pertanian (Ditjenbun).',
    },
    tabs: {
      verifikasi: 'Antrean Verifikasi',
      approval: 'Menunggu Approval Ketua',
      selesai: 'Riwayat & Ditransfer ke BPDP',
    },
    table: {
      headers: {
        no: 'No',
        nomorUsulan: 'Nomor Usulan',
        kelompokTani: 'Kelompok Tani',
        komoditas: 'Komoditas',
        bentukBantuan: 'Bentuk Bantuan',
        status: 'Status',
        aksi: 'Aksi',
      },
      emptyState: 'Tidak ada usulan dalam antrean ini.',
      actionButton: 'Tinjau',
    },
    status: {
      verifikasiDitjenbun: 'Perlu Verifikasi',
      perbaikanDinasKab: 'Perbaikan Dinas Kab/Kota',
      perbaikanDinasProv: 'Perbaikan Dinas Provinsi',
      approvalDitjenbun: 'Menunggu Approval Ketua',
      verifikasiBpdp: 'Diproses BPDP',
      approvalBpdp: 'Diproses BPDP',
      generateSkDirut: 'Diproses BPDP',
      selesai: 'Selesai (SK Terbit)',
    },
    filter: {
      statusOptions: {
        verifikasiDitjenbun: 'Perlu Verifikasi Ditjenbun',
        perbaikanDinasKab: 'Perbaikan Dinas Kab',
        perbaikanDinasProv: 'Perbaikan Dinas Prov',
        approvalDitjenbun: 'Menunggu Approval Ditjenbun',
        verifikasiBpdp: 'Disetujui Ditjenbun (Kirim BPDP)',
      },
    },
  },

  // ============================================
  // Review Rekomtek Ditjenbun
  // ============================================
  reviewRekomtekDitjenbun: {
    page: {
      title: 'Review Rekomtek',
      headerRole: 'Review Ketua Tim',
      headerIdLabel: 'ID usulan:',
      headerNomorUsulan: 'Nomor Pengusulan:',
      viewAuditTrail: 'Lihat Riwayat',
    },
    tabs: {
      pratinjau: 'Pratinjau Pekebun & Dokumen',
      review: 'Review Rekomtek',
    },
    reviewPanel: {
      title: 'Hasil Asistensi Berkas & Dokumen Pendukung',
      subtitle: 'Validasi dokumen Rekomtek dari Verifikator Ditjenbun.',
      documentCard: {
        title: 'Dokumen Rekomtek',
        source: 'dari Ditjenbun Verifikator',
        nomorRekomtek: 'Nomor Rekomtek',
        jenisBantuan: 'Jenis Bantuan',
        previewButton: 'Pratinjau Rekomtek Bertanda Tangan',
        notUploaded: 'Dokumen Rekomtek belum diunggah oleh Verifikator',
        rejectNote: 'Catatan Penolakan',
        rejectPlaceholder: 'Tuliskan alasan penolakan dokumen Rekomtek...',
      },
      actions: {
        title: 'Keputusan Ketua Tim',
        approved: 'Setuju',
        rejected: 'Tolak',
        approveButton: 'Push ke BPDP (Setujui)',
        rejectButton: 'Revisi Kembali',
        alreadyCompleted: 'Persetujuan Selesai',
        statusInfo: 'Usulan saat ini berada pada status',
      },
    },
    toast: {
      accessDenied: 'Akses ditolak: Anda bukan Approval Ditjenbun',
      usulanNotFound: 'Usulan tidak ditemukan',
      validationError: 'Harap berikan catatan alasan penolakan.',
      approveSuccess: 'Rekomtek disetujui dan berhasil diteruskan ke BPDP.',
      approveTitle: 'Disetujui',
      rejectSuccess: 'Usulan dikembalikan ke Verifikator Ditjenbun untuk perbaikan berkas.',
      rejectTitle: 'Pushback Sukses',
    },
  },

  // ============================================
  // Asistensi Ditjenbun
  // ============================================
  asistensiDitjenbun: {
    page: {
      headerRole: '{komoditas}',
      headerIdLabel: 'ID usulan:',
      headerNomorUsulan: 'Nomor Pengusulan:',
      viewAuditTrail: 'Lihat Riwayat',
    },
    tabs: {
      pratinjau: 'Pratinjau Pekebun & Dokumen',
      asistensi: 'Asistensi Dokumen',
    },
    asistensiPanel: {
      title: 'Pelaksanaan Asistensi Dokumen Usulan',
      subtitle: 'Verifikasi kelengkapan dan kesesuaian berkas pengantar dari dinas daerah serta data pekebun.',
      documents: {
        skCpcl: {
          title: 'SK CPCL',
          subtitle: 'Dari Dinas Kabupaten',
          downloadLabel: 'Download SK CPCL',
          badgeType: 'emerald',
        },
        suratPengantar: {
          title: 'Surat Pengantar SK CPCL',
          subtitle: 'Dari Dinas Provinsi',
          downloadLabel: 'Download Surat Pengantar',
          badgeType: 'blue',
        },
        beritaAcara: {
          title: 'Berita Acara Verifikasi',
          subtitle: 'Dari Dinas Kabupaten & Provinsi',
          downloadLabel: 'Download Berita Acara',
          badgeType: 'amber',
        },
      },
    },
    rightPanel: {
      title: 'Keputusan Asistensi',
      statusCompleted: {
        title: 'Tahap Asistensi Selesai',
        statusInfo: 'Usulan saat ini berada pada status',
      },
      invalidDocuments: {
        warning: 'Ada dokumen yang ditandai <strong>tidak sesuai</strong>. Silakan kirim instruksi perbaikan kembali ke dinas daerah.',
        returnButton: 'Kembalikan untuk Perbaikan',
      },
      uncheckedDocuments: {
        warning: 'Masih ada dokumen yang <strong>belum diverifikasi</strong>. Silakan periksa semua item sebelum melanjutkan.',
      },
      allChecked: {
        assistanceLabel: '1. Tentukan Bentuk Bantuan',
        bantuanUang: 'Bantuan Uang',
        bantuanBarang: 'Bantuan Barang',
        generateButton: 'Generate Draf Rekomtek',
        step2: {
          label: '2. Unduh & Tanda Tangan',
          downloadButton: 'Download Draf Rekomtek.pdf',
          previewButton: 'Pratinjau',
        },
        step3: {
          label: '3. Nomor Rekomtek Resmi',
          placeholder: 'Contoh: 505/DITJENBUN/REKOMTEK/2026',
        },
        step4: {
          label: '4. Unggah Rekomtek Bertanda Tangan',
          placeholder: 'Pilih berkas PDF Rekomtek Signed (Max 10MB)',
          previewButton: 'Pratinjau Rekomtek Tertanda Tangan',
        },
        submitButton: 'Ajukan ke Approval Ditjenbun',
      },
    },
    toast: {
      accessDenied: 'Akses ditolak: Anda bukan Verifikator Ditjenbun',
      usulanNotFound: 'Usulan tidak ditemukan',
      validationAssistance: 'Pilih bentuk bantuan terlebih dahulu.',
      generateSuccess: 'Draf rekomendasi teknis berhasil di-generate.',
      generateTitle: 'Dokumen Dibuat',
      uploadSuccess: 'Berkas Rekomtek bertanda tangan berhasil diunggah.',
      uploadTitle: 'Unggah Sukses',
      validationNomor: 'Mohon masukkan nomor Rekomtek.',
      validationSigned: 'Mohon unggah berkas Rekomtek yang sudah ditandatangani.',
      submitSuccess: 'Usulan Rekomtek berhasil diajukan ke Ketua Tim Ditjenbun.',
      submitTitle: 'Berhasil Diajukan',
      returnSuccess: 'Perintah perbaikan berhasil dikirim ke dinas daerah.',
      returnTitle: 'Revisi Dikirim',
    },
  },

  // ============================================
  // SK Penetapan Ditjenbun
  // ============================================
  skPenetapanDitjenbun: {
    page: {
      title: 'Penerbitan SK Penetapan Penerima Sarpras',
      subtitle: 'Upload naskah SK resmi dari Direktur Jenderal Perkebunan',
    },
    form: {
      nomorSK: {
        label: 'Nomor SK Penetapan Ditjenbun',
        placeholder: 'SK-DITJENBUN/2026/xx/xxxx',
      },
      fileSK: {
        label: 'Naskah PDF SK Ditjenbun (Tandatangan Basah/BSrE)',
        accept: '.pdf',
      },
    },
    buttons: {
      cancel: 'Batal',
      submit: 'Terbitkan SK & Teruskan Ke BPDPKS',
    },
    toast: {
      success: 'SK Penetapan {nomor} resmi diterbitkan & dikirim ke BPDPKS!',
      title: 'SK Ditjenbun Issued',
    },
  },

  // ============================================
  // Pleno Penetapan Ditjenbun
  // ============================================
  plenoPenetapanDitjenbun: {
    page: {
      title: 'Evaluasi & Pleno Penetapan Ditjenbun',
      subtitle: 'Direktorat Jenderal Perkebunan - Kementerian Pertanian RI',
    },
    card: {
      title: 'Daftar Usulan Ber-Rekomtek Rekomendasi Daerah',
      subtitle: 'Siap diajukan dalam rapat pleno penetapan SK',
    },
    table: {
      headers: {
        nomorProposal: 'Nomor Proposal',
        lembaga: 'Koperasi / Lembaga',
        rekomtek: 'Rekomtek Kab/Kota',
        sarpras: 'Usulan Sarpras',
        pagu: 'Total Pagu Usulan',
        aksi: 'Aksi Ditjenbun',
      },
      rekomtekStatus: 'Ada (Lengkap)',
      actionButton: 'Proses SK Penetapan',
    },
  },

  // ============================================
  // Evaluasi SK Penetapan Ditjenbun
  // ============================================
  evaluasiSkPenetapanDitjenbun: {
    page: {
      title: 'Evaluasi Teknis & SK Penetapan Ditjenbun',
      subtitle: 'Penetapan penerima sarana dan prasarana perkebunan kelapa tingkat nasional.',
    },
    form: {
      title: 'Form Penerbitan SK Penetapan Penerima',
      nomorSK: {
        label: 'Nomor SK Penetapan Ditjenbun',
      },
      pagu: {
        label: 'Pagu Anggaran Disetujui',
      },
    },
    buttons: {
      submit: 'Terbitkan & Kirim SK Penetapan ke BPDPKS',
    },
    toast: {
      success: 'Surat Keputusan (SK) Penetapan Penerima {nomor} diterbitkan & dikirim ke BPDPKS!',
      title: 'SK Ditjenbun Diterbitkan',
    },
  },

  // ============================================
  // Pendaftaran Pekebun
  // ============================================
  pendaftaranPekebun: {
    page: {
      title: 'Pendaftaran Pekebun Baru',
      subtitle: 'Tambahkan data pekebun beserta lahan garapannya untuk dimasukkan ke dalam Master Data Pekebun.',
    },
    steps: {
      step1: {
        id: 1,
        title: 'Identitas Pekebun',
        description: 'Verifikasi NIK & Kontak',
      },
      step2: {
        id: 2,
        title: 'Upload Dokumen',
        description: 'KTP, KK & Surat Kuasa',
      },
      step3: {
        id: 3,
        title: 'Data Lahan',
        description: 'Legalitas & Wilayah Lahan',
      },
    },
    buttons: {
      back: 'Kembali',
      next: 'Lanjut Tahap Berikutnya',
      saveDraft: 'Simpan Draft',
      submit: 'Simpan Pekebun',
    },
    toast: {
      dukcapilSuccess: 'Data Dukcapil ditemukan & diverifikasi.',
      dukcapilTitle: 'Dukcapil Berhasil',
      dukcapilNotFound: 'Data Dukcapil tidak ditemukan untuk NIK tersebut.',
      dukcapilNotFoundTitle: 'NIK Tidak Ditemukan',
      dukcapilError: 'Gagal menghubungi server Dukcapil.',
      dukcapilErrorTitle: 'Koneksi Error',
      nikRegistered: 'Nomor KTP sudah terdaftar dalam Master Data',
      nikRegisteredTitle: 'Validasi Duplikat',
      validationIdentitas: 'Lengkapi data identitas dengan benar.',
      validationIdentitasTitle: 'Validasi Identitas',
      validationNik: 'Lakukan verifikasi NIK terlebih dahulu.',
      validationNikTitle: 'Validasi NIK',
      validationDokumen: 'Semua dokumen wajib diunggah.',
      validationDokumenTitle: 'Validasi Dokumen',
      validationLahan: 'Lengkapi data lahan dengan benar.',
      validationLahanTitle: 'Validasi Lahan',
      validationLahanMin: 'Minimal harus menambahkan 1 data lahan.',
      submitSuccess: 'Data Pekebun berhasil disimpan.',
      submitTitle: 'Registrasi Berhasil',
      draftSuccess: 'Draft Pekebun berhasil disimpan.',
      draftTitle: 'Draft Disimpan',
      draftError: 'Masukkan 16 digit NIK sebelum menyimpan draft.',
      draftErrorTitle: 'Validasi NIK',
      submitError: 'Gagal menyimpan data pekebun',
      draftErrorGeneric: 'Gagal menyimpan draft pekebun',
    },
  },

  // ============================================
  // Master Data Pekebun
  // ============================================
  masterDataPekebun: {
    page: {
      title: 'Master Data Pekebun',
      subtitle: 'Daftar petani pekebun kelapa yang terdaftar dalam sistem dan data lahan garapannya.',
    },
    buttons: {
      add: 'Tambah Pekebun',
    },
    filters: {
      search: {
        placeholder: 'Cari berdasarkan nama atau NIK...',
      },
      provinsi: {
        placeholder: 'Semua Provinsi',
        disabled: 'Pilih Provinsi Dahulu',
      },
      kabupaten: {
        placeholder: 'Semua Kabupaten/Kota',
      },
    },
    table: {
      headers: {
        no: 'No',
        nik: 'NIK',
        nama: 'Nama Pekebun',
        wilayah: 'Wilayah Lahan',
        luas: 'Luas Lahan',
        aksi: 'Aksi',
      },
      emptyState: {
        title: 'Tidak ada data pekebun',
        description: 'Silakan tambahkan data pekebun baru atau ubah kata kunci pencarian.',
      },
      draftBadge: 'Draft',
      actionButton: 'Detail',
    },
  },

  // ============================================
  // Pengajuan Usulan
  // ============================================
  pengajuanUsulan: {
    page: {
      title: 'Form Pengajuan Usulan Sarpras BPDPKS',
      subtitle: 'Lengkapi data profil kelembagaan, calon petani calon lokasi (CPCL), dan unggah dokumen legalitas.',
    },
    summaryPanel: {
      title: 'Ringkasan Paket Usulan',
      paketLabel: 'Pilih Paket Sarpras',
      catatanLabel: 'Catatan Permohonan',
      paketOptions: {
        benihPupuk: 'Benih & Pupuk Kelapa Unggul 2026',
        alsintan: 'Alat & Mesin Pertanian (Alsin Kelapa)',
        infrastruktur: 'Infrastruktur / Unit Pengolahan Hasil',
      },
    },
    buttons: {
      submit: 'Kirim Proposal Usulan',
    },
    toast: {
      success: 'Proposal berhasil dikirim ke Dinas Kabupaten/Kota!',
      title: 'Usulan Terkirim',
    },
  },

  // ============================================
  // Revisi Proposal
  // ============================================
  revisiProposal: {
    page: {
      title: 'Halaman Revisi Proposal Usulan',
      subtitle: 'Perbaiki berkas usulan berdasarkan catatan hasil verifikasi Dinas Kabupaten / Provinsi.',
    },
    catatan: {
      title: 'Catatan Revisi Dari Verifikator:',
    },
    upload: {
      title: 'Upload Berkas Perbaikan',
      placeholder: 'Klik atau seret berkas revisi PDF di sini',
      maxSize: 'Maksimal ukuran file 10MB',
    },
    buttons: {
      cancel: 'Batal',
      submit: 'Kirim Ulang Usulan',
    },
    toast: {
      success: 'Revisi berhasil dikirim ulang ke Dinas Kabupaten/Kota!',
      title: 'Berhasil Perbarui',
    },
  },

  // ============================================
  // Pengajuan Usulan Baru
  // ============================================
  pengajuanUsulanBaru: {
    page: {
      title: 'Pengajuan Usulan Sarpras Baru',
      subtitle: 'Lengkapi 3 langkah berikut untuk mengajukan bantuan sarana & prasarana kelapa kepada BPDP.',
    },
    steps: {
      step1: {
        id: 1,
        title: 'Paket & Dokumen',
        description: 'Pilih Paket & Upload Dokumen',
      },
      step2: {
        id: 2,
        title: 'RAB',
        description: 'Rencana Anggaran Biaya',
      },
      step3: {
        id: 3,
        title: 'Pekebun & Submit',
        description: 'Pilih Pekebun & Kirim',
      },
    },
  },

  // ============================================
  // CPCL Form
  // ============================================
  cpclForm: {
    card: {
      title: 'Tahap 2: Input Data CPCL & Poligon Spasial Lahan',
      subtitle: 'Masukkan data anggota petani calon lokasi (CPCL) dan pemetaan koordinat poligon batas lahan.',
    },
    form: {
      namaPekebun: {
        label: 'Nama Lengkap Pekebun',
        placeholder: 'Ahmad Supardi',
      },
      nik: {
        label: 'NIK Pekebun (16 Digit)',
        placeholder: '730102xxxxxxxxxx',
      },
      nomorKK: {
        label: 'Nomor Kartu Keluarga (KK)',
        placeholder: '730102xxxxxxxxxx',
      },
      luasLahan: {
        label: 'Luas Lahan (Hektar)',
        placeholder: '2.5',
      },
      jenisHak: {
        label: 'Jenis Hak / Legalitas Lahan',
        options: {
          shm: 'SHM (Sertifikat Hak Milik)',
          skt: 'SKT (Surat Keterangan Tanah)',
          stdb: 'STDB (Surat Tanda Daftar Budidaya)',
        },
      },
      nomorSurat: {
        label: 'Nomor Dokumen Lahan',
        placeholder: 'SHM-00123/2024',
      },
    },
    koordinat: {
      title: 'Koordinat Poligon Batas Lahan',
      subtitle: 'Masukkan minimal 4 titik koordinat latitude & longitude.',
      addButton: '+ Titik',
      excelButton: 'Copy-Paste Excel',
      excelPanel: {
        title: 'Copy-Paste Langsung dari Microsoft Excel',
        format: 'Format: Lat [TAB] Long per baris',
        placeholder: 'Salin sel dari Excel lalu paste di sini:\n-2.583100\t120.312100\n-2.584000\t120.315000\n-2.586500\t120.313500',
        cancel: 'Batal',
        import: 'Impor Koordinat Excel',
      },
      row: {
        latitude: 'Latitude',
        longitude: 'Longitude',
        moveUp: 'Naikkan',
        moveDown: 'Turunkan',
        delete: 'Hapus',
      },
      map: {
        valid: 'Poligon valid dengan {count} titik koordinat spasial.',
        invalid: 'Pratinjau poligon akan terbentuk setelah minimal 4 titik koordinat dimasukkan.',
        preview: 'Pratinjau Poligon Lahan',
      },
      emptyState: 'Belum ada koordinat. Silakan klik "Tambah Baris" atau tempel dari Excel.',
      pasteSuccess: 'Berhasil mengimpor {count} titik koordinat dari Excel!',
      clipboardSuccess: 'Berhasil menempelkan {count} titik koordinat dari clipboard!',
      resetButton: 'Reset',
    },
    buttons: {
      addPekebun: '+ Tambah Pekebun Ke Daftar CPCL',
    },
    table: {
      title: 'Daftar CPCL Terdaftar (Total: {count} Pekebun)',
      totalLuas: 'Total Luas: {luas} Ha',
      headers: {
        no: 'No',
        nama: 'Nama Pekebun',
        nikKk: 'NIK / KK',
        luas: 'Luas Lahan',
        dokumen: 'Dokumen Lahan',
        aksi: 'Aksi',
      },
      emptyState: 'Belum ada data CPCL. Silakan isi formulir di atas dan klik "+ Tambah Pekebun Ke Daftar CPCL".',
      deleteButton: 'Hapus',
    },
    toast: {
      error: {
        incomplete: 'Mohon lengkapi Nama Pekebun, NIK, dan Nomor Surat Lahan!',
        invalidPolygon: 'Poligon lahan belum valid. Mohon periksa kembali koordinat titik!',
      },
    },
  },

  // ============================================
  // Step Pilih Pekebun & Lahan
  // ============================================
  stepPilihPekebunLahan: {
    title: 'Step 2: Pekebun & Lahan',
    subtitle: 'Pilih pekebun yang akan diajukan dalam proposal, lengkapi dokumen kepemilikan lahan, dan pastikan memenuhi persyaratan minimum paket.',
    dokumenTerunggah: {
      title: 'Dokumen Persyaratan Terunggah',
      previewButton: 'Pratinjau',
    },
    validationStatus: {
      pekebunLabel: 'Pekebun: {count} | Total Luas: {luas} Ha',
      minimumLabel: 'Minimum: {count} pekebun atau {luas} Ha',
      noteLabel: 'Catatan: {keterangan} (diverifikasi petugas lapangan)',
    },
    summaryBar: {
      pekebunLabel: 'Pekebun terpilih: {count}',
      luasLabel: 'Total luas: {luas} Ha',
    },
    daftarPekebun: {
      title: 'Daftar Pekebun',
      searchPlaceholder: 'Cari nama atau NIK...',
      filters: {
        provinsi: 'Semua Provinsi',
        kabupaten: 'Semua Kabupaten/Kota',
        provinsiDisabled: 'Pilih Provinsi Dahulu',
      },
      emptyState: {
        title: 'Belum ada pekebun terdaftar',
        description: 'Daftarkan pekebun terlebih dahulu di modul Master Data Pekebun.',
      },
      emptySearch: {
        title: 'Tidak ada pekebun yang cocok',
        description: 'Ubah kata kunci pencarian atau filter wilayah Anda.',
      },
      pekebunCard: {
        selectedBadge: 'Dipilih',
        noLahan: 'Belum ada lahan',
        viewDocument: 'Lihat Dokumen',
        lahan: {
          luas: 'Luas Lahan: {luas} Ha',
          lokasi: 'Lokasi: {desa}, {kecamatan}',
        },
      },
    },
    navigation: {
      back: 'Kembali',
      preview: 'Pratinjau Proposal',
      submit: 'Submit Proposal',
      submitting: 'Mengirim...',
    },
    toast: {
      submitSuccess: 'Pengajuan berhasil dikirimkan! Nomor Proposal: {nomor}',
      submitError: 'Terjadi kesalahan saat mengirimkan proposal. Coba lagi.',
    },
  },

  // ============================================
  // Profil Lembaga Pengusul
  // ============================================
  profilLembagaPengusul: {
    card: {
      title: 'Tahap 1: Profil Lembaga Pengusul',
      subtitle: 'Masukkan informasi legalitas kelembagaan dan kontak penanggung jawab',
    },
    fields: {
      namaLembaga: {
        label: 'Nama Lembaga / Koperasi',
        placeholder: 'Contoh: Koperasi Tani Kelapa Sejahtera',
      },
      jenisLembaga: {
        label: 'Jenis Kelembagaan',
        options: {
          koperasi: 'Koperasi Pekebun',
          poktan: 'Kelompok Tani (POKTAN)',
          gapoktan: 'Gabungan Kelompok Tani (GAPOKTAN)',
        },
      },
      nomorAkta: {
        label: 'Nomor Akta Pendirian / SK Kemenkumham',
        placeholder: 'AHU-xxxxxxx.AH.01.02.2024',
      },
      namaKetua: {
        label: 'Nama Ketua Lembaga',
        placeholder: 'Nama Sesuai KTP',
      },
      nikKetua: {
        label: 'NIK Ketua Lembaga (16 Digit)',
        placeholder: '7301xxxxxxxxxxxx',
      },
      telepon: {
        label: 'Nomor Telepon / WhatsApp',
        placeholder: '0812xxxxxxxx',
      },
      alamatLengkap: {
        label: 'Alamat Lengkap Kantor / Sekretariat',
        placeholder: 'Jl. Perkebunan No. 12, Desa X',
      },
      namaBank: {
        label: 'Nama Bank Penampung',
        placeholder: 'Contoh: Bank BRI / Bank Mandiri',
      },
      nomorRekening: {
        label: 'Nomor Rekening Lembaga',
        placeholder: '1234-01-xxxxxx-xx-x',
      },
      namaPemilikRekening: {
        label: 'Nama Pemilik Rekening (Sesuai Buku Tabungan)',
        placeholder: 'Nama Koperasi / Lembaga',
      },
    },
  },

  // ============================================
  // Step RAB
  // ============================================
  stepRab: {
    title: 'Step 3: RAB & Submit',
    subtitle: 'Isi detail anggaran, unduh RAB, tandatangani, unggah kembali, dan kirimkan proposal pengusulan.',
    stepper: {
      step1: {
        label: 'Isi RAB',
        description: 'Lengkapi tabel rencana anggaran biaya kegiatan.',
        tableLabel: 'Tabel RAB',
        totalLabel: 'Total Anggaran',
      },
      step2: {
        label: 'Generate & Unduh RAB',
        description: 'Sistem akan meng-generate dokumen RAB berdasarkan data yang diisi.',
        button: 'Generate & Unduh RAB',
      },
      step3: {
        label: 'Cetak & Tandatangani',
        description: 'Cetak dokumen RAB yang telah diunduh, lalu tandatangani oleh pihak berwenang.',
        message: 'Dokumen RAB telah di-generate. Silakan cetak dan tandatangani.',
      },
      step4: {
        label: 'Upload RAB Bertandatangan',
        description: 'Unggah dokumen RAB yang sudah ditandatangani dalam format PDF (maks. 10 MB).',
        uploadPlaceholder: 'Upload RAB bertandatangan (PDF maks. 10 MB)',
        uploadedLabel: 'RAB Bertandatangan',
        previewButton: 'Pratinjau',
        deleteButton: 'Hapus',
      },
    },
    dokumenTerunggah: {
      title: 'Dokumen Persyaratan Terunggah',
      previewButton: 'Pratinjau',
    },
    navigation: {
      back: 'Kembali',
      next: 'Lanjut ke Step 3',
    },
    confirmDownload: {
      title: 'Konfirmasi:',
      message: 'Sistem akan meng-generate dan mengunduh dokumen RAB. Lanjutkan?',
      confirm: 'Ya, Generate',
      cancel: 'Batal',
    },
    toast: {
      downloadWarning: 'Tambahkan minimal 1 baris RAB sebelum mengunduh.',
      downloadSuccess: 'RAB berhasil diunduh sebagai CSV.',
      uploadSuccess: 'RAB bertandatangan "{name}" berhasil diunggah.',
      uploadErrorPdf: 'RAB bertandatangan harus berformat PDF.',
      uploadErrorSize: 'Ukuran file melebihi 10 MB.',
      validationMinRow: 'Lengkapi RAB: minimal 1 baris harus diisi.',
      validationSigned: 'RAB bertandatangan harus diunggah sebelum melanjutkan.',
      validationError: 'Pastikan semua baris RAB sudah terisi lengkap (Jenis, Barang, Satuan, Jumlah, dan Harga).',
    },
  },

  // ============================================
  // Upload Dokumen Persyaratan
  // ============================================
  uploadDokumenPersyaratan: {
    card: {
      title: 'Tahap 4: Upload Dokumen Persyaratan Wajib',
      subtitle: 'Unggah berkas legalitas kelembagaan dan proposal pengusulan (PDF/JPG max 5MB)',
    },
    fields: {
      ktp: {
        label: '1. KTP Pengurus & Anggota',
        placeholder: 'Unggah scan KTP pengurus (PDF/JPG max 5MB)',
        badgeUploaded: 'Sudah Diunggah',
        badgeRequired: 'Wajib',
      },
      kk: {
        label: '2. Kartu Keluarga (KK) Pekebun',
        placeholder: 'Unggah scan KK anggota (PDF/JPG max 5MB)',
        badgeUploaded: 'Sudah Diunggah',
        badgeRequired: 'Wajib',
      },
      proposal: {
        label: '3. Proposal Pengajuan Sarpras',
        placeholder: 'Unggah Proposal Pengajuan Resmi (PDF max 5MB)',
        badgeUploaded: 'Sudah Diunggah',
        badgeRequired: 'Wajib',
      },
      akta: {
        label: '4. Legalitas Kelembagaan / Akta',
        placeholder: 'Unggah Akta Koperasi / SK Dinas (PDF max 5MB)',
        badgeUploaded: 'Sudah Diunggah',
        badgeRequired: 'Wajib',
      },
    },
  },

  // ============================================
  // Status & Tracking Proposal
  // ============================================
  statusTrackingProposal: {
    page: {
      title: 'Status & Tracking Proposal',
      subtitle: 'Monitoring progres usulan bantuan sarana prasarana kelapa',
      detailTitle: 'Detail Usulan: {namaLembaga}',
      nomorProposal: 'Nomor Proposal: {nomor}',
    },
    buttons: {
      back: '← Kembali ke Daftar',
      new: '+ Buat Proposal Baru',
      detail: 'Lihat Detail',
    },
    search: {
      placeholder: 'Cari nomor proposal, lembaga, paket sarpras...',
    },
    filter: {
      button: 'Filter',
      title: 'Filter Proposal',
      status: 'Status',
      paket: 'Paket Sarpras',
      dateRange: 'Tanggal Pengajuan',
      dateFrom: 'Dari',
      dateTo: 'Sampai',
      allStatus: 'Semua Status',
      allPaket: 'Semua Paket Sarpras',
      reset: 'Reset',
      apply: 'Terapkan',
      searchStatus: 'Ketik untuk mencari...',
      noStatus: 'Tidak ada status yang cocok',
    },
    table: {
      headers: {
        no: 'No',
        tanggal: 'Tanggal Pengajuan',
        nomor: 'Nomor Proposal',
        lembaga: 'Lembaga Pengusul',
        paket: 'Paket Usulan',
        anggaran: 'Total Anggaran',
        status: 'Status',
        aksi: 'Aksi',
      },
      emptyState: {
        title: 'Tidak ada proposal ditemukan',
        description: 'Coba ubah kata kunci atau filter pencarian',
      },
    },
    detail: {
      paket: 'Paket Sarpras Usulan',
      cpcl: 'Daftar CPCL Pekebun',
      cpclCount: '{count} Pekebun Terdaftar',
      dokumen: 'Dokumen Pendukung',
      dokumenCount: '{count} File Uploaded',
      estimasiAnggaran: 'Estimasi Total Anggaran',
    },
    workflow: {
      title: 'Progres Pengusulan (Workflow Progress)',
    },
  },

  // ============================================
  // Access Denied
  // ============================================
  accessDenied: {
    title: 'Akses Ditolak (403)',
    description: 'Anda tidak memiliki hak akses yang cukup untuk membuka halaman ini.',
    button: 'Kembali ke Dashboard',
  },

  // ============================================
  // Dashboard
  // ============================================
  dashboard: {
    page: {
      title: 'Dashboard',
      roleLabel: 'Dashboard {role}',
    },
    header: {
      scope: '',
      simulationMode: '',
    },
    roleBanner: {
      descriptionLabel: 'Deskripsi Peran Resmi',
    },
    stats: {
      fallback: {
        totalProposals: 'Total Proposal',
        activeProposals: 'Proposal Aktif',
        verifiedProposals: 'Proposal Terverifikasi',
        totalBudget: 'Total Anggaran',
      },
    },
    toast: {
      // To be filled if needed
    },
    reminder: {
      title: 'Segera selesaikan pengusulan Anda!',
      subtitleOne: 'Anda memiliki 1 pengusulan yang belum selesai dilengkapi.',
      subtitleMany: 'Anda memiliki {count} pengusulan yang belum selesai dilengkapi.',
      chipDraft: 'Draft Belum Selesai',
      chipRevision: 'Perlu Perbaikan',
      expand: 'Lihat Detail Pengusulan',
      collapse: 'Sembunyikan Detail',
      actionContinue: 'Lanjutkan Pengisian',
      actionFix: 'Perbaiki Usulan',
      actionReview: 'Tinjau',
      actionCreate: 'Buat Usulan Baru',
      viewAll: 'Lihat Semua Pengajuan',
      updatedLabel: 'Diperbarui',
      draftBadge: 'Draft',
      revisionBadge: 'Perlu Revisi',
    },
  },

  // ============================================
  // Login Page
  // ============================================
  login: {
    page: {
      title: 'BPDP Sarpras Kakao',
      subtitle: 'Masuk ke sistem manajemen sarana dan prasarana',
    },
    form: {
      email: {
        label: 'Alamat Email',
        placeholder: 'nama@perusahaan.id',
      },
      password: {
        label: 'Password',
        placeholder: '••••••••',
      },
      submit: 'Masuk ke Akun',
    },
    toast: {
      validationError: 'Mohon periksa kembali inputan Anda',
      validationTitle: 'Validasi Gagal',
      loginSuccess: 'Selamat datang!',
      loginTitle: 'Akses Berhasil',
      loginError: 'Gagal melakukan akses',
      loginErrorTitle: 'Error',
    },
  },

  // ============================================
  // App Layout
  // ============================================
  appLayout: {
    mobile: {
      openSidebar: 'Buka Sidebar Menu',
    },
  },

  // ============================================
  // Desktop Header
  // ============================================
  desktopHeader: {
    toggleSidebarOpen: 'Buka Sidebar',
    toggleSidebarClose: 'Tutup Sidebar',
    toggleSidebarAria: 'Buka atau tutup menu sidebar navigasi',
    notifications: {
      title: 'Notifikasi',
      empty: 'Belum ada notifikasi baru',
    },
    userProfile: {
      defaultName: 'Pengguna Sarpras',
      defaultEmail: 'pengguna@bpdp.go.id',
      switchRoleTitle: 'Ganti Peran Simulasi',
      logoutButton: 'Keluar Akun',
    },
    logout: {
      buttonLabel: 'Keluar',
      buttonAccountLabel: 'Keluar Akun',
      modalTitle: 'Konfirmasi Keluar',
      modalDescription: 'Apakah Anda yakin ingin keluar dari aplikasi Sarpras Kakao? Anda harus masuk kembali melalui portal BPDP IAM untuk mengakses aplikasi.',
      cancelButton: 'Batal',
      confirmButton: 'Ya, Keluar',
      toastSuccess: 'Anda telah berhasil keluar.',
    },
    toast: {
      roleSwitchedTitle: 'Peran Dialihkan',
      roleSwitchedMessage: 'Berhasil berganti ke peran {role}',
      komoditasSelectedTitle: 'Komoditas Selected',
      komoditasSelectedMessage: 'Komoditas aktif saat ini: {komoditas}',
      modulSelectedTitle: 'Modul Selected',
      modulSelectedMessage: 'Modul aplikasi aktif saat ini: {modul}',
    },
    roles: {
      PEMOHON: { name: 'Operator Kelembagaan Pekebun', desc: 'Penginputan data dan proposal pekebun' },
      KELEMBAGAAN_PEKEBUN: { name: 'Operator Kelembagaan Pekebun', desc: 'Penginputan data dan proposal pekebun' },
      DINAS_KAB: { name: 'Dinas Kabupaten / Kota', desc: 'Verifikasi berkas & lapangan kabupaten' },
      DINAS_PROV: { name: 'Dinas Provinsi', desc: 'Validasi & asistensi SK CPCL provinsi' },
      DITJENBUN_VERIFIKATOR: { name: 'Ditjenbun Verifikator', desc: 'Asistensi teknis & rekomtek pusat' },
      DITJENBUN_APPROVAL: { name: 'Ditjenbun Approval', desc: 'Persetujuan akhir penerbitan rekomtek' },
      BPDP_VERIFIKATOR: { name: 'BPDP Verifikator', desc: 'Penelitian berkas & draf SK Dirut' },
      BPDP_APPROVAL: { name: 'BPDP Approval (Admin)', desc: 'Otorisasi SK Dirut & hak akses' },
      BPDP_PPK: { name: 'BPDP PPK', desc: 'Pejabat Pembuat Komitmen & disposisi pengadaan' },
      BPDP_ULP: { name: 'BPDP ULP', desc: 'Unit Layanan Pengadaan & tender e-catalog' },
      BPDP_STAFF: { name: 'BPDP Staff', desc: 'Pemeriksaan dokumen pencairan dana (Sarpras Kakao)' },
      BPDP_KADIV: { name: 'BPDP Kadiv', desc: 'Persetujuan akhir pencairan dana & Surat Persetujuan' },
      SURVEYOR_SCI: { name: 'Surveyor SCI', desc: 'Verifikasi dokumen pencairan & monitoring lapangan' },
      BANK_MITRA: { name: 'Bank Mitra', desc: 'Komparisi A.3, konfirmasi transfer, penutupan escrow' },
    },
  },

  // ============================================
  // Sidebar Navigation
  // ============================================
  sidebar: {
    brand: {
      title: 'BPDP',
      subtitle: 'Sarpras Kakao',
    },
    categories: {
      kakao: 'Kakao',
      kelapa: 'Kelapa',
      sawit: 'Sawit',
    },
    apps: {
      sarpras: {
        name: 'Sarpras Kakao',
        desc: 'Pengusulan, verifikasi lapangan, rekomendasi teknis & penyaluran.',
      },
      replanting: {
        name: 'Replanting Kakao',
        desc: 'Penyediaan bibit unggul & peremajaan lahan tanaman kakao.',
      },
      sawitSarpras: {
        name: 'Sarpras Kakao Sawit',
        desc: 'Bantuan sarana prasarana, verifikasi dinas, dan monitoring.',
      },
    },
    navigation: {
      beranda: 'Beranda',
      alurKerja: 'Alur Kerja (Pipeline)',
      daftarPekebun: 'Daftar Pekebun',
      pengajuanUsulan: 'Pengajuan Usulan',
      verifikasiDinas: 'Verifikasi Usulan',
      queueRekomtek: 'Queue Rekomtek',
      asistensiDitjenbun: 'Asistensi Usulan',
      reviewDitjenbun: 'Review Rekomtek',
      queueBpdp: 'Queue BPDP',
      cekiBpdp: 'Penelitian BPDP',
      approvalBpdp: 'Persetujuan Kadiv',
      skDirutBpdp: 'Penerbitan SK Dirut',
      riwayatSelesai: 'Riwayat Usulan',
      penyaluranDana: 'Penyaluran & PKS',
      userManagement: 'User Management',
    },
    sections: {
      menuUtama: 'Menu Utama',
      manajemenData: 'Manajemen Data',
      pemohon: 'Pemohon (Pekebun)',
      verifikasiDinas: 'Verifikasi Dinas',
      ditjenbun: 'Kementerian (Ditjenbun)',
      bpdp: 'Badan Pengelola (BPDP)',
      penyaluran: 'Penyaluran & BAST',
      sistem: 'Sistem',
    },
  },

  // ============================================
  // Cascading Paket Select
  // ============================================
  cascadingPaketSelect: {
    labels: {
      kategori: 'Kategori Sarpras',
      paket: 'Paket Bantuan Sarpras',
      luasLahan: 'Estimasi Luas Lahan (Ha)',
    },
    placeholders: {
      kategori: 'Pilih Kategori Sarpras',
      paket: 'Pilih Paket Bantuan',
      luasLahan: 'Contoh: 15.5',
    },
    rules: {
      satuanLuas: 'Ha',
      minLuas: 'Min: {min} Ha',
      maxLuas: 'Maks: {max} Ha',
      kelipatanLuas: 'Kelipatan: {step} Ha',
    },
    helper: {
      summary: 'Paket terpilih: {paket} ({kategori})',
    },
  },

  // ============================================
  // File Upload
  // ============================================
  fileUpload: {
    dropzone: {
      title: 'Tarik berkas ke sini, atau',
      browse: 'Pilih Berkas',
      formatInfo: 'Format: {formats} (Maks. {maxSize})',
      replace: 'Ganti Berkas',
      remove: 'Hapus',
    },
    toast: {
      invalidType: 'Tipe file tidak didukung! Format yang diizinkan: {allowed}',
      exceedSize: 'Ukuran file melebihi batas maksimal {maxSize}MB',
      uploadSuccess: 'File {fileName} berhasil dipilih',
    },
  },

  // ============================================
  // Role Switcher
  // ============================================
  roleSwitcher: {
    label: 'Simulasi Role:',
    roles: {
      PEMOHON: { label: 'Operator Kelembagaan Pekebun', shortLabel: 'Operator' },
      KELEMBAGAAN_PEKEBUN: { label: 'Operator Kelembagaan Pekebun', shortLabel: 'Operator' },
      DINAS_KAB: { label: 'Dinas Kabupaten / Kota', shortLabel: 'Dinas Kab' },
      DINAS_PROV: { label: 'Dinas Provinsi', shortLabel: 'Dinas Prov' },
      DITJENBUN_VERIFIKATOR: { label: 'Ditjenbun Verifikator', shortLabel: 'Ditjenbun Ver' },
      DITJENBUN_APPROVAL: { label: 'Ditjenbun Approval', shortLabel: 'Ditjenbun App' },
      BPDP_VERIFIKATOR: { label: 'BPDP Verifikator', shortLabel: 'BPDP Ver' },
      BPDP_APPROVAL: { label: 'BPDP Approval (Admin)', shortLabel: 'BPDP App' },
      BPDP_PPK: { label: 'BPDP PPK', shortLabel: 'BPDP PPK' },
      BPDP_STAFF: { label: 'BPDP Staff (Pencairan)', shortLabel: 'Staff' },
      BPDP_KADIV: { label: 'BPDP Kadiv (Pencairan)', shortLabel: 'Kadiv' },
      SURVEYOR_SCI: { label: 'Surveyor SCI', shortLabel: 'SCI' },
      BANK_MITRA: { label: 'Bank Mitra', shortLabel: 'Bank' },
      BPDP_ULP: { label: 'BPDP ULP', shortLabel: 'BPDP ULP' },
    },
  },

  // ============================================
  // Satellite Map Preview
  // ============================================
  satelliteMapPreview: {
    pointTooltip: 'Titik {index}: {lat}, {lng}',
    attribution: 'Esri World Imagery',
    layerControl: 'Citra Satelit Esri',
  },

  // ============================================
  // Document Preview Modal
  // ============================================
  documentPreviewModal: {
    closeAria: 'Tutup Pratinjau Dokumen',
    previewIframeTitle: 'Pratinjau Dokumen',
  },

  // ============================================
  // Audit Trail Sidebar
  // ============================================
  auditTrailSidebar: {
    title: 'Riwayat Audit',
    asRole: 'sebagai',
    types: {
      submit: 'Pengajuan',
      verify: 'Verifikasi',
      approve: 'Disetujui',
      reject: 'Ditolak',
      revision: 'Revisi',
      change: 'Perubahan',
    },
  },

  // ============================================
  // Metric Cards
  // ============================================
  metricCards: {
    updatedLive: 'Updated Live',
    pemohon: {
      totalUsulan: 'Total Usulan Sarpras',
      totalUsulanNote: '1 Draft, 2 Diajukan',
      totalCpcl: 'Total Pekebun CPCL',
      totalCpclNote: 'Terverifikasi internal',
      luasLahan: 'Luas Lahan Poligon',
      luasLahanNote: 'Sudah Geotagging',
      statusTerakhir: 'Status Terakhir',
      statusTerakhirValue: 'Verifikasi Kab',
      statusTerakhirNote: 'Menunggu Rekomtek',
    },
    dinasKab: {
      menungguVerifikasi: 'Usulan Menunggu Verifikasi',
      menungguVerifikasiNote: 'Perlu cek fisik & CPCL',
      rekomtekDiterbitkan: 'Rekomtek Diterbitkan',
      rekomtekDiterbitkanNote: 'Diteruskan ke Provinsi',
      dikembalikan: 'Usulan Dikembalikan',
      dikembalikanNote: 'Perlu revisi berkas',
      totalLuas: 'Total Luas Usulan Kab',
      totalLuasNote: 'Tahun Anggaran 2026',
    },
    dinasProv: {
      validasiMasuk: 'Validasi Rekomtek Masuk',
      validasiMasukNote: 'Dari 5 Kabupaten/Kota',
      disetujuiProvinsi: 'Disetujui Provinsi',
      disetujuiProvinsiNote: 'Diteruskan ke Ditjenbun',
      sinkronisasiKuota: 'Sinkronisasi Kuota Prov',
      sinkronisasiKuotaNote: 'Target 3,000 Ha',
      dikembalikanKab: 'Dikembalikan ke Kab',
      dikembalikanKabNote: 'Klarifikasi administrasi',
    },
    ditjenbun: {
      evaluasiPleno: 'Proposal Evaluasi Pleno',
      evaluasiPlenoNote: 'Sidang Pleno Nasional',
      skPenetapan: 'SK Penetapan Diterbitkan',
      skPenetapanNote: 'Siap Penyaluran BPDPKS',
      totalAnggaran: 'Total Anggaran Disetujui',
      totalAnggaranNote: 'Alokasi Pagu 2026',
      targetArea: 'Target Area Nasional',
      targetAreaNote: 'Pekebun Kelapa',
    },
    bpdp: {
      totalPengguna: 'Total Pengguna Sistem',
      totalPenggunaNote: '5 Role Terdaftar',
      skPenyaluran: 'SK Penetapan Penyaluran',
      skPenyaluranNote: 'Dari Ditjenbun',
      pksBerjalan: 'PKS Berjalan',
      pksBerjalanNote: 'Tahap Transfer Rekening',
      pencairanDana: 'Pencairan Dana Sarpras',
      pencairanDanaNote: 'BAST & LPJ Diverifikasi',
    },
  },

  // ============================================
  // Role Descriptions
  // ============================================
  roleDescriptions: {
    title: 'Matriks Matra & Responsibilitas Role (User Governance)',
    subtitle: '5 Role Utama Sistem',
    scopePrefix: 'Scope: {scope}',
  },

  // ============================================
  // User Directory
  // ============================================
  userDirectory: {
    title: 'Direktori Pengguna Sistem',
    searchPlaceholder: 'Cari nama / email...',
    filterRoles: {
      all: 'Semua Role',
      pemohon: 'Pemohon',
      dinasKab: 'Dinas Kab/Kota',
      dinasProv: 'Dinas Prov',
      ditjenbun: 'Ditjenbun',
      bpdpks: 'BPDPKS',
    },
    table: {
      headers: {
        nama: 'Nama Pengguna',
        email: 'Email',
        role: 'Role Akses',
        status: 'Status',
        tglRegistrasi: 'Tgl Registrasi',
      },
    },
  },

  // ============================================
  // Kab Verifikasi Checklist
  // ============================================
  kabVerifikasiChecklist: {
    title: 'Checklist Verifikasi Administrasi & Lapangan',
    verifiedCount: '{count} / {total} Terverifikasi',
    items: {
      item1: 'Keabsahan Kelembagaan Pekebun (Akte / SK Kemenkumham Koperasi)',
      item2: 'Kesesuaian CPCL (NIK & Kartu Keluarga Petani Terverifikasi)',
      item3: 'Batas Spasial Poligon Lahan & Sertifikat Hak Milik / Alas Hak',
      item4: 'Verifikasi Lapangan Fisik Lahan (Kesesuaian Akses & Komoditas Kelapa)',
    },
  },

  // ============================================
  // Detail Pekebun Modal
  // ============================================
  detailPekebunModal: {
    title: 'Detail Pekebun: {nama}',
    subtitle: 'NIK: {nik} • Terdaftar pada {date}',
    tabs: {
      identitas: 'identitas',
      lahan: 'lahan',
      dokumen: 'dokumen',
    },
    identitas: {
      nama: 'Nama Lengkap',
      nik: 'Nomor Induk Kependudukan (NIK)',
      nomorKK: 'Nomor Kartu Keluarga (KK)',
      statusPernikahan: 'Status Pernikahan',
      ttl: 'Tempat, Tanggal Lahir',
      alamat: 'Alamat Sesuai KTP',
      kodepos: 'Kode pos',
      nomorHP: 'Nomor HP / WhatsApp',
    },
    lahan: {
      luasLahan: 'Luas Lahan (Ha)',
      statusSertifikat: 'Status Kepemilikan Lahan',
      noSertifikat: 'Nomor Sertifikat / Alas Hak',
      lokasiDesa: 'Lokasi Desa',
      lokasiKecamatan: 'Lokasi Kecamatan',
      jenisBibit: 'Jenis Bibit',
      mapTitle: 'Peta Poligon Lahan Kebun (Mode Satelit)',
      rawDataTitle: 'Data Koordinat (Raw)',
    },
    dokumen: {
      viewDoc: 'Lihat Berkas',
    },
    buttons: {
      edit: 'Edit Data',
      close: 'Tutup',
    },
  },

  // ============================================
  // Step Identitas Pekebun
  // ============================================
  stepIdentitasPekebun: {
    title: 'Tahap 1: Data Identitas Pekebun',
    subtitle: 'Lengkapi data identitas pekebun; data akan diverifikasi ke Dukcapil via SIKP saat melanjutkan ke tahap berikutnya',
    fields: {
      nik: {
        label: 'Nomor KTP (NIK)',
        placeholder: 'Masukkan 16 digit NIK KTP',
        hint: 'Pastikan 16 digit NIK sesuai dengan KTP',
      },
      nama: {
        label: 'Nama Pekebun',
        placeholder: 'Masukkan nama lengkap',
      },
      nomorKK: {
        label: 'Nomor KK',
        placeholder: 'Masukkan nomor Kartu Keluarga',
      },
      jenisKelamin: {
        label: 'Jenis Kelamin',
        options: {
          LAKI_LAKI: 'Laki-laki',
          PEREMPUAN: 'Perempuan',
        },
      },
      statusPernikahan: {
        label: 'Status Pernikahan',
        options: {
          MENIKAH: 'Menikah',
          BELUM_MENIKAH: 'Belum Menikah',
          CERAI_HIDUP: 'Cerai Hidup',
          CERAI_MATI: 'Cerai Mati',
        },
      },
      ttl: {
        label: 'Tempat & Tanggal Lahir',
        tempatPlaceholder: 'Tempat Lahir',
        errorMsg: 'Tempat & tanggal lahir wajib diisi.',
      },
      alamat: {
        label: 'Alamat Sesuai KTP',
        placeholder: 'Masukkan alamat lengkap sesuai KTP',
      },
      kodepos: {
        label: 'Kode pos',
        placeholder: 'Masukkan kode pos',
      },
      nomorHP: {
        label: 'Nomor Handphone',
        placeholder: '08xxxxxxxxxx',
      },
    },
  },

  // ============================================
  // Step Upload Dokumen Pekebun
  // ============================================
  stepUploadDokumenPekebun: {
    title: 'Tahap 2: Upload Dokumen Pekebun',
    subtitle: 'Unggah berkas persyaratan wajib (Scan KTP, KK, Swafoto, dan Surat Kuasa)',
    labels: {
      scanKTP: '1. Scan KTP Pekebun',
      scanKK: '2. Scan KK Pekebun',
      swafoto: '3. Swafoto Pekebun',
      suratKuasa: '4. Surat Kuasa Pekebun ke Ketua',
    },
    placeholders: {
      image: 'Unggah berkas gambar (JPG/PNG maks 5MB)',
      pdf: 'Unggah berkas PDF (PDF maks 10MB)',
    },
    badges: {
      uploaded: 'Sudah Diunggah',
      required: 'Wajib',
    },
    viewDoc: 'Lihat Dokumen {doc}',
  },

  // ============================================
  // Penyaluran CPCL Form
  // ============================================
  penyaluranCpclForm: {
    title: 'Data Pekebun & Lahan (CPCL)',
    subtitle: 'Daftar Calon Petani dan Calon Lokasi yang diajukan dalam proposal.',
    btnAdd: 'Tambah Pekebun',
    modalTitle: 'Form Tambah Pekebun CPCL',
    fields: {
      nama: 'Nama Pekebun',
      namaPlaceholder: 'Sesuai KTP',
      nik: 'NIK (16 Digit)',
      nikPlaceholder: '3201xxxx',
      noHp: 'No. HP / WA',
      noHpPlaceholder: '0812xxxx',
      luasLahan: 'Luas Lahan (Ha)',
      legalitas: 'Legalitas Lahan',
      noLegalitas: 'Nomor Berkas Legalitas',
      noLegalitasPlaceholder: 'No. Dokumen',
    },
    legalitasOptions: {
      SHM: 'SHM (Sertifikat Hak Milik)',
      SKT: 'SKT (Surat Keterangan Tanah)',
      ALAS_HAK: 'Alas Hak / Sporadik',
      GIRIK: 'Girik / Letter C',
    },
    buttons: {
      cancel: 'Batal',
      save: 'Simpan Pekebun',
    },
    table: {
      headers: {
        nama: 'Nama Pekebun',
        nik: 'NIK',
        luas: 'Luas Lahan',
        legalitas: 'Legalitas',
        desa: 'Lokasi Desa',
        aksi: 'Aksi',
      },
    },
  },

  // ============================================
  // Polygon Map
  // ============================================
  polygonMap: {
    title: 'Map Geotagging Poligon Lahan',
    subtitle: 'Pemetaan batas spasial poligon lahan calon lokasi sarpras.',
    badgeValid: 'Polygon Valid ({size} Ha)',
    layerLabel: 'Layer: Satelit BPN / Geotagging GPS',
    coordLabel: '📍 Lat: {lat}, Long: {lng}',
  },

  // ============================================
  // Form Pengembalian Modal (Ditjenbun / Dinas)
  // ============================================
  formPengembalianModal: {
    title: 'Kirim Perintah Perbaikan Usulan',
    dinasLabel: 'Dinas Penerima Perbaikan',
    dinasKab: 'Dinas Kabupaten / Kota',
    dinasProv: 'Dinas Provinsi',
    dinasHelper: 'Notifikasi pemberitahuan perbaikan akan otomatis dikirimkan ke pihak dinas terkait.',
    alasanLabel: 'Alasan Ketidaksesuaian',
    alasanPlaceholder: 'Jelaskan bagian dokumen yang tidak sesuai beserta instruksi perbaikannya...',
    validationMinChars: 'Alasan ketidaksesuaian wajib diisi (minimal 10 karakter).',
    buttons: {
      cancel: 'Batal',
      submit: 'Kirim Perbaikan',
    },
  },

  // ============================================
  // Log Status Usulan
  // ============================================
  logStatusUsulan: {
    title: 'Riwayat Status & Catatan',
    emptyState: 'Belum ada riwayat aktivitas untuk usulan ini.',
  },

  // ============================================
  // Pratinjau Pekebun & Dokumen Tab
  // ============================================
  pratinjauPekebunDanDokumenTab: {
    sectionTitle: 'Pratinjau Data Usulan & Dokumen',
    sectionSubtitle: 'Ringkasan data kelembagaan, pekebun CPCL, dan dokumen persyaratan usulan sarpras kelapa.',
    tabCpcl: 'Daftar CPCL Pekebun',
    tabDokumen: 'Dokumen Persyaratan',
    tabLahan: 'Peta Poligon Lahan',
    tabRab: 'Rencana Anggaran Biaya (RAB)',
    gudangTitle: 'Gudang Serah Terima',
    gudangAddress: 'Alamat Gudang',
    gudangCoord: 'Titik Koordinat Gudang',
    rabSigned: 'Dokumen RAB Ditandatangani',
    rabDetail: 'Rincian RAB',
    totalRab: 'Total RAB',
  },

  // ============================================
  // Verifikasi Dokumen Item
  // ============================================
  verifikasiDokumenItem: {
    btnAgree: 'Setuju',
    btnReject: 'Tolak',
    tooltipAgree: 'Tandai Sesuai',
    tooltipReject: 'Tandai Tidak Sesuai',
    badgeAgree: 'Sesuai',
    badgeReject: 'Tidak Sesuai',
    badgeUnchecked: 'Belum dicek',
    downloadLabelDefault: 'Download Dokumen',
    previewTooltip: 'Pratinjau',
    rejectNoteLabel: 'Catatan Ketidaksesuaian',
    rejectNotePlaceholder: 'Tulis alasan dokumen tidak sesuai...',
  },

  // ============================================
  // Proposal Revision & Update Wording
  // ============================================
  proposalRevision: {
    pageTitle: 'Perbaikan & Revisi Dokumen Proposal',
    pageSubtitle: 'Perbarui dokumen yang ditolak berdasarkan catatan verifikasi Kabupaten/Kota.',
    alertTitle: 'Catatan Hasil Verifikasi Kabupaten',
    alertSubtitle: 'Harap perbarui hanya berkas yang ditolak di bawah ini. Dokumen yang telah disetujui terkunci secara otomatis.',
    approvedBadge: 'Disetujui',
    rejectedBadge: 'Perlu Perbaikan',
    updatedBadge: 'Telah Diperbarui',
    uploadAction: 'Unggah Ulang Dokumen',
    lockedMsg: 'Dokumen ini telah disetujui dan tidak dapat diubah.',
    incompleteWarning: 'Harap perbarui semua dokumen yang ditolak sebelum mengirim ulang usulan.',
    resubmitSuccess: 'Proposal berhasil dikirim ulang ke verifikasi Dinas Kabupaten/Kota!',
    resubmitButton: 'Kirim Ulang Usulan',
    cancelButton: 'Batal',
    pekebunTabTitle: 'Perbaikan Data & Dokumen Pekebun',
    rabTabTitle: 'Perbaikan RAB & Dokumen RAB',
    farmerDocUpdated: 'Dokumen pekebun berhasil diperbarui.',
    rabItemUpdated: 'Rincian RAB berhasil diperbarui.',
    rabSignedUpdated: 'Dokumen RAB bertandatangan berhasil diperbarui.',
    rabOverviewTitle: 'Ringkasan Rencana Anggaran Biaya (RAB)',
    rabOverviewSubtitle: 'Berikut adalah ringkasan data rincian anggaran yang diusulkan.',
    rabDownloadPdf: 'Cetak / Unduh RAB (PDF)',
    rabUploadNewSigned: 'Unggah Dokumen RAB Baru',
    rabRejectAlert: 'Catatan Penolakan Dokumen RAB',
    farmerRejectionSummary: 'Pekebun Memerlukan Perbaikan Data/Dokumen',
    farmerAllApproved: 'Seluruh data dan dokumen pekebun telah sesuai verifikasi.',
    farmerCardItemsToFix: 'Item Perlu Perbaikan',
    farmerCardUpdated: 'Telah Diperbarui',
    farmerFieldLabel: 'Koreksi Data Teks',
    farmerDocLabel: 'Unggah Berkas Baru',
    farmerRejectionNotes: 'Catatan Verifikator',
    uploadFarmerDocSuccess: 'Berkas pekebun berhasil diunggah.',
    uploadLandDocSuccess: 'Berkas lahan berhasil diunggah.',
  },
  penyaluranDana: {
    menu: {
      pemohon: 'Penyaluran Dana',
      pks3Pihak: 'PKS 3 Pihak',
      approval: 'Approval Pencairan',
      verifikasiDokumen: 'Verifikasi Dokumen',
      monitoringLapangan: 'Monitoring Lapangan',
      bankMitra: 'Komparisi & Transfer',
    },
    page: {
      pemohonTitle: 'Penyaluran & Pencairan Dana',
      pemohonSubtitle: 'Pengajuan pencairan dana sarpras dari proposal SK Dirut Terbit (tahap 40% / 30% / 30% ke rekening escrow)',
      wizardTitle: 'Tambah Permohonan Pencairan',
      wizardSubtitle: 'Lengkapi langkah pengajuan: data permohonan, dokumen, dan checklist tahap',
      detailTitle: 'Detail & Tracking Permohonan',
      detailSubtitle: 'Satu halaman untuk memantau seluruh proses pencairan lintas pihak (KP, SCI, BPDP, Bank Mitra)',
      pksTitle: 'PKS 3 Pihak (KP – BPDP – Bank Mitra)',
      pksSubtitle: 'Proses dokumen, komparisi tiga pihak, dan penjadwalan penandatanganan perjanjian',
      approvalTitle: 'Approval Pencairan Dana',
      approvalSubtitle: 'Pemeriksaan Staff BPDP dan persetujuan Kadiv hingga Surat Persetujuan Pencairan Dana',
      sciTitle: 'Verifikasi Dokumen Pencairan (SCI)',
      sciSubtitle: 'Rantai verifikasi Pendok → Verdok → QC → Kantor Pusat dan penerbitan Laporan VPD',
      monitoringTitle: 'Monitoring Lapangan (SCI)',
      monitoringSubtitle: 'Surat tugas kunjungan lapangan dan laporan monitoring tahap 2 (≥70%) / tahap 3 (100%)',
      bankTitle: 'Komparisi & Transfer (Bank Mitra)',
      bankSubtitle: 'Komparisi A.3, konfirmasi Surat Persetujuan, transfer dana, dan penutupan rekening escrow',
    },
    stats: {
      total: 'Total Permohonan',
      dalamProses: 'Dalam Proses',
      perluPerbaikan: 'Perlu Perbaikan',
      danaMasuk: 'Dana Masuk Escrow',
    },
    pks: {
      statusLabel: 'Status PKS',
      suratKuasa: 'Surat Kuasa',
      downloadTemplate: 'Unduh Template Surat Kuasa',
      uploadSuratKuasa: 'Unggah Surat Kuasa',
      downloadDokumenPks: 'Unduh Dokumen PKS 3 Pihak',
      prosesDokumen: 'Proses Dokumen PKS 3 Pihak',
      komparisiTitle: 'Komparisi Para Pihak',
      komparisiA1: 'Komparisi A.1 — Kelembagaan Pekebun',
      komparisiA2: 'Komparisi A.2 — BPDP',
      komparisiA3: 'Komparisi A.3 — Bank Mitra',
      jadwalTtd: 'Jadwal Tanda Tangan',
      uploadHasilTtd: 'Unggah Hasil Penandatanganan',
      noPks: 'Nomor PKS',
      narasiBadanHukum: 'Narasi Badan Hukum',
      noRekeningKp: 'Nomor Rekening KP',
      submittedAt: 'Disubmit',
      belumSubmit: 'Belum submit',
    },
    wizard: {
      step1: 'Data Permohonan',
      step2: 'Dokumen',
      step3: 'Tahap & Cek',
      pilihProposal: 'Pilih Nomor Proposal (SK Dirut Terbit)',
      dataA: 'Data A — Legalitas Kelembagaan',
      dataB: 'Data B — Kop Surat',
      jenisPembelian: 'Jenis Pembelian',
      peruntukan: 'Peruntukan',
      divisi: 'Divisi Pekerjaan & Nilai Permohonan',
      divisiHint: 'Pilih divisi pekerjaan lalu isi nilai permohonan untuk setiap divisi — total di-generate otomatis.',
      totalPermohonan: 'Total Permohonan (auto-generate)',
      sisaSaldo: 'Sisa Saldo Permohonan',
      rekeningTujuan: 'Rekening Tujuan',
      namaRekening: 'Nama Rekening',
      nomorRekening: 'Nomor Rekening',
      bankTujuan: 'Bank Tujuan',
      skemaTransfer: 'Skema Transfer',
      alamatTujuan: 'Alamat Tujuan',
      kota: 'Kota',
      kodepos: 'Kode Pos',
      email: 'Email',
      unduhSuratPdf: 'Unduh Surat Permohonan (PDF)',
      unduhSuratWord: 'Unduh Surat Permohonan (Word)',
      uploadSuratTtd: 'Unggah Surat Permohonan (berttd basah)',
      dokumenD: 'Dokumen D (Pendukung Pengajuan)',
      unduhBa: 'Unduh Surat Berita Acara (Word)',
      uploadBa: 'Unggah Surat Berita Acara',
      cek: 'Cek Kelengkapan',
      simpanLanjut: 'Simpan & Lanjutkan',
      sesuai: 'Sesuai',
      tidakSesuai: 'Tidak Sesuai',
      perbaiki: 'Perbaiki Ulang',
      sebelumnya: 'Sebelumnya',
      submit: 'Kirim Permohonan',
    },
    tahap: {
      title: 'Tahap Penyaluran',
      idPenyaluran: 'ID Penyaluran',
      nominal: 'Nominal Penyaluran',
      persenDefault: 'Default',
      deviasi: 'Deviasi dari persentase baku',
      prosesPenyaluran: 'Proses Penyaluran ke Escrow',
      ajukanTahap: 'Ajukan Tahap',
      terkunci: 'Terkunci',
      gateBelum: 'Syarat belum terpenuhi',
      gate70: 'Laporan kemajuan pekerjaan ≥ 70% belum diverifikasi',
      gate100: 'Laporan kemajuan pekerjaan 100% belum diverifikasi',
      gateDanaNote: 'Pengajuan tahap ini sudah bisa diajukan; penyaluran dana baru dapat diproses BPDP setelah laporan monitoring diverifikasi dan seluruh dokumen pembayaran diunggah.',
      checklist: 'Checklist Dokumen Persyaratan',
      saldoEscrow: 'Saldo Escrow',
      noSpp: 'Nomor SPP',
      statusPembayaran: 'Status Pembayaran',
      progressMonitoring: 'Progres Pekerjaan (laporan SCI)',
    },
    verifikasi: {
      tingkat: 'Tingkat Verifikasi',
      hasil: 'Hasil',
      catatan: 'Catatan',
      catatanWajib: 'Catatan wajib diisi saat Tidak Sesuai',
      vpd: 'Laporan & Lampiran VPD',
      uploadVpd: 'Unggah VPD',
      pushPusat: 'Push ke Kantor Pusat',
      approvalKadiv: 'Keputusan Kadiv',
      ya: 'Ya',
      tidak: 'Tidak',
      suratPersetujuan: 'Surat Persetujuan Pencairan Dana',
      generate: 'Generate',
      konfirmasiTransfer: 'Konfirmasi Transfer Dana',
      riwayatPerbaikan: 'Riwayat Pengembalian untuk Perbaikan',
    },
    monitoring: {
      suratTugas: 'Surat Tugas Kunjungan Lapangan',
      uploadSuratTugas: 'Unggah Surat Tugas',
      laporanE: 'Laporan Monitoring Tahap 2 (E)',
      laporanG: 'Laporan Monitoring Tahap 3 (G)',
      progress: 'Progres Penyelesaian Pekerjaan (%)',
      baMonitoring: 'BA Monitoring',
      dokumentasi: 'Dokumentasi Kegiatan',
    },
    pengembalian: {
      title: 'Pengembalian Dana',
      uploadPermohonan: 'Unggah Dokumen Permohonan Pengembalian',
      penelitian: 'Penelitian BPDP-Teknis',
      lengkapSesuai: 'Lengkap dan Sesuai',
      tidakLengkap: 'Tidak Lengkap / Tidak Sesuai',
      suratPemberitahuan: 'Surat Pemberitahuan Pengembalian Dana',
      skPembatalan: 'SK Dirut tentang Pembatalan Penerima Dana',
    },
    penutupan: {
      title: 'Pencairan Sisa Dana & Penutupan Rekening',
      gerbang: 'Unggah Bukti Pencairan Sisa Dana',
      gerbangHint: 'Form penutupan rekening terbuka setelah bukti pencairan sisa dana diunggah (proses pencairan sisa dana terjadi di bank).',
      uploadSuratPenutupan: 'Unggah Surat Permohonan Penutupan Rekening',
      terimaBpdp: 'Terima & Teruskan ke Bank Mitra',
      prosesBank: 'Proses Penutupan Rekening',
    },
    notifikasi: {
      skDirutTerbit: 'SK Dirut terbit — proses PKS 3 Pihak dapat dimulai',
      jadwalTtd: 'Jadwal tanda tangan PKS 3 pihak',
      catatanPerbaikan: 'Dokumen dikembalikan untuk perbaikan',
      persetujuan: 'Surat Persetujuan Pencairan Dana diterbitkan',
      penolakan: 'Pencairan ditolak',
      danaMasuk: 'Dana masuk rekening escrow',
    },
    docLabel: {
      SK_DIRUT: 'SK Dirut',
      PENELITIAN_REKOMTEK: 'Dokumen Hasil Penelitian Kelengkapan & Kesesuaian Rekomtek',
      REKOMTEK_CPCL_BA: 'Salinan Rekomtek + Lampiran (CPCL & BA Hasil Verifikasi)',
      SURAT_PERMOHONAN: 'Surat Permohonan',
      PKS_3PIHAK: 'Salinan PKS 3 Pihak',
      KUITANSI: 'Kuitansi Bermeterai',
      SPTJM: 'SPTJM Bermeterai',
      BA_PEMBAYARAN: 'Berita Acara Pembayaran',
      SURAT_KUASA: 'Salinan Surat Kuasa',
      RENCANA_PENGGUNAAN_RAB: 'Rencana Penggunaan Dana + RAB',
      LAP_PENGGUNAAN: 'Laporan Penggunaan Dana',
      LAP_KEMAJUAN: 'Laporan Kemajuan Pekerjaan',
      LAP_MON_SCI: 'Laporan Monitoring SCI',
      BA_MON: 'BA Monitoring',
      DOK_KEGIATAN: 'Dokumentasi Kegiatan',
      DOK_D: 'Dokumen D',
      BA: 'Surat Berita Acara',
      SURAT_TUGAS: 'Surat Tugas',
      VPD: 'Laporan & Lampiran VPD',
      SURAT_PERSETUJUAN: 'Surat Persetujuan Pencairan Dana',
      BUKTI_SISA_DANA: 'Bukti Pencairan Sisa Dana',
      SURAT_PENUTUPAN: 'Surat Permohonan Penutupan Rekening',
      SURAT_PENGEMBALIAN: 'Surat Permohonan Pengembalian Dana',
    },
    status: {
      PKS_DIPROSES: 'Diproses',
      PKS_KOMPARISI: 'Komparisi',
      PKS_PENJADWALAN: 'Penjadwalan',
      PKS_DITANDATANGANI: 'Ditandatangani',
      PKS_AKTIF: 'Aktif',
      DRAFT: 'Draft',
      DIAJUKAN: 'Diajukan',
      DIPROSES_TAHAP1: 'Diproses Tahap 1',
      DIPROSES_TAHAP2: 'Diproses Tahap 2',
      DIPROSES_TAHAP3: 'Diproses Tahap 3',
      VERIF_SCI: 'Verifikasi SCI',
      VERIF_BPDP: 'Verifikasi BPDP',
      DISETUJUI: 'Disetujui',
      DITRANSFER: 'Ditransfer',
      DITOLAK: 'Ditolak',
      DITOLAK_PERBAIKAN: 'Dikembalikan untuk Perbaikan',
      SELESAI: 'Selesai',
      DIBATALKAN: 'Dibatalkan',
      DITELITI: 'Diteliti',
      DIKEMBALIKAN: 'Dikembalikan',
      DITERIMA_BPDP: 'Diterima BPDP',
      DITERIMA_BANK: 'Diterima Bank',
      PENDING: 'Tertunda',
      PAID: 'Masuk',
      SESUAI: 'Sesuai',
      TIDAK_SESUAI: 'Tidak Sesuai',
      GENERATED: 'Generated Sistem',
      UPLOAD: 'Unggahan',
      PENDOK: 'Pendok',
      VERDOK: 'Verdok',
      QC: 'QC',
      SCI_PUSAT: 'Kantor Pusat SCI',
      BPDP_STAFF: 'Staff BPDP',
      BPDP_KADIV: 'Kadiv BPDP',
      PEMBELIAN: 'Pembelian',
      REIMBURSEMENT: 'Reimbursement',
      UMK: 'UMK',
      BENEFICIER: 'Beneficier',
      OPERASIONAL_KP: 'Operasional KP',
      ONLINE_EKSTERNAL: 'Transfer Online (Eksternal)',
      SKN_EKSTERNAL: 'SKN (Eksternal)',
    },
    divisi: {
      DIV_01: '1. Umum',
      DIV_02: '2. Drainase',
      DIV_03: '3. Pekerjaan Tanah & Geosintetik',
      DIV_04: '4. Pelebaran Perkerasan & Bahu Jalan',
      DIV_05: '5. Perkerasan Berbutir & Beton Semen',
      DIV_06: '6. Perkerasan Aspal',
      DIV_07: '7. Struktur',
      DIV_08: '8. Pengembangan Kondisi & Pekerjaan Minor',
      DIV_09: '9. Pekerjaan Harian',
      DIV_10: '10. Pekerjaan Pemeliharaan Rutin',
    },
    toast: {
      prosesPksSuccess: 'Dokumen PKS 3 Pihak berhasil diproses dan siap diunduh.',
      komparisiSuccess: 'Komparisi berhasil disubmit.',
      jadwalSuccess: 'Jadwal tanda tangan tersimpan; notifikasi terkirim ke KP & Bank Mitra.',
      hasilTtdSuccess: 'PKS 3 Pihak kini berstatus AKTIF.',
      uploadSuccess: 'Berkas berhasil diunggah.',
      uploadInvalid: 'Berkas tidak valid (tipe/ukuran).',
      permohonanCreated: 'Permohonan pencairan berhasil dibuat.',
      saldoKurang: 'Total nilai divisi melebihi sisa saldo permohonan.',
      tahapDiajukan: 'Tahap berhasil diajukan.',
      checklistIncomplete: 'Checklist dokumen belum lengkap.',
      nominalConfirmed: 'Nominal penyaluran dikonfirmasi.',
      transferProcessed: 'Penyaluran ke rekening escrow diproses (SPP diterbitkan).',
      verifikasiSuccess: 'Hasil verifikasi tercatat.',
      catatanWajib: 'Catatan wajib diisi untuk keputusan Tidak Sesuai.',
      vpdSuccess: 'Laporan & Lampiran VPD terunggah.',
      suratPersetujuanSuccess: 'Surat Persetujuan Pencairan Dana siap.',
      transferBankSuccess: 'Transfer dana dikonfirmasi; status tahap DITRANSFER.',
      perbaikanKirim: 'Dokumen dikembalikan ke KP beserta catatan perbaikan.',
      laporanMonitoringSuccess: 'Laporan monitoring terunggah.',
      gateLocked: 'Tahap masih terkunci: syarat progres belum terpenuhi.',
      pengembalianSuccess: 'Permohonan pengembalian dana tercatat.',
      penelitianSuccess: 'Hasil penelitian tercatat.',
      penutupanSuccess: 'Status penutupan rekening diperbarui.',
      gerbangSuccess: 'Bukti sisa dana diterima; form penutupan rekening terbuka.',
      downloadStarted: 'Unduhan dimulai.',
      formInvalid: 'Periksa kembali isian formulir.',
      perluSuratPermohonanTahap: 'Unggah Surat Permohonan tahap ini terlebih dahulu',
      escrowSudahDiproses: 'Penyaluran ke escrow sudah diproses',
      suratPersetujuanBelumDiunggah: 'Surat Persetujuan Pencairan Dana belum diunggah',
    },
    common: {
      lihatDetail: 'Lihat Detail',
      kembali: 'Kembali',
      aksi: 'Aksi',
      status: 'Status',
      tanggal: 'Tanggal',
      nomor: 'Nomor',
      proposal: 'Proposal',
      total: 'Total',
      aktor: 'Aktor',
      kejadian: 'Kejadian',
      kosong: 'Belum ada data',
      diajukanPada: 'Diajukan pada',
      escrowInfo: 'Rekening Escrow',
      meterai: 'Bermeterai, ditandatangani Ketua KP',
      notifikasi: 'Notifikasi',
      antreanProposal: 'Antrean Proposal (SK Dirut Terbit)',
      daftarPks: 'Daftar PKS 3 Pihak',
      simpanKirimNotif: 'Simpan & Kirim Notifikasi',
      konfirmasiAktif: 'Konfirmasi PKS Aktif',
      pilihPks: 'Pilih PKS di daftar untuk melihat detail & berlanjut',
      pilihBerkas: 'Pilih berkas pada antrean untuk memverifikasi',
      pilihTahap: 'Pilih tahap pada antrean',
      subPeranAktif: 'Sub-peran aktif (simulasi)',
      antreanDokumen: 'Antrean Dokumen Pencairan',
      antreanApproval: 'Antrean Approval',
      tambahBerkasD: 'Tambah Berkas Dokumen D',
      simpanLaporan: 'Simpan Laporan Monitoring',
      suratPermohonanLabel: 'Surat Permohonan (PDF & Word)',
      laporan: 'Laporan',
    },
  },
  logout: {
    modalTitle: 'Konfirmasi Keluar Akun',
    modalDescription: 'Apakah Anda yakin ingin keluar dari sesi aplikasi Sarpras Kakao?',
    confirmButton: 'Ya, Keluar',
    cancelButton: 'Batal',
    buttonLabel: 'Keluar',
    buttonLabelLong: 'Keluar Akun',
    buttonAccountLabel: 'Keluar Akun',
    tooltip: 'Keluar dari aplikasi',
  },
} as const;