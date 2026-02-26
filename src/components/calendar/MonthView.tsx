import React, { useMemo, useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useLocale } from '../../contexts/LocaleContext';
import { dateHelpers } from '../../utils/dateHelpers';
import type { CalendarEvent } from '../../types/calendar.types';

interface MonthViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, onDateClick, onEventClick }) => {
  const { events, getEventsForDateRange, ensureDateRange } = useCalendar();
  const { locale } = useLocale();

  const calendarGrid = useMemo(() => {
    return dateHelpers.getMonthCalendarGrid(currentDate);
  }, [currentDate]);

  const gridStart = useMemo(() => calendarGrid[0][0], [calendarGrid]);
  const gridEnd = useMemo(() => calendarGrid[calendarGrid.length - 1][6], [calendarGrid]);

  // Ensure events are loaded for the visible month grid
  useEffect(() => {
    ensureDateRange(gridStart, gridEnd);
  }, [gridStart, gridEnd, ensureDateRange]);

  const monthEvents = useMemo(() => {
    return getEventsForDateRange(gridStart, gridEnd);
  }, [gridStart, gridEnd, events]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dayStart = dateHelpers.getDayStart(date);
    const dayEnd = dateHelpers.getDayEnd(date);

    return monthEvents.filter(event => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const isCurrentMonth = (date: Date) => {
    return dateHelpers.isSameMonth(date, currentDate);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b bg-card">
        {dateHelpers.getWeekDays(currentDate).map(day => (
          <div key={day.toISOString()} className="p-3 text-center text-base font-medium text-muted-foreground border-r border-border last:border-r-0">
            {dateHelpers.formatDate(day, 'EEE', locale)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="flex flex-col h-full">
          {calendarGrid.map((week, weekIndex) => {
            // Check if this week contains today
            const containsToday = week.some(date => dateHelpers.isToday(date));

            return (
              <div
                key={weekIndex}
                className={`grid grid-cols-7 border-b ${
                  containsToday ? 'flex-[2]' : 'flex-1'
                }`}
              >
                {week.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                const isToday = dateHelpers.isToday(date);
                const inCurrentMonth = isCurrentMonth(date);

                return (
                  <div
                    key={dayIndex}
                    className={`border-r border-border last:border-r-0 p-3 cursor-pointer hover:bg-secondary/20 transition-colors touch-optimized ${
                      !inCurrentMonth ? 'bg-muted' : 'bg-card'
                    } ${isToday ? 'bg-secondary border-2 border-muted-foreground/30' : ''}`}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="flex flex-col h-full">
                      {/* Date number */}
                      <div className={`text-base font-medium mb-1 ${
                        isToday
                          ? 'bg-muted-foreground text-background rounded-full w-6 h-6 flex items-center justify-center font-bold'
                          : !inCurrentMonth
                          ? 'text-muted-foreground/50'
                          : 'text-foreground'
                      }`}>
                        {date.getDate()}
                      </div>

                      {/* Event indicators */}
                      <div className="flex-1 overflow-hidden">
                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {/* All-day events first */}
                            {dayEvents
                              .filter(event => event.isAllDay)
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className="text-sm px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity break-words font-semibold"
                                  style={{
                                    backgroundColor: `${event.color || '#0ea5e9'}50`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick?.(event);
                                  }}
                                >
                                  {event.subject}
                                </div>
                              ))}

                            {/* Timed events with time */}
                            {dayEvents
                              .filter(event => !event.isAllDay)
                              .map((event) => {
                                const eventStart = new Date(event.start.dateTime);
                                const eventEnd = new Date(event.end.dateTime);
                                const eventTime = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}-${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')} `;

                                return (
                                  <div
                                    key={event.id}
                                    className="text-sm px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity break-words"
                                    style={{
                                      backgroundColor: `${event.color || '#0ea5e9'}40`,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEventClick?.(event);
                                    }}
                                  >
                                    {eventTime}{event.subject}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
