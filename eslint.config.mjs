import { defineConfig } from "eslint/config"
import nextConfig from "eslint-config-next/core-web-vitals"

export default defineConfig([
  ...nextConfig,
  {
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
])
