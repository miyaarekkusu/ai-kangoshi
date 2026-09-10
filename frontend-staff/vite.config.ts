import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 看護師・医師向けアプリ（②問診票確認・③通訳呼び出し・④診察通訳・ログイン）。
// 患者向けの⓪①は frontend-patient/ に分離している（別バンドル・別デプロイ）。
// ログインが必須（frontend-staff/src/lib配下のAuthContext参照）。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../frontend-shared/src", import.meta.url))
    }
  },
  server: {
    port: 5174,
    fs: {
      allow: [fileURLToPath(new URL("..", import.meta.url))]
    }
  }
});
