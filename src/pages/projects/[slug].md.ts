import { createMarkdownGet, markdownPaths } from '../../lib/entry-markdown';

export const prerender = true;
export const getStaticPaths = markdownPaths('projects');
export const GET = createMarkdownGet('projects');
