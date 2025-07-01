// import { NextResponse } from 'next/server';
// import { TaskResponseDTO, PaginatedResponse } from '@/app/lib/types';

// const mockTasks: TaskResponseDTO[] = Array.from({ length: 50 }, (_, i) => ({
//   id: `task-${i + 1}`,
//   title: `Task ${i + 1}`,
//   description: `Description for task ${i + 1}`,
//   taskStageId: ['todo', 'in_progress', 'done'][Math.floor(Math.random() * 3)],
//   taskPriorityId: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
//   progressPercent: Math.floor(Math.random() * 100),
//   assignedUsers: ['user1', 'user2', 'user3'].slice(0, Math.floor(Math.random() * 3) + 1),
//   labels: [
//     { id: 'label-1', name: 'Bug', color: '#ef4444' },
//     { id: 'label-2', name: 'Feature', color: '#3b82f6' },
//     { id: 'label-3', name: 'Improvement', color: '#10b981' },
//   ].slice(0, Math.floor(Math.random() * 3)),
//   deadline: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   createdBy: 'admin',
//   isActive: true,
//   properties: {},
//   childCount: 0,
// }));

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
  
//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = parseInt(searchParams.get('limit') || '10');
//   const title = searchParams.get('title');
//   const taskStageId = searchParams.get('taskStageId');
//   const taskPriorityId = searchParams.get('taskPriorityId');

//   let filteredTasks = [...mockTasks];

//   if (title) {
//     filteredTasks = filteredTasks.filter(task => 
//       task.title.toLowerCase().includes(title.toLowerCase())
//     );
//   }

//   if (taskStageId) {
//     filteredTasks = filteredTasks.filter(task => task.taskStageId === taskStageId);
//   }

//   if (taskPriorityId) {
//     filteredTasks = filteredTasks.filter(task => task.taskPriorityId === taskPriorityId);
//   }

//   const startIndex = (page - 1) * limit;
//   const endIndex = startIndex + limit;
//   const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

//   const response: PaginatedResponse<TaskResponseDTO> = {
//     data: paginatedTasks,
//     total: filteredTasks.length,
//     page,
//     limit,
//   };

//   return NextResponse.json(response);
// }