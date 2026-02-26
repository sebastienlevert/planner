import { graphService } from './graph.service';
import type { Calendar, CalendarEvent, CreateEventInput } from '../types/calendar.types';

export class CalendarService {
  // Fetch all calendars for an account
  async getCalendars(accessToken: string, accountId: string): Promise<Calendar[]> {
    try {
      const response: any = await graphService.getCalendars(accessToken);

      return response.value.map((cal: any) => ({
        id: cal.id,
        name: cal.name,
        color: cal.hexColor || this.generateColor(cal.id),
        owner: {
          name: cal.owner?.name || 'Unknown',
          address: cal.owner?.address || '',
        },
        canEdit: cal.canEdit !== false,
        accountId,
        isDefault: cal.isDefaultCalendar || false,
      }));
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
      throw error;
    }
  }

  // Fetch events for a calendar within a date range
  // Uses calendarView to expand recurring event instances
  async getEvents(
    calendarId: string,
    accessToken: string,
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const startDateTime = startDate.toISOString();
      const endDateTime = endDate.toISOString();

      // Use calendarView instead of events endpoint to get recurring event instances
      const response: any = await graphService.getCalendarViewForCalendar(
        calendarId,
        accessToken,
        startDateTime,
        endDateTime
      );

      return response.value.map((event: any) => this.mapGraphEventToCalendarEvent(event, calendarId, accountId));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  // Fetch all events across all calendars using calendar view
  async getAllEvents(
    accessToken: string,
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const startDateTime = startDate.toISOString();
      const endDateTime = endDate.toISOString();

      const response: any = await graphService.getCalendarView(
        accessToken,
        startDateTime,
        endDateTime
      );

      return response.value.map((event: any) => {
        // Microsoft Graph returns calendar ID in parentFolderId for calendarView
        const calendarId = event.parentFolderId || event.calendar?.id || event.calendarId || '';
        return this.mapGraphEventToCalendarEvent(event, calendarId, accountId);
      });
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      throw error;
    }
  }

  // Create a new event
  async createEvent(input: CreateEventInput, accessToken: string): Promise<CalendarEvent> {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format dates properly for all-day events
      let startDateTime: string;
      let endDateTime: string;

      if (input.isAllDay) {
        // For all-day events, use date-only format (YYYY-MM-DD) and set time to midnight
        const startDate = new Date(input.start);
        const endDate = new Date(input.end);

        // Format as YYYY-MM-DD
        const formatDateOnly = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        startDateTime = `${formatDateOnly(startDate)}T00:00:00`;
        endDateTime = `${formatDateOnly(endDate)}T00:00:00`;
      } else {
        // For regular events, use full ISO string
        startDateTime = input.start.toISOString();
        endDateTime = input.end.toISOString();
      }

      const eventData = {
        subject: input.subject,
        body: input.body ? {
          contentType: 'text',
          content: input.body,
        } : undefined,
        start: {
          dateTime: startDateTime,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timeZone,
        },
        location: input.location ? {
          displayName: input.location,
        } : undefined,
        isAllDay: input.isAllDay || false,
        attendees: input.attendees?.map(email => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
      };

      const response: any = await graphService.createEvent(
        input.calendarId,
        accessToken,
        eventData
      );

      return this.mapGraphEventToCalendarEvent(response, input.calendarId, input.accountId);
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    accessToken: string
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.subject) updateData.subject = updates.subject;
      if (updates.bodyPreview) {
        updateData.body = {
          contentType: 'text',
          content: updates.bodyPreview,
        };
      }
      if (updates.start) {
        updateData.start = {
          dateTime: updates.start.dateTime,
          timeZone: updates.start.timeZone,
        };
      }
      if (updates.end) {
        updateData.end = {
          dateTime: updates.end.dateTime,
          timeZone: updates.end.timeZone,
        };
      }
      if (updates.location) {
        updateData.location = {
          displayName: updates.location.displayName,
        };
      }

      await graphService.updateEvent(eventId, accessToken, updateData);
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId: string, accessToken: string): Promise<void> {
    try {
      await graphService.deleteEvent(eventId, accessToken);
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }

  // Helper: Map Graph API event to our CalendarEvent type
  private mapGraphEventToCalendarEvent(
    event: any,
    calendarId: string,
    accountId: string
  ): CalendarEvent {
    return {
      id: event.id,
      calendarId,
      accountId,
      subject: event.subject || '(No title)',
      bodyPreview: event.bodyPreview,
      start: {
        dateTime: event.start.dateTime,
        timeZone: event.start.timeZone || 'UTC',
      },
      end: {
        dateTime: event.end.dateTime,
        timeZone: event.end.timeZone || 'UTC',
      },
      location: event.location ? {
        displayName: event.location.displayName,
      } : undefined,
      isAllDay: event.isAllDay || false,
      isCancelled: event.isCancelled || false,
      isOrganizer: event.isOrganizer !== false,
      organizer: event.organizer ? {
        emailAddress: {
          name: event.organizer.emailAddress.name,
          address: event.organizer.emailAddress.address,
        },
      } : undefined,
      attendees: event.attendees?.map((att: any) => ({
        emailAddress: {
          name: att.emailAddress.name,
          address: att.emailAddress.address,
        },
        status: {
          response: att.status.response,
          time: att.status.time,
        },
      })),
      recurrence: event.recurrence,
    };
  }

  // Helper: Generate a color from calendar ID
  private generateColor(id: string): string {
    const colors = [
      '#0ea5e9', // blue
      '#8b5cf6', // purple
      '#10b981', // green
      '#f59e0b', // orange
      '#ef4444', // red
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];

    // Simple hash function to get consistent color for calendar ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

export const calendarService = new CalendarService();
