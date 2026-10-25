import { createMarkdownGet, markdownPaths } from '../../lib/entry-markdown';

export const prerender = true;
export const getStaticPaths = markdownPaths('other');
export const GET = createMarkdownGet('other');
