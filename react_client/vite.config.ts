import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/vitest.setup.ts",
    include: ["./tests/**/*.test.{ts,tsx}"],
    exclude: [
      "./tests/e2e/**",
      "**/*.spec.ts",
      "**/*.spec.tsx"
    ]
  },
  resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

})

