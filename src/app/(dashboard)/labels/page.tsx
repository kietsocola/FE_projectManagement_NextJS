'use client';

import { useEffect, useState } from 'react';
import LabelTable from './components/LabelTable';
import LabelForm from './components/LabelForm';
import LabelFilter from './components/LabelFilter';
import apiClient from '@/app/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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
  const [labels, setLabels] = useState<Label[]>([]);
  const [filter, setFilter] = useState<LabelFilterDTO>({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [loading, setLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const router = useRouter();
  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/label/filter?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, filter);
      setLabels(res.data.data.data || res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
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
    <div className="container mx-auto px-4 py-8">
      <div className='flex justify-between items-center mb-4'>
        <h1 className="text-2xl font-bold mb-4">Label Management</h1>
        <Button
          type="button"
          className="mb-4"
          onClick={() => router.push('/labels/create')}
        >
          + Add New Label
        </Button>
      </div>
      <div className="mb-4">
        <LabelFilter
          filter={filter}
          onFilterChange={setFilter}
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