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
        className='text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
      >
        {open ? '\u25BE' : '\u25B8'} {label}
      </button>
      {open && (
        <pre className='mt-1 max-h-96 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}
