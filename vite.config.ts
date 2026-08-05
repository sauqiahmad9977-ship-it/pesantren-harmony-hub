import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    TanStackRouterVite(),
    viteReact(),
  ],
  optimizeDeps: {
    include: [
      "lucide-react",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "date-fns",
      "recharts",
    ],
  },
});
