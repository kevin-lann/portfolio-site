import { ExternalLink } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";

interface MetadataField {
  label: string;
  value: string | Array<string | { text: string; url: string }>;
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
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase() as IconName;

  return availableIcons.has(normalized) ? normalized : null;
};

const isLinkValue = (
  value: string | { text: string; url: string }
): value is { text: string; url: string } =>
  typeof value === "object" &&
  value !== null &&
  "text" in value &&
  "url" in value;

const isGithubLink = (text: string, url: string): boolean => {
  const normalizedText = text.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  return normalizedUrl.includes("github.com") || normalizedText.includes("github");
};

export function MetadataPanelCollection({
  title,
  overview,
  metadata,
}: MetadataPanelCollectionProps) {
  return (
    <section
      className="portfolio-panel metadata-panel text-sm"
      aria-label="Entry metadata"
    >
      <article className="pb-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl text-(--light) fancy-font">{title}</h2>
          <p>{overview}</p>
        </div>

        <dl className="metadata-list">
          {metadata.map((field) => {
            const iconName = getIconName(field.icon);

            return (
              <div
                key={field.label}
                className="metadata-item text-sm flex items-start gap-2.5"
              >
                {iconName ? (
                  <span
                    className="mt-0.5 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <DynamicIcon
                      name={iconName}
                      size={14}
                      strokeWidth={1.75}
                      style={{ color: "var(--light)" }}
                    />
                  </span>
                ) : null}

                <div>
                  <dt className="metadata-label-light">{field.label}</dt>
                  <dd className={`${field.label == "Links" ? "flex gap-1.5" : "flex flex-col"}`}>
                    {Array.isArray(field.value)
                      ? field.value.map((line, index) =>
                          isLinkValue(line) ? (
                            <a
                              key={`${line.url}-${index}`}
                              href={line.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-2 rounded-md border border-(--line) px-2.5 py-1.5 transition-colors hover:bg-(--line)"
                            >
                              {isGithubLink(line.text, line.url) ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-[14px] w-[14px] shrink-0"
                                  aria-hidden="true"
                                  focusable="false"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.6-.7 2-1.1.1-.7.4-1.1.7-1.3-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.4 1.2a11.7 11.7 0 0 1 6.1 0C16.1 4 17 4.3 17 4.3c.7 1.6.3 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v2.9c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"
                                  />
                                </svg>
                              ) : (
                                <ExternalLink
                                  size={14}
                                  strokeWidth={2}
                                  style={{ color: "var(--light)" }}
                                  aria-hidden="true"
                                />
                              )}
                              {line.text}
                            </a>
                          ) : (
                            <span key={`${line}-${index}`}>{line}</span>
                          )
                        )
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
