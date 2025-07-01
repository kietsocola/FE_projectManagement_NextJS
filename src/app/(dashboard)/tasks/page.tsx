'use client';

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskFilter from '../../components/tasks/TaskFilter';
import TaskTable from '../../components/tasks/TaskTable';
import TaskKanban from '../../components/tasks/TaskKanban';
import SwitchView from '../../components/ui/SwitchView';
import TableSkeletonRow from '@/app/components/ui/TableSkeletonRow';
import { useLookups } from '@/app/hooks/useLookups';

export default function TaskListPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [viewLoading, setViewLoading] = useState(false);
  const { tasks, loading, error, filter, totalElements, updateFilter } = useTasks();
  const { prioritiesMap, statusesMap, labelsMap } = useLookups();

  const handlePageChange = (page: number) => {
    updateFilter({ page });
  };
  const handleSort = (column: string) => {
    if (filter.sortBy === column) {
      updateFilter({
        sortBy: column,
        sortDirection: filter.sortDirection === 'ASC' ? 'DESC' : 'ASC',
        page: 0,
      });
    } else {
      updateFilter({
        sortBy: column,
        sortDirection: 'ASC',
        page: 0,
      });
    }
  };
  const handlePageSizeChange = (size: number) => {
    updateFilter({ limit: size, page: 0, sortBy: 'created_at', sortDirection: 'DESC' });
  };
  const handleSwitchView = () => {
    setViewLoading(true);
    setTimeout(() => {
      setViewMode(viewMode === 'list' ? 'kanban' : 'list');
      setViewLoading(false);
    }, 500); // 500ms skeleton
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <SwitchView
          viewMode={viewMode}
          onSwitch={handleSwitchView}
        />
      </div>

      <TaskFilter filter={filter} 
                  onFilterChange={updateFilter}
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
          sortDirection={filter.sortDirection}
          onSort={handleSort}
          onPageSizeChange={handlePageSizeChange}
          prioritiesMap={prioritiesMap}
          statusesMap={statusesMap}
        />
      ) : (
        <TaskKanban />
      )}
    </div>
  );
}