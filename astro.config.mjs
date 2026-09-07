// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import { rehypeMarkdownVideo } from './src/lib/rehype-markdown-video.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  markdown: {
    rehypePlugins: [rehypeMarkdownVideo],
    shikiConfig: {
      themes: {
        dark: 'tokyo-night',
        light: 'github-light'
      },
      defaultColor: false
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
