import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { todoService } from '../services/todo.service';
import type { TodoList, TodoTask, CreateTaskInput, TaskContextType } from '../types/task.types';

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
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
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

      // If first sync, select all lists by default
      if (selectedLists.length === 0) {
        setSelectedLists(allLists.map(list => list.id));
      }

      // Fetch tasks from selected lists
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
  }, [accounts, getAccessToken, selectedLists.length]);

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

  // Toggle list visibility
  const toggleList = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const value: TaskContextType = {
    lists,
    tasks: tasks.filter(t => selectedLists.includes(t.listId)),
    isLoading,
    isSyncing,
    lastSyncTime,
    error,
    selectedLists,
    syncTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleList,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
