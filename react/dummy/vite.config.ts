import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@layered-ui": path.resolve(__dirname, "../lib"),
    },
  },
  server: {
    fs: {
      allow: [
        // Allow serving files from the entire repo root (for fonts and CSS)
        path.resolve(__dirname, "../.."),
      ],
    },
  },
  build: {
    outDir: "dist",
  },
})
