import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages sert le site sous /<depot>/ : BASE_PATH=/StorMe/ au build.
  base: process.env.BASE_PATH ?? "/",
  root: fileURLToPath(new URL("./netlify", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-netlify", import.meta.url)),
    emptyOutDir: true,
  },
});
