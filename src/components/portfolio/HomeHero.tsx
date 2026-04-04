import { Video2Ascii } from 'video2ascii';

export function HomeHero() {
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
    />
  );
}
