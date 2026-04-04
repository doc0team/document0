import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

function vuePreviewPlugin() {
  const registryRoot = path.resolve(__dirname, "../../registry/ui");

  return {
    name: "vue-preview-routes",
    configureServer(server: any) {
      server.middlewares.use("/api/previews", (_req: any, res: any) => {
        const previews: string[] = [];
        if (!fs.existsSync(registryRoot)) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(previews));
          return;
        }
        for (const ns of fs.readdirSync(registryRoot)) {
          const nsDir = path.join(registryRoot, ns);
          if (!fs.statSync(nsDir).isDirectory()) continue;
          for (const comp of fs.readdirSync(nsDir)) {
            const previewPath = path.join(nsDir, comp, "preview.vue");
            if (fs.existsSync(previewPath)) {
              previews.push(`${ns}/${comp}`);
            }
          }
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(previews));
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), vuePreviewPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@registry": path.resolve(__dirname, "../../registry"),
    },
  },
  server: {
    port: 3002,
    cors: true,
  },
  build: {
    outDir: "dist",
  },
});
