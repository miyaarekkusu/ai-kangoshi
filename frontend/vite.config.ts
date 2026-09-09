import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "NurseLink AI",
        short_name: "NurseLink",
        description: "多言語対応AI看護師アプリ",
        theme_color: "#0E9E92",
        background_color: "#FAFAF7",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    port: 5173
  }
});
