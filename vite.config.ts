import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import pluginExternal from "vite-plugin-external";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pluginExternal({
      externals: {
        obsidian: "obsidian",
      },
    }),
  ],
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2018",
    lib: {
      entry: path.resolve(__dirname, "./src/main.tsx"),
      name: "Obsidian Working Time Tracker",
      fileName: () => "main.js",
      formats: ["cjs"],
      cssFileName: "styles",
    },
  },
});
