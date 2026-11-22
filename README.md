# astro-note

[orbit.supply](https://orbit.supply) の Web サイトを構築する Astro プロジェクトです。記事の本文（Markdown）は別の非公開リポジトリ（Obsidian の保管庫）で管理しています。

## ディレクトリ構成と前提条件

本リポジトリと記事リポジトリ（`note`）を、同じ親ディレクトリに並べてチェックアウトして使用します。

```text
parent/
├── astro-note/   # 本リポジトリ（Web サイトのコード）
└── note/         # 非公開リポジトリ（記事本文 / Obsidian の保管庫）
```

- **記事の参照先**: デフォルトでは `../note` を読み込みます（環境変数 `NOTE_DIR` で変更可能。[src/content.config.ts](src/content.config.ts)）。
- **バージョン管理**: 開発ツール（Node.js, Bun, Typst）のバージョンは [mise.toml](mise.toml) で一元管理しています。手元の mise 環境および CI の双方がこれを参照します。
  - ※ Typst は OGP 画像生成（`og/`）に使用しています。

## 開発コマンド

パッケージマネージャーには **Bun** を使用します。

| コマンド | 内容 |
| :-- | :-- |
| `bun install` | 依存パッケージのインストール |
| `bun run dev` | 開発サーバーを起動 (`http://localhost:4321`) |
| `bun run build` | 型チェック (`astro check`) 後、`dist/` へビルド |
| `bun run preview` | ビルド成果物をローカルでプレビュー |
| `bun run lint` | Biome による構文・スタイル検査 |
| `bun run lint:fix` | Biome による自動修正 |
| `bun run format` | Biome によるコード整形 |

## デプロイ

本サイトは **Cloudflare Workers** にデプロイされます。

- デプロイは `note` 側の GitHub Actions（`.github/workflows/deploy.yml`）だけが実行します。`note` の `main` ブランチへの push、または手動実行で動作し、両リポジトリをチェックアウトしてビルドし、`wrangler deploy` で Cloudflare Workers にアップロードします。
- Cloudflare Workers Builds の Git 連携は意図して切ってあります（記事を含まない空サイトがデプロイされるのを防ぐため）。
- ツールのバージョンを上げる場合は [mise.toml](mise.toml) を更新するだけでよく、`deploy.yml` の変更は不要です。CI の手順自体を変更する場合は、本リポジトリと `note` の `deploy.yml` を合わせて更新してください。

### コード変更時のデプロイ手順

**本リポジトリに push しても自動デプロイは行われません。** Web サイトのコードだけを変更した場合は、以下の手順でデプロイします。

1. 本リポジトリの変更を push する
2. `note` の deploy ワークフローを手動で実行する
