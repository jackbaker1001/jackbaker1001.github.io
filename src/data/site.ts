export const SITE = {
  name: 'Jack S. Baker',
  url: 'https://www.jackstephenbaker.com',
  tagline: 'Quantum computing in the age of AI',
  description:
    'Jack S. Baker is a quantum applications scientist working on quantum algorithms for simulating materials, molecules and fluids, machine learning for electronic structure, and large-scale first-principles simulation.',
  role: 'Lead Quantum Applications Scientist',
  org: 'Zapata Quantum',
  /** Side role, shown alongside the main one. */
  visiting: { role: 'Visiting Scientist', org: 'University of Toronto', group: 'Matter Lab', lead: 'Alán Aspuru-Guzik' },
  location: 'Toronto, Canada',
};

export const NAV = [
  { label: 'Research', href: '/research/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Teaching', href: '/teaching/' },
  { label: 'About', href: '/about/' },
];

export const SOCIAL = [
  { label: 'GitHub', href: 'https://github.com/jackbaker1001', icon: 'github' },
  { label: 'Google Scholar', href: 'https://scholar.google.co.uk/citations?user=Tct_ymQAAAAJ&hl=en', icon: 'scholar' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jack-s-baker-7596b2235', icon: 'linkedin' },
  { label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Jack-Baker-9', icon: 'researchgate' },
] as const;

/**
 * Comments on hosted blog posts use giscus (https://giscus.app), which stores each
 * thread as a GitHub Discussion. To switch them on:
 *  1. enable Discussions on the repo below (Settings → General → Features);
 *  2. install the giscus app on that repo: https://github.com/apps/giscus;
 *  3. visit https://giscus.app, enter the repo, pick the "Announcements" category,
 *     and copy the data-category-id it shows into `categoryId`.
 * Until `categoryId` is set, posts show a short "comments coming soon" note in dev
 * and nothing in production.
 */
export const GISCUS = {
  repo: 'jackbaker1001/jackbaker1001.github.io',
  repoId: 'R_kgDOJdQ8NQ',
  category: 'Announcements',
  categoryId: '',
};
