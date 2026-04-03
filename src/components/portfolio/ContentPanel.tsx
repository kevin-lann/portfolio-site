import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { PortfolioEntry } from './types';

interface ContentPanelProps {
  entry: PortfolioEntry;
  areSidebarsCollapsed: boolean;
  onToggleSidebars: () => void;
}

export function ContentPanel({
  entry,
  areSidebarsCollapsed,
  onToggleSidebars
}: ContentPanelProps) {
  return (
    <section className="portfolio-panel content-panel text-sm" aria-label="Entry content">
      <div className="content-toolbar">
        <button type="button" className="collapse-toggle" onClick={onToggleSidebars}>
          {areSidebarsCollapsed ? '>' : '<'}
        </button>
        <div className="content-links">
          {entry.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="content-markdown mb-[20vh]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.markdown}</ReactMarkdown>
      </div>
    </section>
  );
}
