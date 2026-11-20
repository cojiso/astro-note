// src/pages/og/[id].webp.ts
// 記事ごとの共有用の画像（OGP）。題名とタグを入れる（src/lib/og.ts）

import type { APIRoute, GetStaticPaths } from 'astro'
import { getAllPublicNotes } from '../../lib/note'
import { renderOgImage } from '../../lib/og'

export const getStaticPaths = (async () => {
  const notes = await getAllPublicNotes()
  return notes.map((note) => ({
    params: { id: note.data.id },
    props: { title: note.data.title, tags: note.data.tags ?? [] },
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => {
  const { title, tags } = props as { title: string; tags: string[] }
  return renderOgImage({ kind: 'note', title, tags })
}
