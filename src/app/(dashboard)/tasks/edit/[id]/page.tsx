'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import apiClient from '@/app/lib/api';
import { TaskResponseDTO } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ProgressInput from './components/ProgressInput';
import AssigneeSelect from './components/AssigneeSelect';
import PropertyEditor from './components/PropertyEditor';
import SubtaskList from './components/SubtaskList';
import TaskActivity from './components/TaskActivity';
import CommentSection from './components/CommentSection';
import { toast } from "sonner";
import LabelSelect from './components/LabelSelect';
import { useProjectId } from '@/app/context/ProjectContext';
import StageSelect from './components/StageSelect';


export default function TaskEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<TaskResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const projectId = useProjectId();
  const [activityKey, setActivityKey] = useState(0);

  const reloadActivity = () => setActivityKey(k => k + 1);

  useEffect(() => {
    setShowLoading(true);
    const timer = setTimeout(() => setShowLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (!loading) {
      // Đảm bảo skeleton không biến mất trước 500ms
      const timer = setTimeout(() => setShowLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch task
        const taskResponse = await apiClient.get(`/task/${id}`);
        setTask(taskResponse.data.data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to fetch task");
        setLoading(false);
        return; // Không có task thì không cần fetch các phần còn lại
      }

      try {
        const stagesRes = await apiClient.get(`/task-stage/by-project/${projectId}`);
        setStages(stagesRes.data); // Giả sử API trả về [{id, name}, ...]
      } catch (err) {
        console.warn("Failed to fetch stages", err);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    // Update task
    try {
      await apiClient.put(`/task/${id}`, task);
      toast.success("Task updated successfully");
      reloadActivity();
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("You don't have permission to update this task.");
      } else {
        toast.error("Fail to delete comment!");
      }
      console.error("Update task error:", err);
    }

    // Optional: navigate only if task update succeeded
    // router.push("/tasks");
  };


  if (loading || showLoading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 h-10 bg-gray-200 rounded mb-4" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="md:col-span-2 h-24 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-10 bg-gray-200 rounded mb-6" />
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
        <div>
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="text-red-500 text-lg font-semibold mb-2">Đã xảy ra lỗi</div>
      <div className="text-gray-700">{error}</div>
      <Button type='button' className="mt-4" variant="outline" onClick={() => window.location.reload()}>
        Thử lại
      </Button>
    </div>
  );
  if (!task) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="text-gray-500 text-lg font-semibold mb-2">Task not found</div>
      <div className="text-gray-400">Nhiệm vụ này không tồn tại hoặc đã bị xóa.</div>
      <Button type='button' className="mt-4" variant="outline" onClick={() => router.push('/tasks')}>
        Quay lại danh sách
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Task</h1>
        <Button className='cursor-pointer' variant="outline" onClick={() => router.push('/tasks')}>
          Back to List
        </Button>
      </div>

      {/* trước form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <AssigneeSelect
          taskId={id as string}
          onReload={reloadActivity}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <LabelSelect
          taskId={id as string}
          onReload={reloadActivity}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
              <ProgressInput
                value={task.progressPercent || 0}
                onChange={(value) => setTask({ ...task, progressPercent: value })}
              />
            </div>

            <div>
              <StageSelect
                value={task.taskStageId || ''}
                onChange={value => setTask({ ...task, taskStageId: value })}
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
              <AssigneeSelect
                selectedUsers={task.assignedUsers}
                onChange={(users) => setTask({ ...task, assignedUsers: users })}
              />
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={task.description || ''}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="datetime-local"
                value={task.startDate ? format(new Date(task.startDate), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setTask({ ...task, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <Input
                type="datetime-local"
                value={task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                className='cursor-pointer'
                id="public-toggle"
                checked={task.isPublic || false}
                onCheckedChange={(value) => setTask({ ...task, isPublic: value })}
              />
              <label htmlFor="public-toggle" className="text-sm font-medium text-gray-700">
                {task.isPublic ? 'Public' : 'Private'}
              </label>
            </div>
          </div>

          <div className="mb-6">
            <PropertyEditor
              priority={task.taskPriorityId}
              onChangePriority={(priority) => setTask({ ...task, taskPriorityId: priority })}
            />
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex justify-end">
            <Button className='cursor-pointer' type="submit">Save Changes</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SubtaskList
              taskId={id as string}
              stageId={task.taskStageId as string}
              isPublic={task.isPublic}
            />

            <CommentSection
              taskId={id as string}
            // comments={comments}
            // onCommentsChange={setComments}
            />
          </div>

          <div>
            <TaskActivity
              key={activityKey}
              taskId={id as string}
              onReload={reloadActivity} />
          </div>
        </div>
      </form>
    </div>
  );
}