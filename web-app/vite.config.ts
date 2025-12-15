import path from "path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./components"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:4001",
    },
  },
  ssr: {
    noExternal: ["styled-components"],
  },
  build: {
    outDir: 'dist'
  }
});
