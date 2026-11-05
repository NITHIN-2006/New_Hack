interface ImportMetaEnv {
  readonly VITE_ADMIN_PANEL_URL?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
