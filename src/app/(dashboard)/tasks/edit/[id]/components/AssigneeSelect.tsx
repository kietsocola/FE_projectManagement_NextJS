
import { useState, useEffect } from 'react';
import { UserDTO } from '@/app/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { useProjectId } from '@/app/context/ProjectContext';
import { useUsers } from '@/app/context/UserContext';


interface AssigneeSelectProps {
  taskId: string;
  onReload?: () => void;
}

export default function AssigneeSelect({ taskId, onReload }: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const projectId = useProjectId();
  const usersMock = useUsers();

  // Fetch all users and assigned users
  const fetchAll = async () => {
    setLoading(true);
    try {
      const usersRes = await apiClient.get<UserDTO[]>(`/projects/${projectId}/users`);
      setUsers(usersRes.data.length ? usersRes.data : usersMock);
      const assignedRes = await apiClient.get<string[]>(`/task-assign?idTask=${taskId}`);
      setAssignedUsers(assignedRes.data.map((u: any) => u.userId));
    } catch (err) {
      toast.error('Failed to fetch users ' + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowLoading(true);
    const timer = setTimeout(() => setShowLoading(false), 600);
    fetchAll();
    return () => clearTimeout(timer);
  }, [taskId]);

  // Thêm user vào task
  const handleAdd = async (userId: string) => {
    try {
      await apiClient.post(`/task-assign?taskId=${taskId}`, [userId]);
      await fetchAll();
      toast.success('Added assignee');
      if (onReload) onReload();
    } catch (err) {
      toast.error('Failed to add assignee '+err);
    }
  };

  // Xóa user khỏi task
  const handleRemove = async (userId: string) => {
    try {
      await apiClient.delete(`/task-assign?taskId=${taskId}&userId=${userId}`);
      await fetchAll();
      toast.success('Removed assignee');
      if (onReload) onReload();
    } catch (err) {
      toast.error('Failed to remove assignee '+err);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
      <div className="flex flex-wrap gap-2">
        {loading || showLoading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))
        ) : (
          assignedUsers.map(userId => {
            const user = users.find(u => u.id === userId);
            return (
              <Badge key={userId} className="flex items-center gap-1">
                {user?.name || userId}
                <button
                  type="button"
                  onClick={() => handleRemove(userId)}
                  className="ml-1 rounded-full hover:bg-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading || showLoading}
          >
            Add assignees...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." disabled={loading || showLoading} />
            <CommandList>
              {loading || showLoading ? (
                <div className="p-4 space-y-2">
                  <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No users found</CommandEmpty>
                  <CommandGroup>
                    {users
                      .filter(user => !assignedUsers.includes(user.id))
                      .map(user => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => {
                            handleAdd(user.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${assignedUsers.includes(user.id) ? 'opacity-100' : 'opacity-0'}`}
                          />
                          {user.name} ({user.email})
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}