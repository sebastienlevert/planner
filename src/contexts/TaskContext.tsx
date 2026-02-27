import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { todoService } from '../services/todo.service';
import { StorageService } from '../services/storage.service';
import type { TodoList, TodoTask, CreateTaskInput, ChecklistItem, TodoListSettings, TaskContextType } from '../types/task.types';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { accounts, getAccessToken } = useAuth();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>(() => {
    const settings = StorageService.getSettings();
    return settings.selectedTodoLists || [];
  });
  const [listSettings, setListSettingsState] = useState<Record<string, TodoListSettings>>(() => {
    const settings = StorageService.getSettings();
    return settings.todoListSettings || {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync on mount and when accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      syncTasks();
    }
  }, [accounts]);

  // Sync To Do lists and tasks from all accounts
  const syncTasks = useCallback(async () => {
    if (accounts.length === 0) return;

    try {
      setIsSyncing(true);
      setError(null);

      // Fetch lists from all accounts
      const allLists: TodoList[] = [];
      for (const account of accounts) {
        const accessToken = await getAccessToken(account.homeAccountId);
        const accountLists = await todoService.getTodoLists(accessToken, account.homeAccountId);
        allLists.push(...accountLists);
      }

      setLists(allLists);

      // If no persisted selection, select all lists by default
      const currentSettings = StorageService.getSettings();
      let activeSelectedLists = currentSettings.selectedTodoLists;
      if (!activeSelectedLists || activeSelectedLists.length === 0) {
        activeSelectedLists = allLists.map(list => list.id);
        setSelectedLists(activeSelectedLists);
        StorageService.setSettings({ ...currentSettings, selectedTodoLists: activeSelectedLists });
      }

      // Fetch tasks from all lists (not just selected — we need them for settings)
      const allTasks: TodoTask[] = [];
      for (const account of accounts) {
        const accessToken = await getAccessToken(account.homeAccountId);
        const accountListIds = allLists
          .filter(list => list.accountId === account.homeAccountId)
          .map(list => list.id);

        const accountTasks = await todoService.getAllTasks(
          accessToken,
          account.homeAccountId,
          accountListIds
        );
        allTasks.push(...accountTasks);
      }

      setTasks(allTasks);
      setLastSyncTime(Date.now());
    } catch (err) {
      console.error('Task sync failed:', err);
      setError('Failed to sync tasks. Please try again.');
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [accounts, getAccessToken]);

  // Create a new task
  const createTask = async (input: CreateTaskInput): Promise<TodoTask> => {
    try {
      const accessToken = await getAccessToken(input.accountId);
      const newTask = await todoService.createTask(input, accessToken);

      // Add to local state
      setTasks(prev => [newTask, ...prev]);

      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw new Error('Failed to create task. Please try again.');
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<TodoTask>): Promise<void> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const accessToken = await getAccessToken(task.accountId);
      await todoService.updateTask(task.listId, taskId, updates, accessToken);

      // Update local state
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
      );
    } catch (err) {
      console.error('Failed to update task:', err);
      throw new Error('Failed to update task. Please try again.');
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string, accountId: string): Promise<void> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const accessToken = await getAccessToken(accountId);
      await todoService.deleteTask(task.listId, taskId, accessToken);

      // Remove from local state
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw new Error('Failed to delete task. Please try again.');
    }
  };

  // Toggle task completion
  const toggleTaskComplete = async (task: TodoTask): Promise<void> => {
    try {
      const accessToken = await getAccessToken(task.accountId);
      const updatedTask = await todoService.toggleTaskComplete(task, accessToken);

      // Update local state
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? updatedTask : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
      throw new Error('Failed to update task. Please try again.');
    }
  };

  // Toggle list visibility (persists to storage)
  const toggleList = (listId: string) => {
    setSelectedLists(prev => {
      const updated = prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId];
      const settings = StorageService.getSettings();
      StorageService.setSettings({ ...settings, selectedTodoLists: updated });
      return updated;
    });
  };

  // Set per-list settings (persists to storage)
  const setListSettings = (listId: string, newSettings: TodoListSettings) => {
    setListSettingsState(prev => {
      const updated = { ...prev, [listId]: newSettings };
      const settings = StorageService.getSettings();
      StorageService.setSettings({ ...settings, todoListSettings: updated });
      return updated;
    });
  };

  // Checklist item operations
  const getChecklistItems = async (task: TodoTask): Promise<ChecklistItem[]> => {
    const accessToken = await getAccessToken(task.accountId);
    return todoService.getChecklistItems(task.listId, task.id, accessToken, task.accountId);
  };

  const createChecklistItem = async (task: TodoTask, displayName: string): Promise<ChecklistItem> => {
    const accessToken = await getAccessToken(task.accountId);
    return todoService.createChecklistItem(task.listId, task.id, displayName, accessToken, task.accountId);
  };

  const deleteChecklistItem = async (task: TodoTask, itemId: string): Promise<void> => {
    const accessToken = await getAccessToken(task.accountId);
    await todoService.deleteChecklistItem(task.listId, task.id, itemId, accessToken);
  };

  const toggleChecklistItem = async (task: TodoTask, item: ChecklistItem): Promise<ChecklistItem> => {
    const accessToken = await getAccessToken(task.accountId);
    return todoService.toggleChecklistItem(task.listId, task.id, item, accessToken);
  };

  const value: TaskContextType = {
    lists,
    tasks: tasks.filter(t => selectedLists.includes(t.listId)),
    isLoading,
    isSyncing,
    lastSyncTime,
    error,
    selectedLists,
    listSettings,
    syncTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleList,
    setListSettings,
    getChecklistItems,
    createChecklistItem,
    deleteChecklistItem,
    toggleChecklistItem,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
