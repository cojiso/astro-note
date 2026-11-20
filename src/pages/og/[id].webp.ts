// src/pages/og/[id].webp.ts
// 記事の共有用の画像（OGP）。og/og.typ を typst で PNG に描き、sharp で WebP にする（X は AVIF を読まない）
// typst のコマンドが要る。CI では deploy のワークフローで入れる

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import type { APIRoute, GetStaticPaths } from 'astro'
import sharp from 'sharp'
import { getAllPublicNotes } from '../../lib/note'

const run = promisify(execFile)

// フォントは git に入れず、無ければ Google Fonts から og/fonts に取ってくる（git の外）。typst は TTF と OTF しか読まないので、woff2 しかない npm のフォントは使えない
// URL はバージョン付きで固定する。CSS API に毎回問い合わせると、フォントの更新で画像の見た目が知らないうちに変わる
const FONT_DIR = 'og/fonts'
const FONTS = {
  'NotoSansJP-Bold.ttf':
    'https://fonts.gstatic.com/s/notosansjp/v57/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFPYk75s.ttf',
  'Raleway-Regular.ttf':
    'https://fonts.gstatic.com/s/raleway/v37/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaooCP.ttf',
  'Raleway-Bold.ttf':
    'https://fonts.gstatic.com/s/raleway/v37/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVs9pYCP.ttf',
}

async function downloadFonts() {
  await mkdir(FONT_DIR, { recursive: true })
  await Promise.all(
    Object.entries(FONTS).map(async ([name, url]) => {
      const file = `${FONT_DIR}/${name}`
      if (existsSync(file)) return
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
      await writeFile(file, new Uint8Array(await res.arrayBuffer()))
    }),
  )
}

// 記事ごとに呼ばれるので、取ってくるのはモジュールで 1 回だけ
let fontsReady: Promise<void> | undefined

export const getStaticPaths = (async () => {
  const notes = await getAllPublicNotes()
  return notes.map((note) => ({
    params: { id: note.data.id },
    props: { title: note.data.title, tags: note.data.tags ?? [] },
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { title, tags } = props as { title: string; tags: string[] }
  fontsReady ??= downloadFonts()
  await fontsReady
  // 手元に入っているフォントで描き分けが変わらないよう、og/fonts のフォントだけを使う。パスは astro を動かすプロジェクトのルートから
  const { stdout } = await run(
    'typst',
    [
      'compile',
      '--ignore-system-fonts',
      '--font-path=og/fonts',
      '--ppi=72',
      '--format=png',
      `--input=title=${title}`,
      `--input=tags=${JSON.stringify(tags)}`,
      'og/og.typ',
      '-',
    ],
    { encoding: 'buffer' },
  )
  const webp = await sharp(stdout).webp({ quality: 90 }).toBuffer()
  return new Response(new Uint8Array(webp), {
    headers: { 'Content-Type': 'image/webp' },
  })
}
