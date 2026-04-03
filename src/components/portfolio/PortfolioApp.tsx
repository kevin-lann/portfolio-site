import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';

import { ContentPanel } from './ContentPanel';
import { getEntriesBySection, sectionOrder } from './content';
import { LeftSidebar } from './LeftSidebar';
import { MetadataPanel } from './MetadataPanel';
import { SplitHandle } from './SplitHandle';
import type { PortfolioEntry, SectionKey } from './types';

type HandleKey = 'left' | 'middle';
type ColorMode = 'dark' | 'light';

interface DragState {
  handle: HandleKey;
  startX: number;
  startLeft: number;
  startMiddle: number;
}

const LEFT_MIN = 0;
const MIDDLE_MIN = 0;
const RIGHT_MIN = 0;
const COLOR_MODE_STORAGE_KEY = 'portfolio-color-mode';

const isColorMode = (value: string): value is ColorMode => value === 'dark' || value === 'light';

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
  const [areSidebarsCollapsed, setAreSidebarsCollapsed] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return stored && isColorMode(stored) ? stored : 'dark';
  });

  const dragState = useRef<DragState | null>(null);
  const cursorCircleRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', colorMode);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
  }, [colorMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isTyping) return;

      const key = event.key.toLowerCase();

      if (key === 'f') {
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => undefined);
        } else {
          void document.documentElement.requestFullscreen().catch(() => undefined);
        }
        return;
      }

      if (key === 'l') {
        setColorMode('light');
      } else if (key === 'd') {
        setColorMode('dark');
      } else if (key === 'h') {
        setAreSidebarsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const circleElement = cursorCircleRef.current;
    if (!circleElement) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const previousMouse = { x: mouse.x, y: mouse.y };
    const circle = { x: mouse.x, y: mouse.y };

    let currentScale = 0;
    let currentAngle = 0;
    let frameId = 0;
    let hasMoved = false;
    const speed = 0.17;

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if (!hasMoved) {
        hasMoved = true;
        circleElement.classList.add('is-visible');
      }
    };

    const tick = () => {
      circle.x += (mouse.x - circle.x) * speed;
      circle.y += (mouse.y - circle.y) * speed;
      const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

      const deltaMouseX = mouse.x - previousMouse.x;
      const deltaMouseY = mouse.y - previousMouse.y;
      previousMouse.x = mouse.x;
      previousMouse.y = mouse.y;

      const mouseVelocity = Math.min(Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4, 150);
      const scaleValue = (mouseVelocity / 150) * 0.5;
      currentScale += (scaleValue - currentScale) * speed;
      const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

      const angle = (Math.atan2(deltaMouseY, deltaMouseX) * 180) / Math.PI;
      if (mouseVelocity > 20) {
        currentAngle = angle;
      }
      const rotateTransform = `rotate(${currentAngle}deg)`;

      circleElement.style.transform =
        `${translateTransform} ${rotateTransform} ${scaleTransform}`;

      frameId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const onSectionChange = (section: SectionKey) => {
    setActiveSection(section);
    const nextEntries = entriesBySection[section];
    setActiveEntryId(nextEntries[0]?.id ?? '');
  };

  const onEntrySelect = (section: SectionKey, entryId: string) => {
    setActiveSection(section);
    setActiveEntryId(entryId);
  };

  const toggleSidebars = () => {
    setAreSidebarsCollapsed((prev) => !prev);
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
    <main className="portfolio-root" data-color-mode={colorMode}>
      <div className="portfolio-shell">
        {!areSidebarsCollapsed ? (
          <>
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
          </>
        ) : null}

        <div className="portfolio-column grow">
          <ContentPanel
            entry={activeEntry}
            areSidebarsCollapsed={areSidebarsCollapsed}
            onToggleSidebars={toggleSidebars}
          />
        </div>
      </div>
      <div ref={cursorCircleRef} className="circle" aria-hidden="true" />
    </main>
  );
}
