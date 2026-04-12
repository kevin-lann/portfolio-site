import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    section: z.enum(['experience', 'projects', 'other']),
    overview: z.string(),
    order: z.number(),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string().url()
      })
    ).default([]),
    metadata: z.array(
      z.object({
        label: z.string(),
        value: z.union([
          z.string(),
          z.array(
            z.union([
              z.string(),
              z.object({
                text: z.string(),
                url: z.string().url()
              })
            ])
          )
        ]),
        icon: z.string().optional()
      })
    ).default([])
  })
});

export const collections = {
  portfolio
};
