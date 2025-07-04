'use client';

import { useEffect, useState } from 'react';
import LabelTable from './components/LabelTable';
import LabelForm from './components/LabelForm';
import LabelFilter from './components/LabelFilter';
import apiClient from '@/app/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: string;
}

export interface LabelFilterDTO {
  name?: string;
  color?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface LabelPagination {
  data: Label[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export default function LabelManagerPage() {


  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Lấy giá trị từ URL query
  const getParam = (key: string, defaultValue: any) => {
    const value = searchParams.get(key);
    if (value === null) return defaultValue;
    if (key === 'page') return Math.max(Number(value) - 1, 0); // page trên URL bắt đầu từ 1
    if (key === 'size') return Number(value);
    return value;
  };

  const [labels, setLabels] = useState<Label[]>([]);
  const [filter, setFilter] = useState<LabelFilterDTO>({
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
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

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

  // 3. Khi các state thay đổi, cập nhật URL
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

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(
        `/label/filter?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
        filter
      );
      setLabels(res.data.data.data || res.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch {
      setLabels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy, direction, filter]);

  const handleCancelEdit = () => setEditingLabel(null);

  const handleSave = async (label: Omit<Label, 'id'>, id?: string) => {
    try {
      if (id) {
        await apiClient.put(`/label/${id}`, label);
      } else {
        await apiClient.post(`/label`, label);
      }
      setEditingLabel(null);
      fetchLabels();
    } catch {
      toast.error("Fail to handle save label")
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/label/${id}`);
      fetchLabels();
    } catch {
      toast.error("Fail to delete label")
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-3">
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2'>
        <h1 className="text-2xl font-bold mb-4">Label Management</h1>
        <Button
          type="button"
          className="mb-4 cursor-pointer"
          onClick={() => router.push('/labels/create')}
        >
          + Create Label
        </Button>
      </div>
      <div className="mb-4">
        <LabelFilter
          filter={filter}
          onFilterChange={(newFilter) => {
            setFilter(newFilter);
            setPage(0); // Reset về trang đầu khi filter thay đổi
          }}
        />
      </div>
      <div className="mb-4">
        <LabelForm
          label={editingLabel}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      </div>
      <LabelTable
        labels={labels}
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