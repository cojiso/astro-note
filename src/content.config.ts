// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noteCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*', '!**/_*/**'], base: './src/content/note' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    public: z.boolean(),
    publishedAt: z.date(),

    editedAt: z.date().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    category: z.string().nullable().optional(),
    lang: z.string().nullable().optional(),
  })
});

export const collections = {
  note: noteCollection,
};
