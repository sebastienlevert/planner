import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { calendarService } from '../services/calendar.service';
import type { Calendar, CalendarEvent, CreateEventInput, CalendarContextType } from '../types/calendar.types';
import { StorageService } from '../services/storage.service';
import { appConfig } from '../config/app.config';
import { dateHelpers } from '../utils/dateHelpers';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const { accounts, getAccessToken } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(() => {
    // Load selected calendars from settings on mount
    const settings = StorageService.getSettings();
    return settings.selectedCalendars || [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Save selected calendars to settings whenever they change
  useEffect(() => {
    const settings = StorageService.getSettings();
    StorageService.setSettings({ ...settings, selectedCalendars });
  }, [selectedCalendars]);

  // Auto-sync on mount and when accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      syncCalendars();

      // Set up periodic sync
      const syncInterval = setInterval(() => {
        syncCalendars();
      }, appConfig.calendar.syncInterval);

      return () => clearInterval(syncInterval);
    }
  }, [accounts]);

  // Sync calendars and events from all accounts
  const syncCalendars = useCallback(async () => {
    if (accounts.length === 0) return;

    try {
      setIsSyncing(true);
      setError(null);

      // Fetch calendars from all accounts
      const allCalendars: Calendar[] = [];
      for (const account of accounts) {
        const accessToken = await getAccessToken(account.homeAccountId);
        const accountCalendars = await calendarService.getCalendars(accessToken, account.homeAccountId);
        allCalendars.push(...accountCalendars);
      }

      setCalendars(allCalendars);

      // If first sync and no calendars previously selected, select all calendars by default
      // After initial setup, respect user's selections and don't auto-add calendars
      if (selectedCalendars.length === 0 && calendars.length === 0) {
        setSelectedCalendars(allCalendars.map(cal => cal.id));
      }

      // Fetch events for the current week plus 2 weeks ahead (to support agenda view)
      const weekStart = dateHelpers.getWeekStart();
      const weekEnd = dateHelpers.getWeekEnd();
      const extendedEnd = new Date(weekEnd);
      extendedEnd.setDate(extendedEnd.getDate() + 14); // Add 2 more weeks
      await fetchEventsForDateRange(weekStart, extendedEnd, allCalendars);

      setLastSyncTime(Date.now());
      StorageService.setCalendarCache({ calendars: allCalendars, events, timestamp: Date.now() });
    } catch (err) {
      console.error('Calendar sync failed:', err);
      setError('Failed to sync calendars. Please try again.');
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [accounts, getAccessToken, selectedCalendars.length, calendars.length]);

  // Fetch events for a specific date range
  const fetchEventsForDateRange = async (
    startDate: Date,
    endDate: Date,
    cals?: Calendar[]
  ): Promise<void> => {
    const calendarsToFetch = cals || calendars;
    if (calendarsToFetch.length === 0 || accounts.length === 0) return;

    try {
      const allEvents: CalendarEvent[] = [];

      // Fetch events from each calendar individually
      for (const calendar of calendarsToFetch) {
        const accessToken = await getAccessToken(calendar.accountId);
        const calendarEvents = await calendarService.getEvents(
          calendar.id,
          accessToken,
          calendar.accountId,
          startDate,
          endDate
        );
        allEvents.push(...calendarEvents);
      }

      setEvents(allEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      throw err;
    }
  };

  // Create a new event
  const createEvent = async (input: CreateEventInput): Promise<CalendarEvent> => {
    try {
      const accessToken = await getAccessToken(input.accountId);
      const newEvent = await calendarService.createEvent(input, accessToken);

      // Add to local state
      setEvents(prev => [...prev, newEvent]);

      return newEvent;
    } catch (err) {
      console.error('Failed to create event:', err);
      throw new Error('Failed to create event. Please try again.');
    }
  };

  // Update an existing event
  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>): Promise<void> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const accessToken = await getAccessToken(event.accountId);
      await calendarService.updateEvent(eventId, updates, accessToken);

      // Update local state
      setEvents(prev =>
        prev.map(e => (e.id === eventId ? { ...e, ...updates } : e))
      );
    } catch (err) {
      console.error('Failed to update event:', err);
      throw new Error('Failed to update event. Please try again.');
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string, accountId: string): Promise<void> => {
    try {
      const accessToken = await getAccessToken(accountId);
      await calendarService.deleteEvent(eventId, accessToken);

      // Remove from local state
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw new Error('Failed to delete event. Please try again.');
    }
  };

  // Toggle calendar visibility
  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  // Get events for a specific date range (filtered by selected calendars)
  const getEventsForDateRange = (startDate: Date, endDate: Date): CalendarEvent[] => {
    return events.filter(event => {
      if (!selectedCalendars.includes(event.calendarId)) return false;

      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      return eventStart <= endDate && eventEnd >= startDate;
    });
  };

  const value: CalendarContextType = {
    calendars,
    events: events.filter(e => selectedCalendars.includes(e.calendarId)),
    isLoading,
    isSyncing,
    lastSyncTime,
    error,
    selectedCalendars,
    syncCalendars,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleCalendar,
    getEventsForDateRange,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
