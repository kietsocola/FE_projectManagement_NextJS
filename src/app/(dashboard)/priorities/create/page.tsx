'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const COLOR_PALETTE = [
    '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#4ade80', '#f97316', '#a3e635', '#f43f5e'
];

export default function CreatePriorityPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);
    const [hex, setHex] = useState('');
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setLoading(true);
            await apiClient.post('/priority', {
                name,
                color: hex.trim() ? hex : color,
                description,
                sortOrder: 1,
            });
            setLoading(false);
            toast.success("Created priority!")
            router.push('/priorities');
        } catch {
            toast.error("Fail to create priority!")
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Add New Priority</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex gap-2 flex-wrap items-center">
                        {COLOR_PALETTE.map(c => (
                            <button
                                type="button"
                                key={c}
                                className={`w-6 h-6 rounded-full border-2 ${color === c && !hex ? 'border-blue-500' : 'border-gray-300'}`}
                                style={{ background: c }}
                                onClick={() => { setColor(c); setHex(''); }}
                                disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <Input
                        type="number"
                        value={sortOrder}
                        onChange={e => setSortOrder(Number(e.target.value))}
                        min={1}
                        disabled={loading}
                    />
                </div> */}
                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>Create</Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/priorities')} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}