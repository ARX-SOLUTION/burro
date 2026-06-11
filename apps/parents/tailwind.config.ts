import { burroTailwindPreset } from "@burro/ui/tailwind-preset";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [burroTailwindPreset],
  plugins: []
};
