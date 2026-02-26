export interface Calendar {
  id: string;
  name: string;
  color: string;
  owner: {
    name: string;
    address: string;
  };
  canEdit: boolean;
  accountId: string;
  isDefault: boolean;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  accountId: string;
  subject: string;
  bodyPreview?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isAllDay: boolean;
  isCancelled: boolean;
  isOrganizer: boolean;
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  attendees?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
    status: {
      response: string;
      time: string;
    };
  }>;
  recurrence?: any;
  color?: string;
}

export interface CreateEventInput {
  subject: string;
  body?: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay?: boolean;
  calendarId: string;
  accountId: string;
  attendees?: string[];
}

export interface CalendarState {
  calendars: Calendar[];
  events: CalendarEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
  selectedCalendars: string[];
}

export interface CalendarContextType extends CalendarState {
  syncCalendars: () => Promise<void>;
  createEvent: (event: CreateEventInput) => Promise<CalendarEvent>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string, accountId: string) => Promise<void>;
  toggleCalendar: (calendarId: string) => void;
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[];
  ensureDateRange: (start: Date, end: Date) => void;
}

export type CalendarView = 'week' | 'day' | 'month' | 'agenda';
