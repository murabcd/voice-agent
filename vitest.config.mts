import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(), // Add react plugin
    tsconfigPaths(), // Add tsconfigPaths plugin
  ],
  test: {
    environment: "jsdom", // Set environment for React/DOM testing
    globals: true, // Optional: make globals like describe, it available without import
    setupFiles: [], // Add setup files if needed (e.g., for global mocks)
  },
});
