// @ts-check

import { unified } from '@astrojs/markdown-remark'
import svelte from '@astrojs/svelte'
import remarkCallout from '@r4ai/remark-callout'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkLinkCard from 'remark-link-card-plus'
import remarkToc from 'remark-toc'

// https://astro.build/config
export default defineConfig({
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@lucide/svelte'],
    },
  },
  integrations: [
    expressiveCode({
      themes: ['plastic'],
      // Map language names used in notes to bundled grammars
      shiki: { langAlias: { jsonld: 'json', formula: 'txt' } },
    }),
    icon(),
    svelte(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkToc, remarkBreaks, remarkLinkCard, remarkCallout],
      rehypePlugins: [
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypeRaw,
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
          },
        ],
      ],
    }),
  },
  build: {
    format: 'file',
    assets: '_assets',
  },
  trailingSlash: 'never',
})
