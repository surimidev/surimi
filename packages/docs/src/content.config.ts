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

export const collections = { docs };
