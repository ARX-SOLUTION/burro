import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ["@burro/shared"] },
  build: { commonjsOptions: { include: [/packages\/shared/, /node_modules/] } },
  server: {
    proxy: {
      "/student": "http://localhost:4000",
      "/leaderboards": "http://localhost:4000",
      "/auth": "http://localhost:4000",
      "/health": "http://localhost:4000"
    }
  }
});
