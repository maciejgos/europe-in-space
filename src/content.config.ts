import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { missionCategories } from "./data/site";

const nonempty = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const httpsUrl = z.url({ protocol: /^https$/ });
const usageTerms = z.object({ label: nonempty, url: httpsUrl });

const missions = defineCollection({
  loader: glob({ base: "./src/content/missions", pattern: "*.md" }),
  schema: z.object({
    title: nonempty,
    summary: nonempty,
    category: z.enum(missionCategories),
    verifiedOn: z.iso.date(),
    hero: z.object({
      src: z.string().startsWith("/images/"),
      width: z.int().positive(),
      height: z.int().positive(),
      label: nonempty,
      attribution: nonempty,
      usageTerms: nonempty,
    }),
    spacecraft: z.array(z.object({
      id,
      name: nonempty,
      statements: z.array(z.object({
        text: nonempty,
        sourceIds: z.array(id).min(1),
      })).min(1),
      status: z.object({
        label: nonempty,
        asOf: z.iso.date(),
        sourceId: id,
      }).optional(),
    })).min(1),
    sources: z.array(z.object({
      id,
      publisher: nonempty,
      title: nonempty,
      url: httpsUrl,
      publicationDate: z.iso.date().optional(),
      effectiveDate: z.iso.date().optional(),
      usageTerms: usageTerms.optional(),
    })).min(1),
  }).superRefine(({ spacecraft, sources }, ctx) => {
    const sourceIds = new Set<string>();
    sources.forEach((source, index) => {
      if (sourceIds.has(source.id)) {
        ctx.addIssue({ code: "custom", path: ["sources", index, "id"], message: `Duplicate source ID: ${source.id}` });
      }
      sourceIds.add(source.id);
    });

    const spacecraftIds = new Set<string>();
    spacecraft.forEach((craft, index) => {
      if (spacecraftIds.has(craft.id)) {
        ctx.addIssue({ code: "custom", path: ["spacecraft", index, "id"], message: `Duplicate spacecraft ID: ${craft.id}` });
      }
      spacecraftIds.add(craft.id);
      function validateReference(sourceId: string, path: (string | number)[]) {
        if (!sourceIds.has(sourceId)) {
          ctx.addIssue({
            code: "custom",
            path: ["spacecraft", index, ...path],
            message: `Unknown source ID: ${sourceId}`,
          });
        }
      }

      craft.statements.forEach((statement, statementIndex) => {
        statement.sourceIds.forEach((sourceId, sourceIndex) => {
          validateReference(sourceId, ["statements", statementIndex, "sourceIds", sourceIndex]);
        });
      });
      if (craft.status) validateReference(craft.status.sourceId, ["status", "sourceId"]);
    });
  }),
});

export const collections = { missions };
