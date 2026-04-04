import type { MouseEvent, TouchEvent } from 'react';

interface SplitHandleProps {
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  isCollapsed?: boolean;
}

export function SplitHandle({ onMouseDown, onTouchStart, isCollapsed = false }: SplitHandleProps) {
  return (
    <div
      className={`split-handle ${isCollapsed ? 'is-collapsed' : ''}`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="separator"
      aria-orientation="vertical"
      aria-hidden={isCollapsed}
    >
      <span aria-hidden="true" />
    </div>
  );
}
