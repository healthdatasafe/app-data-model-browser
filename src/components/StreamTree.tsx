import { useState } from 'react';

interface StreamNode {
  id: string;
  name?: string;
  parentId?: string | null;
  children?: StreamNode[];
}

interface StreamTreeProps {
  streams: StreamNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StreamTree ({ streams, selectedId, onSelect }: StreamTreeProps) {
  return (
    <ul className='text-sm'>
      {streams.map(s => (
        <StreamNodeRow key={s.id} node={s} depth={0} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}

interface RowProps {
  node: StreamNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function StreamNodeRow ({ node, depth, selectedId, onSelect }: RowProps) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = !!node.children?.length;
  const isSelected = node.id === selectedId;
  return (
    <li>
      <div
        className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer ${
          isSelected ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'
        }`}
        style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          className='w-4 text-muted-foreground'
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (open ? '\u25BE' : '\u25B8') : '\u00B7'}
        </button>
        <button onClick={() => onSelect(node.id)} className='flex-1 text-left'>
          <span>{node.name}</span>
          <span className='ml-2 font-mono text-xs text-muted-foreground'>{node.id}</span>
        </button>
      </div>
      {open && hasChildren && (
        <ul>
          {node.children!.map(c => (
            <StreamNodeRow key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}
