# design.md

Referensi sistem desain UI dari project **bpdp-iam-fe** (Vue 3 + TypeScript + Tailwind CSS). Dokumen ini murni membahas lapisan **UI**: token desain, komponen, dan pola interaksi — bukan arsitektur backend/store/service. Ditulis agar tim lain bisa mereplikasi (atau memperbaiki) pendekatan visual project ini saat membangun aplikasi baru.

Setiap nilai (warna, class, prop) di sini diambil langsung dari kode sumber saat ini — bukan aspirasi. Bagian akhir ("Known Gaps") merangkum inkonsistensi nyata yang ditemukan, supaya tim yang mereplikasi bisa membuat pilihan sadar, bukan mewarisi drift begitu saja.

## Daftar Isi

1. [Design Tokens](#1-design-tokens)
2. [Dark Mode Convention](#2-dark-mode-convention)
3. [Component Library](#3-component-library)
4. [Interaction Patterns](#4-interaction-patterns)
5. [Responsive & Accessibility Rules](#5-responsive--accessibility-rules)
6. [Known Gaps When Reusing This System](#6-known-gaps-when-reusing-this-system)

---

## 1. Design Tokens

### 1.1 Brand Color

Warna brand utama: **`#066C2A`** (forest green). Nilai ini muncul dalam **dua encoding paralel** di codebase:

- **Hardcoded hex** — dipakai literal di banyak komponen: `bg-[#066C2A]`, `text-[#066C2A]`, `border-[#066C2A]`, `hover:bg-[#055621]` (contoh: `Button.vue`, `FileUpload.vue`, `ToastContainer.vue`, `StepIndicator.vue`).
- **CSS variable HSL** — didefinisikan di `src/style.css` sebagai `--primary: 141 89.5% 22.4%` (nilai HSL yang sama persis dengan `#066C2A`), dipakai via `bg-primary`/`text-primary` melalui `tailwind.config.js`'s `colors.primary.DEFAULT: "hsl(var(--primary))"`.

Kedua encoding ini **valid secara bersamaan** tapi tidak konsisten dipakai — lihat [Known Gaps](#6-known-gaps-when-reusing-this-system).

### 1.2 Semantic Status Colors

Sistem 4 warna semantik dipakai konsisten di `Badge.vue` dan `ToastContainer.vue`:

| Status | Warna Tailwind | Contoh pemakaian |
|---|---|---|
| Success | `emerald` (50/100/200/600/700/800/900/950 sesuai konteks) | `bg-emerald-50/95 border-emerald-200 text-emerald-950` |
| Error/Danger | `rose` | `bg-rose-50/95 border-rose-200 text-rose-950` |
| Warning | `amber` | `bg-amber-50/95 border-amber-200 text-amber-950` |
| Info | `sky` | `bg-sky-50/95 border-sky-200 text-sky-950` |

Pola umum: background `-50/95` (opacity 95%), border `-200`, teks judul `-900`, teks pesan `-800/90` (opacity 90%). Ikon container solid `-600` (kecuali success yang pakai brand hex `#066C2A`, bukan `emerald-600` — lihat Known Gaps).

### 1.3 Neutral Scale

**`slate`** adalah skala neutral utama: `text-slate-900` (teks utama), `text-slate-500`/`text-slate-400` (teks sekunder/placeholder), `border-slate-200`/`border-slate-100` (border).

> ⚠️ `FileUpload.vue` inkonsisten memakai `gray` (`text-gray-700`, `border-gray-300`, `text-gray-500`) alih-alih `slate` — lihat Known Gaps.

### 1.4 Border Radius

| Class | Konteks pemakaian |
|---|---|
| `rounded-2xl` | Card, Toast, container besar |
| `rounded-xl` | Button, icon chip, input field |
| `rounded-lg` | Zona upload file, elemen input-like lebih kecil |

`tailwind.config.js` juga mendefinisikan skala shadcn berbasis CSS variable (`--radius: 0.5rem` di `style.css`):

```js
borderRadius: {
  xl: "calc(var(--radius) + 4px)",
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
}
```

Skala ini **tersedia tapi jarang dipakai** — komponen kebanyakan langsung menulis `rounded-xl`/`rounded-2xl` sebagai literal Tailwind, bukan derivasi dari `--radius`.

### 1.5 Typography

Font stack utama ("Apple Typography System", didefinisikan di `src/style.css`, layer `base`):

```css
font-family: "SF Pro Text", "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
font-size: 17px;
line-height: 1.47;
letter-spacing: -0.015em;
```

Utility class turunan (dipakai eksplisit di markup untuk heading/hierarki tertentu):

| Class | Font size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| `.font-apple-hero` | 56px | 600 | 1.07 | -0.025em |
| `.font-apple-display-lg` | 40px | 600 | 1.1 | -0.02em |
| `.font-apple-display-md` | 34px | 600 | 1.47 | -0.015em |
| `.font-apple-lead` | 28px | 400 | 1.14 | 0.01em |
| `.font-apple-tagline` | 21px | 600 | 1.19 | 0.01em |
| `.font-apple-body-strong` | 17px | 600 | 1.24 | -0.015em |
| `.font-apple-body` | 17px | 400 | 1.47 | -0.015em |
| `.font-apple-caption` | 14px | 400 | 1.43 | -0.01em |
| `.font-apple-fine-print` | 12px | 400 | 1.0 | -0.01em |

**Disiplin font-weight (wajib)**: hanya `font-medium` dan `font-semibold` yang dipakai di seluruh komponen — **tidak pernah** `font-bold` atau `font-extrabold`. Ini bukan sekadar preferensi gaya; ini aturan eksplisit di konstitusi project (Principle X) dan terkonfirmasi konsisten di kode.

---

## 2. Dark Mode Convention

**Mekanisme aktual** (bukan pendekatan Tailwind standar): sebuah boolean di Pinia store, `authStore.isDarkMode`, menggerakkan ternary class inline per komponen:

```html
:class="authStore.isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'"
```

Pola ini dipakai berulang di `Breadcrumb.vue`, `StepIndicator`-adjacent views, `DashboardLayout.vue`, dan komponen dashboard lain — **bukan** lewat Tailwind `dark:` variant class, dan **bukan** lewat blok `.dark { }` CSS variable override (`src/style.css` sama sekali tidak punya blok ini, meskipun `tailwind.config.js` sudah mengaktifkan `darkMode: ["class"]` untuk itu).

Konsekuensi: setiap komponen baru harus secara manual menerapkan ternary ini sendiri — tidak otomatis mewarisi dark mode dari sistem. `ToastContainer.vue`, misalnya, **sepenuhnya light-only** — tidak ada percabangan dark mode sama sekali di file itu.

**Rekomendasi untuk aplikasi baru**: pilih satu pendekatan yang konsisten. Tailwind `dark:` variant class (dikombinasikan dengan toggle `class="dark"` di elemen root) lebih standar dan tidak memerlukan setiap komponen mengimpor store — ini akan menghindari drift yang terjadi di project ini.

---

## 3. Component Library

Semua komponen berada di `src/components/ui/`. Total 10 file.

### 3.1 `Button.vue`

Dibangun dengan `class-variance-authority` (cva).

**Props**: `type?: "button"|"submit"|"reset"` (default `"button"`), `variant?: "primary"|"secondary"|"outline"|"danger"|"ghost"` (default `"primary"`), `size?: "sm"|"md"|"lg"` (default `"md"`), `disabled?: boolean`, `loading?: boolean` (menampilkan spinner SVG inline, otomatis disable tombol), `customClass?: string`.

**Varian visual**: `primary` = `bg-[#066C2A] text-white hover:bg-[#055621]`; `secondary` = `bg-emerald-50 text-[#066C2A] hover:bg-emerald-100`; `outline` = `border border-slate-200 bg-white text-slate-700`; `danger` = `bg-rose-600 text-white hover:bg-rose-700`; `ghost` = `text-slate-600 hover:bg-slate-100`.

Base class semua varian: `inline-flex items-center justify-center font-semibold rounded-xl transition-all ... active:scale-[0.98]`.

### 3.2 `Card.vue`

**Props**: `title?: string`, `subtitle?: string`, `customClass?: string`. **Slots**: default, `header` (override judul), `footer`.

Base: `rounded-2xl border border-slate-200 bg-white shadow-sm p-6`. Header (jika ada `title` atau slot `header`) dipisah `border-b border-slate-100`; footer dipisah `border-t border-slate-100`.

### 3.3 `Input.vue`

**Props**: `id?, label?, modelValue?: string|number, type?: string, placeholder?, required?, disabled?, error?: string, hint?: string`. Meneruskan `type` langsung ke elemen `<input>` native — jadi `type="date"`, `type="email"`, `type="number"` semua berfungsi tanpa modifikasi komponen.

Menampilkan pesan error (`text-rose-600`) di bawah field jika `error` terisi, atau `hint` (`text-slate-400`) jika tidak ada error. Border berubah `border-rose-500` saat ada error.

### 3.4 `Badge.vue`

**Props**: `variant?: "primary"|"secondary"|"success"|"warning"|"danger"|"info"` (default `"primary"`). Style: `inline-flex ... rounded-md text-[11px] font-mono-code font-semibold`. Setiap varian: bg-50 + text-700 + border-200 dari warna semantik masing-masing (kecuali `primary` yang pakai emerald + `text-[#066C2A]`).

### 3.5 `Modal.vue`

**Props**: `isOpen: boolean, title: string, closeOnOverlay?: boolean` (default `true`). **Emits**: `close`. **Slots**: default, `footer`.

Menggunakan `<Teleport to="body">` — modal selalu di-render ke luar tree komponen induk. Overlay backdrop `bg-slate-900/60 backdrop-blur-sm`, card `bg-white rounded-2xl shadow-2xl max-w-md`. Klik overlay memicu `close` (bisa dinonaktifkan via `closeOnOverlay=false`). Tombol close (✕) selalu ada di header.

### 3.6 `Skeleton.vue`

**Props**: `width?` (default `"100%"`), `height?` (default `"1rem"`), `customClass?`. Render `<div class="animate-pulse bg-slate-200/80 dark:bg-zinc-800/80 rounded-xl">` — satu-satunya komponen yang memakai Tailwind `dark:` variant asli, bukan pola ternary `isDarkMode` (lihat Known Gaps).

### 3.7 `StepIndicator.vue`

**Props**: `steps: string[], currentStep: number` (1-based — step ke-N dianggap "current" saat `currentStep === N`).

Render deretan lingkaran bernomor terhubung garis horizontal. 3 state visual per step, dihitung murni dari `currentStep` (tidak ada emit klik — presentasi non-interaktif saja):

- **completed** (`index + 1 < currentStep`): lingkaran solid `bg-[#066C2A]` + ikon centang (`lucide-vue-next` `Check`)
- **current** (`index + 1 === currentStep`): lingkaran outline `border-[#066C2A]` + ring `ring-2 ring-[#066C2A]/20`, angka step
- **upcoming** (`index + 1 > currentStep`): lingkaran `border-slate-300 text-slate-400`, angka step

Label di bawah tiap lingkaran: `text-[11px] font-semibold`, dipotong 2 baris (`line-clamp-2 max-w-[6rem]`).

### 3.8 `FileUpload.vue`

**Props**: `id?, label?, placeholder?` (default `"Unggah dokumen (PDF / JPG / PNG max 5MB)"`), `accept?` (default `".pdf,.png,.jpg,.jpeg"`), `required?, hint?`. **Emits**: `file-selected` (payload: `File`).

Zona dashed-border (`border-2 border-dashed rounded-lg`), hover `hover:border-[#066C2A]`; setelah file dipilih berubah `border-emerald-500 bg-emerald-50/30`. Input file native disembunyikan (`hidden`), dipicu lewat tombol `Button` (`size="sm" variant="outline"`) berlabel "Pilih Berkas"/"Ganti Berkas". Ikon status pakai **emoji** (`📤`/`📄`), bukan SVG — beda konvensi dari `ToastContainer` (lihat Known Gaps).

### 3.9 `ToastContainer.vue`

Tidak menerima props — membaca state langsung dari `useToast()` composable (lihat [4.1](#41-toast-notification-system)). Posisi `fixed top-5 right-5 z-50`, `TransitionGroup` untuk animasi masuk/keluar (scale + translate). Setiap toast: `rounded-2xl shadow-xl border backdrop-blur-md`, ikon SVG 24×24 dalam chip warna solid, tombol close (✕) di kanan.

### 3.10 `Breadcrumb.vue`

**Props**: `items: BreadcrumbItem[]` dengan `interface BreadcrumbItem { label: string; to?: string; active?: boolean }`.

Separator `/` antar item. Item dengan `to` dan bukan `active` jadi `router-link`; sisanya jadi `<span aria-current="page">` statis. Aksesibilitas: `<nav aria-label="Breadcrumb">` di root, `aria-current="page"` di item aktif.

---

## 4. Interaction Patterns

### 4.1 Toast Notification System

**Aturan keras**: dialog native browser (`alert()`, `confirm()`, `prompt()`) **dilarang total** di seluruh aplikasi. Semua notifikasi ke pengguna wajib lewat sistem toast reaktif.

`src/composables/useToast.ts` — state singleton di level module (`ref<ToastItem[]>([])`, dibagi oleh semua pemanggil `useToast()`, bukan per-instance):

```ts
type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: number; type: ToastType; title?: string; message: string; duration?: number }

function useToast() {
  // show(message, type='info', title?, duration=4000)
  // success(message, title?) / error(...) / info(...) / warning(...)
  // remove(id)
}
```

`id` dibuat via `Date.now() + Math.random()`. Auto-dismiss lewat `setTimeout` (default 4000ms, bisa dimatikan dengan `duration: 0`). `ToastContainer.vue` (lihat [3.9](#39-toastcontainervue)) di-mount **sekali** di root `App.vue`, merender seluruh toast aktif dari state singleton itu.

Pemakaian tipikal di komponen:
```ts
const toast = useToast();
toast.success("Data berhasil disimpan", "Berhasil");
toast.error(err.message || "Terjadi kesalahan", "Gagal");
```

### 4.2 Modal Pattern

`Modal.vue` (lihat [3.5](#35-modalvue)) selalu dipakai dengan pola: state `isOpen` di parent, konten form/konfirmasi di slot default, tombol aksi di slot `footer`. Karena `Teleport to="body"`, modal tidak terpengaruh `overflow`/`z-index` parent manapun.

### 4.3 Form Validation Pattern

Setiap form field wajib validasi real-time dengan pesan error kontekstual sebelum submit diperbolehkan (aturan konstitusi Principle VIII). Pola konkret yang dipakai:

1. Skema **Zod** per form (`src/schemas/*.schema.ts`), field opsional pakai `.optional()`, field wajib pakai `.min(1, "pesan error")` atau validator spesifik (`.email(...)`, `.length(16, ...)`, dst).
2. State lokal `errors = ref<Record<string, string>>({})`.
3. Fungsi `validate()`: `schema.safeParse(form)` → jika gagal, mapping `result.error.issues` ke `errors.value` (key = `issue.path[0]`, value = `issue.message`, hanya pesan pertama per field).
4. Tiap `<Input>` menerima `:error="errors.fieldName"` — komponen otomatis menampilkan style merah + pesan.

### 4.4 Multi-Step Wizard Pattern

Pola terbaru (form registrasi multi-bagian): satu step/card ditampilkan sekaligus, navigasi via tombol "Lanjut"/"Kembali", bukan scroll.

- **`useFormWizard(totalSteps, validateStep)`** (`src/composables/useFormWizard.ts`) — composable generik: expose `currentStepIndex` (0-based), `isFirstStep`/`isLastStep`, `goNext()` (memvalidasi step berjalan dulu via callback, baru maju), `goBack()`, `goToStep(index)` (untuk inisialisasi resume dari draft tersimpan).
- **Validasi per-step**: skema Zod form dipecah jadi grup field per step (`{ profile: [...], legalBank: [...] }` dsb, sebagai `as const` array nama field), lalu di-scope dengan `schema.pick(Object.fromEntries(fields.map(f => [f, true])))` — hanya field di step yang sedang aktif yang divalidasi, field step lain (belum dijangkau/opsional) tidak memblokir maju.
- **`StepIndicator.vue`** (lihat [3.7](#37-stepindicatorvue)) menampilkan progres, non-interaktif (tidak bisa diklik untuk lompat step).
- Tombol submit sesungguhnya (kirim ke backend) hanya muncul di card step terakhir.

### 4.5 File Upload Pattern

Lihat [`FileUpload.vue`](#38-fileuploadvue) — dipakai untuk field dokumen wajib (mis. legalitas, akta perusahaan). Untuk form yang butuh melacak status upload sebagai bagian dari validasi step (pola wizard di atas), field string sederhana (`"uploaded"` atau kosong) disimpan di form state saat event `file-selected` terpicu — bukan menyimpan File object itu sendiri.

### 4.6 Lazy Route + Skeleton Loading Pattern

Semua route di-load dengan dynamic import (`component: () => import("@/views/...")`), bukan static import — wajib per konstitusi Principle XII. Komponen yang menunggu data async wajib merender `Skeleton.vue` (lihat [3.6](#36-skeletonvue)) sebagai placeholder, bukan layar putih kosong atau spinner blocking layar penuh.

---

## 5. Responsive & Accessibility Rules

- **Mobile-first wajib**: semua layout dibangun dari breakpoint terkecil ke atas, pakai `sm:`/`md:`/`lg:`/`xl:` Tailwind — bukan `max-width` mobile override dari desktop-first.
- **Touch target minimum 44×44px** untuk semua elemen interaktif di viewport mobile.
- **Tidak boleh horizontal overflow** — tidak ada teks terpotong atau layout pecah di viewport manapun.
- **Kontras WCAG AA**: target eksplisit `bg-white`/`bg-gray-50` untuk light mode, `bg-[#121316]`/`bg-[#18191c]` untuk dark mode (nilai literal dari konstitusi Principle X).
- **ARIA**: contoh konkret di `Breadcrumb.vue` — `<nav aria-label="Breadcrumb">` di root, `aria-current="page"` di item yang aktif.
- **Micro-interaction**: `transition-all duration-200`, `backdrop-blur-md` (dipakai di Modal & Toast), `active:scale-95`/`active:scale-[0.98]` (dipakai di Button) untuk feedback klik yang terasa responsif.

---

## 6. Known Gaps When Reusing This System

Daftar ini bukan kritik — ini catatan praktis supaya aplikasi baru membuat pilihan sadar, bukan mewarisi drift yang sudah ada di project ini:

1. **Dua encoding warna brand**: `#066C2A` hex literal vs `--primary` CSS variable HSL. Sebuah app baru sebaiknya pilih **satu** — CSS variable lebih fleksibel untuk theming, hex literal lebih mudah dibaca di tempat.
2. **Dark mode dua mekanisme berbeda**: mayoritas komponen pakai ternary `authStore.isDarkMode` (butuh import store di tiap komponen), tapi `Skeleton.vue` justru satu-satunya yang pakai Tailwind `dark:` variant asli. Tidak ada blok `.dark {}` di `style.css` meski `tailwind.config.js` sudah mengaktifkan `darkMode: ["class"]`. `ToastContainer.vue` tidak punya dark mode sama sekali. **Rekomendasi**: standarkan ke satu pendekatan (Tailwind `dark:` variant lebih portabel).
3. **Neutral scale campur**: `slate` dipakai di hampir semua komponen, tapi `FileUpload.vue` pakai `gray`. Pilih satu skala neutral untuk seluruh aplikasi.
4. **Skala radius shadcn tidak terpakai**: `tailwind.config.js` sudah menyediakan `borderRadius` berbasis `--radius` CSS variable, tapi komponen menulis `rounded-xl`/`rounded-2xl` sebagai literal Tailwind langsung, bukan lewat token itu. Kalau mau radius yang benar-benar bisa di-theme, pakai token-nya secara konsisten.
5. **Gaya ikon campur**: `FileUpload.vue` pakai emoji (📤/📄), `ToastContainer.vue` dan `StepIndicator.vue` pakai SVG (`lucide-vue-next` atau inline). Untuk konsistensi visual lintas platform/font, SVG lebih andal daripada emoji (yang tampilannya beda-beda antar OS).
6. **`components.json` menyatakan shadcn-vue scaffolding** (`style: "new-york"`, `baseColor: "slate"`), tapi komponen di `src/components/ui/` semuanya *hand-rolled* — bukan hasil generate shadcn asli. Kalau app baru benar-benar mau pakai shadcn-vue, mulai dari CLI generator-nya langsung; kalau hand-rolled seperti ini, `components.json` bisa dihapus supaya tidak menyesatkan.

