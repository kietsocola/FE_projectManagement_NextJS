'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Priority } from '../page';

const COLOR_PALETTE = [
    '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#4ade80', '#f97316', '#a3e635', '#f43f5e'
];

interface PriorityFormProps {
    priority: Priority | null;
    onSave: (priority: Omit<Priority, 'id'>, id?: string) => void;
    onCancel: () => void;
}

export default function PriorityForm({ priority, onSave, onCancel }: PriorityFormProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);
    const [hex, setHex] = useState('');
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(1);

    useEffect(() => {
        if (priority) {
            setName(priority.name);
            setColor(priority.color || COLOR_PALETTE[0]);
            setHex('');
            setDescription(priority.description || '');
            setSortOrder(priority.sortOrder ?? 1);
        } else {
            setName('');
            setColor(COLOR_PALETTE[0]);
            setHex('');
            setDescription('');
            setSortOrder(1);
        }
    }, [priority]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            {
                name,
                color: hex.trim() ? hex : color,
                description,
                sortOrder,
            },
            priority?.id
        );
    };

    if (!priority) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-gray-50 p-4 rounded">
            <div className="flex gap-2 items-center">
                <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Priority name"
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
            <Input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
                placeholder="Sort order"
                className="w-32"
                min={1}
            />
            <div className="flex gap-2">
                <Button className='cursor-pointer' type="submit" size="sm">{priority?.id ? 'Update' : 'Create'}</Button>
                <Button className='cursor-pointer' type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
}