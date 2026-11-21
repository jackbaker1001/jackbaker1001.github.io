// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { graphStateLight, graphStateDark } from './src/lib/shiki-themes.mjs';

export default defineConfig({
  site: 'https://www.jackstephenbaker.com',
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  // HTML whitespace rules (Astro 7 defaults to JSX rules, which drop the space before a link on a new line)
  compressHTML: true,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeHeadingIds,
        [rehypeKatex, { strict: false }],
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
            content: { type: 'text', value: '#' },
          },
        ],
      ],
    }),
    shikiConfig: {
      themes: { light: graphStateLight, dark: graphStateDark },
      defaultColor: false,
    },
  },
  // Keep links from the old HydeJack site working.
  redirects: {
    '/blog/optimization/2022-03-22-portfolio-opt-blog':
      'https://web.archive.org/web/20240912112851/https://agnostiq.ai/blog/optimizing-financial-portfolios-on-superconducting-and-trapped-ion-quantum-computers/',
    '/blog/quantum-machine-learning/2023-05-27-qvr-tutorial':
      'https://pennylane.ai/demos/tutorial_univariate_qvr',
    '/blog/optimization': '/blog/tags/optimisation/',
    '/blog/quantum-machine-learning': '/blog/tags/quantum-machine-learning/',
    '/legal': '/about/',
  },
});
