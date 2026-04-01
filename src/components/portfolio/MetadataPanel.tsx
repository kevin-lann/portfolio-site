import type { PortfolioEntry } from "./types";

interface MetadataPanelProps {
  entry: PortfolioEntry;
}

export function MetadataPanel({ entry }: MetadataPanelProps) {
  return (
    <section
      className="portfolio-panel metadata-panel text-sm"
      aria-label="Entry metadata"
    >
      <article className="pb-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl text-(--light) fancy-font">{entry.title}</h2>
          <p>{entry.overview}</p>
        </div>

        <dl className="metadata-list">
          {entry.metadata.map((field) => (
            <div key={field.label} className="text-sm py-2">
              <dt className="metadata-label-light">{field.label}</dt>
              <dd>
                {Array.isArray(field.value)
                  ? field.value.map((line) => <span key={line}>{line}</span>)
                  : field.value}
              </dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
