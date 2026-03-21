import React, { useState, useEffect } from 'react';
import { Check, CheckSquare, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTask } from '../contexts/TaskContext';
import { LoginButton } from '../components/auth/LoginButton';
import { TaskList } from '../components/tasks/TaskList';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Button } from '@/components/ui/button';

export const TasksPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const { isSyncing, syncTasks, lastSyncTime, isLoading } = useTask();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Trigger first sync when page is opened
  useEffect(() => {
    if (isAuthenticated && !lastSyncTime) {
      syncTasks();
    }
  }, [isAuthenticated, lastSyncTime, syncTasks]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <CheckSquare size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t.tasks.taskManagement}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t.tasks.signInMessage}
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
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCompleted(false)}
              variant={!showCompleted ? 'default' : 'secondary'}
              className="touch-optimized"
            >
              {t.tasks.active}
            </Button>
            <Button
              onClick={() => setShowCompleted(true)}
              variant={showCompleted ? 'default' : 'secondary'}
              className="touch-optimized"
            >
              {t.tasks.completed}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync status — same as calendar */}
            <div className="flex items-center">
              {(isSyncing || isLoading) ? (
                <div className="w-9 h-9 flex items-center justify-center">
                  <Loader2 size={18} className="text-primary animate-spin" />
                </div>
              ) : lastSyncTime ? (
                <div className="w-9 h-9 flex items-center justify-center text-green-500">
                  <Check size={18} strokeWidth={3} />
                </div>
              ) : null}
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              {t.actions.newTask}
            </Button>
          </div>
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
