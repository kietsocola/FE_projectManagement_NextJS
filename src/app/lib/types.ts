export interface TaskResponseDTO {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  parentTaskId?: string;
  taskStageId?: string;
  taskPriorityId?: string;
  milestoneId?: string;
  startDate?: string;
  deadline?: string;
  completeDate?: string;
  progressPercent?: number;
  isAutoCalculateProgress?: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  labels: LabelResponseDTO[];
  assignedUsers: string[];
  isActive: boolean;
  properties: Record<string, unknown>;
  childCount: number;
}

export interface LabelResponseDTO {
  id: string;
  name: string;
  color: string;
}
export interface TaskStageResponseDTO {
  id: string;
  name: string;
  color?: string;
  sortOder: number;
}
export interface TaskPriorityResponseDTO {
  id: string;
  name: string;
  color: string;
  sortOder: number;
}

export interface TaskFilterDTO {
  title?: string;
  description?: string;
  projectId?: string;
  taskStageId?: string;
  taskPriorityId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  isPublic?: boolean;
  isActive?: boolean;
  assignedUserId?: string;
  labelId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortDirection: string;
  search: string;
  searchFor: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CommentDTO {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  childComments: CommentDTO[];
  hasMoreChildren: boolean;
  childCount: number;
}

export interface ActivityLogDTO {
  id: string,
  taskId: string;
  userId: string;
  oldValue?: Record<string, any>;
  newValue: Record<string, any>;
  timestamp: string;
  userName: string;
}

export interface SubtaskDTO {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}