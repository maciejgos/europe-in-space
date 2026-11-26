import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import { sentinel2Validation } from "./scripts/validate-sentinel-2.mjs";

export default defineConfig({
  site: "https://europeinspace.org",
  devToolbar: { enabled: false },
  integrations: [react(), sentinel2Validation()],
  vite: { plugins: [tailwindcss()] },
});
