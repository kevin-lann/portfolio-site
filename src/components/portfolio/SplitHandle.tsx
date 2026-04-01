import type { MouseEvent, TouchEvent } from 'react';

interface SplitHandleProps {
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
}

export function SplitHandle({ onMouseDown, onTouchStart }: SplitHandleProps) {
  return (
    <div
      className="split-handle"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="separator"
      aria-orientation="vertical"
    >
      <span aria-hidden="true" />
    </div>
  );
}
