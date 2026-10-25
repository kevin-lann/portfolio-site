import type { APIRoute } from 'astro';

import { getPortfolioEntries, toEntryHref } from '../lib/portfolio';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://kevinlan.space')).origin;
  const entries = await getPortfolioEntries();
  const paths = ['/', ...entries.map((entry) => toEntryHref(entry) + '/')];
  const urls = paths
    .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/2000/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
