import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = fileURLToPath(new URL(".", import.meta.url)).replace(/[\\/]+$/, "")

export default defineConfig({
  plugins: [
    {
      // Mirrors the turbopack rule in next.config.ts: Markdown imports are plain strings.
      name: "raw-markdown",
      enforce: "pre",
      load(id) {
        if (id.endsWith(".md")) return `export default ${JSON.stringify(readFileSync(id, "utf8"))}`
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      // "server-only" throws outside React Server Components; tests run modules directly.
      { find: /^server-only$/, replacement: `${root}/tests/helpers/server-only.ts` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Provider-backed evaluations only run via `npm run rag:eval`.
    exclude: process.argv.some((a) => a.includes("tests/eval")) ? [] : ["tests/eval/**"],
  },
})
