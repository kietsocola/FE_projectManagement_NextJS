'use client';

import { useEffect, useState } from 'react';
import PriorityTable from './components/PriorityTable';
import PriorityFilter from './components/PriorityFilter';
import apiClient from '@/app/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
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


  const searchParams = useSearchParams();

  const getParam = (key: string, defaultValue: any) => {
    const value = searchParams.get(key);
    if (value === null) return defaultValue;
    if (key === 'page' || key === 'size') return Number(value);
    return value;
  };

  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [filter, setFilter] = useState<TaskPriorityFilterDTO>({
    name: searchParams.get('name') || undefined,
    color: searchParams.get('color') || undefined,
    createdFrom: searchParams.get('createdFrom') || undefined,
    createdTo: searchParams.get('createdTo') || undefined,
  });
  const [page, setPage] = useState(getParam('page', 0));
  const [size] = useState(getParam('size', 5));
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(getParam('sortBy', 'id'));
  const [direction, setDirection] = useState<'ASC' | 'DESC'>(getParam('direction', 'ASC'));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const DEFAULTS: { [key: string]: string | number } = {
    page: 1,
    size: 5,
    sortBy: 'id',
    direction: 'ASC',
  };


  const updateUrl = (params: any) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      let v = value;
      if (key === 'page') v = Number(value) + 1; // page trên URL bắt đầu từ 1
      if (
        v !== undefined &&
        v !== null &&
        v !== '' &&
        (DEFAULTS[key] === undefined || String(v) !== String(DEFAULTS[key]))
      ) {
        url.searchParams.set(key, String(v));
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState(null, '', url.pathname + url.search);
  };

  
  useEffect(() => {
    updateUrl({
      page,
      size,
      sortBy,
      direction,
      ...filter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy, direction, filter]);
  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/priority/filter?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, filter);
      setPriorities(res.data.data?.data || res.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) {
      setPriorities([]);
      setTotalPages(1);
      console.error(err);
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
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-3">
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2'>
        <h1 className="text-2xl font-bold mb-4">Priority Management</h1>
        <Button
          type="button"
          className="mb-4 cursor-pointer"
          onClick={() => router.push('/priorities/create')}
        >
          + Create Priority
        </Button>
      </div>
      <div className="mb-4">
        <PriorityFilter
          filter={filter}
          onFilterChange={(newFilter) => {
            setFilter(newFilter);
            setPage(0); // Reset về trang đầu khi filter thay đổi
          }}
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