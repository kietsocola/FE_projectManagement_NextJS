'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { TaskResponseDTO, TaskFilterDTO, PaginatedResponse } from '../lib/types';
import { AxiosError } from 'axios';

export const useTasks = (filter: TaskFilterDTO) => {
  const [tasks, setTasks] = useState<TaskResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [filter, setFilter] = useState<TaskFilterDTO>(initialFilter);
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
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.message === 'Network Error') {
        setError('Cannot connect to server');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch tasks');
      }
  } finally {
    setLoading(false);
  }
}, [filter]);

useEffect(() => {
  fetchTasks();
}, [fetchTasks]);

// Ghi đè các giá trị trong filter, cái cũ giữ nguyên, cái mới có cái nào thì ghi đè lên
// const updateFilter = (newFilter: Partial<TaskFilterDTO>) => {
//   setFilter(prev => ({ ...prev, ...newFilter }));
// };

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
  // updateFilter,
  deleteTask,
};
};