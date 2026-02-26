import { graphService } from './graph.service';
import type { TodoList, TodoTask, CreateTaskInput } from '../types/task.types';

export class TodoService {
  // Fetch all To Do lists for an account
  async getTodoLists(accessToken: string, accountId: string): Promise<TodoList[]> {
    try {
      const response: any = await graphService.get('/me/todo/lists', accessToken);

      return response.value.map((list: any) => ({
        id: list.id,
        displayName: list.displayName,
        isOwner: list.isOwner !== false,
        isShared: list.isShared || false,
        accountId,
      }));
    } catch (error) {
      console.error('Failed to fetch To Do lists:', error);
      throw error;
    }
  }

  // Fetch tasks from a specific list
  async getTasksFromList(listId: string, accessToken: string, accountId: string): Promise<TodoTask[]> {
    try {
      const response: any = await graphService.get(
        `/me/todo/lists/${listId}/tasks?$top=100`,
        accessToken
      );

      return response.value.map((task: any) => this.mapGraphTaskToTodoTask(task, listId, accountId));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  // Fetch all tasks from all lists
  async getAllTasks(accessToken: string, accountId: string, listIds: string[]): Promise<TodoTask[]> {
    try {
      const allTasks: TodoTask[] = [];

      for (const listId of listIds) {
        const tasks = await this.getTasksFromList(listId, accessToken, accountId);
        allTasks.push(...tasks);
      }

      return allTasks;
    } catch (error) {
      console.error('Failed to fetch all tasks:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(input: CreateTaskInput, accessToken: string): Promise<TodoTask> {
    try {
      const taskData: any = {
        title: input.title,
        importance: input.importance || 'normal',
        status: 'notStarted',
      };

      if (input.body) {
        taskData.body = {
          content: input.body,
          contentType: 'text',
        };
      }

      if (input.dueDate) {
        taskData.dueDateTime = {
          dateTime: input.dueDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }

      const response: any = await graphService.post(
        `/me/todo/lists/${input.listId}/tasks`,
        accessToken,
        taskData
      );

      return this.mapGraphTaskToTodoTask(response, input.listId, input.accountId);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(
    listId: string,
    taskId: string,
    updates: Partial<TodoTask>,
    accessToken: string
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.title) updateData.title = updates.title;
      if (updates.importance) updateData.importance = updates.importance;
      if (updates.status) updateData.status = updates.status;

      if (updates.body) {
        updateData.body = {
          content: updates.body.content,
          contentType: updates.body.contentType || 'text',
        };
      }

      if (updates.dueDateTime) {
        updateData.dueDateTime = updates.dueDateTime;
      }

      await graphService.patch(
        `/me/todo/lists/${listId}/tasks/${taskId}`,
        accessToken,
        updateData
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(listId: string, taskId: string, accessToken: string): Promise<void> {
    try {
      await graphService.delete(`/me/todo/lists/${listId}/tasks/${taskId}`, accessToken);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  // Toggle task completion
  async toggleTaskComplete(task: TodoTask, accessToken: string): Promise<TodoTask> {
    try {
      const newStatus = task.status === 'completed' ? 'notStarted' : 'completed';

      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'completed') {
        updateData.completedDateTime = {
          dateTime: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      } else {
        updateData.completedDateTime = null;
      }

      const response: any = await graphService.patch(
        `/me/todo/lists/${task.listId}/tasks/${task.id}`,
        accessToken,
        updateData
      );

      return this.mapGraphTaskToTodoTask(response, task.listId, task.accountId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
      throw error;
    }
  }

  // Helper: Map Graph API task to our TodoTask type
  private mapGraphTaskToTodoTask(task: any, listId: string, accountId: string): TodoTask {
    return {
      id: task.id,
      listId,
      accountId,
      title: task.title || '(No title)',
      body: task.body,
      importance: task.importance || 'normal',
      status: task.status || 'notStarted',
      isReminderOn: task.isReminderOn || false,
      reminderDateTime: task.reminderDateTime,
      dueDateTime: task.dueDateTime,
      completedDateTime: task.completedDateTime,
      createdDateTime: task.createdDateTime,
      lastModifiedDateTime: task.lastModifiedDateTime,
    };
  }
}

export const todoService = new TodoService();
