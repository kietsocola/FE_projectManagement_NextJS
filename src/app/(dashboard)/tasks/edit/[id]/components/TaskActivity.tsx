'use client';

import { format } from 'date-fns';
import { ActivityLogDTO } from '@/app/lib/types';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/app/lib/api';
import { useProjectId } from '@/app/context/ProjectContext';
import { useUsers } from '@/app/context/UserContext';
import { Button } from '@/components/ui/button';

interface TaskActivityProps {
  taskId: string;
  onReload?: () => void;
}

export default function TaskActivity({ taskId }: TaskActivityProps) {
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [priorityMap, setPriorityMap] = useState<Record<string, string>>({});
  const [stageMap, setStageMap] = useState<Record<string, string>>({});
  const projectId = useProjectId();
  const [activities, setActivities] = useState<ActivityLogDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  // const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const users = useUsers();

  function getUserName(id: string) {
    return users.find(u => u.id === id)?.name || id;
  }

  const fetchActivities = async (nextPage = 0) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/task-log-activity/task/${taskId}?page=${nextPage}&size=${size}`);
      const newActivities = res.data.content || res.data; // tuỳ API trả về
      await new Promise(res => setTimeout(res, 600));
      if (nextPage === 0) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
    } catch {
      if (nextPage === 0) setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchActivities(0);
  }, [taskId]);

  const handleLoadMore = () => {
    setShowSkeleton(true);
    setTimeout(() => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
      setShowSkeleton(false);
    }, 600);
  };

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const [labelRes, priorityRes, stageRes] = await Promise.all([
          apiClient.get('/label'),
          apiClient.get('/priority'),
          apiClient.get(`/task-stage/by-project/${projectId}`),
        ]);
        const labelObj: Record<string, string> = {};
        labelRes.data.forEach((item: any) => { labelObj[item.id] = item.name; });
        setLabelMap(labelObj);

        const priorityObj: Record<string, string> = {};
        priorityRes.data.forEach((item: any) => { priorityObj[item.id] = item.name; });
        setPriorityMap(priorityObj);

        const stageObj: Record<string, string> = {};
        stageRes.data.forEach((item: any) => { stageObj[item.id] = item.name; });
        setStageMap(stageObj);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaps();
  }, []);

  // Helper để hiển thị tên thay vì uuid
  const getDisplayValue = useCallback((key: string, value: string) => {
    if (key === 'task priority' && priorityMap[value]) return priorityMap[value];
    if ((key === 'labels' || key === 'label') && labelMap[value]) return labelMap[value];
    if (key === 'task stage' && stageMap[value]) return stageMap[value];
    if (key === 'assign') {
      return getUserName(value) || 'empty'
    };
    if (key === 'assignedUsers') {
      return getUserName(value)
    };
    return value;
  }, [labelMap, priorityMap, stageMap]);

  // Hàm build chi tiết thay đổi
  const buildActionDetails = useCallback((activity: ActivityLogDTO): string => {
    const { oldValue = {}, newValue = {} } = activity;
    const changes: string[] = [];
    if (Object.keys(oldValue).length === 0 && Object.keys(newValue).length === 0) {
      return '';
    }
    if (Object.keys(oldValue).length === 0 &&
      Object.keys(newValue).length === 1 &&
      newValue.hasOwnProperty('task')) {
      return ''; // Nếu tạo task thì không cần log chi tiết
    }
    if (Object.keys(oldValue).length !== 0 && Object.keys(newValue).length === 0) {
      for (const key of Object.keys(oldValue)) {
        const oldVal = oldValue[key];
        changes.push(
          `Removed "${key}" with value "${getDisplayValue(key, oldVal)}"`
        );
      }
      return changes.join('\n');
    }
    for (const key of Object.keys(newValue)) {
      const oldVal = oldValue[key];
      const newVal = newValue[key];
      if (key === 'assignedUsers') {
        changes.push(
          `Assigned "${getDisplayValue(key, newVal[0]) ?? 'empty'}"`
        );
      } else if (key === 'labels') {
        changes.push(
          `Add label "${getDisplayValue(key, newVal[0]) ?? 'empty'}"`
        );
      }
      else if (oldVal !== newVal) {
        changes.push(
          `"${key}" changed from "${getDisplayValue(key, oldVal) ?? 'empty'}" to "${getDisplayValue(key, newVal) ?? 'empty'}"`
        );
      }
    }
    return changes.join('\n');
  }, [getDisplayValue]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        {/* {onReload && (
          <Button type="button" size="sm" variant="outline" onClick={onReload}>
            Reload
          </Button>
        )} */}
      </div>
      <div className="space-y-4">
        {(loading || showSkeleton) ? (
          Array.from({ length: size }).map((_, idx) => (
            <div key={idx} className="flex gap-3 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                <div className="w-px h-full bg-gray-200"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-40 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          <>
            {activities.map(activity => {
              const { oldValue = {}, newValue = {} } = activity;
              if (Object.keys(oldValue).length === 0 && Object.keys(newValue).length === 0) {
                return null; // Không render activity có old và new đều null
              }
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    <div className="w-px h-full bg-gray-200"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between">
                      <p className="font-medium">{activity.userName || getUserName(activity.userId)}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {Object.keys(activity.oldValue || {}).length === 0 &&
                        Object.keys(activity.newValue || {}).length === 1 &&
                        activity.newValue?.hasOwnProperty('task')
                        ? 'Created task'
                        : 'Updated task'}
                    </p>
                    <div className="text-sm text-gray-500 mt-1">
                      {buildActionDetails(activity).split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Skeleton loading khi nhấn "See more" */}
            {showSkeleton && (
              Array.from({ length: size }).map((_, idx) => (
                <div key={idx} className="flex gap-3 animate-pulse">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                    <div className="w-px h-full bg-gray-200"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-40 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          showSkeleton ? (
            Array.from({ length: size }).map((_, idx) => (
              <div key={idx} className="flex gap-3 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                  <div className="w-px h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-40 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No activity yet</p>
          )
        )}
      </div>
      {/* Nút Xem thêm */}
      {activities.length > 0 && activities.length % size === 0 && !loading && !showSkeleton && (
        <div className="flex justify-center mt-4">
          <Button
            type='button'
            onClick={handleLoadMore}
            disabled={loading || showSkeleton}
          >
            {(loading || showSkeleton) ? 'Loading...' : 'See more'}
          </Button>
        </div>
      )}
    </div>
  );
}