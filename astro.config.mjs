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
 * Lucide のアイコンを、文字の大きさに合わせた svg の文字列にする。Markdown の中には astro-icon の Icon を置けないので、同じアイコンのデータから組む
 * @param {keyof typeof lucide.icons} name
 */
const lucideSvg = (name) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 ${lucide.width} ${lucide.height}" aria-hidden="true">${lucide.icons[name].body}</svg>`

/**
 * コールアウトの種類名。data-callout-type の値と同じく、空白をハイフンにして小文字にする（プラグインの既定と同じ）
 * @param {import('@r4ai/remark-callout').Callout} callout
 */
const calloutType = (callout) => callout.type.replace(/\s+/g, '-').toLowerCase()

/**
 * 題名を書かなかったときに、プラグインが入れた自動の題名（種類名の頭だけ大文字にしたもの。[!NOTE] でも Note）かどうか
 * 自分で同じ文字列を書いた場合（[!note] Note）も自動の題名とみなす
 * @param {import('@r4ai/remark-callout').Callout} callout
 */
const hasDefaultCalloutTitle = (callout) =>
  callout.title ===
  callout.type.charAt(0).toUpperCase() + callout.type.slice(1).toLowerCase()

/** 色を付けているコールアウトの種類。アイコンはどれも Lucide の info で、種類は色で分ける。ほかの種類にはアイコンを付けない */
const coloredCalloutTypes = new Set(['note', 'important', 'warning'])

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
      // 外側の角丸を画像やコールアウトと同じ --radius-lg にする。外側の角丸は borderRadius に枠線の幅を足したものになるので、そのぶんを引く
      // 既定（0.3rem）でも外側は 6px になるが、枠線の幅が px なので、ブラウザの文字サイズを変えるとずれる
      styleOverrides: {
        borderRadius: 'calc(var(--radius-lg) - var(--ec-brdWd))',
      },
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
            // 題名の文字はアイコンの有無によらず要素で包む。既定ではアイコンがないと包まない
            // 自動の題名には印を付け、CSS で画面からは隠して読み上げにだけ残す
            /** @param {import('@r4ai/remark-callout').Callout} callout */
            titleInner: (callout) => ({
              tagName: 'div',
              properties: {
                dataCalloutTitleInner: true,
                dataCalloutDefaultTitle: hasDefaultCalloutTitle(callout),
              },
            }),
            // 題名の前に Lucide のアイコンを置く。raw の HTML として渡し、後ろの rehype-raw で要素に変換させる
            /** @param {import('@r4ai/remark-callout').Callout} callout */
            icon: (callout) => {
              return coloredCalloutTypes.has(calloutType(callout))
                ? lucideSvg('info')
                : undefined
            },
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
          value: lucideSvg('corner-right-up'),
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
