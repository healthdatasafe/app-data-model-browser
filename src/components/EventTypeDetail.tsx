import { useMemo, useState } from 'react';
import type { HDSModel } from 'hds-lib';
import { RawJson } from './RawJson';

interface EventTypeDetailProps {
  model: HDSModel;
  eventType: string | null;
  onOpenItem?: (key: string) => void;
}

function localized (data: any, lang: string): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') return data[lang] ?? data.en ?? Object.values(data)[0] ?? '';
  return '';
}

function collectLanguages (extras: any): string[] {
  const langs = new Set<string>();
  if (extras?.name && typeof extras.name === 'object') {
    for (const k of Object.keys(extras.name)) langs.add(k);
  }
  return Array.from(langs).sort();
}

export function EventTypeDetail ({ model, eventType, onOpenItem }: EventTypeDetailProps) {
  const [lang, setLang] = useState('en');

  // All items that reference this eventType — computed once per (model, et).
  const itemsUsingThis = useMemo(() => {
    if (!eventType) return [] as Array<{ key: string; label: string }>;
    const out: Array<{ key: string; label: string }> = [];
    for (const def of model.itemsDefs.getAll()) {
      try {
        if (def.eventTypes.includes(eventType)) {
          out.push({ key: def.key, label: def.label });
        }
      } catch { /* skip malformed */ }
    }
    return out.sort((a, b) => a.key.localeCompare(b.key));
  }, [model, eventType]);

  if (!eventType) {
    return <div className='p-6 text-sm text-muted-foreground'>Select an eventType from the list to see its details.</div>;
  }

  const def = model.eventTypes.getEventTypeDefinition(eventType);
  const extras = model.eventTypes.getEventTypeExtra(eventType);
  if (!def) {
    return <div className='p-6 text-sm text-destructive'>EventType "{eventType}" not found.</div>;
  }

  const languages = collectLanguages(extras);
  const symbol = extras?.symbol;

  return (
    <div className='p-6 overflow-y-auto'>
      <div className='flex items-start justify-between gap-4 mb-3'>
        <div className='min-w-0'>
          <h2 className='text-xl font-bold font-mono break-all'>{eventType}</h2>
          {extras?.name && (
            <div className='text-sm text-muted-foreground mt-0.5'>{localized(extras.name, lang)}</div>
          )}
        </div>
        {languages.length > 1 && (
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className='rounded border border-border bg-background text-foreground px-2 py-1 text-sm shrink-0'
          >
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      {symbol && (
        <Section title='Symbol'>
          <span className='text-2xl font-mono'>{symbol}</span>
        </Section>
      )}

      <Section title='Description'>
        <div className='text-sm text-foreground/80'>{def.description || <span className='italic text-muted-foreground'>(none)</span>}</div>
      </Section>

      <Section title='Type'>
        <span className='font-mono text-sm'>{def.type ?? <span className='italic text-muted-foreground'>(none)</span>}</span>
      </Section>

      {def.enum && Array.isArray(def.enum) && (
        <Section title={`Enum values (${def.enum.length})`}>
          <ul className='text-sm font-mono max-h-64 overflow-auto'>
            {def.enum.map((v: any) => (
              <li key={String(v)} className='py-0.5'>{String(v)}</li>
            ))}
          </ul>
        </Section>
      )}

      {(def.minimum != null || def.maximum != null) && (
        <Section title='Range'>
          <span className='text-sm font-mono'>
            {def.minimum != null ? def.minimum : '-∞'} … {def.maximum != null ? def.maximum : '+∞'}
          </span>
        </Section>
      )}

      {def.properties && (
        <Section title='Object properties'>
          <ul className='text-sm font-mono'>
            {Object.entries(def.properties).map(([k, v]: [string, any]) => (
              <li key={k} className='py-0.5'>
                <span>{k}</span>
                {v?.type && <span className='ml-2 text-muted-foreground'>: {v.type}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Items using this eventType (${itemsUsingThis.length})`}>
        {itemsUsingThis.length === 0 && <div className='text-sm italic text-muted-foreground'>(none)</div>}
        <ul className='text-sm'>
          {itemsUsingThis.map(it => (
            <li key={it.key} className='py-0.5'>
              <button
                onClick={() => onOpenItem?.(it.key)}
                className='font-mono text-primary hover:underline'
              >
                {it.key}
              </button>
              <span className='ml-2 text-foreground/80'>{it.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      <RawJson value={{ definition: def, extras }} label='Raw JSON' />
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
