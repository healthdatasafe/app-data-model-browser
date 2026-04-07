import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamTree } from '../src/components/StreamTree';

const sample = [
  {
    id: 'body',
    name: 'Body',
    parentId: null,
    children: [
      { id: 'body-weight', name: 'Body Weight', parentId: 'body' }
    ]
  }
];

describe('StreamTree', () => {
  it('renders root nodes with name and id', () => {
    render(<StreamTree streams={sample} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('expands by default at depth 0 and shows children', () => {
    render(<StreamTree streams={sample} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('Body Weight')).toBeInTheDocument();
  });

  it('calls onSelect with the node id when clicked', () => {
    const onSelect = vi.fn();
    render(<StreamTree streams={sample} selectedId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Body Weight'));
    expect(onSelect).toHaveBeenCalledWith('body-weight');
  });
});
