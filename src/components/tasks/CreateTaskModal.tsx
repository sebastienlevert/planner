import React, { useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateTaskInput } from '../../types/task.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { lists, createTask } = useTask();
  const { accounts } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    importance: 'normal' as 'low' | 'normal' | 'high',
    dueDate: '',
    listId: lists[0]?.id || '',
    accountId: lists[0]?.accountId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleListChange = (listId: string) => {
    const selectedList = lists.find(list => list.id === listId);
    if (selectedList) {
      setFormData(prev => ({
        ...prev,
        listId,
        accountId: selectedList.accountId,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const input: CreateTaskInput = {
        title: formData.title,
        body: formData.body || undefined,
        importance: formData.importance,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        listId: formData.listId,
        accountId: formData.accountId,
      };

      await createTask(input);
      onClose();

      // Reset form
      setFormData({
        title: '',
        body: '',
        importance: 'normal',
        dueDate: '',
        listId: lists[0]?.id || '',
        accountId: lists[0]?.accountId || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your to-do list
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task Title *</Label>
            <Input
              id="taskTitle"
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* List Selection */}
          <div className="space-y-2">
            <Label htmlFor="list">List *</Label>
            <select
              id="list"
              value={formData.listId}
              onChange={e => handleListChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {lists.map(list => {
                const account = accounts.find(acc => acc.homeAccountId === list.accountId);
                return (
                  <option key={list.id} value={list.id}>
                    {list.displayName} ({account?.email || 'Unknown'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <Label htmlFor="importance">Importance</Label>
            <select
              id="importance"
              value={formData.importance}
              onChange={e => setFormData(prev => ({ ...prev, importance: e.target.value as any }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.body}
              onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
              rows={3}
              placeholder="Add notes or details"
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
