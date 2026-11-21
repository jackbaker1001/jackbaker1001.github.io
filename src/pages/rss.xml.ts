import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: `${SITE.name} · Blog`,
    description: 'Writing and tutorials on quantum computing, machine learning and chemistry.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: p.data.external ? p.data.external.url : `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
    customData: '<language>en-gb</language>',
  });
}
