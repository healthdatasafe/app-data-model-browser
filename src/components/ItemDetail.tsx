import { useState } from 'react';
import type { HDSModel } from 'hds-lib';
import { repeatableLabel } from 'hds-forms-js';
import { RawJson } from './RawJson';

interface ItemDetailProps {
  model: HDSModel;
  itemKey: string | null;
  onSelectStream?: (streamId: string) => void;
  onSelectEventType?: (eventType: string) => void;
}

/** Pull every language present across the item's localized fields. */
function collectLanguages (data: any): string[] {
  const langs = new Set<string>();
  for (const field of ['label', 'description']) {
    const v = data?.[field];
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) langs.add(k);
    }
  }
  return Array.from(langs).sort();
}

function localized (data: any, field: string, lang: string): string {
  const v = data?.[field];
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return v[lang] ?? v.en ?? Object.values(v)[0] ?? '';
  return '';
}

export function ItemDetail ({ model, itemKey, onSelectStream, onSelectEventType }: ItemDetailProps) {
  const [lang, setLang] = useState('en');

  if (!itemKey) {
    return (
      <div className='p-6 text-sm text-muted-foreground'>Select an item from the list to see its details.</div>
    );
  }

  let itemDef;
  try {
    itemDef = model.itemsDefs.forKey(itemKey);
  } catch {
    return <div className='p-6 text-sm text-destructive'>Item "{itemKey}" not found.</div>;
  }
  const data = itemDef.data;
  const languages = collectLanguages(data);
  const eventTypes: string[] = itemDef.eventTypes;

  return (
    <div className='p-6 overflow-y-auto'>
      <div className='flex items-start justify-between gap-4 mb-3'>
        <div>
          <h2 className='text-xl font-bold font-mono'>{itemDef.key}</h2>
          <div className='text-sm text-muted-foreground mt-0.5'>v{data.version}</div>
        </div>
        {languages.length > 1 && (
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className='rounded border border-border bg-background text-foreground px-2 py-1 text-sm'
          >
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      <Section title='Label'>
        <div className='text-base'>{localized(data, 'label', lang)}</div>
      </Section>

      <Section title='Description'>
        <div className='text-sm text-foreground/80'>{localized(data, 'description', lang) || <span className='italic text-muted-foreground'>(none)</span>}</div>
      </Section>

      <Section title='Stream'>
        <button
          onClick={() => onSelectStream?.(data.streamId)}
          className='font-mono text-sm text-primary hover:underline'
        >
          {data.streamId}
        </button>
      </Section>

      <Section title='Event types'>
        <div className='flex flex-wrap gap-1'>
          {eventTypes.map(et => (
            onSelectEventType
              ? (
                <button
                  key={et}
                  onClick={() => onSelectEventType(et)}
                  className='rounded bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground px-2 py-0.5 font-mono text-xs'
                >
                  {et}
                </button>
                )
              : (
                <span key={et} className='rounded bg-muted text-muted-foreground px-2 py-0.5 font-mono text-xs'>{et}</span>
                )
          ))}
        </div>
      </Section>

      <Section title='Type'>
        <span className='font-mono text-sm'>{data.type}</span>
      </Section>

      <Section title='Repeatable'>
        <span className='text-sm'>{repeatableLabel(itemDef.repeatable)} <span className='ml-2 font-mono text-xs text-muted-foreground'>({itemDef.repeatable})</span></span>
      </Section>

      {itemDef.reminder && (
        <Section title='Reminder'>
          <pre className='text-xs bg-muted text-foreground rounded p-2 overflow-auto'>{JSON.stringify(itemDef.reminder, null, 2)}</pre>
        </Section>
      )}

      {data.devNotes && (
        <Section title='Dev notes'>
          <div className='whitespace-pre-wrap text-xs italic text-muted-foreground'>{data.devNotes}</div>
        </Section>
      )}

      {data.options && Array.isArray(data.options) && (
        <Section title='Options'>
          <ul className='text-sm'>
            {data.options.map((opt: any) => (
              <li key={String(opt.value)} className='font-mono'>
                {String(opt.value)}{opt.label && <span className='ml-2 font-sans not-italic text-muted-foreground'>{localized(opt, 'label', lang)}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.variations?.eventType?.options && (
        <Section title='Variations (event types)'>
          <ul className='text-sm'>
            {data.variations.eventType.options.map((opt: any) => (
              <li key={opt.value} className='font-mono'>
                {opt.value}{opt.label && <span className='ml-2 font-sans not-italic text-muted-foreground'>{localized(opt, 'label', lang)}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <RawJson value={data} label='Raw JSON' />
    </div>
  );
}

function Section ({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mb-3'>
      <div className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5'>{title}</div>
      {children}
    </div>
  );
}
