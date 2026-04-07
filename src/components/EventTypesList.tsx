import { useMemo, useState } from 'react';
import type { EventTypeSource } from '../services/hdsLibService';
import { SourcePill } from './SourcePill';

interface EventTypesListProps {
  eventTypes: string[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  sources: Map<string, EventTypeSource>;
}

/** Group key — everything before the first '/'. Falls back to '(other)'. */
function groupOf (key: string): string {
  const i = key.indexOf('/');
  return i > 0 ? key.slice(0, i) : '(other)';
}

/**
 * Searchable, grouped list of eventType keys. Same shape as the items list
 * but built locally because we don't need the full ItemSearchPicker's
 * model-aware features.
 */
export function EventTypesList ({ eventTypes, selectedKey, onSelect, sources }: EventTypesListProps) {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const out: Record<string, string[]> = {};
    const q = search.toLowerCase();
    for (const et of eventTypes) {
      if (q && !et.toLowerCase().includes(q)) continue;
      const g = groupOf(et);
      if (!out[g]) out[g] = [];
      out[g].push(et);
    }
    for (const g of Object.keys(out)) out[g].sort();
    return out;
  }, [eventTypes, search]);

  const sortedGroups = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  function toggle (g: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  return (
    <div className='border border-border bg-card text-card-foreground rounded-lg overflow-y-auto max-h-[36rem]'>
      <div className='sticky top-0 z-10 border-b border-border bg-card p-2'>
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search eventTypes…'
          className='w-full rounded border border-border bg-background text-foreground px-2 py-1 text-sm'
        />
      </div>
      <div className='p-1'>
        {sortedGroups.length === 0 && (
          <div className='px-3 py-2 text-sm text-muted-foreground'>No eventTypes match</div>
        )}
        {sortedGroups.map(g => {
          const isOpen = expandedGroups.has(g) || !!search;
          return (
            <div key={g} className='mb-1'>
              <button
                onClick={() => toggle(g)}
                className='flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground'
              >
                <span>{isOpen ? '\u25BE' : '\u25B8'} {g}</span>
                <span className='ml-2 rounded-full bg-muted text-muted-foreground px-1.5 text-xs'>
                  {grouped[g].length}
                </span>
              </button>
              {isOpen && (
                <div className='ml-2'>
                  {grouped[g].map(et => {
                    const isSelected = et === selectedKey;
                    return (
                      <button
                        key={et}
                        onClick={() => onSelect(et)}
                        className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-xs font-mono ${
                          isSelected
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-foreground/80 hover:bg-muted'
                        }`}
                      >
                        <span className='truncate'>{et.includes('/') ? et.slice(et.indexOf('/') + 1) : et}</span>
                        <SourcePill source={sources.get(et)} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
