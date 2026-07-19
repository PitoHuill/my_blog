import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    series: z.string().min(1).optional(),
    seriesOrder: z.number().int().positive().optional(),
    heroImage: z.string().min(1).optional(),
    locale: z.enum(['en', 'zh']),
    translationKey: z.string().min(1),
  }),
});

export const collections = { posts };
