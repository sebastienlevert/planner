import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns';

export const dateHelpers = {
  // Format dates
  formatDate(date: Date | string, formatStr: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  },

  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'p');
  },

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'PPp');
  },

  // Week operations
  getWeekStart(date: Date = new Date()): Date {
    return startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  },

  getWeekEnd(date: Date = new Date()): Date {
    return endOfWeek(date, { weekStartsOn: 0 });
  },

  getWeekDays(date: Date = new Date()): Date[] {
    const start = this.getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  },

  nextWeek(date: Date): Date {
    return addWeeks(date, 1);
  },

  previousWeek(date: Date): Date {
    return subWeeks(date, 1);
  },

  // Month operations
  getMonthStart(date: Date = new Date()): Date {
    return startOfMonth(date);
  },

  getMonthEnd(date: Date = new Date()): Date {
    return endOfMonth(date);
  },

  nextMonth(date: Date): Date {
    return addMonths(date, 1);
  },

  previousMonth(date: Date): Date {
    return subMonths(date, 1);
  },

  // Day operations
  getDayStart(date: Date = new Date()): Date {
    return startOfDay(date);
  },

  getDayEnd(date: Date = new Date()): Date {
    return endOfDay(date);
  },

  nextDay(date: Date): Date {
    return addDays(date, 1);
  },

  previousDay(date: Date): Date {
    return subDays(date, 1);
  },

  // Comparison
  isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  },

  isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isSameDay(d1, d2);
  },

  isSameMonth(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isSameMonth(d1, d2);
  },

  // Time slot generation for day/week views
  generateTimeSlots(intervalMinutes: number = 30): string[] {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const time = new Date(2000, 0, 1, hour, minute);
        slots.push(format(time, 'HH:mm'));
      }
    }
    return slots;
  },

  // Calendar grid for month view
  getMonthCalendarGrid(date: Date = new Date()): Date[][] {
    const monthStart = this.getMonthStart(date);
    const monthEnd = this.getMonthEnd(date);
    const calendarStart = this.getWeekStart(monthStart);
    const calendarEnd = this.getWeekEnd(monthEnd);

    const weeks: Date[][] = [];
    let currentWeekStart = calendarStart;

    while (currentWeekStart <= calendarEnd) {
      weeks.push(this.getWeekDays(currentWeekStart));
      currentWeekStart = this.nextWeek(currentWeekStart);
    }

    return weeks;
  },

  // Convert to ISO string for Graph API
  toISOString(date: Date): string {
    return date.toISOString();
  },

  // Parse ISO string from Graph API
  parseISOString(dateString: string): Date {
    return parseISO(dateString);
  },
};
