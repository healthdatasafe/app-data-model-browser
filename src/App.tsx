import { useEffect, useState } from 'react';
import type { HDSModel } from 'hds-lib';
import { ensureModel } from './services/hdsLibService';
import { Tabs } from './components/Tabs';
import { ItemsTab } from './components/ItemsTab';
import { StreamsTab } from './components/StreamsTab';
import { EventTypesTab } from './components/EventTypesTab';

type TabId = 'items' | 'streams' | 'eventTypes';

export default function App () {
  const [model, setModel] = useState<HDSModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('items');
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

  useEffect(() => {
    ensureModel()
      .then(setModel)
      .catch((e: Error) => setError(e.message));
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
      <header className='border-b border-border px-6 py-3 bg-card'>
        <h1 className='text-xl font-bold'>HDS Data Model Browser</h1>
        <div className='text-xs text-muted-foreground'>
          {model.modelUrl} — {model.itemsDefs.getAll().length} items, {model.modelData.streams?.length ?? 0} root streams, {eventTypesCount} eventTypes
        </div>
      </header>
      <Tabs<TabId>
        tabs={[
          { id: 'items', label: 'Items' },
          { id: 'streams', label: 'Streams' },
          { id: 'eventTypes', label: 'Event Types' }
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
        />
      )}
    </div>
  );
}
