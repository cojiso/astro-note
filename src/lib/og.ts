// src/lib/og.ts
// 共有用の画像（OGP）を描く。og/og.typ を typst で PNG に描き、sharp で WebP にする（X は AVIF を読まない）
// typst のコマンドが要る。CI では deploy のワークフローで入れる

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { loadDefaultJapaneseParser } from 'budoux'
import sharp from 'sharp'

const run = promisify(execFile)

// typst は日本語を 1 字ごとにどこでも折るので、BudouX で文節に区切って渡し、og.typ で文節の中を折らせない
const budoux = loadDefaultJapaneseParser()

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

// 画像ごとに呼ばれるので、取ってくるのはモジュールで 1 回だけ
let fontsReady: Promise<void> | undefined

/** og.typ に渡す入力。記事は題名とタグ、サイト共通の画像は kind: 'site' とサイトの説明 */
export type OgInput =
  | { kind: 'note'; title: string; tags: string[] }
  | { kind: 'site'; description: string }

function typstInputs(input: OgInput): string[] {
  if (input.kind === 'site') {
    return ['kind=site', `description=${input.description}`]
  }
  return [
    `title=${JSON.stringify(budoux.parse(input.title))}`,
    `tags=${JSON.stringify(input.tags)}`,
  ]
}

export async function renderOgImage(input: OgInput): Promise<Response> {
  fontsReady ??= downloadFonts()
  await fontsReady
  // 手元に入っているフォントで描き分けが変わらないよう、og/fonts のフォントだけを使う。パスは astro を動かすプロジェクトのルートから
  const { stdout } = await run(
    'typst',
    [
      'compile',
      '--ignore-system-fonts',
      `--font-path=${FONT_DIR}`,
      '--ppi=72',
      '--format=png',
      ...typstInputs(input).map((value) => `--input=${value}`),
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
