import type { APIContext } from 'astro';

// Everything is crawlable except Pagefind's search index (binary chunks, no value in search results).
export function GET({ site }: APIContext) {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /pagefind/',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', site)}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
