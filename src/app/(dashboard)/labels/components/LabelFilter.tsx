'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LabelFilterDTO } from '../page';

interface LabelFilterProps {
  filter: LabelFilterDTO;
  onFilterChange: (filter: LabelFilterDTO) => void;
}

export default function LabelFilter({ filter, onFilterChange }: LabelFilterProps) {
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
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:items-end bg-white p-4 rounded-lg shadow">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Label name" />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
        <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#hex or color" />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">Created From</label>
        <Input type="date" value={createdFrom} onChange={e => setCreatedFrom(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">Created To</label>
        <Input type="date" value={createdTo} onChange={e => setCreatedTo(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button className='cursor-pointer' type="button" size="sm" onClick={handleApply}>Filter</Button>
        <Button className='cursor-pointer' type="button" size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
}