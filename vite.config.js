import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "./",

  build: {
    emptyOutDir: true,
    outDir: "dist",
    assetsDir: "assets",

    // 🟢 Lo importante:
    minify: false,       // <-- evita que Vite elimine console.log
    sourcemap: true,     // <-- te permite ver el código real en DevTools
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
