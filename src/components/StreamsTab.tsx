import { useMemo } from 'react';
import type { HDSModel } from 'hds-lib';
import { StreamTree } from './StreamTree';
import { RawJson } from './RawJson';
import { SplitPane } from './SplitPane';

interface StreamsTabProps {
  model: HDSModel;
  selectedId: string | null;
  onSelectId: (id: string) => void;
  onOpenItem: (key: string) => void;
}

export function StreamsTab ({ model, selectedId, onSelectId, onOpenItem }: StreamsTabProps) {
  const streams = model.modelData.streams ?? [];

  // Items in the selected stream
  const items = useMemo(() => {
    if (!selectedId) return [] as Array<{ key: string; label: string }>;
    const all = model.itemsDefs.getAll();
    return all
      .filter((d: any) => d.data.streamId === selectedId)
      .map((d: any) => ({ key: d.key, label: d.label }));
  }, [model, selectedId]);

  const streamData = selectedId ? findStream(streams, selectedId) : null;

  return (
    <SplitPane
      storageKey='streams'
      defaultWidth={320}
      minWidth={220}
      maxWidth={640}
      className='p-4'
      left={
        <div className='pr-2 border border-border bg-card text-card-foreground rounded-lg p-2 overflow-y-auto max-h-[36rem]'>
          <StreamTree streams={streams} selectedId={selectedId} onSelect={onSelectId} />
        </div>
      }
      right={
        <div className='ml-2 border border-border bg-card text-card-foreground rounded-lg p-4 min-h-[24rem] overflow-y-auto'>
          {!selectedId && <div className='text-sm text-muted-foreground'>Select a stream from the tree.</div>}
          {streamData && (
            <>
              <h2 className='text-xl font-bold'>{streamData.name}</h2>
              <div className='font-mono text-sm text-muted-foreground'>{streamData.id}</div>
              {streamData.parentId && (
                <div className='text-xs text-muted-foreground mt-1'>parent: <button onClick={() => onSelectId(streamData.parentId!)} className='font-mono text-primary hover:underline'>{streamData.parentId}</button></div>
              )}
              <div className='mt-4'>
                <div className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1'>
                  Items in this stream ({items.length})
                </div>
                {items.length === 0 && <div className='text-sm text-muted-foreground italic'>(none)</div>}
                <ul className='text-sm'>
                  {items.map(it => (
                    <li key={it.key} className='py-0.5'>
                      <button
                        onClick={() => onOpenItem(it.key)}
                        className='font-mono text-primary hover:underline'
                      >
                        {it.key}
                      </button>
                      <span className='ml-2 text-foreground/80'>{it.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <RawJson value={streamData} label='Raw stream node' />
            </>
          )}
        </div>
      }
    />
  );
}

function findStream (streams: any[], id: string): any | null {
  for (const s of streams) {
    if (s.id === id) return s;
    if (s.children) {
      const found = findStream(s.children, id);
      if (found) return found;
    }
  }
  return null;
}
