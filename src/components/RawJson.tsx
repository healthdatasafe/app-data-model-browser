import { useState } from 'react';

interface RawJsonProps {
  value: unknown;
  label?: string;
  defaultOpen?: boolean;
}

export function RawJson ({ value, label = 'Raw JSON', defaultOpen = false }: RawJsonProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='mt-2'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='text-xs text-muted-foreground hover:text-foreground'
      >
        {open ? '\u25BE' : '\u25B8'} {label}
      </button>
      {open && (
        <pre className='mt-1 max-h-96 overflow-auto rounded border border-border bg-muted p-2 text-xs text-foreground'>
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}
