export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  /** CelesTrak GP endpoint override; defaults to the official endpoint. */
  CELESTRAK_BASE_URL?: string;
}
