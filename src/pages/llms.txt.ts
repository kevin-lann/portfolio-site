import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

export const GET: APIRoute = async () => {
  const profile = await getEntry('agent', 'profile');
  const markdown = profile?.body?.trim();

  if (!markdown) {
    return new Response('Agent profile is unavailable.', { status: 404 });
  }

  return new Response(markdown + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
