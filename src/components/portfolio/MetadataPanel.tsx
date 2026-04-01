import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";
import type { PortfolioEntry } from "./types";

interface MetadataPanelProps {
  entry: PortfolioEntry;
}

const availableIcons = new Set(iconNames);

const getIconName = (icon?: string): IconName | null => {
  if (!icon) return null;

  const normalized = icon
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase() as IconName;

  return availableIcons.has(normalized) ? normalized : null;
};

const getFieldSizeClass = (value: string | string[]) => {
  const lines = Array.isArray(value) ? value : [value];
  const totalChars = lines.join(" ").length;
  const hasManyLines = lines.length > 2;
  const hasLongLine = lines.some((line) => line.length > 24);

  return hasManyLines || hasLongLine || totalChars > 40
    ? "metadata-item-wide"
    : "metadata-item-compact";
};

export function MetadataPanel({ entry }: MetadataPanelProps) {
  return (
    <section
      className="portfolio-panel metadata-panel text-sm"
      aria-label="Entry metadata"
    >
      <article className="pb-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl text-(--light) fancy-font">{entry.title}</h2>
          <p>{entry.overview}</p>
        </div>

        <dl className="metadata-list">
          {entry.metadata.map((field) => {
            const iconName = getIconName(field.icon);
            const fieldSizeClass = getFieldSizeClass(field.value);

            return (
              <div
                key={field.label}
                className={`metadata-item ${fieldSizeClass} text-sm flex items-start gap-2.5`}
              >
                {iconName ? (
                  <DynamicIcon
                    name={iconName}
                    size={14}
                    strokeWidth={1.75}
                    className="mt-0.5 text-(--light) shrink-0"
                    aria-hidden="true"
                  />
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
