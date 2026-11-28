import { handleApiRequest } from "./api/index";
import type { Env } from "./env";
import { runScheduledIngestion } from "./ingestion/scheduled";

export type { Env };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return handleApiRequest(request, env);
    }
    return env.ASSETS.fetch(request);
  },

  // Cron Trigger: scheduled CelesTrak ingestion (daily UTC, see wrangler.jsonc).
  // Failures are recorded in D1 ingestion_runs and never delete the last
  // valid dataset (ADR-016).
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runScheduledIngestion(env).then((summary) => {
        console.log(
          `CelesTrak ingestion (${event.cron}) summary: ${JSON.stringify(
            summary.runs.map((run) => ({ id: run.noradCatalogId, outcome: run.outcome })),
          )}`,
        );
      }),
    );
  },
} satisfies ExportedHandler<Env>;
