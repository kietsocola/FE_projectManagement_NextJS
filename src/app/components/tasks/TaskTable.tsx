'use client';

import Link from 'next/link';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TaskResponseDTO, LabelResponseDTO } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';
import { format } from 'date-fns';
import Pagination from '@/app/components/ui/Pagination';
import { useState } from 'react';
import TableSkeletonRow from '@/app/components/ui/TableSkeletonRow';

interface TaskTableProps {
  tasks: TaskResponseDTO[];
  loading: boolean;
  page: number;
  limit: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  onSort?: (sortBy: string) => void;
  onPageSizeChange?: (size: number) => void;
  prioritiesMap: any;
  statusesMap: any;
  onDeleteTask: (id: string) => Promise<void>;
}


function EmptyTask() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
        <rect width="100%" height="100%" rx="12" fill="#f3f4f6" />
        <path d="M7 12h10M7 16h6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="mt-4 text-lg font-medium">No tasks found</div>
      <div className="text-sm">You have no tasks yet. Create one to get started!</div>
    </div>
  );
}

export default function TaskTable({ tasks, loading, page, limit, totalElements, onPageChange, sortBy, sortDirection, onSort, onPageSizeChange, prioritiesMap, statusesMap, onDeleteTask }: TaskTableProps) {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const columns: ColumnDef<TaskResponseDTO>[] = [
    {
      accessorKey: 'title',
      header: () => (
        <button
          type="button"
          className="flex items-center gap-1 group"
          onClick={() => onSort && onSort('title')}
        >
          TITLE
          {sortBy === 'title' ? (
            sortDirection === 'ASC' ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )
          ) : (
            <ChevronDown className="w-4 h-4 opacity-30 group-hover:opacity-80" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <Link href={`/tasks/edit/${row.original.id}`} className="font-medium text-dark-600 hover:underline">
          {row.getValue('title')}
        </Link>
      ),
    },
    {
      accessorKey: 'taskPriorityId',
      header: 'Priority',
      cell: ({ row }) => {
        const priorityId = row.original.taskPriorityId;
        const priority = priorityId ? prioritiesMap[priorityId] : null;

        // ❗ Nếu không có priorityId hoặc không tìm thấy trong map → không hiển thị gì
        if (!priorityId || !priority) return null;

        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${priority.color}20`,
              color: priority.color,
            }}
          >
            {priority.name}
          </span>
        );
      },
    },
    {
      accessorKey: 'taskStageId',
      header: 'Stage',
      cell: ({ row }) => {
        const statusId = row.original.taskStageId || 'todo';
        const status = statusesMap[statusId];
        if (!status) {
          // Có thể trả về skeleton nhỏ hoặc null để tránh nháy id
          return (
            <span className="inline-block h-5 w-16 bg-gray-100 rounded animate-pulse" />
          );
        }

        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${status?.color || '#ccc'}20`,
              color: status?.color || '#333',
            }}
          >
            {status?.name || statusId.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'progressPercent',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2 w-full">
          {/* Progress bar container (chiếm phần còn lại) */}
          <div className="flex-grow bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${row.original.progressPercent || 0}%` }}
            ></div>
          </div>

          {/* Phần trăm, chiếm chiều rộng cố định */}
          <p className="w-8 text-right text-sm">
            {`${row.original.progressPercent || 0}%`}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'assignedUsers',
      header: 'Assignee',
      cell: ({ row }) => (
        <div className="flex -space-x-2">
          {row.original.assignedUsers.slice(0, 3).map((user, index) => (
            <div
              key={index}
              title={user}
              className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium"
            >
              {user.charAt(0).toUpperCase()}
            </div>
          ))}
          {row.original.assignedUsers.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              +{row.original.assignedUsers.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'labels',
      header: 'Label',
      cell: ({ row }) => {
        const labels: LabelResponseDTO[] = row.original.labels || [];

        if (labels.length === 0) return null; // ❗ Nếu không có label thì không hiển thị

        return (
          <div className="flex flex-wrap gap-1">
            {labels.slice(0, 2).map(label => (
              <span
                key={label.id}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}

            {labels.length > 2 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{labels.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'deadline',
      header: () => (
        <button
          type="button"
          className="flex items-center gap-1 group"
          onClick={() => onSort && onSort('deadline')}
        >
          DEADLINE
          {sortBy === 'deadline' ? (
            sortDirection === 'ASC' ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )
          ) : (
            <ChevronDown className="w-4 h-4 opacity-30 group-hover:opacity-80" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        row.original.deadline ? format(new Date(row.original.deadline), 'MMM dd, yyyy') : '-'
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const task = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tasks/edit/${task.id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTaskToDelete(task.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const columnWidths = ['12.5rem', '7rem', '7rem', '9rem', '10rem', '10rem', '8rem', '4rem'];
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: columnWidths[idx] }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableSkeletonRow columns={columns.length} widths={columnWidths} key={idx} />
                ))}
              </>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8">
                  <EmptyTask />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={cell.id}
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ width: columnWidths[idx] }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={totalElements}
        itemsPerPage={limit}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={async () => {
          if (taskToDelete) {
            await onDeleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
      />
    </div>
  );
}