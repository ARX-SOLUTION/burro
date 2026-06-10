declare module "*.css";
declare module "./styles.css";
declare module "./styles/tokens.css";

declare global {
  namespace JSX { interface IntrinsicElements { [elemName: string]: any; } }

  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_USE_MOCK_API?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
