import { useEffect, useState } from 'react';
import type { HDSModel } from 'hds-lib';
import { ensureModel, loadEventTypeSources, type EventTypeSource } from './services/hdsLibService';
import { Tabs } from './components/Tabs';
import { ItemsTab } from './components/ItemsTab';
import { StreamsTab } from './components/StreamsTab';
import { EventTypesTab } from './components/EventTypesTab';
import { FilesTab } from './components/FilesTab';

type TabId = 'items' | 'streams' | 'eventTypes' | 'files';

export default function App () {
  const [model, setModel] = useState<HDSModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('items');
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [eventTypeSources, setEventTypeSources] = useState<Map<string, EventTypeSource>>(new Map());

  useEffect(() => {
    ensureModel()
      .then(setModel)
      .catch((e: Error) => setError(e.message));
    loadEventTypeSources()
      .then(setEventTypeSources)
      .catch(() => { /* soft-fail — no pills */ });
  }, []);

  if (error) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>HDS Data Model Browser</h1>
        <div className='text-destructive'>Failed to load model: {error}</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>HDS Data Model Browser</h1>
        <div className='text-muted-foreground'>Loading model…</div>
      </div>
    );
  }

  const eventTypesCount = Object.keys(model.modelData.eventTypes?.types ?? {}).length;

  function openItem (key: string) {
    setSelectedItemKey(key);
    setTab('items');
  }
  function openStream (id: string) {
    setSelectedStreamId(id);
    setTab('streams');
  }
  function openEventType (et: string) {
    setSelectedEventType(et);
    setTab('eventTypes');
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b border-border px-6 py-3 bg-card flex items-center gap-4'>
        <a href='https://www.healthdatasafe.org' target='_blank' rel='noreferrer' className='shrink-0'>
          {/* Light + dark logos; CSS hides the wrong one based on the active palette. */}
          <img src='./hds-logo.svg' alt='HDS' className='h-10 logo-light' />
          <img src='./hds-logo-white.svg' alt='HDS' className='h-10 logo-dark' />
        </a>
        <div className='min-w-0'>
          <h1 className='text-xl font-bold leading-tight'>HDS — Data Model</h1>
          <div className='text-xs text-muted-foreground truncate'>
            {model.modelUrl} — {model.itemsDefs.getAll().length} items, {model.modelData.streams?.length ?? 0} root streams, {eventTypesCount} eventTypes
          </div>
        </div>
      </header>
      <Tabs<TabId>
        tabs={[
          { id: 'items', label: 'Items' },
          { id: 'streams', label: 'Streams' },
          { id: 'eventTypes', label: 'Event Types' },
          { id: 'files', label: 'Files' }
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'items' && (
        <ItemsTab
          model={model}
          selectedKey={selectedItemKey}
          onSelectKey={setSelectedItemKey}
          onSelectStream={openStream}
          onSelectEventType={openEventType}
          eventTypeSources={eventTypeSources}
        />
      )}
      {tab === 'streams' && (
        <StreamsTab
          model={model}
          selectedId={selectedStreamId}
          onSelectId={setSelectedStreamId}
          onOpenItem={openItem}
        />
      )}
      {tab === 'eventTypes' && (
        <EventTypesTab
          model={model}
          selectedKey={selectedEventType}
          onSelectKey={setSelectedEventType}
          onOpenItem={openItem}
          eventTypeSources={eventTypeSources}
        />
      )}
      {tab === 'files' && (
        <FilesTab model={model} />
      )}
    </div>
  );
}
