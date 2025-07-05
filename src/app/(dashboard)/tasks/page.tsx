'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskFilter from '../../components/tasks/TaskFilter';
import TaskTable from '../../components/tasks/TaskTable';
import TaskKanban from '../../components/tasks/TaskKanban';
import SwitchView from '../../components/ui/SwitchView';
import TableSkeletonRow from '@/app/components/ui/TableSkeletonRow';
import { useLookups } from '@/app/hooks/useLookups';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DEFAULTS: { [key: string]: string | number } = {
  page: 1,
  limit: 5,
  sortBy: 'created_at',
  sortDirection: 'DESC',
  // ...các filter mặc định khác nếu có
};

function getParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string | number
): string | number {
  const value = searchParams.get(key);
  if (value === null) return defaultValue;
  if (key === 'page') return Math.max(Number(value) - 1, 0); // page trên URL bắt đầu từ 1
  if (key === 'size' || key === 'limit') return Number(value);
  return value;
}
export default function TaskListPage() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(() => ({
    page: Number(getParam(searchParams, 'page', 0)),
    limit: Number(getParam(searchParams, 'limit', DEFAULTS.limit)),
    sortBy: String(getParam(searchParams, 'sortBy', DEFAULTS.sortBy)),
    sortDirection: ((): "ASC" | "DESC" | undefined => {
      const dir = getParam(searchParams, 'sortDirection', DEFAULTS.sortDirection);
      if (dir === "ASC" || dir === "DESC") return dir;
      return DEFAULTS.sortDirection === "ASC" || DEFAULTS.sortDirection === "DESC"
        ? DEFAULTS.sortDirection as "ASC" | "DESC"
        : undefined;
    })(),
    title: searchParams.get('title') || "",
    taskStageId: searchParams.get('taskStageId') || undefined,
    taskPriorityId: searchParams.get('taskPriorityId') || undefined,
    labelId: searchParams.get('labelId') || undefined,
    description: searchParams.get('description') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    startDateFrom: searchParams.get('startDateFrom') || undefined,
    startDateTo: searchParams.get('startDateTo') || undefined,
    deadlineFrom: searchParams.get('deadlineFrom') || undefined,
    deadlineTo: searchParams.get('deadlineTo') || undefined,
    assignedUserId: searchParams.get('assignedUserId') || undefined,
    // ...các filter khác
  }));

  useEffect(() => {
    const url = new URL(window.location.href);
    Object.entries(filter).forEach(([key, value]) => {
      // Chỉ set nếu khác mặc định và có giá trị
      const defaultValue = DEFAULTS[key];
      let v = value;
      if (key === 'page') v = Number(value) + 1; // page trên URL bắt đầu từ 1
      if (
        v !== undefined &&
        v !== null &&
        v !== '' &&
        (defaultValue === undefined || String(v) !== String(defaultValue))
      ) {
        url.searchParams.set(key, String(v));
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState(null, '', url.pathname + url.search);
  }, [filter]);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [viewLoading, setViewLoading] = useState(false);
  const { tasks, loading, error, totalElements, deleteTask } = useTasks(filter);
  const { prioritiesMap, statusesMap, labelsMap } = useLookups();


  const handlePageChange = (page: number) => setFilter(f => ({ ...f, page }));
  const handleSort = (column: string) => {
    setFilter(f => ({
      ...f,
      sortBy: column,
      sortDirection: f.sortBy === column && f.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }));
  };
  const handlePageSizeChange = (size: number) => setFilter(f => ({
    ...f,
    limit: size,
    page: 0,
    sortBy: 'created_at',
    sortDirection: 'DESC',
  }));
  const handleFilterChange = (newFilter: Partial<typeof filter>) => setFilter(f => ({
    ...f,
    ...newFilter,
    page: 0,
  }));
  const handleSwitchView = () => {
    setViewLoading(true);
    setTimeout(() => {
      setViewMode(viewMode === 'list' ? 'kanban' : 'list');
      setViewLoading(false);
    }, 500); // 500ms skeleton
  };
  const router = useRouter();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 pt-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            onClick={() => router.push('/tasks/create')}
            className="whitespace-nowrap cursor-pointer"
          >
            + Create Task
          </Button>
          <SwitchView
            viewMode={viewMode}
            onSwitch={handleSwitchView}
          />
        </div>
      </div>

      <TaskFilter filter={filter}
        onFilterChange={handleFilterChange}
        prioritiesMap={prioritiesMap}
        statusesMap={statusesMap}
        labelsMap={labelsMap} />

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {viewLoading ? (
        // Skeleton cho bảng
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <TableSkeletonRow columns={8} widths={['12.5rem', '7rem', '7rem', '9rem', '10rem', '10rem', '8rem', '4rem']} key={idx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'list' ? (
        <TaskTable
          tasks={tasks}
          loading={loading}
          page={filter.page || 0}
          limit={filter.limit || 5}
          totalElements={totalElements}
          onPageChange={handlePageChange}
          sortBy={filter.sortBy}
          sortDirection={
            filter.sortDirection === 'ASC' || filter.sortDirection === 'DESC'
              ? filter.sortDirection
              : undefined
          }
          onSort={handleSort}
          onPageSizeChange={handlePageSizeChange}
          prioritiesMap={prioritiesMap}
          statusesMap={statusesMap}
          onDeleteTask={async (id: string) => {
            try {
              await deleteTask(id);
              toast.success("Delete task successfully!");
            } catch {
              toast.error("Delete task failed!");
            }
          }}
        />
      ) : (
        <TaskKanban />
      )}
    </div>
  );
}