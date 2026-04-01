export type SectionKey = 'experience' | 'projects' | 'other';

export type MetadataValue = string | string[];

export interface MetadataField {
  label: string;
  value: MetadataValue;
  icon?: string;
}

export interface PortfolioEntry {
  id: string;
  section: SectionKey;
  title: string;
  overview: string;
  metadata: MetadataField[];
  markdown: string;
}
