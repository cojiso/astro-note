// 記事の共有用の画像（OGP）。src/pages/og/[id].webp.ts が記事ごとに typst で描く
// 入力: title（記事の題名を BudouX で文節に区切った JSON 配列）、tags（タグの JSON 配列）。サイト共通の画像は kind=site と description（サイトの説明）
// X の大きな画像のカード（summary_large_image）に合わせて 2:1。X は左下（下から 27〜65px ほど）に題名の札を重ね、長い題名ほど右へ伸ばすので、その帯には何も置かない

// 文節の中の字の間にワードジョイナー（U+2060）を挟み、文節の境目でだけ折る。box で包むと、和欧文間のアキや約物の詰めが文節の境目で効かなくなる
// 1 行（60px で約 17 字）より長い文節は、はみ出さないよう区切らずにふつうに折る
#let title = (
  json(bytes(sys.inputs.at("title", default: "[\"タイトル\"]")))
    .map(phrase => if phrase.clusters().len() > 16 { phrase } else { phrase.clusters().join("\u{2060}") })
    .join()
)
#let tags = json(bytes(sys.inputs.at("tags", default: "[]")))
// kind が site のときはサイト共通の画像。description はサイトの説明
#let kind = sys.inputs.at("kind", default: "note")
#let description = sys.inputs.at("description", default: "")

// 色はサイトの Radix のトークン（src/styles/radix-colors.css）から
#let slate-1 = rgb("#fcfcfd")
#let slate-3 = rgb("#f0f0f3")
#let slate-9 = rgb("#8b8d98")
#let slate-11 = rgb("#60646c")
#let slate-12 = rgb("#1c2024")
#let lime-12 = rgb("#37401c")

// 緑の枠。ページを枠の色で塗り、内側に角丸の地を重ねる
// 色は lime-10（#b0e64c、OKLCH で明度 85.9%、彩度 0.188、色相 127°）から、明度と彩度はそのまま色相だけを 162° まで回す
// OKLCH の色相の弧に沿って補間するので、途中で彩度が落ちない（RGB や Oklab の直線では内側を通ってくすむ）。この明度と彩度で sRGB に収まるのは色相 162.1° まで
#let frame-color = gradient.linear(
  oklch(85.9%, 0.188, 127deg),
  oklch(85.9%, 0.188, 162deg),
  angle: 30deg,
  space: oklch,
)
#let frame-width = 39pt
// X は表示したカードの角を丸めるので、小さく表示されたときに内と外の角が近い曲がりになる値
#let frame-radius = 15pt

// 余白と角丸はサイトと同じく 3px × フィボナッチ数（3 / 6 / 9 / 15 / 24 / 39 / 63、src/styles/global.css）
// 文字は枠（39）の内側にさらに 39 空ける。下の 78 は X の札（下から 65px まで）に掛からない
#let inset = frame-width + 39pt

#set page(
  width: 1200pt,
  height: 600pt,
  margin: inset,
  fill: frame-color,
  background: place(top + left, dx: frame-width, dy: frame-width, rect(
    width: 1200pt - frame-width * 2,
    height: 600pt - frame-width * 2,
    radius: frame-radius,
    fill: slate-1,
  )),
)
// Raleway は既定の数字がオールドスタイル（高さが小文字に揃う）で小さく見えるので、タグやロゴの数字はライニング数字にする
#set text(font: ("Raleway", "Noto Sans JP"), lang: "ja", fill: slate-12, number-type: "lining")

// 文字の大きさと行送りもサイトと同じ列から（120 ÷ n px、行送りは 3px の倍数、src/styles/global.css）
// 1 行の高さを行送りちょうどにする。和文の字面の中心（ベースラインの 0.38em 上）を行の真ん中に置き、上下に半分ずつ振る
#let type(size, line) = (
  size: size,
  top-edge: 0.38em + line / 2,
  bottom-edge: 0.38em - line / 2,
)
#let text-3xl = type(30pt, 39pt)
#let text-4xl = type(40pt, 48pt)
#let text-5xl = type(60pt, 63pt)

// サイトのロゴ（ヘッダーと同じ orbit のアイコンと名前）。アイコンは名前の行送りと同じ高さ
#let logo(t, line) = {
  set text(..t, weight: 700, fill: slate-11)
  // 行の下端（ベースラインの line / 2 − 0.38em 下）にアイコンの下端を合わせ、行の高さいっぱいに置く
  box(baseline: line / 2 - 0.38em, image("orbit.svg", height: line))
  h(15pt)
  [orbit.supply]
}

// 記事でないページ（トップ、404 など）のサイト共通の画像。ロゴを横の真ん中に置き、サイトの説明をその下に添える
// 縦は 1 : 1.6 で入れ子に割る。白い面の中でロゴの行の上と下の余白を 1 : 1.6 にし（説明は数えない）、ロゴの下の空きの中で説明の行の上と下も 1 : 1.6 にする
// 段落の間の余白が足されないよう、位置は数値で置く
#if kind == "site" {
  let panel-top = frame-width
  let panel-bottom = 600pt - frame-width
  let logo-line = 63pt
  let logo-top = panel-top + (panel-bottom - panel-top - logo-line) / 2.6
  let description-line = 39pt
  let below-logo = logo-top + logo-line
  let description-top = below-logo + (panel-bottom - below-logo - description-line) / 2.6
  // place は本文の欄（上の余白 inset の下）から測る
  place(top + center, dy: logo-top - inset, logo(text-5xl, logo-line))
  place(top + center, dy: description-top - inset, {
    set text(..text-3xl, weight: 400, fill: slate-9)
    description
  })
} else [
  // 題名。text-5xl で 4 行に収まらない長い題名は text-4xl にする
  #let title-width = 1200pt - inset * 2
  #let title-block(t) = block(width: title-width, {
    // 題名は欧文も Noto Sans JP で組む。Raleway と混ぜると、欧文の字形と太さが和文から浮く
    set text(..t, font: "Noto Sans JP", weight: 700)
    set par(leading: 0pt, justify: false)
    title
  })

  #context {
    let big = title-block(text-5xl)
    if measure(big).height <= 63pt * 4 { big } else { title-block(text-4xl) }
  }

  // タグはサイトの pill と同じ見た目（Raleway、地が slate-3、字が lime-12、角丸いっぱい）
  #v(39pt)
  #{
    set text(..text-3xl, weight: 400, fill: lime-12)
    tags
      .map(tag => box(fill: slate-3, radius: 999pt, inset: (x: 24pt, y: 9pt), tag))
      .join(h(15pt))
  }

  // 右下にサイトのロゴ
  #place(bottom + right, logo(text-4xl, 48pt))
]
