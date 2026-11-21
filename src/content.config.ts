import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPICS, PUB_TYPES } from './data/taxonomy';
import { parse as parseYaml } from 'yaml';

/**
 * Blog posts. Two kinds live side by side:
 *  - hosted posts: Markdown/MDX with a body, rendered at /blog/<slug>/ with comments;
 *  - external posts: frontmatter only, with `external.url`, listed here but read elsewhere.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      external: z
        .object({
          url: z.url(),
          site: z.string(), // e.g. "PennyLane", shown as "on PennyLane"
        })
        .optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      comments: z.boolean().default(true),
    }),
});

const publications = defineCollection({
  // keep the order of the YAML file (newest first) as an explicit `order` field
  loader: file('src/content/publications.yaml', {
    parser: (text) => (parseYaml(text) as Record<string, unknown>[]).map((e, order) => ({ ...e, order })),
  }),
  schema: z.object({
    title: z.string(), // may contain <sub>, <sup> and <i>
    authors: z.array(z.string()),
    venue: z.string(),
    details: z.string().optional(), // volume, issue, pages
    year: z.number(),
    type: z.enum(Object.keys(PUB_TYPES) as [keyof typeof PUB_TYPES]),
    doi: z.string().optional(),
    arxiv: z.string().optional(),
    url: z.url().optional(),
    code: z.url().optional(),
    summary: z.string(),
    topics: z.array(z.enum(Object.keys(TOPICS) as [keyof typeof TOPICS])),
    order: z.number(),
  }),
});

export const collections = { posts, publications };
