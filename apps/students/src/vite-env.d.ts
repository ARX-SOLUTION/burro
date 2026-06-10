declare module "*.css";
declare global { namespace JSX { interface IntrinsicElements { [elemName: string]: any; } } }
export {};
declare module "./styles.css";
declare module "./styles/tokens.css";
