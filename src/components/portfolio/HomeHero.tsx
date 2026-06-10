import { useEffect, useRef, useState } from 'react';
import { Video2Ascii } from 'video2ascii';

type ColorMode = 'dark' | 'light' | 'summer' | 'night';

const colorModeHighlight = {
  dark: 0,
  light: 100,
  summer: 100,
  night: 0
};

const isColorMode = (value: string | null | undefined): value is ColorMode =>
  value === 'dark' || value === 'light' || value === 'summer' || value === 'night';

export function HomeHero({ colorMode }: { colorMode: ColorMode }) {
  const [activeColorMode, setActiveColorMode] = useState<ColorMode>(colorMode);
  const [renderKey, setRenderKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ensurePlayback = () => {
      const video = rootRef.current?.querySelector('video');
      if (!(video instanceof HTMLVideoElement)) {
        return;
      }

      void video.play().catch(() => {
        // Ignore autoplay races during Astro view transitions.
      });
    };

    const syncFromDom = () => {
      const domColorMode = document.documentElement.getAttribute('data-color-mode');
      if (isColorMode(domColorMode)) {
        setActiveColorMode(domColorMode);
      }
    };

    const handleColorModeChange = (event: Event) => {
      const nextColorMode = (event as CustomEvent<{ colorMode?: string }>).detail?.colorMode;
      if (isColorMode(nextColorMode)) {
        setActiveColorMode(nextColorMode);
      }
    };

    const handlePageLoad = () => {
      if (window.location.pathname !== '/') {
        return;
      }

      syncFromDom();
      setRenderKey((current) => current + 1);

      requestAnimationFrame(() => {
        window.setTimeout(ensurePlayback, 0);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && window.location.pathname === '/') {
        ensurePlayback();
      }
    };

    syncFromDom();
    ensurePlayback();

    window.addEventListener('portfolio-color-mode-change', handleColorModeChange as EventListener);
    document.addEventListener('astro:page-load', handlePageLoad);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageLoad);

    return () => {
      window.removeEventListener(
        'portfolio-color-mode-change',
        handleColorModeChange as EventListener
      );
      document.removeEventListener('astro:page-load', handlePageLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageLoad);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <Video2Ascii
        key={renderKey}
        src="/videos/heaven-trimmed-cropped.mp4"
        numColumns={90}
        colored={true}
        brightness={1.5}
        enableMouse={true}
        enableRipple={true}
        charset="detailed"
        autoPlay={true}
        enableSpacebarToggle={true}
        highlight={colorModeHighlight[activeColorMode]}
      />
    </div>
  );
}
