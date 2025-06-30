'use-client'
import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { TaskPriorityResponseDTO, TaskStageResponseDTO, LabelResponseDTO } from '../lib/types';


export const useLookups = () => {
  const [priorities, setPriorities] = useState<TaskPriorityResponseDTO[]>([]);
  const [statuses, setStatuses] = useState<TaskStageResponseDTO[]>([]);
  const [labels, setLabels] = useState<LabelResponseDTO[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [priRes, staRes, labRes] = await Promise.all([
        apiClient.get('/priority'),
        apiClient.get('/task-stage'),
        apiClient.get('/label'),
      ]);
      setPriorities(priRes.data);
      setStatuses(staRes.data);
      setLabels(labRes.data)
    };
    fetch();
  }, []);

  return {
    prioritiesMap: Object.fromEntries(priorities.map(p => [p.id, p])),
    statusesMap: Object.fromEntries(statuses.map(s => [s.id, s])),
    labelsMap: Object.fromEntries(labels.map(s => [s.id, s])),
  };
};
