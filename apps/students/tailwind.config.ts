import { burroTokens } from "../../docs/design/tailwind.tokens";
export default { content: ["./index.html", "./src/**/*.{ts,tsx}"], theme: { extend: { colors: burroTokens.colors } }, plugins: [] };
