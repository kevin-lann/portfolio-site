import { useCallback, useEffect, useRef, useState } from 'react';
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

// HTMLMediaElement.NETWORK_NO_SOURCE: the element never ran resource
// selection, so it has nothing to play.
const NETWORK_NO_SOURCE = 3;

export function HomeHero({ colorMode }: { colorMode: ColorMode }) {
  const [activeColorMode, setActiveColorMode] = useState<ColorMode>(colorMode);
  const rootRef = useRef<HTMLDivElement>(null);

  const queryVideo = useCallback(() => {
    const video = rootRef.current?.querySelector('video');
    return video instanceof HTMLVideoElement ? video : null;
  }, []);

  // video2ascii drives its canvas from a requestAnimationFrame loop that is
  // (re)started exclusively on the video element's `play` event. If that
  // scheduled frame is ever dropped while the video is already playing
  // (an effect re-run after a prop change), no new `play` event fires to
  // restart it and the canvas freezes. Bouncing through pause/play forces a
  // fresh `play` event. Only call this once the video has data.
  const bouncePlay = useCallback(
    (video: HTMLVideoElement) => {
      if (video.error) {
        return;
      }
      if (!video.paused && !video.ended) {
        video.pause();
      }
      if (video.ended) {
        video.currentTime = 0;
      }
      void video.play().catch(() => {
        // Aborted play() races are retried by the fallback timeout below.
      });
    },
    []
  );

  const handleCanPlay = useCallback(() => {
    const video = queryVideo();
    if (video) {
      bouncePlay(video);
    }
  }, [bouncePlay, queryVideo]);

  const waitForDataThenPlay = useCallback(
    (video: HTMLVideoElement) => {
      video.removeEventListener('canplay', handleCanPlay);
      video.addEventListener('canplay', handleCanPlay, { once: true });
    },
    [handleCanPlay]
  );

  const ensurePlayback = useCallback(() => {
    const video = queryVideo();
    if (!video) {
      return;
    }

    // After an Astro view-transition swap, the swapped-in <video> never runs
    // resource selection (NETWORK_NO_SOURCE) — and a previous failed play()
    // latches an error on the element. Calling play() in either state
    // rejects with NotSupportedError and keeps the canvas blank forever, so
    // reset with load() first and play once data arrives.
    if (video.error || video.networkState === NETWORK_NO_SOURCE) {
      waitForDataThenPlay(video);
      video.load();
      return;
    }

    if (video.readyState >= 2) {
      bouncePlay(video);
      return;
    }

    waitForDataThenPlay(video);
  }, [bouncePlay, queryVideo, waitForDataThenPlay]);

  // Top up playback without disturbing a healthy loop: recover errored or
  // unloaded videos, and play paused ones. Never bounces on its own.
  const topUpPlayback = useCallback(() => {
    const video = queryVideo();
    if (!video) {
      return;
    }
    if (video.error || video.networkState === NETWORK_NO_SOURCE) {
      ensurePlayback();
      return;
    }
    if (video.paused || video.ended) {
      if (video.ended) {
        video.currentTime = 0;
      }
      void video.play().catch(() => undefined);
    }
  }, [ensurePlayback, queryVideo]);

  // Runs on fresh mount (every return to `/` via the ClientRouter creates a
  // brand-new island) and whenever the color mode changes the `highlight`
  // prop (which recreates the renderer's internals and drops its animation
  // loop while the video keeps playing).
  useEffect(() => {
    ensurePlayback();

    // Fallback: if play() raced the navigation and was aborted, retry once
    // the page has settled.
    const retryId = window.setTimeout(topUpPlayback, 1200);

    return () => {
      window.clearTimeout(retryId);
    };
  }, [ensurePlayback, topUpPlayback, activeColorMode]);

  useEffect(() => {
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
      // No remount here: returning to `/` already mounts a fresh island
      // (whose effect above starts playback). Remounting again would tear
      // down the initializing video mid-flight.
      topUpPlayback();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && window.location.pathname === '/') {
        topUpPlayback();
      }
    };

    syncFromDom();

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
  }, [queryVideo, topUpPlayback]);

  return (
    <div ref={rootRef}>
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
        highlight={colorModeHighlight[activeColorMode]}
      />
    </div>
  );
}
