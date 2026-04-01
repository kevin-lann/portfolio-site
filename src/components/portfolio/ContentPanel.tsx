import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { PortfolioEntry } from './types';

interface ContentPanelProps {
  entry: PortfolioEntry;
}

export function ContentPanel({ entry }: ContentPanelProps) {
  return (
    <section className="portfolio-panel content-panel text-sm" aria-label="Entry content">
      <div className="content-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.markdown}</ReactMarkdown>
      </div>
    </section>
  );
}
