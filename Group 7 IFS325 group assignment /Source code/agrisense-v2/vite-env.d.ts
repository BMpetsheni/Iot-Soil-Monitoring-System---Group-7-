// This file provides TypeScript definitions for Vite's environment variables.
// By defining `import.meta.env`, we get type-safety and autocompletion for our environment variables.

interface ImportMetaEnv {
  /**
   * The Gemini API key, prefixed with VITE_ to be exposed to the client.
   */
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
