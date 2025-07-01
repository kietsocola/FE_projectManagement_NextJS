import { createContext, useContext } from 'react';
import { UserDTO } from '@/app/lib/types';

export const MOCK_USERS: UserDTO[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Alice', email: 'alice@example.com' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Bob', email: 'bob@example.com' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Charlie', email: 'charlie@example.com' },
];

export const UserContext = createContext<UserDTO[]>(MOCK_USERS);

export const useUsers = () => useContext(UserContext);

export function useUserName(userId: string) {
  const users = useUsers();
  return users.find(u => u.id === userId)?.name || userId;
}