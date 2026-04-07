import { useMemo } from 'react';
import type { HDSModel } from 'hds-lib';
import { StreamTree } from './StreamTree';
import { RawJson } from './RawJson';

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
    <div className='grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-4 p-4'>
      <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-2 overflow-y-auto max-h-[36rem]'>
        <StreamTree streams={streams} selectedId={selectedId} onSelect={onSelectId} />
      </div>
      <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[24rem] overflow-y-auto'>
        {!selectedId && <div className='text-sm text-gray-500'>Select a stream from the tree.</div>}
        {streamData && (
          <>
            <h2 className='text-xl font-bold'>{streamData.name}</h2>
            <div className='font-mono text-sm text-gray-500'>{streamData.id}</div>
            {streamData.parentId && (
              <div className='text-xs text-gray-500 mt-1'>parent: <button onClick={() => onSelectId(streamData.parentId!)} className='font-mono text-primary hover:underline'>{streamData.parentId}</button></div>
            )}
            <div className='mt-4'>
              <div className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'>
                Items in this stream ({items.length})
              </div>
              {items.length === 0 && <div className='text-sm text-gray-400 italic'>(none)</div>}
              <ul className='text-sm'>
                {items.map(it => (
                  <li key={it.key} className='py-0.5'>
                    <button
                      onClick={() => onOpenItem(it.key)}
                      className='font-mono text-primary hover:underline'
                    >
                      {it.key}
                    </button>
                    <span className='ml-2 text-gray-700 dark:text-gray-300'>{it.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <RawJson value={streamData} label='Raw stream node' />
          </>
        )}
      </div>
    </div>
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
