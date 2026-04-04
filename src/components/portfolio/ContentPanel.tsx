import { useEffect, useRef, useState } from "react";
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
  const asciiContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAsciiHovered, setIsAsciiHovered] = useState(false);
  const [isAsciiPriming, setIsAsciiPriming] = useState(false);
  const isAsciiHoveredRef = useRef(false);
  const [activeImage, setActiveImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    isAsciiHoveredRef.current = isAsciiHovered;
  }, [isAsciiHovered]);

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

  useEffect(() => {
    if (!isHomeView) {
      setIsAsciiPriming(false);
      return;
    }

    setIsAsciiPriming(true);
    let isCancelled = false;
    let frameId = 0;
    let fallbackTimeoutId = 0;
    let releaseTimeoutId = 0;

    const releasePrime = () => {
      window.clearTimeout(releaseTimeoutId);
      releaseTimeoutId = window.setTimeout(() => {
        if (!isCancelled && !isAsciiHoveredRef.current) {
          setIsAsciiPriming(false);
        }
      }, 50);
    };

    const attachToVideo = () => {
      if (isCancelled) return;

      const video = asciiContainerRef.current?.querySelector("video");
      if (!video) {
        frameId = window.requestAnimationFrame(attachToVideo);
        return;
      }

      if (video.readyState >= 2) {
        releasePrime();
        return;
      }

      video.addEventListener("loadeddata", releasePrime, { once: true });
      video.addEventListener("canplay", releasePrime, { once: true });
    };

    frameId = window.requestAnimationFrame(attachToVideo);
    fallbackTimeoutId = window.setTimeout(releasePrime, 1800);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fallbackTimeoutId);
      window.clearTimeout(releaseTimeoutId);
    };
  }, [isHomeView]);

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
          <div
            ref={asciiContainerRef}
            onMouseEnter={() => setIsAsciiHovered(true)}
            onMouseLeave={() => setIsAsciiHovered(false)}
          >
            <p>{!isAsciiHovered ? "Hover me" : "Click me"}</p>
            <Video2Ascii
              src="/videos/heaven-trimmed-cropped.mp4"
              numColumns={90}
              colored={true}
              brightness={1.5}
              enableMouse={true}
              enableRipple={true}
              charset="detailed"
              isPlaying={isAsciiPriming || isAsciiHovered}
              autoPlay={isAsciiPriming || isAsciiHovered}
            />
          </div>
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
