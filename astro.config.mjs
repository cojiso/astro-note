// @ts-check

import { unified } from '@astrojs/markdown-remark'
import lucide from '@iconify-json/lucide/icons.json' with { type: 'json' }
import remarkCallout from '@r4ai/remark-callout'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkLinkCard from 'remark-link-card-plus'
import remarkToc from 'remark-toc'

/**
 * コールアウトの種類名。data-callout-type の値と同じく、空白をハイフンにして小文字にする（プラグインの既定と同じ）
 * @param {import('@r4ai/remark-callout').Callout} callout
 */
const calloutType = (callout) => callout.type.replace(/\s+/g, '-').toLowerCase()

// https://astro.build/config
export default defineConfig({
  site: 'https://orbit.supply',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    expressiveCode({
      themes: ['plastic'],
      // Map language names used in notes to bundled grammars
      shiki: { langAlias: { jsonld: 'json', formula: 'txt' } },
    }),
    icon(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        remarkBreaks,
        remarkLinkCard,
        [
          remarkCallout,
          {
            // 折りたたみ（[!note]- や [!note]+）も普通のコールアウトとして出す。既定では details と summary になる
            /** @param {import('@r4ai/remark-callout').Callout} callout */
            root: (callout) => ({
              tagName: 'div',
              properties: {
                dataCallout: true,
                dataCalloutType: calloutType(callout),
              },
            }),
            title: { tagName: 'div', properties: { dataCalloutTitle: true } },
          },
        ],
      ],
      // 脚注の見出しを「脚注」にし、画面にも出す。既定は英語の Footnotes で、読み上げ専用の sr-only が付く
      // 本文に戻るリンクの読み上げも日本語にする。番号の付け方は既定（Back to reference 1、2 回目以降は 1-2）と同じ
      remarkRehype: {
        footnoteLabel: '脚注',
        footnoteLabelProperties: {},
        footnoteBackLabel: (
          /** @type {number} */ referenceIndex,
          /** @type {number} */ rereferenceIndex,
        ) =>
          `本文の参照 ${referenceIndex + 1}${rereferenceIndex > 1 ? `-${rereferenceIndex}` : ''} に戻る`,
        // 戻るリンクの中身を Lucide の corner-right-up にする。既定の ↩ は本文のフォントに無く、絵文字のフォントで描かれてしまう
        // raw の HTML として渡し、後ろの rehype-raw で要素に変換させる
        // 文字列か、要素を返す関数だけを受け付ける
        footnoteBackContent: () => ({
          type: 'raw',
          value: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">${lucide.icons['corner-right-up'].body}</svg>`,
        }),
      },
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
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Lato',
      cssVariable: '--font-lato',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Raleway',
      cssVariable: '--font-raleway',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
})
