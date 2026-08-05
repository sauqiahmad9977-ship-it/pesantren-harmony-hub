import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      preset: "vercel",
    }),
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
