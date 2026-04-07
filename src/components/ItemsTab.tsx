import { ItemSearchPicker } from 'hds-forms-js';
import type { HDSModel } from 'hds-lib';
import { ItemDetail } from './ItemDetail';

interface ItemsTabProps {
  model: HDSModel;
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  onSelectStream?: (streamId: string) => void;
}

export function ItemsTab ({ model, selectedKey, onSelectKey, onSelectStream }: ItemsTabProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-4 p-4'>
      <div>
        <ItemSearchPicker
          selectedKey={selectedKey ?? undefined}
          onSelect={onSelectKey}
          placeholder='Search items…'
        />
        <div className='mt-2 text-xs text-gray-500'>{model.itemsDefs.getAll().length} items</div>
      </div>
      <div className='border border-gray-200 dark:border-gray-700 rounded-lg min-h-[24rem]'>
        <ItemDetail model={model} itemKey={selectedKey} onSelectStream={onSelectStream} />
      </div>
    </div>
  );
}
