import type { CollectionEntry } from 'astro:content';

const toLatex = (s: string) =>
  s
    .replace(/<sub>(.*?)<\/sub>/g, '$_{$1}$')
    .replace(/<sup>(.*?)<\/sup>/g, '$^{$1}$')
    .replace(/<i>(.*?)<\/i>/g, '\\textit{$1}')
    .replace(/&amp;/g, '\\&')
    .replace(/&/g, '\\&');

/** BibTeX for a publication entry (best effort; check before submitting anywhere important). */
export function bibtex(p: CollectionEntry<'publications'>): string {
  const d = p.data;
  const kind = { journal: 'article', conference: 'inproceedings', thesis: 'phdthesis', preprint: 'misc' }[d.type];
  const f: [string, string][] = [
    ['title', `{${toLatex(d.title)}}`],
    ['author', d.authors.join(' and ')],
  ];
  if (d.type === 'journal') f.push(['journal', toLatex(d.venue)]);
  if (d.type === 'conference') f.push(['booktitle', toLatex(d.venue)]);
  if (d.type === 'thesis') f.push(['school', 'University College London']);
  const m = d.details?.match(/^(\w+)(?:\((\w+)\))?,\s*(.+)$/);
  if (m) {
    f.push(['volume', m[1]]);
    if (m[2]) f.push(['number', m[2]]);
    f.push(['pages', m[3].replace('–', '--')]);
  }
  f.push(['year', String(d.year)]);
  if (d.doi) f.push(['doi', d.doi]);
  if (d.arxiv) f.push(['eprint', d.arxiv], ['archivePrefix', 'arXiv']);
  if (d.url) f.push(['url', d.url]);
  return `@${kind}{${p.id},\n${f.map(([k, v]) => `  ${k} = {${v}}`).join(',\n')}\n}`;
}

export const pubLinks = (p: CollectionEntry<'publications'>) => {
  const d = p.data;
  const out: { label: string; href: string }[] = [];
  if (d.doi) out.push({ label: 'Journal', href: `https://doi.org/${d.doi}` });
  if (d.arxiv) out.push({ label: 'arXiv', href: `https://arxiv.org/abs/${d.arxiv}` }, { label: 'PDF', href: `https://arxiv.org/pdf/${d.arxiv}` });
  if (d.url && !d.doi) out.push({ label: 'Link', href: d.url });
  if (d.code) out.push({ label: 'Code', href: d.code });
  return out;
};

export const primaryHref = (p: CollectionEntry<'publications'>) =>
  p.data.doi ? `https://doi.org/${p.data.doi}` : p.data.arxiv ? `https://arxiv.org/abs/${p.data.arxiv}` : p.data.url;

export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

/** Newest year first; within a year, the order of publications.yaml. */
export const byNewest = (a: CollectionEntry<'publications'>, b: CollectionEntry<'publications'>) =>
  b.data.year - a.data.year || a.data.order - b.data.order;
