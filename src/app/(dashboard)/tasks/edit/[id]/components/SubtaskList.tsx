'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Eye } from 'lucide-react';
import apiClient from '@/app/lib/api';
import { TaskResponseDTO } from '@/app/lib/types';
import { useRouter } from 'next/navigation';
import { useProjectId } from '@/app/context/ProjectContext';
import { useUsers } from '@/app/context/UserContext';
import { toast } from 'sonner';

interface SubtaskListProps {
  taskId: string;
  stageId?: string;
  isPublic?: boolean;
}

interface SubtaskPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalElements: number;
  data: TaskResponseDTO[];
}

function ProgressCircle({ percent }: { percent: number }) {
  // Simple SVG circle progress
  const radius = 16;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#3b82f6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 0.35s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="12"
        fill="#3b82f6"
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function SubtaskList({ taskId, stageId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<TaskResponseDTO[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [page, setPage] = useState(0);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const projectId = useProjectId();
  const users = useUsers();
  const router = useRouter();

  const fetchSubtasks = async (nextPage = 0, append = false) => {
    setLoading(true);
    try {
      const res = await apiClient.get<SubtaskPagination>(`/task/parent/${taskId}?page=${nextPage}&size=${limit}`);
      setTotalPages(res.data.totalPages);
      if (append) {
        setSubtasks(prev => [...prev, ...res.data.data]);
      } else {
        setSubtasks(res.data.data || []);
      }
    } catch {
      if (!append) setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchSubtasks(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      // Lấy stageId từ props hoặc subtask đầu tiên (nếu có)
      const parentStageId = stageId || (subtasks[0]?.taskStageId ?? '');
      await apiClient.post<TaskResponseDTO>(`/task`, {
        title: newSubtask,
        parentTaskId: taskId,
        projectId,
        taskStageId: parentStageId,
      });
      toast.success("Add subtask successfully!")
      // setSubtasks(prev => [res.data, ...prev]);
      setNewSubtask('');
      setPage(0);
      fetchSubtasks(0, false);
    } catch (err: any) {
      if (
        err?.response?.status === 400 &&
        err?.response?.data?.message?.includes('Maximum subtask depth')
      ) {
        toast.error('Subtask depth limit reached, cannot create!');
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to add this subtask.");
      } else {
        toast.error("Fail to delete comment!");
      }
    }
  };

  // const toggleSubtask = async (subtaskId: string, completed: boolean) => {
  //   try {
  //     await apiClient.patch(`/task/${subtaskId}`, { completed });
  //     setSubtasks(subtasks =>
  //       subtasks.map(subtask =>
  //         subtask.id === subtaskId ? { ...subtask, completed } : subtask
  //       )
  //     );
  //     toast.success("Updated subtask successfully!")
  //   } catch (err) {
  //     console.error('Failed to update subtask', err);
  //   }
  // };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      await apiClient.delete(`/task/${subtaskId}`);
      setSubtasks(subtasks => subtasks.filter(subtask => subtask.id !== subtaskId));
      toast.success("Deleted subtask successfully!")
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSubtasks(nextPage, true);
  };

  const getAssigneeNames = (userIds: string[]) => {
    return userIds
      .map(uid => users.find(u => u.id === uid)?.name)
      .filter(Boolean)
      .join(', ');
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
        <Button onClick={addSubtask} type='button' className='cursor-pointer'>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {subtasks.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">Process</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[140px]">Deadline</TableHead>
                {/* <TableHead className="w-[160px]">Assignee</TableHead> */}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subtasks.map((subtask) => (
                <TableRow key={subtask.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <ProgressCircle percent={subtask.progressPercent ?? 0} />
                    </div>
                  </TableCell>
                  <TableCell className={subtask.progressPercent==100 ? 'line-through text-gray-400' : ''}>
                    {subtask.title}
                  </TableCell>
                  <TableCell>
                    {subtask.deadline
                      ? new Date(subtask.deadline).toLocaleString()
                      : <span className="text-gray-400">-</span>}
                  </TableCell>
                  {/* <TableCell>
                    {subtask.assignedUsers && subtask.assignedUsers.length > 0
                      ? getAssigneeNames(subtask.assignedUsers)
                      : <span className="text-gray-400">No assignee</span>}
                  </TableCell> */}
                  <TableCell>
                    <Button
                      type='button'
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/tasks/edit/${subtask.id}`)}
                      title="View/Edit"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      type='button'
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubtask(subtask.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Nút Xem thêm */}
          {page + 1 < totalPages && (
            <div className="flex justify-center mt-4">
              <Button
                type='button'
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'See more'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No subtasks yet</p>
      )}
    </div>
  );
}