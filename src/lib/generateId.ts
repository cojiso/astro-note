// src/lib/generateId.ts
import Sqids from 'sqids'

export function generateNoteId(date: Date): string {
  // unixtime in seconds (10 digits)
  const timestamp = Math.floor(date.getTime() / 1000)
  
  // Initialize sqids with custom settings
  const sqids = new Sqids({
    minLength: 6,  // 最小6文字を保証
    alphabet: 'abcdefghijklmnopqrstuvwxyz0123456789', // 小文字と数字のみ使用
  })

  return sqids.encode([timestamp])
}

export async function ensureUniqueNoteId(date: Date): Promise<string> {
  const { getCollection } = await import('astro:content');
  const notes = await getCollection('note');
  
  let id = generateNoteId(date);
  let counter = 0;
  
  while (notes.some(note => note.data.id === id) && counter < 10) {
    // 1秒ずつずらして生成を試みる
    const newDate = new Date(date.getTime() + (counter * 1000));
    counter++;
    id = generateNoteId(newDate);
  }
  
  return id;
}