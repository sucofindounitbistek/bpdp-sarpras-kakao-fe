# Tech Stack & Architecture Blueprint (Vue 3 + TypeScript)

Dokumen ini berisi dokumentasi **Tech Stack, Standard Architecture, & Project Setup Blueprint** yang digunakan pada project ini. Dokumen ini dapat digunakan sebagai panduan / template standar untuk inisialisasi dan pengembangan project frontend baru selanjutnya.

---

## 1. Core Tech Stack Overview

| Kategori | Teknologi | Versi | Fungsi & Peran |
|---|---|---|---|
| **Framework** | **Vue 3** | `^3.5.x` | Modern reactive UI framework dengan Composition API (`<script setup>`) |
| **Build Tool** | **Vite** | `^8.1.x` | Development server super cepat & production bundler |
| **Language** | **TypeScript** | `~6.0.x` | Static type checking (`vue-tsc`) & autocompletion |
| **Routing** | **Vue Router** | `^4.6.x` | Client-side routing dengan Role-Based Access Control (RBAC) guards |
| **State Management** | **Pinia** | `^4.0.x` | Type-safe, modular state management |
| **Storage Sync** | **pinia-plugin-persistedstate** | `^4.7.x` | Otomatisasi persitensi state Pinia ke `localStorage` |
| **Styling** | **Tailwind CSS** | `^3.4.x` | Utility-first CSS framework dengan PostCSS & Autoprefixer |
| **UI Primitives** | **Radix Vue** | `^1.9.x` | Headless, accessible UI primitives (Shadcn UI style) |
| **Icons** | **Lucide Icons** | `^1.x` | Icon set modern (`lucide-vue-next` & `@lucide/vue`) |
| **Form & Validation** | **VeeValidate + Zod** | `^4.15.x` / `^3.25.x` | Schema-driven form validation (`@vee-validate/zod`) |
| **HTTP Client** | **Axios** | `^1.18.x` | HTTP client dengan centralized interceptor & response envelope handling |
| **Utilities** | **VueUse** | `^14.3.x` | Collection of essential Vue Composition Utilities |
| **Date Utility** | **Day.js** | `^1.11.x` | Flexible & lightweight date manipulation library |
| **Testing** | **Vitest + Vue Test Utils** | `^3.2.x` | Unit & component testing environment (`jsdom`) |

---

## 2. Directory & Architecture Structure

```
.
├── public/                 # Static public assets (favicon, images)
├── src/
│   ├── assets/             # Global styles & CSS variables
│   │   └── main.css        # Tailwind directives & CSS variables
│   ├── components/         # Application components
│   │   └── ui/             # Reusable UI primitives (Button, Card, Input, Modal, Toast, Badge, dll)
│   ├── composables/        # Reusable Vue Composition API logic (e.g., useToast, useAuth)
│   ├── router/             # Vue Router configuration & RBAC navigation guards
│   │   └── index.ts
│   ├── schemas/            # Zod validation schemas for forms & DTOs
│   ├── services/           # Centralized API HTTP service modules
│   │   └── api.ts          # Base Axios client instance with Bearer Auth & Envelope unwrapper
│   ├── stores/             # Pinia stores (auth, user, domain features) with state persistence
│   ├── types/              # TypeScript interface definitions, enums, & domain models
│   ├── views/              # Page components linked to router endpoints
│   ├── App.vue             # Root component with ToastContainer/Layout wrapper
│   └── main.ts             # Application bootstrapping & plugin registration
├── .env.example            # Environment variables template
├── components.json         # Shadcn-vue design configuration
├── package.json            # Project dependencies & scripts
├── postcss.config.js       # PostCSS config (Tailwind + Autoprefixer)
├── tailwind.config.js      # Custom Tailwind theme, colors, animations
├── tsconfig.app.json       # TypeScript frontend app compilation config
└── vite.config.ts          # Vite build plugin & path alias (@/) configuration
```

---

## 3. Package Dependencies Reference (`package.json`)

Berikut konfigurasi `package.json` yang siap pakai untuk project baru:

```json
{
  "name": "your-app-name",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@lucide/vue": "^1.24.0",
    "@vee-validate/zod": "^4.15.1",
    "@vueuse/core": "^14.3.0",
    "axios": "^1.18.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.21",
    "lucide-vue-next": "^1.0.0",
    "pinia": "^4.0.2",
    "pinia-plugin-persistedstate": "^4.7.1",
    "radix-vue": "^1.9.17",
    "tailwind-merge": "^3.6.0",
    "vee-validate": "^4.15.1",
    "vue": "^3.5.39",
    "vue-router": "^4.6.4",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@vitejs/plugin-vue": "^6.0.7",
    "@vue/test-utils": "^2.4.6",
    "@vue/tsconfig": "^0.9.1",
    "autoprefixer": "^10.5.4",
    "jsdom": "^25.0.1",
    "postcss": "^8.5.19",
    "tailwindcss": "^3.4.19",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "~6.0.2",
    "vite": "^8.1.1",
    "vitest": "^3.2.4",
    "vue-tsc": "^3.3.5"
  }
}
```

---

## 4. Key Architectural Patterns & Coding Standards

### A. Centralized Axios API Client (`src/services/api.ts`)
* **Token Injection**: Otomatis menyertakan Header Authorization Bearer dari Auth Store.
* **Response Envelope Unwrapping**: Menangani struktur API standar `{ success: boolean, data: T, message: string }`.

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response Interceptor: Unwrap Response Envelope & Handle Errors
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res && typeof res.success === 'boolean' && !res.success) {
      return Promise.reject(new Error(res.message || 'Operasi gagal'));
    }
    return res;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';
    return Promise.reject(new Error(message));
  }
);

export default api;
```

---

### B. Pinia State Management dengan Persistence (`src/stores/auth.ts`)
* Menggunakan Setup Store syntax Vue Composition API (`defineStore`).
* Menggunakan `pinia-plugin-persistedstate` untuk menyimpan state penting ke `localStorage`.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null);
    const user = ref<any | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    function setAuth(newToken: string, userData: any) {
      token.value = newToken;
      user.value = userData;
    }

    function logout() {
      token.value = null;
      user.value = null;
    }

    return { token, user, isAuthenticated, setAuth, logout };
  },
  {
    persist: {
      pick: ['token', 'user'],
    },
  }
);
```

---

### C. Schema-Driven Form Validation (VeeValidate + Zod)
* Definisi skema di folder `src/schemas/`.
* Penggunaan di komponen Vue via `@vee-validate/zod`.

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

### D. Vue Router RBAC Navigation Guard (`src/router/index.ts`)
* Pengecekan autentikasi via `meta.requiresAuth`.
* Pengecekan hak akses role via `meta.roles`.

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN', 'USER'] },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' });
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = authStore.user?.role;
    if (!to.meta.roles.includes(userRole)) {
      return next({ name: 'access-denied' });
    }
  }

  next();
});

export default router;
```

---

### E. Styling & Component Utility Helper (`src/lib/utils.ts`)
* Penggabungan class Tailwind secara dinamis dengan `clsx` & `tailwind-merge`.

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 5. Quickstart Step-by-Step for New Projects

### Langkah 1: Inisialisasi Project Vue 3 TypeScript dengan Vite
```bash
npm create vite@latest my-new-project -- --template vue-ts
cd my-new-project
```

### Langkah 2: Install Core Dependencies
```bash
npm install vue-router pinia pinia-plugin-persistedstate axios @vueuse/core dayjs
npm install vee-validate zod @vee-validate/zod
npm install radix-vue lucide-vue-next @lucide/vue clsx tailwind-merge class-variance-authority
```

### Langkah 3: Install Dev Dependencies (Tailwind CSS & Testing)
```bash
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
npx tailwindcss init -p
npm install -D vitest @vue/test-utils jsdom vue-tsc @types/node
```

### Langkah 4: Setup Path Alias (`@/`) pada Vite & TypeScript

* **`vite.config.ts`**:
```typescript
import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

* **`tsconfig.app.json`** / **`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Langkah 5: Bootstrapping App (`src/main.ts`)
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount('#app');
```

---

## 6. Summary Command Cheat Sheet

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Vite development server |
| `npm run build` | Menjalankan type checking (`vue-tsc`) lalu kompilasi production build |
| `npm run preview` | Menjalankan preview lokal dari hasil build production |
| `npm test` | Menjalankan pengujian Vitest unit/component tests |
