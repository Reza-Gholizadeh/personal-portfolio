import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` is the deployed origin only — Astro's docs say it must not include
// `base`. `base` nests every route this project builds under /blog, so
// index.astro becomes /personal-portfolio/blog/ and [slug].astro becomes
// /personal-portfolio/blog/<slug>/ once GitHub Pages serves them — matching
// the dist/blog/ nesting the CI merge step creates (see
// .github/workflows/deploy.yml at the repo root).
export default defineConfig({
  site: 'https://reza-gholizadeh.github.io',
  base: '/personal-portfolio/blog',
  // Pairs with the default directory build format (one index.html per route
  // folder), so every generated canonical/OG/sitemap URL already ends in a
  // slash.
  trailingSlash: 'always',
  integrations: [sitemap()],
});
