import React, { useState } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateEventInput } from '../../types/calendar.types';
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
import { Checkbox } from '@/components/ui/checkbox';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialHour?: number;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialHour = 9,
}) => {
  const { calendars, createEvent } = useCalendar();
  const { accounts } = useAuth();

  // Only set initial values if we have calendars available
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    startDate: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: `${initialHour.toString().padStart(2, '0')}:00`,
    endDate: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endTime: `${(initialHour + 1).toString().padStart(2, '0')}:00`,
    location: '',
    calendarId: calendars.length > 0 ? calendars[0].id : '',
    accountId: calendars.length > 0 ? calendars[0].accountId : '',
    isAllDay: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when calendars are loaded
  React.useEffect(() => {
    if (calendars.length > 0 && !formData.calendarId) {
      setFormData(prev => ({
        ...prev,
        calendarId: calendars[0].id,
        accountId: calendars[0].accountId,
      }));
    }
  }, [calendars]);

  const handleCalendarChange = (calendarId: string) => {
    const selectedCalendar = calendars.find(cal => cal.id === calendarId);
    if (selectedCalendar) {
      setFormData(prev => ({
        ...prev,
        calendarId,
        accountId: selectedCalendar.accountId,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate that we have calendars and accounts
      if (calendars.length === 0) {
        throw new Error('No calendars available. Please add an account in Settings.');
      }

      if (!formData.calendarId || !formData.accountId) {
        throw new Error('Please select a calendar.');
      }

      // Verify the account exists
      const accountExists = accounts.some(acc => acc.homeAccountId === formData.accountId);
      if (!accountExists) {
        throw new Error('Account not found. Please try signing in again in Settings.');
      }

      let startDateTime: Date;
      let endDateTime: Date;

      if (formData.isAllDay) {
        // For all-day events, use midnight time
        // Microsoft Graph requires end date to be the next day at midnight
        startDateTime = new Date(`${formData.startDate}T00:00:00`);

        // Add one day to the end date for all-day events
        const endDate = new Date(`${formData.endDate}T00:00:00`);
        endDate.setDate(endDate.getDate() + 1);
        endDateTime = endDate;
      } else {
        startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      }

      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }

      const input: CreateEventInput = {
        subject: formData.subject,
        body: formData.body,
        start: startDateTime,
        end: endDateTime,
        location: formData.location,
        isAllDay: formData.isAllDay,
        calendarId: formData.calendarId,
        accountId: formData.accountId,
      };

      await createEvent(input);
      onClose();

      // Reset form
      setFormData({
        subject: '',
        body: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '10:00',
        location: '',
        calendarId: calendars[0]?.id || '',
        accountId: calendars[0]?.accountId || '',
        isAllDay: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {calendars.length === 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
              No calendars available. Please add an account in Settings to create events.
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.subject}
              onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Event title"
              required
            />
          </div>

          {/* Calendar Selection */}
          <div className="space-y-2">
            <Label htmlFor="calendar">Calendar *</Label>
            <select
              id="calendar"
              value={formData.calendarId}
              onChange={e => handleCalendarChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {calendars.map(cal => {
                const account = accounts.find(acc => acc.homeAccountId === cal.accountId);
                return (
                  <option key={cal.id} value={cal.id}>
                    {cal.name} ({account?.email || 'Unknown'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAllDay: checked as boolean }))}
            />
            <Label htmlFor="allDay" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All day event
            </Label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>

            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Add location"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.body}
              onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
              rows={3}
              placeholder="Add description"
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
              disabled={isSubmitting || calendars.length === 0}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
