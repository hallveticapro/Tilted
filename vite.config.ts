/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const publicUrl = env.VITE_PUBLIC_URL || "https://tilted.mrhallsclass.com";
  const shareImageUrl =
    env.VITE_SHARE_IMAGE_URL || "https://tilted.mrhallsclass.com/assets/tilted-cover.png";

  return {
    base: "./",
    plugins: [
      react(),
      {
        name: "tilted-social-metadata",
        transformIndexHtml(html) {
          return html
            .replaceAll("__TILTED_PUBLIC_URL__", publicUrl)
            .replaceAll("__TILTED_SHARE_IMAGE_URL__", shareImageUrl);
        },
      },
    ],
    test: {
      environment: "jsdom",
      exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
      setupFiles: "./src/test/setup.ts",
    },
  };
});
