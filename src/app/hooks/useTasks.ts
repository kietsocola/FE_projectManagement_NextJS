'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { TaskResponseDTO, TaskFilterDTO, PaginatedResponse } from '../lib/types';

export const useTasks = (initialFilter: TaskFilterDTO = { page: 0, limit: 5, isPublic: true }) => {
  const [tasks, setTasks] = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilterDTO>(initialFilter);
  const [totalElements, setTotalElements] = useState<number>(0);
  // const [total, setTotal] = useState<number>(0);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.post<PaginatedResponse<TaskResponseDTO>>(
        '/task/filter',
        filter // ✅ gửi filter vào body
      );
      setTasks(response.data.data);
      setTotalElements(response.data.totalElements);

      setError(null);
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Cannot connect to server');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
      }
      console.error(err);
  } finally {
    setLoading(false);
  }
}, [filter]);

useEffect(() => {
  fetchTasks();
}, [fetchTasks]);

// Ghi đè các giá trị trong filter, cái cũ giữ nguyên, cái mới có cái nào thì ghi đè lên
const updateFilter = (newFilter: Partial<TaskFilterDTO>) => {
  setFilter(prev => ({ ...prev, ...newFilter }));
};

const deleteTask = async (id: string) => {
  try {
    await apiClient.delete(`/task/${id}`);
    fetchTasks(); // Refresh the list
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

return {
  tasks,
  loading,
  error,
  filter,
  totalElements,
  fetchTasks,
  updateFilter,
  deleteTask,
};
};