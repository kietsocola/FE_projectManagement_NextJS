'use client';

import { useState, useEffect } from 'react';
import { TaskPriorityResponseDTO } from '@/app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/app/lib/api';

interface PropertyEditorProps {
  priority?: string;
  onChangePriority: (priority: string) => void;
}

export default function PropertyEditor({
  priority,
  onChangePriority,
}: PropertyEditorProps) {
  const [priorities, setPriorities] = useState<TaskPriorityResponseDTO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        // Fetch priorities
        const prioritiesResponse = await apiClient.get<TaskPriorityResponseDTO[]>('/priority');
        setPriorities(prioritiesResponse.data);
      } catch (err) {
        console.error('Failed to fetch properties', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <Select value={priority} onValueChange={onChangePriority}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(priorities) && priorities.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}