import { useLayoutEffect, useRef, useState } from 'react';
import BounceCards from './bounce-cards/BounceCards';

export type DeckEntry = {
  href: string;
  title: string;
  overview: string;
  banner: string;
};

function deckLayout(width: number, count: number, scale = 1) {
  const middle = (count - 1) / 2;
  const reach = Math.max(middle, 0.5);
  const aspectRatio = 4 / 5;
  const edge = 24;
  const unscaled = Math.round(Math.min(168, Math.max(112, width / (3.6 + count * 0.22))));
  let cardSize = Math.round(unscaled * scale);

  // `packed` is the previous center-to-center step. Opening the fan by 30%
  // of the hidden strip keeps each card readable without a hover.
  const place = (size: number) => {
    const pushDistance = Math.round(Math.min(84, Math.max(24, size * 0.34)));
    const packed = Math.min(
      size * 0.62,
      Math.max(18, (width / 2 - size / 2 - pushDistance - 10) / reach)
    );
    const overlap = Math.max(0, size - packed);
    const opened = size - overlap * 0.7;
    const maxSpread = Math.max(18, (width / 2 - edge - size / 2) / reach);
    return { pushDistance, opened, maxSpread };
  };

  let placed = place(cardSize);
  while (placed.opened > placed.maxSpread && cardSize > unscaled) {
    cardSize -= 2;
    placed = place(cardSize);
  }

  const spread = Math.min(placed.opened, placed.maxSpread);
  const { pushDistance } = placed;
  const cardHeight = cardSize / aspectRatio;
  const arc = Math.min(28, 8 + count * 2);
  const containerHeight = Math.ceil(cardHeight + arc + 96);
  return { cardSize, pushDistance, spread, arc, containerHeight, aspectRatio };
}

export function EntryDeck({
  label,
  entries,
  scale = 1
}: {
  label: string;
  entries: DeckEntry[];
  scale?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = deckLayout(Math.max(width, 280), Math.max(entries.length, 1), scale);

  return (
    <section className="entry-deck" aria-label={label}>
      <p className="section-label">{label}</p>
      <div ref={frameRef} className="entry-deck-stage">
        {width > 0 && (
          <BounceCards
            images={entries.map((entry) => ({
              src: entry.banner,
              href: entry.href,
              title: entry.title,
              subtitle: entry.overview,
              alt: entry.title
            }))}
            containerWidth={width}
            containerHeight={layout.containerHeight}
            cardSize={layout.cardSize}
            spread={layout.spread}
            rotation={9}
            arc={layout.arc}
            aspectRatio={layout.aspectRatio}
            pushDistance={layout.pushDistance}
            hoverScale={1.06}
            animationDelay={0.12}
            animationStagger={0.05}
            borderWidth={1}
            borderColor="var(--line)"
            radius={14}
          />
        )}
      </div>
    </section>
  );
}
