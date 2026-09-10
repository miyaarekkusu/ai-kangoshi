import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// 患者向けアプリ（⓪同意・①問診対話・使い方ガイド）。
// 看護師・医師向けの②③④は frontend-staff/ に分離している（別バンドル・別デプロイ）。
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "NurseLink AI",
        short_name: "NurseLink",
        description: "多言語対応AI看護師アプリ（患者用）",
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
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../frontend-shared/src", import.meta.url))
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [fileURLToPath(new URL("..", import.meta.url))]
    }
  }
});
