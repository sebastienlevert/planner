import React from 'react';
import { CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import type { TodoTask } from '../../types/task.types';
import { dateHelpers } from '../../utils/dateHelpers';

interface TaskListProps {
  showCompleted?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ showCompleted = false }) => {
  const { tasks, lists, toggleTaskComplete, deleteTask } = useTask();
  const { accounts } = useAuth();

  const filteredTasks = tasks.filter(task =>
    showCompleted ? task.status === 'completed' : task.status !== 'completed'
  );

  // Group tasks by list
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.listId]) {
      acc[task.listId] = [];
    }
    acc[task.listId].push(task);
    return acc;
  }, {} as Record<string, TodoTask[]>);

  const handleToggle = async (task: TodoTask) => {
    try {
      await toggleTaskComplete(task);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleDelete = async (task: TodoTask) => {
    if (confirm('Delete this task?')) {
      try {
        await deleteTask(task.id, task.accountId);
      } catch (error) {
        // Error is handled in context
      }
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle2 size={48} className="mx-auto mb-3 text-gray-400" />
        <p>{showCompleted ? 'No completed tasks' : 'No active tasks'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([listId, listTasks]) => {
        const list = lists.find(l => l.id === listId);
        const account = accounts.find(a => a.homeAccountId === list?.accountId);

        return (
          <div key={listId} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {list?.displayName || 'Unknown List'}
              {account && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({account.email})
                </span>
              )}
            </h3>

            <div className="space-y-2">
              {listTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(task)}
                    className="touch-target flex-shrink-0 mt-1"
                    aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={24} className="text-green-600" />
                    ) : (
                      <Circle size={24} className="text-gray-400 hover:text-primary-600" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.importance === 'high' && (
                        <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                      )}
                    </div>

                    {task.body?.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.body.content}
                      </p>
                    )}

                    {task.dueDateTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <CalendarIcon size={14} />
                        <span>
                          Due {dateHelpers.formatDate(task.dueDateTime.dateTime, 'PPP')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(task)}
                    className="btn-icon text-red-600 hover:bg-red-50 flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
