/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@vue-leaflet/vue-leaflet';

declare module 'shpjs' {
  const shp: any;
  export const parseShp: any;
  export const parseDbf: any;
  export const combine: any;
  export default shp;
}
