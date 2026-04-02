import { sectionLabels, sectionOrder } from './content';
import type { PortfolioEntry, SectionKey } from './types';

interface LeftSidebarProps {
  activeSection: SectionKey;
  activeEntryId: string;
  entriesBySection: Record<SectionKey, PortfolioEntry[]>;
  onSectionChange: (section: SectionKey) => void;
  onEntrySelect: (section: SectionKey, entryId: string) => void;
}

const socials = [
  { label: 'linkedin', href: 'https://www.linkedin.com/' },
  { label: 'github', href: 'https://github.com/' },
  { label: 'twitter', href: 'https://twitter.com/' }
];

export function LeftSidebar({
  activeSection,
  activeEntryId,
  entriesBySection,
  onSectionChange,
  onEntrySelect
}: LeftSidebarProps) {
  return (
    <aside className="portfolio-panel left-panel text-sm">
      <div>
        <h1 className="logo fancy-font">Kevin Lan</h1>
        <p className="intro-copy text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et dui id lacus
          efficitur eleifend non ac erat.
        </p>
        <p className="shortcut-hints text-xs" aria-label="Keyboard shortcuts">
          <span><kbd>L</kbd> light mode</span>
          <span><kbd>D</kbd> dark mode</span>
        </p>
      </div>

      <nav className="nav-group" aria-label="Main sections">
        <span className="group-label">sections</span>
        {sectionOrder.map((section) => (
          <div key={section} className="section-block">
            <button
              type="button"
              className={`nav-link ${activeSection === section ? 'active' : ''}`}
              onClick={() => onSectionChange(section)}
            >
              {sectionLabels[section]}
            </button>

            {(section === 'experience' || section === 'projects') && entriesBySection[section].length > 0 ? (
              <div className="subnav-group">
                {entriesBySection[section].map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`subnav-link ${activeEntryId === entry.id ? 'active' : ''}`}
                    onClick={() => onEntrySelect(section, entry.id)}
                  >
                    <div className="flex gap-2 text-left"><span className="text-xs">∟</span> {entry.title}</div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="social-group">
        <span className="group-label">socials</span>
        {socials.map((social) => (
          <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="text-link">
            {social.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
