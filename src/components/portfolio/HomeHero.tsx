import { useEffect, useState } from 'react';
import { Video2Ascii } from 'video2ascii';

type ColorMode = 'dark' | 'light' | 'summer';

const colorModeHighlight = {
  dark: 0,
  light: 100,
  summer: 100
};

const isColorMode = (value: string | null | undefined): value is ColorMode =>
  value === 'dark' || value === 'light' || value === 'summer';

export function HomeHero({ colorMode }: { colorMode: ColorMode }) {
  const [activeColorMode, setActiveColorMode] = useState<ColorMode>(colorMode);

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

    syncFromDom();
    window.addEventListener('portfolio-color-mode-change', handleColorModeChange as EventListener);

    return () => {
      window.removeEventListener(
        'portfolio-color-mode-change',
        handleColorModeChange as EventListener
      );
    };
  }, []);

  return (
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
  );
}
