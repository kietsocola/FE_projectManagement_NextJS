'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import apiClient from '@/app/lib/api';
import { SubtaskDTO } from '@/app/lib/types';

interface SubtaskListProps {
  taskId: string;
  subtasks: SubtaskDTO[];
  onSubtasksChange: (subtasks: SubtaskDTO[]) => void;
}

export default function SubtaskList({ taskId, subtasks, onSubtasksChange }: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;

    try {
      const response = await apiClient.post<SubtaskDTO>(`/task/${taskId}/subtasks`, {
        title: newSubtask,
      });
      onSubtasksChange([...subtasks, response.data]);
      setNewSubtask('');
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, {
        completed,
      });
      onSubtasksChange(
        subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
        )
      );
    } catch (err) {
      console.error('Failed to update subtask', err);
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      onSubtasksChange(subtasks.filter(subtask => subtask.id !== subtaskId));
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Subtasks</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add new subtask"
          onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
        />
        <Button onClick={addSubtask}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {subtasks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subtasks.map((subtask) => (
              <TableRow key={subtask.id}>
                <TableCell>
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={(checked) => toggleSubtask(subtask.id, !!checked)}
                  />
                </TableCell>
                <TableCell className={subtask.completed ? 'line-through text-gray-400' : ''}>
                  {subtask.title}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubtask(subtask.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No subtasks yet</p>
      )}
    </div>
  );
}