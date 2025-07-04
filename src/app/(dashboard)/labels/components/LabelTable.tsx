'use client';

import { Label } from '../page';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface LabelTableProps {
    labels: Label[];
    loading: boolean;
    page: number;
    size: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
    onSortChange: (sortBy: string, direction: 'ASC' | 'DESC') => void;
    sortBy: string;
    direction: 'ASC' | 'DESC';
}

function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
        for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
        if (page > 2) {
            pages.push(0, '...');
        } else {
            for (let i = 0; i < Math.min(3, totalPages); i++) pages.push(i);
        }
        const start = Math.max(1, page - 1);
        const end = Math.min(totalPages - 2, page + 1);
        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }
        if (page < totalPages - 3) {
            pages.push('...', totalPages - 1);
        } else {
            for (let i = totalPages - 3; i < totalPages; i++) {
                if (i > 1 && !pages.includes(i)) pages.push(i);
            }
        }
    }

    return (
        <div className="flex gap-1 justify-center items-center mt-4">
            <Button
                className='cursor-pointer'
                type="button"
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
            >
                Prev
            </Button>
            {pages.map((p, idx) =>
                p === '...' ? (
                    <span key={idx} className="px-2">...</span>
                ) : (
                    <Button
                        type="button"
                        key={p}
                        size="sm"
                        variant={page === p ? 'default' : 'outline'}
                        className="min-w-[32px] px-2 cursor-pointer"
                        onClick={() => onPageChange(Number(p))}
                    >
                        {Number(p) + 1}
                    </Button>
                )
            )}
            <Button
                className='cursor-pointer'
                type="button"
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}

export default function LabelTable({
    labels,
    loading,
    page,
    // size,
    totalPages,
    onPageChange,
    onDelete,
    onSortChange,
    sortBy,
    direction,
}: LabelTableProps) {
    const router = useRouter();
    const [showSkeleton, setShowSkeleton] = useState(false);
    const loadingStart = useRef<number | null>(null);
    const searchParams = useSearchParams();


    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (loading) {
            loadingStart.current = Date.now();
            setShowSkeleton(true);
        } else if (showSkeleton) {
            const elapsed = loadingStart.current ? Date.now() - loadingStart.current : 0;
            const remain = Math.max(0, 600 - elapsed);
            timeout = setTimeout(() => setShowSkeleton(false), remain);
        }
        return () => clearTimeout(timeout);
    }, [loading]);

    return (
        <>
            <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                onClick={() => onSortChange('name', direction === 'ASC' ? 'DESC' : 'ASC')}
                            >
                                Name {sortBy === 'name' ? (direction === 'ASC' ? '▲' : '▼') : ''}
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Color</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Description</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Created At</th>
                            <th className='px-9 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {(showSkeleton || loading) ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 rounded" /></td>
                                </tr>
                            ))
                        ) : labels.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No labels found</td>
                            </tr>
                        ) : (
                            labels.map(label => (
                                <tr
                                    key={label.id}
                                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">{label.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block w-5 h-5 rounded-full border align-middle" style={{ background: label.color }} />
                                        <span className="ml-2 text-xs align-middle">{label.color}</span>
                                    </td>
                                    <td className="px-6 py-4">{label.description}</td>
                                    <td className="px-6 py-4">{label.createdAt ? new Date(label.createdAt).toLocaleString() : ''}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                className='cursor-pointer'
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const query = searchParams.toString();
                                                    router.push(`/labels/edit/${label.id}${query ? `?${query}` : ''}`);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                className='cursor-pointer'
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onDelete(label.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
    );
}