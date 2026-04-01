import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';

import { ContentPanel } from './ContentPanel';
import { getEntriesBySection, sectionOrder } from './content';
import { LeftSidebar } from './LeftSidebar';
import { MetadataPanel } from './MetadataPanel';
import { SplitHandle } from './SplitHandle';
import type { PortfolioEntry, SectionKey } from './types';

type HandleKey = 'left' | 'middle';

interface DragState {
  handle: HandleKey;
  startX: number;
  startLeft: number;
  startMiddle: number;
}

const LEFT_MIN = 0;
const MIDDLE_MIN = 0;
const RIGHT_MIN = 0;

/**
 * Clamps a value between a minimum and maximum value.
 * @param value - The value to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The clamped value.
 */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PortfolioApp() {
  const [activeSection, setActiveSection] = useState<SectionKey>('experience');
  const [activeEntryId, setActiveEntryId] = useState<string>('');
  const [leftWidth, setLeftWidth] = useState(40);
  const [middleWidth, setMiddleWidth] = useState(40);

  const dragState = useRef<DragState | null>(null);

  const entriesBySection = useMemo(
    () =>
      sectionOrder.reduce(
        (acc, section) => {
          acc[section] = getEntriesBySection(section);
          return acc;
        },
        {} as Record<SectionKey, PortfolioEntry[]>
      ),
    []
  );
  const entries = entriesBySection[activeSection];
  const activeEntry = entries.find((entry) => entry.id === activeEntryId) ?? entries[0];

  useEffect(() => {
    if (!entries.length) {
      setActiveEntryId('');
      return;
    }

    if (!activeEntryId || !entries.some((entry) => entry.id === activeEntryId)) {
      setActiveEntryId(entries[0].id);
    }
  }, [activeEntryId, entries]);

  const onSectionChange = (section: SectionKey) => {
    setActiveSection(section);
    const nextEntries = entriesBySection[section];
    setActiveEntryId(nextEntries[0]?.id ?? '');
  };

  const onEntrySelect = (section: SectionKey, entryId: string) => {
    setActiveSection(section);
    setActiveEntryId(entryId);
  };

  const beginDrag = (handle: HandleKey, clientX: number) => {
    dragState.current = {
      handle,
      startX: clientX,
      startLeft: leftWidth,
      startMiddle: middleWidth
    };
  };

  const endDrag = () => {
    dragState.current = null;
    document.body.classList.remove('is-dragging-columns');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
  };

  const updateDrag = (clientX: number) => {
    const state = dragState.current;
    if (!state) return;

    const delta = ((clientX - state.startX) / window.innerWidth) * 100;

    if (state.handle === 'left') {
      const maxLeft = 100 - RIGHT_MIN - middleWidth;
      const nextLeft = clamp(state.startLeft + delta, LEFT_MIN, maxLeft);
      setLeftWidth(nextLeft);
      return;
    }
    const maxMiddle = 100 - RIGHT_MIN - leftWidth;
    const nextMiddle = clamp(state.startMiddle + delta, MIDDLE_MIN, maxMiddle);
    setMiddleWidth(nextMiddle);
  };

  const onMouseMove = (event: MouseEvent) => updateDrag(event.clientX);
  const onTouchMove = (event: TouchEvent) => {
    if (!event.touches[0]) return;
    updateDrag(event.touches[0].clientX);
  };

  const attachDragListeners = () => {
    document.body.classList.add('is-dragging-columns');
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag, { once: true });
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', endDrag, { once: true });
  };

  const handleLeftMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    beginDrag('left', event.clientX);
    attachDragListeners();
  };

  const handleMiddleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    beginDrag('middle', event.clientX);
    attachDragListeners();
  };

  const handleLeftTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!event.touches[0]) return;
    beginDrag('left', event.touches[0].clientX);
    attachDragListeners();
  };

  const handleMiddleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!event.touches[0]) return;
    beginDrag('middle', event.touches[0].clientX);
    attachDragListeners();
  };

  if (!activeEntry) {
    return null;
  }

  return (
    <main className="portfolio-root">
      <div className="portfolio-shell">
        <div className="portfolio-column" style={{ width: `${leftWidth}%` }}>
          <LeftSidebar
            activeSection={activeSection}
            activeEntryId={activeEntry.id}
            entriesBySection={entriesBySection}
            onSectionChange={onSectionChange}
            onEntrySelect={onEntrySelect}
          />
        </div>

        <SplitHandle onMouseDown={handleLeftMouseDown} onTouchStart={handleLeftTouchStart} />

        <div className="portfolio-column" style={{ width: `${middleWidth}%` }}>
          <MetadataPanel entry={activeEntry} />
        </div>

        <SplitHandle onMouseDown={handleMiddleMouseDown} onTouchStart={handleMiddleTouchStart} />

        <div className="portfolio-column grow">
          <ContentPanel entry={activeEntry} />
        </div>
      </div>
    </main>
  );
}
