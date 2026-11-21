// src/content.config.ts

import { defineCollection } from 'astro:content'
import { existsSync } from 'node:fs'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Notes live in a separate repository (an Obsidian vault) checked out next to this one. Fail the build instead of publishing a site with no notes.
const noteDir = process.env.NOTE_DIR ?? '../note'
if (!existsSync(noteDir)) {
  throw new Error(
    `Note directory not found: ${noteDir}. Check out the note repository next to this one, or set NOTE_DIR.`,
  )
}

const noteCollection = defineCollection({
  // Files starting with a draft emoji are never published.
  loader: glob({
    pattern: [
      '**/*.md',
      '!**/_*',
      '!**/_*/**',
      '!**/✏*',
      '!**/✍*',
      '!**/📝*',
      '!**/🫥*',
    ],
    base: noteDir,
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    public: z.boolean(),
    publishedAt: z.date(),

    editedAt: z.date().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    // Tags are written as the display text with spaces replaced by hyphens (Obsidian tags cannot contain spaces), e.g. Google-Cloud → "Google Cloud".
    tags: z
      .array(z.string().transform((tag) => tag.replaceAll('-', ' ')))
      .nullable()
      .optional(),
    category: z.string().nullable().optional(),
    lang: z.string().nullable().optional(),
  }),
})

export const collections = {
  note: noteCollection,
}
