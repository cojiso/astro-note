// src/pages/og.webp.ts
// 記事でないページ（トップ、404 など）のサイト共通の共有用の画像（src/lib/og.ts）

import type { APIRoute } from 'astro'
import { renderOgImage } from '../lib/og'
import { siteConfig } from '../lib/site'

export const GET: APIRoute = () =>
  renderOgImage({ kind: 'site', description: siteConfig.siteDescription })
