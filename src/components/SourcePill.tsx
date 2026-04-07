import type { EventTypeSource } from '../services/hdsLibService';

interface SourcePillProps {
  source: EventTypeSource | undefined;
  className?: string;
}

/** Small uppercase pill marking the origin of an eventType (hds vs pryv-legacy). */
export function SourcePill ({ source, className = '' }: SourcePillProps) {
  if (!source) return null;
  const styles = source === 'hds'
    ? 'bg-primary/15 text-primary'
    : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide ${styles} ${className}`}
      title={source === 'hds' ? 'HDS event type' : 'Legacy Pryv event type'}
    >
      {source}
    </span>
  );
}
