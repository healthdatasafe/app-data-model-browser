import { useEffect, useState } from 'react';
import type { HDSModel } from 'hds-lib';
import { ensureModel } from './services/hdsLibService';
import { Tabs } from './components/Tabs';
import { ItemsTab } from './components/ItemsTab';
import { StreamsTab } from './components/StreamsTab';

type TabId = 'items' | 'streams';

export default function App () {
  const [model, setModel] = useState<HDSModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('items');
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  useEffect(() => {
    ensureModel()
      .then(setModel)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>HDS Data Model Browser</h1>
        <div className='text-red-600'>Failed to load model: {error}</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>HDS Data Model Browser</h1>
        <div>Loading model…</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <header className='border-b border-gray-200 dark:border-gray-700 px-6 py-3'>
        <h1 className='text-xl font-bold'>HDS Data Model Browser</h1>
        <div className='text-xs text-gray-500'>
          {model.modelUrl} — {model.itemsDefs.getAll().length} items, {model.modelData.streams?.length ?? 0} root streams
        </div>
      </header>
      <Tabs<TabId>
        tabs={[
          { id: 'items', label: 'Items' },
          { id: 'streams', label: 'Streams' }
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'items' && (
        <ItemsTab
          model={model}
          selectedKey={selectedItemKey}
          onSelectKey={setSelectedItemKey}
          onSelectStream={(streamId) => {
            setSelectedStreamId(streamId);
            setTab('streams');
          }}
        />
      )}
      {tab === 'streams' && (
        <StreamsTab
          model={model}
          selectedId={selectedStreamId}
          onSelectId={setSelectedStreamId}
          onOpenItem={(key) => {
            setSelectedItemKey(key);
            setTab('items');
          }}
        />
      )}
    </div>
  );
}
