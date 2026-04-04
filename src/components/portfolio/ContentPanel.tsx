import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import type { PortfolioEntry } from "./types";
import { Video2Ascii } from "video2ascii";

interface ContentPanelProps {
  entry: PortfolioEntry;
  isHomeView: boolean;
  areSidebarsCollapsed: boolean;
  onToggleSidebars: () => void;
}

export function ContentPanel({
  entry,
  isHomeView,
  areSidebarsCollapsed,
  onToggleSidebars,
}: ContentPanelProps) {
  const [activeImage, setActiveImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

  return (
    <section
      className="portfolio-panel content-panel text-sm"
      aria-label="Entry content"
    >
      <div className="content-toolbar">
        <button
          type="button"
          className="collapse-toggle"
          onClick={onToggleSidebars}
        >
          {areSidebarsCollapsed ? ">" : "<"}
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
      <div
        className={`content-markdown mb-[20vh] ${isHomeView ? "is-home" : ""}`}
      >
        {isHomeView ? (
          <Video2Ascii
            src="/videos/heaven-trimmed-cropped.mp4"
            numColumns={90}
            colored={true}
            brightness={1.5}
            enableMouse={true}
            enableRipple={true}
            charset="detailed"
            autoPlay={true}
            enableSpacebarToggle={true}
          />
        ) : null}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt }) => {
              if (!src) {
                return null;
              }

              return (
                <button
                  type="button"
                  className="content-image-trigger"
                  onClick={() => setActiveImage({ src, alt: alt ?? "" })}
                  aria-label={alt ? `Expand image: ${alt}` : "Expand image"}
                >
                  <img src={src} alt={alt ?? ""} className="content-image" />
                </button>
              );
            },
          }}
        >
          {entry.markdown}
        </ReactMarkdown>
      </div>
      {activeImage ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt || "Expanded image"}
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="image-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
