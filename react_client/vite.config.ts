import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from "path";
import { copyFileSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    {
    name: 'github-pages-spa-fallback',
    closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html')
    }
}
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
  base: '/Myst-Market/',
})
