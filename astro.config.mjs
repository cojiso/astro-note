// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import expressiveCode from 'astro-expressive-code';
import remarkToc from 'remark-toc';
import remarkBreaks from 'remark-breaks'
import remarkLinkCard from 'remark-link-card-plus'
import remarkCallout from "@r4ai/remark-callout";
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw'
import rehypeExternalLinks from 'rehype-external-links'

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@iconify/svelte', 'lucide-svelte']
    }
  },
  integrations: [
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
    format: "file",
    assets: '_assets'
  },
  trailingSlash: 'never',
});