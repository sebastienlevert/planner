import React, { useState } from 'react';
import { CheckSquare, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { LoginButton } from '../components/auth/LoginButton';
import { TaskList } from '../components/tasks/TaskList';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Button } from '@/components/ui/button';

export const TasksPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isSyncing, syncTasks, lastSyncTime } = useTask();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <CheckSquare size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Task Management
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your Microsoft To Do tasks.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
            <p className="text-muted-foreground">Manage your to-do lists</p>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-xs text-muted-foreground">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={syncTasks}
              disabled={isSyncing}
              variant="ghost"
              size="icon"
              aria-label="Refresh tasks"
            >
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              New Task
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => setShowCompleted(false)}
            variant={!showCompleted ? 'default' : 'secondary'}
            className="touch-optimized"
          >
            Active
          </Button>
          <Button
            onClick={() => setShowCompleted(true)}
            variant={showCompleted ? 'default' : 'secondary'}
            className="touch-optimized"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Task List */}
      <TaskList showCompleted={showCompleted} />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
