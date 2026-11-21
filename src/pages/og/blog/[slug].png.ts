import type { APIContext } from 'astro';
import { getPosts, isHosted, formatDate } from '../../../lib/posts';
import { ogImage } from '../../../lib/og';

export async function getStaticPaths() {
  const posts = (await getPosts()).filter(isHosted);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export async function GET({ props }: APIContext) {
  const { post } = props as any;
  const png = await ogImage({ kicker: `Blog · ${formatDate(post.data.date)}`, title: post.data.title });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
