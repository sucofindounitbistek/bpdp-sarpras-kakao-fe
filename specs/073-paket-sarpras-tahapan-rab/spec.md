# Feature Specification: Integrasi Jumlah Tahap RAB Dinamis per Paket Sarpras

**Feature Branch**: `073-paket-sarpras-tahapan-rab`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "setiap paket itu memiliki tahap2 yang berbeda: intensifikasi 4 tahap, ekstensifikasi 2 tahap, sisanya 1 tahap pada rab. seharusnya itu tersimpan juga di paket sarpras"

## Clarifications

### Session 2026-09-04

- Q: Bagaimana aturan pembagian anggaran biaya per tahap saat pemohon mengisi RAB? → A: **Fleksibel per Item (Option A)**: Pemohon bebas memasukkan rincian item biaya pada masing-masing tahap (Tahap 1, 2, dst.), dan sistem menghitung subtotal per tahap serta total keseluruhan secara otomatis tanpa batasan persentase kaku per tahap.
- Q: Apakah setiap tahapan wajib memiliki minimal 1 rincian item biaya (nominal > 0) agar proposal valid dan dapat disubmit? → A: **Wajib Setiap Tahap Terisi (Option A)**: Setiap tahap (dari Tahap 1 sampai Tahap N sesuai `jumlah_tahap`) wajib memiliki minimal 1 item biaya dengan nominal > 0 sebelum proposal dapat diajukan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic RAB Steps pada Form Pengusulan Proposal (Priority: P1)

Sebagai Pemohon / Kelembagaan Pekebun yang mengisi form pengajuan usulan (Step 3: RAB), saya ingin pembagian tab/seksi tahapan RAB otomatis menyesuaikan atribut `jumlah_tahap` dari paket yang dipilih (misal: 4 tahap untuk Intensifikasi, 2 tahap untuk Ekstensifikasi, dan 1 tahap untuk paket lainnya), sehingga saya dapat menginput dan membagi rincian biaya sesuai termin pencairan yang sah.

**Acceptance Scenarios**:
1. **Given** pemohon memilih paket `INTENSIFIKASI` (`jumlah_tahap: 4`), **When** masuk ke Step 3 (RAB), **Then** form menampilkan 4 termin/tahapan RAB (Tahap 1 s/d Tahap 4).
2. **Given** pemohon memilih paket `EKSTENSIFIKASI` (`jumlah_tahap: 2`), **When** masuk ke Step 3 (RAB), **Then** form menampilkan 2 termin tahapan RAB (Tahap 1 & Tahap 2).
3. **Given** pemohon memilih paket lainnya seperti `JALAN_KEBUN` (`jumlah_tahap: 1`), **When** masuk ke Step 3 (RAB), **Then** form hanya menampilkan 1 termin RAB tunggal.
4. **Given** proposal memiliki 4 tahap, **When** salah satu tahap belum memiliki rincian biaya, **Then** form menandai tahap tersebut belum lengkap dan tombol submit proposal dinonaktifkan.

---

## Requirements *(mandatory)*

- **FR-001**: Store master sarpras (`masterSarprasStore`) MUST memuat dan menyimpan atribut `jumlah_tahap` dari respons API backend `GET /api/v1/master/paket-sarpras`.
- **FR-002**: Komponen form RAB ([`StepRAB.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepRAB.vue)) dan view detail verifikasi proposal MUST merender tab/termin tahapan RAB secara dinamis berdasarkan `selectedPaket.jumlah_tahap` (default 1 jika data belum termuat).
- **FR-003**: Perhitungan total anggaran RAB per tahap dan total keseluruhan proposal tetap terakumulasi secara akurat.
- **FR-004**: Form validasi pengusulan proposal MUST memastikan setiap tahap yang tersedia terisi sekurang-kurangnya 1 item biaya sebelum tombol kirim proposal aktif.
- **FR-005**: Penyimpanan alokasi kuantitas/nilai per tahap dikirim ke backend dalam objek `details` JSON (misal: `jumlahTahap1`, `jumlahTahap2`, `jumlahTahap3`, `jumlahTahap4`) yang tersimpan di kolom `attributes` (JSONB) pada `rab_item_details`.
