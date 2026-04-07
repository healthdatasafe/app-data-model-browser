import { useCallback, useEffect, useRef, useState } from 'react';

interface SplitPaneProps {
  /** Stable id used to persist the left-pane width in localStorage. */
  storageKey: string;
  /** Initial / fallback width in px. */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

/**
 * Two-pane horizontal split with a draggable vertical handle.
 * The left pane has a controlled width (px); the right pane fills the rest.
 * Width persists in localStorage under `splitpane:<storageKey>`.
 *
 * Layout: flex row at all viewport widths (this is a desktop-first developer tool).
 */
export function SplitPane ({
  storageKey,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  left,
  right,
  className = ''
}: SplitPaneProps) {
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem('splitpane:' + storageKey);
    const n = saved ? parseInt(saved, 10) : NaN;
    return Number.isFinite(n) ? clamp(n, minWidth, maxWidth) : defaultWidth;
  });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const next = clamp(e.clientX - rect.left, minWidth, maxWidth);
    setWidth(next);
  }, [dragging, minWidth, maxWidth]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) return;
    localStorage.setItem('splitpane:' + storageKey, String(width));
  }, [width, dragging, storageKey]);

  return (
    <div ref={containerRef} className={`flex flex-row ${className}`}>
      <div style={{ width, flex: '0 0 auto' }}>
        {left}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`flex items-center justify-center w-2 cursor-col-resize select-none shrink-0 group ${
          dragging ? 'bg-primary/20' : 'hover:bg-accent'
        }`}
        role='separator'
        aria-orientation='vertical'
        aria-label='Resize side panel'
      >
        <div className={`h-8 w-0.5 rounded ${dragging ? 'bg-primary' : 'bg-border group-hover:bg-primary'}`} />
      </div>
      <div className='flex-1 min-w-0'>{right}</div>
    </div>
  );
}

function clamp (v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
