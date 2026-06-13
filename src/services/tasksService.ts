import { apiClient } from '../api/axios';
import { Task } from '../types/auth';

export async function fetchTasks(status?: string): Promise<Task[]> {
  const params = status ? { status } : {};
  const response = await apiClient.get<Task[]>('/tasks', { params });
  return response.data;
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${taskId}/status`, { status });
  return response.data;
}
