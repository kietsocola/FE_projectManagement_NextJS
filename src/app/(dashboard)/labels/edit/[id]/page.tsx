'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const COLOR_PALETTE = [
    '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#4ade80', '#f97316', '#a3e635', '#f43f5e'
];

export default function EditLabelPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [name, setName] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);
    const [hex, setHex] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    // Fetch label info
    useEffect(() => {
        try {
            let timeout: NodeJS.Timeout;
            if (!id) return;
            setLoading(true);
            setShowSkeleton(true);
            apiClient.get(`/label/${id}`)
                .then(res => {
                    const label = res.data.data;
                    setName(label.name || '');
                    setColor(label.color || COLOR_PALETTE[0]);
                    setHex(label.color);
                    setDescription(label.description || '');
                })
                .finally(() => {
                    timeout = setTimeout(() => {
                        setShowSkeleton(false);
                        setLoading(false);
                    }, 600);
                });
            return () => clearTimeout(timeout);
        } catch {
            toast.error("Fail to load label");
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.put(`/label/${id}`, {
                name,
                color: hex.trim() ? hex : color,
                description,
            });
            setLoading(false);
            toast.success("Updated label successfully!");
            router.push(`/labels`);
        } catch {
            toast.error("Updated label fail!");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Edit Label</h1>
            {showSkeleton ? (
                <div className="flex flex-col gap-4 bg-white p-6 rounded shadow animate-pulse">
                    <div className="h-6 w-1/3 bg-gray-200 rounded" />
                    <div className="h-10 w-full bg-gray-100 rounded" />
                    <div className="h-6 w-1/3 bg-gray-200 rounded mt-4" />
                    <div className="h-10 w-full bg-gray-100 rounded" />
                    <div className="h-6 w-1/3 bg-gray-200 rounded mt-4" />
                    <div className="h-10 w-full bg-gray-100 rounded" />
                    <div className="flex gap-2 mt-4">
                        <div className="h-8 w-20 bg-gray-200 rounded" />
                        <div className="h-8 w-20 bg-gray-100 rounded" />
                    </div>
                </div>
            ) : (
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
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>Save</Button>
                        <Button type="button" variant="ghost" onClick={() => {
                            router.push(`/labels`);
                        }} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}