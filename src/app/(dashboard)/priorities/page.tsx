'use client';

import { useEffect, useState } from 'react';
import PriorityTable from './components/PriorityTable';
import PriorityFilter from './components/PriorityFilter';
import apiClient from '@/app/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface Priority {
  id: string;
  name: string;
  color: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface TaskPriorityFilterDTO {
  name?: string;
  color?: string;
  createdFrom?: string;
  createdTo?: string;
}

export default function PriorityManagerPage() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [filter, setFilter] = useState<TaskPriorityFilterDTO>({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/priority/filter?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, filter);
      setPriorities(res.data.data?.data || res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setPriorities([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy, direction, filter]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/priority/${id}`);
      fetchPriorities();
    } catch {
      toast.error("Fail to delete priority")
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='flex justify-between items-center mb-4'>
        <h1 className="text-2xl font-bold mb-4">Priority Management</h1>
        <Button
          type="button"
          className="mb-4"
          onClick={() => router.push('/priorities/create')}
        >
          + Add New Label
        </Button>
      </div>
      <div className="mb-4">
        <PriorityFilter
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>
      <PriorityTable
        priorities={priorities}
        loading={loading}
        page={page}
        size={size}
        totalPages={totalPages}
        onPageChange={setPage}
        onDelete={handleDelete}
        onSortChange={(sort, dir) => { setSortBy(sort); setDirection(dir); }}
        sortBy={sortBy}
        direction={direction}
      />
    </div>
  );
}