# jackstephenbaker.com

Personal site of Jack S. Baker, built with [Astro](https://astro.build) on the **Graph State** brand (see `brand/`).

## Run it

Needs Node 24 or newer (`.nvmrc` pins 26).

```bash
npm install
npm run dev        # http://localhost:4321, with live reload; drafts are visible here
npm run build      # production build into dist/, plus the search index
npm run preview    # serve dist/ locally (search works here)
npm run check      # type-check everything
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/publications.yaml` | Every paper. Add new ones at the top; within a year, file order is display order. |
| `src/content/posts/` | Blog posts, one `.md` or `.mdx` file each. |
| `src/data/site.ts` | Name, role, navigation, social links and the comments (giscus) settings. |
| `src/data/projects.ts` | Open-source projects on the home page. |
| `src/pages/` | One file per page: `index`, `research`, `publications`, `teaching`, `about`, `blog/…`. |
| `src/styles/tokens.css` | Brand colours, fonts and spacing (light and dark). |
| `src/scripts/background.ts` | The animated background (molecules, crystals, circuit, Bloch sphere, neural net). |
| `src/assets/` | Images, resized and converted to WebP at build time. |
| `public/` | Files served as-is: favicons, fonts, `CNAME`, giscus themes. |

## Writing a blog post

```bash
npm run new-post "Title of the post"
```

This creates `src/content/posts/title-of-the-post.mdx` as a draft. Write in Markdown; it supports:

- maths with KaTeX: `$\langle\psi|\hat H|\psi\rangle$` inline, `$$ … $$` for display;
- code blocks with syntax highlighting and a copy button;
- figures and callouts in `.mdx` (`import Figure from '../../components/Figure.astro'`);
- footnotes, tables, and a cover image (`cover:` in the frontmatter).

Delete `draft: true` when it is ready. Each hosted post gets a contents sidebar, reading time, share links,
a generated social-card image and a comments section. Set `comments: false` to turn comments off for one post.

`src/content/posts/post-template.mdx` is a draft that shows every feature; it never appears in production.

### Linking to a post published elsewhere

```bash
npm run new-post "Title" -- --external https://pennylane.ai/qml/demos/... PennyLane
```

External posts appear in the blog list and RSS feed, and link straight to the original.

## Comments

Comments use [giscus](https://giscus.app), which stores each post's thread as a GitHub Discussion on the site's repository.
Commenters sign in with GitHub. To switch them on:

1. enable **Discussions** on the repository (Settings → General → Features);
2. install the giscus app on that repository: <https://github.com/apps/giscus>;
3. on <https://giscus.app>, enter the repository, choose the *Announcements* category, and copy `data-category-id`
   into `GISCUS.categoryId` in `src/data/site.ts`.

The comment box follows the site's light/dark theme, using `public/giscus/light.css` and `dark.css` in production.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `master` or `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions**. `public/CNAME` keeps the custom domain
`www.jackstephenbaker.com`. Old HydeJack URLs (`/blog/optimization/…`, `/legal/`) redirect to their new homes.

## Fonts

New Computer Modern (GUST Font Licence) and CMU Sans Serif (SIL Open Font Licence), self-hosted from `public/fonts/`.
