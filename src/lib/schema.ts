/** schema.org structured data (JSON-LD) so search engines understand who and what the site is about. */
import type { CollectionEntry } from 'astro:content';
import { SITE, SOCIAL } from '../data/site';
import { primaryHref, stripTags } from './bibtex';

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;
const ME = 'J. S. Baker';

export function person() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.name,
    alternateName: ['Jack Stephen Baker', 'Jack Baker'],
    url: `${SITE.url}/`,
    image: `${SITE.url}/images/jack-stephen-baker.jpg`,
    jobTitle: SITE.role,
    worksFor: { '@type': 'Organization', name: SITE.org, url: 'https://zapataquantum.com/' },
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: SITE.visiting.org,
      department: { '@type': 'Organization', name: SITE.visiting.group, url: 'https://www.matter.toronto.edu/' },
    },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'University College London' },
      { '@type': 'CollegeOrUniversity', name: 'University of Leicester' },
    ],
    homeLocation: { '@type': 'Place', name: SITE.location },
    knowsAbout: [
      'Quantum computing', 'Quantum algorithms', 'Quantum chemistry', 'Quantum simulation', 'Error mitigation',
      'Quantum machine learning', 'Machine learning', 'Density functional theory', 'Computational fluid dynamics',
      'Condensed matter physics', 'Ferroelectrics',
    ],
    sameAs: SOCIAL.map((s) => s.href),
  };
}

export function website() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE.url}/`, name: SITE.name, inLanguage: 'en-GB', author: { '@id': PERSON_ID }, publisher: { '@id': PERSON_ID } };
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

export function scholarlyArticle(p: CollectionEntry<'publications'>) {
  const d = p.data;
  const same = [d.doi && `https://doi.org/${d.doi}`, d.arxiv && `https://arxiv.org/abs/${d.arxiv}`].filter(Boolean);
  return {
    '@type': d.type === 'thesis' ? 'Thesis' : 'ScholarlyArticle',
    name: stripTags(d.title),
    headline: stripTags(d.title).slice(0, 110),
    author: d.authors.map((a) => (a === ME ? { '@id': PERSON_ID } : { '@type': 'Person', name: a })),
    datePublished: String(d.year),
    abstract: stripTags(d.summary),
    url: primaryHref(p),
    ...(same.length ? { sameAs: same } : {}),
    ...(d.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: d.doi } } : {}),
    ...(d.type === 'journal' || d.type === 'conference' ? { isPartOf: { '@type': 'Periodical', name: stripTags(d.venue) } } : {}),
  };
}
