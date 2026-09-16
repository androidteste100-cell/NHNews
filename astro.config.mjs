import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

const rawSiteUrl = process.env.PUBLIC_SITE_URL || process.env.APP_URL;
const siteUrl = (rawSiteUrl && (rawSiteUrl.startsWith('http://') || rawSiteUrl.startsWith('https://')))
  ? rawSiteUrl
  : "http://localhost:3000";

export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: vercel(),
  security: {
    checkOrigin: false,
  },
  build: {
    inlineStylesheets: "always",
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
  },
});
