declare module "*.css";
declare module "./styles.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_SOCKET_URL?: string;
    readonly VITE_APP_NAME?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
