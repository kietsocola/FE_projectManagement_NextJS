'use client';

import { format } from 'date-fns';
import { ActivityLogDTO } from '@/app/lib/types';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/app/lib/api';
import { useProjectId } from '@/app/context/ProjectContext';
import { useUserName } from '@/app/context/UserContext';

interface TaskActivityProps {
  activities: ActivityLogDTO[];
}

export default function TaskActivity({ activities }: TaskActivityProps) {
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [priorityMap, setPriorityMap] = useState<Record<string, string>>({});
  const [stageMap, setStageMap] = useState<Record<string, string>>({});
  const projectId = useProjectId();

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
        // handle error
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
      return useUserName(value) || 'empty'
    };
    if (key === 'assignedUsers') {
      return useUserName(value)
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
      if (key==='assignedUsers'){
        changes.push(
          `Assigned "${getDisplayValue(key, newVal[0]) ?? 'empty'}"`
        );
      }else if (oldVal !== newVal) {
        changes.push(
          `"${key}" changed from "${getDisplayValue(key, oldVal) ?? 'empty'}" to "${getDisplayValue(key, newVal) ?? 'empty'}"`
        );
      }
    }
    return changes.join('\n');
  }, [getDisplayValue]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map(activity => {
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
                    <p className="font-medium">{activity.userName || useUserName(activity.userId)}</p>
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
          })
        ) : (
          <p className="text-gray-500">No activity yet</p>
        )}
      </div>
    </div>
  );
}