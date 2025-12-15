import path from "path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouterDevTools } from "react-router-devtools";

export default defineConfig(async ({ command }) => {
  const plugins = [tailwindcss(), reactRouter(), tsconfigPaths()];

  if (command === 'serve') {
    // Only import devtools in dev mode
    const { reactRouterDevTools } = await import('react-router-devtools')
    plugins.push(reactRouterDevTools())
  }
  
  return {
    
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
  };
});
