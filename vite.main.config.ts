import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "@electron/llm",
        "@electron/llm/dist/language-model",
        "@electron/llm/dist/interfaces",
        "node-llama-cpp",
        "electron-log",
      ],
    },
    sourcemap: true,
  },
});
