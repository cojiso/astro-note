// @radix-ui/colors のライトの値から、Tailwind の @theme で色を定義する src/styles/radix-colors.css を生成する
// @radix-ui/colors を更新したら bun run gen:colors で生成し直す
import { readFileSync, writeFileSync } from 'node:fs'
import radix from '@radix-ui/colors'

const { version } = JSON.parse(
  readFileSync(
    new URL('../node_modules/@radix-ui/colors/package.json', import.meta.url),
    'utf8',
  ),
)

// ダークと P3 は使わないので、ライトのスケール（slate、slateA など）だけを残す
const scales = Object.keys(radix)
  .filter((name) => !/Dark|P3/.test(name))
  .sort()

// slate3 → slate-3、slateA3 → slate-a3。Radix の CSS 変数と同じ名前にする
const toCss = (key) => {
  const [, hue, alpha, step] = key.match(/^([a-z]+)(A?)(\d+)$/)
  return `${hue}-${alpha ? 'a' : ''}${step}`
}

const lines = [
  `/* このファイルは scripts/gen-radix-colors.mjs が @radix-ui/colors v${version} から生成する。手で編集しない */`,
  '/* ダークと P3 は含めない。使っていない段階は Tailwind がビルドから省く */',
  '',
  '/* Tailwind 既定の色をすべて消す。Radix には不透明な白と黒がないので、その2色だけ足す */',
  '@theme {',
  '  --color-*: initial;',
  '  --color-white: #fff;',
  '  --color-black: #000;',
]

for (const name of scales) {
  lines.push('')
  for (const [key, value] of Object.entries(radix[name])) {
    lines.push(`  --color-${toCss(key)}: ${value};`)
  }
}

lines.push('}', '')

const out = new URL('../src/styles/radix-colors.css', import.meta.url)
writeFileSync(out, lines.join('\n'))
console.log(`wrote ${scales.length} scales from @radix-ui/colors v${version}`)
