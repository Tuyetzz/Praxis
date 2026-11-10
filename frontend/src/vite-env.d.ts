/// <reference types="vite/client" />

/**
 * Vite exposes VITE_* variables on import.meta.env and inlines them at build
 * time. Declared here so `import.meta.env.VITE_API_URL` is typed under
 * `strict` instead of erroring.
 */
interface ImportMetaEnv {
  /**
   * API base URL baked into the bundle at build time.
   * Unset  -> http://localhost:5000/api  (local development)
   * "/api" -> same origin, proxied by nginx (production)
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
