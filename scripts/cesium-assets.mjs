import { createReadStream } from "node:fs";
import { cp, mkdir, readdir } from "node:fs/promises";

const base = "/cesium/";
const cesium = new URL("../node_modules/cesium/", import.meta.url);
const build = new URL("Build/Cesium/", cesium);
const assetDirectories = ["Workers", "Assets/IAU2006_XYS"];
const terrainHeights = "Assets/approximateTerrainHeights.json";

export function cesiumAssets() {
  return {
    name: "local-cesium-assets",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            define: { CESIUM_BASE_URL: JSON.stringify(base) },
            plugins: [{
              name: "local-cesium-assets",
              async configureServer(server) {
                const entries = await Promise.all(assetDirectories.map(async (directory) => {
                  const names = await readdir(new URL(`${directory}/`, build));
                  return names.map((name) => `${directory}/${name}`);
                }));
                const paths = new Set([terrainHeights, ...entries.flat()]);
                server.middlewares.use(base, (request, response, next) => {
                  const path = request.url?.split("?")[0]?.slice(1);
                  if (!paths.has(path)) return next();

                  response.setHeader("Content-Type", path.endsWith(".json") ? "application/json" : "text/javascript");
                  createReadStream(new URL(path, build)).on("error", next).pipe(response);
                });
              },
            }],
          },
        });
      },
      "astro:build:done": async ({ dir }) => {
        const destination = new URL("cesium/", dir);
        await mkdir(new URL("Assets/", destination), { recursive: true });
        await Promise.all([
          ...[...assetDirectories, terrainHeights].map((path) =>
            cp(new URL(path, build), new URL(path, destination), { recursive: true })
          ),
          cp(new URL("LICENSE.md", cesium), new URL("LICENSE.md", destination)),
        ]);
      },
    },
  };
}
