import type { APIContext } from 'astro';
import { ogImage } from '../../../lib/og';

/** Link-preview cards for the main pages (the home page uses the brand card, /og-default.png). */
export const PAGES: Record<string, { kicker: string; title: string }> = {
  research: { kicker: 'Research', title: 'Where quantum theory meets computation' },
  publications: { kicker: 'Publications', title: 'Papers and preprints' },
  blog: { kicker: 'Blog', title: 'Writing and tutorials' },
  teaching: { kicker: 'Teaching', title: 'Learning by building' },
  about: { kicker: 'About', title: 'Jack S. Baker, Lead Quantum Applications Scientist' },
};

export function getStaticPaths() {
  return Object.keys(PAGES).map((slug) => ({ params: { slug } }));
}

export async function GET({ params }: APIContext) {
  const png = await ogImage(PAGES[params.slug as string]);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
