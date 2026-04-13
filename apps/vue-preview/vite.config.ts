import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

function copyRegistryPlugin() {
  const projectRoot = __dirname;
  const registryRoot = path.resolve(projectRoot, "../../registry/ui");
  const dest = path.join(projectRoot, ".registry", "ui");

  function copyDir(src: string, dst: string) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  }

  return {
    name: "copy-registry",
    buildStart() {
      // Clean previous copy
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }

      if (!fs.existsSync(registryRoot)) {
        console.warn("[copy-registry] Registry root not found at", registryRoot);
        console.warn("[copy-registry] Creating empty .registry/ui directory");
        fs.mkdirSync(dest, { recursive: true });
        return;
      }

      console.log("[copy-registry] Copying registry/ui →", dest);
      copyDir(registryRoot, dest);
      console.log("[copy-registry] Done.");
    },
  };
}

function vuePreviewPlugin() {
  const registryRoot = path.resolve(__dirname, ".registry/ui");

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
  plugins: [copyRegistryPlugin(), vue(), tailwindcss(), vuePreviewPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@registry": path.resolve(__dirname, ".registry"),
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
