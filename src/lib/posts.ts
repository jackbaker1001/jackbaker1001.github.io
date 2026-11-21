import { getCollection, type CollectionEntry } from 'astro:content';

/** Published posts, newest first. Drafts appear only in `npm run dev`. */
export async function getPosts(): Promise<CollectionEntry<'posts'>[]> {
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const isHosted = (p: CollectionEntry<'posts'>) => !p.data.external;

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function readingTime(body?: string) {
  const words = (body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export const slugifyTag = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const tagLabel = (t: string) => t.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
