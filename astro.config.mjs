// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import expressiveCode from 'astro-expressive-code';
import remarkToc from 'remark-toc';
import remarkBreaks from 'remark-breaks'
import remarkLinkCard from 'remark-link-card'
import remarkCallout from "@r4ai/remark-callout";
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw'
import rehypeExternalLinks from 'rehype-external-links'

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(), 
    expressiveCode({themes: ['plastic'],}), 
    icon(), 
    svelte()
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      remarkBreaks,
      remarkLinkCard,
      remarkCallout,
    ],
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
  },
  build: {
    assets: '_assets'
  },
  vite: {
    ssr: {
      noExternal: ['@iconify/svelte', 'lucide-svelte']
    }
  }
});