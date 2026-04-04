import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';

interface MetadataField {
  label: string;
  value: string | string[];
  icon?: string;
}

interface MetadataPanelCollectionProps {
  title: string;
  overview: string;
  metadata: MetadataField[];
}

const availableIcons = new Set(iconNames);

const getIconName = (icon?: string): IconName | null => {
  if (!icon) return null;

  const normalized = icon
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase() as IconName;

  return availableIcons.has(normalized) ? normalized : null;
};

export function MetadataPanelCollection({
  title,
  overview,
  metadata
}: MetadataPanelCollectionProps) {
  return (
    <section className="portfolio-panel metadata-panel text-sm" aria-label="Entry metadata">
      <article className="pb-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl text-(--light) fancy-font">{title}</h2>
          <p>{overview}</p>
        </div>

        <dl className="metadata-list">
          {metadata.map((field) => {
            const iconName = getIconName(field.icon);

            return (
              <div key={field.label} className="metadata-item text-sm flex items-start gap-2.5">
                {iconName ? (
                  <span
                    className="mt-0.5 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <DynamicIcon
                      name={iconName}
                      size={14}
                      strokeWidth={1.75}
                      style={{ color: 'var(--light)' }}
                    />
                  </span>
                ) : null}

                <div>
                  <dt className="metadata-label-light">{field.label}</dt>
                  <dd>
                    {Array.isArray(field.value)
                      ? field.value.map((line) => <span key={line}>{line}</span>)
                      : field.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </article>
    </section>
  );
}
