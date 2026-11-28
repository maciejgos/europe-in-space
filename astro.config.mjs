import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import { cesiumAssets } from "./scripts/cesium-assets.mjs";
import { sentinel2Validation } from "./scripts/validate-sentinel-2.mjs";

export default defineConfig({
  site: "https://europeinspace.org",
  devToolbar: { enabled: false },
  integrations: [react(), sentinel2Validation(), cesiumAssets()],
  vite: { plugins: [tailwindcss()] },
});
