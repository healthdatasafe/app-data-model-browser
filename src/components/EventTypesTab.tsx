import { useMemo } from 'react';
import type { HDSModel } from 'hds-lib';
import { EventTypesList } from './EventTypesList';
import { EventTypeDetail } from './EventTypeDetail';
import { SplitPane } from './SplitPane';

interface EventTypesTabProps {
  model: HDSModel;
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  onOpenItem?: (key: string) => void;
}

export function EventTypesTab ({ model, selectedKey, onSelectKey, onOpenItem }: EventTypesTabProps) {
  const eventTypes = useMemo(() => {
    const types = model.modelData.eventTypes?.types;
    return types ? Object.keys(types).sort() : [];
  }, [model]);

  return (
    <SplitPane
      storageKey='eventTypes'
      defaultWidth={320}
      minWidth={220}
      maxWidth={640}
      className='p-4'
      left={
        <div className='pr-2'>
          <EventTypesList
            eventTypes={eventTypes}
            selectedKey={selectedKey}
            onSelect={onSelectKey}
          />
          <div className='mt-2 text-xs text-muted-foreground'>{eventTypes.length} eventTypes</div>
        </div>
      }
      right={
        <div className='ml-2 border border-border bg-card text-card-foreground rounded-lg min-h-[24rem]'>
          <EventTypeDetail model={model} eventType={selectedKey} onOpenItem={onOpenItem} />
        </div>
      }
    />
  );
}
