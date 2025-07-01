'use client';

import { TaskFilterDTO } from '@/app/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { TaskStageResponseDTO, LabelResponseDTO, TaskPriorityResponseDTO } from '@/app/lib/types';

interface TaskFilterProps {
  filter: TaskFilterDTO;
  onFilterChange: (filter: Partial<TaskFilterDTO>) => void;
  prioritiesMap: { [id: string]: TaskPriorityResponseDTO };
  statusesMap: { [id: string]: TaskStageResponseDTO };
  labelsMap: { [id: string]: LabelResponseDTO };
}

export default function TaskFilter({ filter, onFilterChange, prioritiesMap, statusesMap, labelsMap }: TaskFilterProps) {

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <Input
          className="w-48"
          placeholder="Search by title"
          value={filter.title || ''}
          onChange={(e) => onFilterChange({ title: e.target.value })}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
        <Select
          value={filter.taskStageId || ''}
          onValueChange={(value) =>
            onFilterChange({ taskStageId: value === 'empty' ? undefined : value })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empty">All</SelectItem>
            {Object.values(statusesMap).map((stage: TaskStageResponseDTO) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* More Filters Popover */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">More Filters</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 max-h-[70vh] overflow-auto space-y-4 pb-0 pt-3">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <Select
                value={filter.taskPriorityId || ''}
                onValueChange={(value) =>
                  onFilterChange({ taskPriorityId: value === 'empty' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">All</SelectItem>
                  {Object.values(prioritiesMap).map((priority:TaskPriorityResponseDTO) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <Select
                value={filter.labelId || ''}
                onValueChange={(value) =>
                  onFilterChange({ labelId: value === 'empty' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">All</SelectItem>
                  {Object.values(labelsMap || {}).map((label:LabelResponseDTO) => (
                    <SelectItem key={label.id} value={label.id}>
                      {label.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.startDateFrom
                      ? format(new Date(filter.startDateFrom), 'MMM dd, yyyy')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filter.startDateFrom ? new Date(filter.startDateFrom) : undefined}
                    onSelect={(date) =>
                      onFilterChange({ startDateFrom: date?.toISOString() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.startDateTo
                      ? format(new Date(filter.startDateTo), 'MMM dd, yyyy')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filter.startDateTo ? new Date(filter.startDateTo) : undefined}
                    onSelect={(date) =>
                      onFilterChange({ startDateTo: date?.toISOString() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.deadlineFrom
                      ? format(new Date(filter.deadlineFrom), 'MMM dd, yyyy')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filter.deadlineFrom ? new Date(filter.deadlineFrom) : undefined}
                    onSelect={(date) =>
                      onFilterChange({ deadlineFrom: date?.toISOString() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Is Public */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Public</label>
              <Switch
                checked={!!filter.isPublic}
                onCheckedChange={(checked) => onFilterChange({ isPublic: checked })}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <Select
                value={filter.sortBy || ''}
                onValueChange={(value) =>
                  onFilterChange({ sortBy: value === 'empty' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="start_date">Start Date</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
              <Select
                value={filter.sortDirection || ''}
                onValueChange={(value) =>
                  onFilterChange({
                    sortDirection: value === 'empty' ? undefined : (value as 'ASC' | 'DESC'),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Default</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset & Apply */}
            <div className="sticky bottom-0 bg-white pt-2 pb-2 flex justify-end gap-2 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onFilterChange({
                    taskPriorityId: undefined,
                    labelId: undefined,
                    startDateFrom: undefined,
                    startDateTo: undefined,
                    deadlineFrom: undefined,
                    deadlineTo: undefined,
                    isPublic: true,
                    sortBy: undefined,
                    sortDirection: undefined,
                  })
                }
              >
                Reset
              </Button>
              <Button size="sm" onClick={() => onFilterChange({ page: 0 })}>Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}