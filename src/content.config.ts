// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noteCollection = defineCollection({
  // Notes live in a separate repository (an Obsidian vault) checked out next to this one. Files starting with a draft emoji are never published.
  loader: glob({
    pattern: ['**/*.md', '!**/_*', '!**/_*/**', '!**/✏*', '!**/✍*', '!**/📝*', '!**/🫥*'],
    base: process.env.NOTE_DIR ?? '../note',
  }),
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
