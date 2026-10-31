import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  fmt: {
    sortTailwindcss: {
      stylesheet: "./src/index.css",
    },
  },
  lint: {
    plugins: ["react", "typescript", "unicorn", "oxc", "vitest"],
    categories: {
      correctness: "error",
    },
    rules: {
      "react/set-state-in-effect": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    env: {
      builtin: true,
      browser: true,
      node: true,
    },
    options: {
      typeAware: false,
      typeCheck: false,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return `vendors`;
          }
        },
      },
    },
  },
});
