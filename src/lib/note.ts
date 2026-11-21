// src/lib/note.ts

import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export async function getAllPublicNotes(): Promise<CollectionEntry<'note'>[]> {
  const notes = await getCollection('note', ({ data }) => {
    return import.meta.env.DEV || data.public === true
  })
  return notes.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  )
}

// ユーティリティ関数
function dateParts(date: Date): [string, string, string] {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return [year, month, day]
}

/** 画面に出す日付。2026.11.22 */
export function formatDate(date: Date): string {
  return dateParts(date).join('.')
}

/** <time> の datetime 属性に入れる、機械が読める日付。2026-11-22 */
export function formatDateAttr(date: Date): string {
  return dateParts(date).join('-')
}

export function generateNotePath(id: string): string {
  return `/note/${id}`
}

// タグはノートに空白をハイフンにして書き、読み込むときに空白へ戻している（src/content.config.ts）。URL にはノートに書いたままの形を使う
export function generateTagPath(tag: string): string {
  return `/tag/${tag.replaceAll(' ', '-')}`
}
