import { ItemSearchPicker } from 'hds-forms-js';
import type { HDSModel } from 'hds-lib';
import { ItemDetail } from './ItemDetail';
import { SplitPane } from './SplitPane';
import type { EventTypeSource } from '../services/hdsLibService';

interface ItemsTabProps {
  model: HDSModel;
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  onSelectStream?: (streamId: string) => void;
  onSelectEventType?: (eventType: string) => void;
  eventTypeSources: Map<string, EventTypeSource>;
}

export function ItemsTab ({ model, selectedKey, onSelectKey, onSelectStream, onSelectEventType, eventTypeSources }: ItemsTabProps) {
  return (
    <SplitPane
      storageKey='items'
      defaultWidth={320}
      minWidth={220}
      maxWidth={640}
      className='p-4'
      left={
        <div className='pr-2'>
          <ItemSearchPicker
            selectedKey={selectedKey ?? undefined}
            onSelect={onSelectKey}
            placeholder='Search items…'
          />
          <div className='mt-2 text-xs text-muted-foreground'>{model.itemsDefs.getAll().length} items</div>
        </div>
      }
      right={
        <div className='ml-2 border border-border bg-card text-card-foreground rounded-lg min-h-[24rem]'>
          <ItemDetail model={model} itemKey={selectedKey} onSelectStream={onSelectStream} onSelectEventType={onSelectEventType} eventTypeSources={eventTypeSources} />
        </div>
      }
    />
  );
}
