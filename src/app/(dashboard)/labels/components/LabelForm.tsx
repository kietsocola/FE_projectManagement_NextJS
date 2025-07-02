'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '../page';

const COLOR_PALETTE = [
  '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#4ade80', '#f97316', '#a3e635', '#f43f5e'
];

interface LabelFormProps {
  label: Label | null;
  onSave: (label: Omit<Label, 'id'>, id?: string) => void;
  onCancel: () => void;
}

export default function LabelForm({ label, onSave, onCancel }: LabelFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [hex, setHex] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (label) {
      setName(label.name);
      setColor(label.color || COLOR_PALETTE[0]);
      setHex('');
      setDescription(label.description || '');
    } else {
      setName('');
      setColor(COLOR_PALETTE[0]);
      setHex('');
      setDescription('');
    }
  }, [label]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name,
        color: hex.trim() ? hex : color,
        description,
      },
      label?.id
    );
  };

  if (!label) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-gray-50 p-4 rounded">
      <div className="flex gap-2 items-center">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Label name"
          required
          className="w-48"
        />
        <div className="flex gap-1">
          {COLOR_PALETTE.map(c => (
            <button
              type="button"
              key={c}
              className={`w-6 h-6 rounded-full border-2 ${color === c && !hex ? 'border-blue-500' : 'border-gray-300'}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setHex(''); }}
            />
          ))}
          <Input
            type="text"
            value={hex}
            onChange={e => setHex(e.target.value)}
            placeholder="#hex"
            className="w-20 h-8 ml-2"
            maxLength={7}
            style={{ fontSize: 13 }}
          />
        </div>
      </div>
      <Input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="w-64"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">{label?.id ? 'Update' : 'Create'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}