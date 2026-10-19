import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
export default defineConfig(({ command, mode }) => ({
  base: "./",
  plugins: [react()],
  server:
    command === "serve" && mode !== "test"
      ? {
          port: 3002,
          strictPort: true,
          https: {
            pfx: fs.readFileSync(".certs/localhost.pfx"),
            passphrase: fs.readFileSync(".certs/passphrase.txt", "utf8").trim(),
          },
        }
      : undefined,
  build: {
    rollupOptions: { input: { main: "index.html", auth: "auth.html" } },
  },
}));
