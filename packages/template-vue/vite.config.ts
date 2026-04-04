import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { document0ApiPlugin } from "./server/api";

export default defineConfig({
  plugins: [vue(), tailwindcss(), document0ApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@registry": path.resolve(__dirname, "../../registry"),
    },
  },
  server: {
    port: 3000,
  },
});
