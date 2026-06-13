import { apiClient } from '../api/axios';
import { Task } from '../types/auth';

function is404(error: any): boolean {
  return error?.response?.status === 404;
}

export async function fetchTasks(status?: string): Promise<Task[]> {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get<Task[]>('/tasks', { params });
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    if (is404(error)) return [];
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${taskId}/status`, { status });
  return response.data;
}
