import { useEffect, useState, useCallback } from 'react';
import { LabelResponseDTO } from '@/app/lib/types';
import apiClient from '@/app/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Tag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from "sonner";
import { AxiosError } from 'axios';

interface LabelSelectProps {
  taskId: string;
  onReload?: () => void;
}

export default function LabelSelect({ taskId, onReload }: LabelSelectProps) {
  const [availableLabels, setAvailableLabels] = useState<LabelResponseDTO[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<LabelResponseDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all labels and assigned labels
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<LabelResponseDTO[]>('/label');
      setAvailableLabels(res.data);

      const assignedRes = await apiClient.get<LabelResponseDTO[]>(`/task-label?idTask=${taskId}`);
      setSelectedLabels(assignedRes.data);
    } catch (err) {
      toast.error('Failed to fetch labels ' + err);
    } finally {
      setLoading(false);
    }
  }, [taskId]); // ✅ Bỏ `fetchAll` phụ thuộc `taskId`

  useEffect(() => {
    fetchAll();
  }, [fetchAll]); // ✅ Không còn warning

  const handleAdd = async (label: LabelResponseDTO) => {
    try {
      await apiClient.post(`/task-label?taskId=${taskId}`, [label.id]);
      await fetchAll();
      toast.success('Added label');
      if (onReload) onReload();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response?.status === 403) {
        toast.error("You don't have permission to add this label.");
      } else {
        toast.error("Fail to delete comment!");
      }
    }
  };

  const handleRemove = async (label: LabelResponseDTO) => {
    try {
      await apiClient.delete(`/task-label?taskId=${taskId}&labelId=${label.id}`);
      await fetchAll();
      toast.success('Removed label');
      if (onReload) onReload();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this label.");
      } else {
        toast.error("Fail to delete comment!");
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))
        ) : (
          selectedLabels.map(label => (
            <Badge
              key={label.id}
              className="flex items-center gap-1"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => handleRemove(label)}
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
            disabled={loading}
          >
            <Tag className="mr-2 h-4 w-4" />
            Add tags...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." disabled={loading} />
            <CommandList>
              <CommandEmpty>No tags found</CommandEmpty>
              <CommandGroup>
                {availableLabels
                  .filter(tag => !selectedLabels.some(l => l.id === tag.id))
                  .map(tag => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        handleAdd(tag);
                        setOpen(false);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}