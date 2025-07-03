'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskPriorityFilterDTO } from '../page';

interface PriorityFilterProps {
  filter: TaskPriorityFilterDTO;
  onFilterChange: (filter: TaskPriorityFilterDTO) => void;
}

export default function PriorityFilter({ filter, onFilterChange }: PriorityFilterProps) {
  const [name, setName] = useState(filter.name || '');
  const [color, setColor] = useState(filter.color || '');
  const [createdFrom, setCreatedFrom] = useState(filter.createdFrom || '');
  const [createdTo, setCreatedTo] = useState(filter.createdTo || '');

  useEffect(() => {
    setName(filter.name || '');
    setColor(filter.color || '');
    setCreatedFrom(filter.createdFrom || '');
    setCreatedTo(filter.createdTo || '');
  }, [filter]);

  const handleApply = () => {
    onFilterChange({
      name: name || undefined,
      color: color || undefined,
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
    });
  };

  const handleReset = () => {
    setName('');
    setColor('');
    setCreatedFrom('');
    setCreatedTo('');
    // onFilterChange({});
  };

  return (
    <div className="flex gap-3 items-end bg-white rounded-lg shadow p-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Priority name" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
        <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#hex or color" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Created From</label>
        <Input type="date" value={createdFrom} onChange={e => setCreatedFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Created To</label>
        <Input type="date" value={createdTo} onChange={e => setCreatedTo(e.target.value)} />
      </div>
      <Button type="button" size="sm" onClick={handleApply}>Filter</Button>
      <Button type="button" size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
    </div>
  );
}