#!/usr/bin/env node
// Usage:
//   npm run new-post "My post title"                      → hosted post (src/content/posts/my-post-title.mdx)
//   npm run new-post "My post title" -- --external URL SITE → link to a post published elsewhere
import { writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const ext = args.indexOf('--external');
const title = (ext === -1 ? args : args.slice(0, ext)).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post "My post title" [-- --external <url> <site name>]');
  process.exit(1);
}
const slug = title.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');
const date = new Date().toISOString().slice(0, 10);
const file = `src/content/posts/${slug}.${ext === -1 ? 'mdx' : 'md'}`;
if (existsSync(file)) { console.error(`${file} already exists`); process.exit(1); }

const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  'description: One or two sentences for the blog list, search results and link previews.',
  `date: ${date}`,
  'tags: []',
];
if (ext !== -1) {
  const [url, ...site] = args.slice(ext + 1);
  fm.push('external:', `  url: ${url ?? 'https://example.com/post'}`, `  site: ${site.join(' ') || 'Example'}`);
} else {
  fm.push('draft: true # remove when ready to publish', '# comments: false # uncomment to turn comments off for this post');
}
fm.push('---', '');
const body = ext === -1 ? 'Start writing here. Maths works inline, $E = mc^2$, and in display blocks with $$…$$.\n' : '';
writeFileSync(file, fm.join('\n') + body);
console.log(`Created ${file}`);
