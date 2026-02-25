import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docsCategories = ['gettingStarted', 'guides', 'apiReference'] as const;

export type DocsCategory = (typeof docsCategories)[number];

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/pages/docs' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(docsCategories),
    // Used to keep a consistent order of posts within a category
    categoryOrderId: z.number().optional(),
  }),
});

const lectures = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lectures' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    orderId: z.number(),
    files: z.record(z.string(), z.string()),
  }),
});

export const collections = { docs, lectures };
