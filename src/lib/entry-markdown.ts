import type { APIRoute, GetStaticPaths } from 'astro';

import { getPortfolioEntries, toEntryHref, toEntrySlug, type PortfolioEntry } from './portfolio';

type Section = PortfolioEntry['data']['section'];
type MetadataValue = PortfolioEntry['data']['metadata'][number]['value'];

const originOf = (site: URL | undefined) => (site ?? new URL('https://kevinlan.space')).origin;

const formatMetadataValue = (value: MetadataValue) => {
  if (typeof value === 'string') return value;
  return value
    .map((item) => (typeof item === 'string' ? item : `${item.text} (${item.url})`))
    .join(', ');
};

const absolutizeMarkdown = (markdown: string, origin: string) =>
  markdown.replace(/\]\((\/[^)\s]+)\)/g, (_match, path: string) => `](${origin}${path})`);

export const toEntryPageUrl = (entry: PortfolioEntry, origin: string) =>
  origin + toEntryHref(entry) + '/';

export const toEntryMarkdownUrl = (entry: PortfolioEntry, origin: string) =>
  origin + toEntryHref(entry) + '.md';

export const toEntryMarkdown = (entry: PortfolioEntry, origin: string) => {
  const canonical = toEntryPageUrl(entry, origin);
  const lines = [
    `# ${entry.data.title}`,
    '',
    `> ${entry.data.overview}`,
    '',
    `- HTML: ${canonical}`,
    `- Markdown: ${toEntryMarkdownUrl(entry, origin)}`,
    ''
  ];

  for (const item of entry.data.metadata) {
    lines.push(`- ${item.label}: ${formatMetadataValue(item.value)}`);
  }
  if (entry.data.metadata.length > 0) lines.push('');

  for (const link of entry.data.links) {
    lines.push(`- [${link.label}](${link.href})`);
  }
  if (entry.data.links.length > 0) lines.push('');

  const body = absolutizeMarkdown(entry.body?.trim() ?? '', origin);
  if (body) lines.push(body);

  return lines.join('\n').trim() + '\n';
};

export const markdownPaths = (section: Section): GetStaticPaths => {
  return async () => {
    const entries = await getPortfolioEntries();
    return entries
      .filter((entry) => entry.data.section === section)
      .map((entry) => ({ params: { slug: toEntrySlug(entry) } }));
  };
};

export const createMarkdownGet = (section: Section): APIRoute => {
  return async ({ params, site }) => {
    const origin = originOf(site);
    const entries = await getPortfolioEntries();
    const entry = entries.find(
      (item) => item.data.section === section && toEntrySlug(item) === params.slug
    );

    if (!entry) {
      return new Response('Not found\n', { status: 404 });
    }

    const canonical = toEntryPageUrl(entry, origin);
    return new Response(toEntryMarkdown(entry, origin), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        Link: `<${canonical}>; rel="canonical"`
      }
    });
  };
};
