import { getCollection, type CollectionEntry } from 'astro:content';

export const sectionOrder = ['experience', 'projects'] as const;
export type SectionKey = (typeof sectionOrder)[number];

export const sectionLabels: Record<SectionKey, string> = {
  experience: 'experience',
  projects: 'projects',
};

export type PortfolioEntry = CollectionEntry<'portfolio'>;

export const toEntrySlug = (entry: PortfolioEntry) =>
  entry.id.replace(/\.md$/, '').split('/').pop() ?? entry.id;

export const toEntryHref = (entry: PortfolioEntry) =>
  '/' + entry.data.section + '/' + toEntrySlug(entry);

export const getPortfolioEntries = async () => {
  const entries = await getCollection('portfolio');
  return entries.sort((a, b) => a.data.order - b.data.order);
};

export const getEntriesBySection = async (): Promise<Record<SectionKey, PortfolioEntry[]>> => {
  const entries = await getPortfolioEntries();

  return sectionOrder.reduce(
    (acc, section) => {
      acc[section] = entries.filter((entry) => entry.data.section === section);
      return acc;
    },
    {
      experience: [],
      projects: [],
      other: []
    } as Record<SectionKey, PortfolioEntry[]>
  );
};
