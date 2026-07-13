import {
  CalendarRange,
  ExternalLink,
  Link2,
  MapPin,
  Shapes,
  Timer,
  User,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

interface MetadataField {
  label: string;
  value: string | Array<string | { text: string; url: string }>;
  icon?: string;
}

interface MetadataGridProps {
  metadata: MetadataField[];
}

const metadataIcons: Record<string, ComponentType<LucideProps>> = {
  "calendar-range": CalendarRange,
  link2: Link2,
  "map-pin": MapPin,
  shapes: Shapes,
  timer: Timer,
  user: User,
};

const getIconComponent = (icon?: string): ComponentType<LucideProps> | null => {
  if (!icon) return null;

  const normalized = icon
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  return metadataIcons[normalized] ?? null;
};

const isLinkValue = (
  value: string | { text: string; url: string },
): value is { text: string; url: string } =>
  typeof value === "object" &&
  value !== null &&
  "text" in value &&
  "url" in value;

const isGithubLink = (text: string, url: string): boolean => {
  const normalizedText = text.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  return (
    normalizedUrl.includes("github.com") || normalizedText.includes("github")
  );
};

export function MetadataGrid({ metadata }: MetadataGridProps) {
  if (!metadata.length) return null;

  return (
    <dl className="metadata-grid" aria-label="Details">
      {metadata.map((field) => {
        const IconComponent = getIconComponent(field.icon);
        const values = Array.isArray(field.value) ? field.value : null;
        const isArray = values !== null;
        // Lists (tools, stack, links) get more room and span both columns.
        const isWide = values !== null && values.length > 2;

        return (
          <div
            key={field.label}
            className={`metadata-card${isWide ? " metadata-card-wide" : ""}`}
          >
            <dt className="metadata-card-label">
              {IconComponent ? (
                <IconComponent
                  size={13}
                  strokeWidth={1.75}
                  style={{ color: "var(--muted)" }}
                  aria-hidden="true"
                />
              ) : null}
              <span>{field.label}</span>
            </dt>
            <dd
              className={`metadata-card-value${
                isArray ? " metadata-card-tags" : ""
              }`}
            >
              {values
                ? values.map((line, index) =>
                    isLinkValue(line) ? (
                      <a
                        key={`${line.url}-${index}`}
                        href={line.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="metadata-link-button inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5"
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
                            style={{ color: "currentColor" }}
                            aria-hidden="true"
                          />
                        )}
                        {line.text}
                      </a>
                    ) : (
                      <span key={`${line}-${index}`} className="metadata-tag">
                        {line}
                      </span>
                    ),
                  )
                : typeof field.value === "string"
                  ? field.value
                  : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
