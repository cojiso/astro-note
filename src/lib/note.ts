// src/lib/note.ts
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function getAllPublicNotes(): Promise<CollectionEntry<'note'>[]> {
  const notes = await getCollection('note', ({ data }) => {
    return import.meta.env.DEV || data.public === true;
  });
  return notes.sort((a, b) => 
    b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}

// ユーティリティ関数
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function generateNotePath(id: string): string {
  return `/note/${id}`;
}