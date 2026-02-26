import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { dateHelpers } from '../../utils/dateHelpers';
import type { CalendarEvent } from '../../types/calendar.types';
import { EventCard } from './EventCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DayViewProps {
  currentDate: Date;
  onCreateEvent?: (date: Date, hour: number) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
}

export const DayView: React.FC<DayViewProps> = ({ currentDate, onCreateEvent, onEventClick }) => {
  const { events, getEventsForDateRange, calendars } = useCalendar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sevenAmRef = useRef<HTMLDivElement>(null);
  const [allDayDialogOpen, setAllDayDialogOpen] = useState(false);

  const MAX_VISIBLE_ALL_DAY = 3; // Show max 3 all-day events before "+X more" button

  const dayStart = useMemo(() => {
    return dateHelpers.getDayStart(currentDate);
  }, [currentDate]);

  const dayEnd = useMemo(() => {
    return dateHelpers.getDayEnd(currentDate);
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    return getEventsForDateRange(dayStart, dayEnd);
  }, [dayStart, dayEnd, events]);

  // Separate all-day events from timed events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter(event => event.isAllDay);
  }, [dayEvents]);

  const timedEvents = useMemo(() => {
    return dayEvents.filter(event => !event.isAllDay);
  }, [dayEvents]);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  // Scroll to 7AM on mount and when date changes
  useEffect(() => {
    if (sevenAmRef.current) {
      sevenAmRef.current.scrollIntoView({ block: 'start' });
    }
  }, [currentDate]);

  // Calculate event positions with overlap handling (only for timed events)
  const positionedEvents = useMemo((): PositionedEvent[] => {
    const HOUR_HEIGHT = 70; // Must match minHeight in JSX

    const positioned: PositionedEvent[] = timedEvents.map(event => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Clamp to current day boundaries
      const clampedStart = eventStart < dayStart ? dayStart : eventStart;
      const clampedEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

      // Calculate position
      const startHour = clampedStart.getHours();
      const startMinutes = clampedStart.getMinutes();
      const endHour = clampedEnd.getHours();
      const endMinutes = clampedEnd.getMinutes();

      const startOffset = startHour + startMinutes / 60;
      const endOffset = endHour + endMinutes / 60;
      const duration = endOffset - startOffset;

      return {
        event,
        top: startOffset * HOUR_HEIGHT,
        height: Math.max(duration * HOUR_HEIGHT, 40), // Minimum 40px height
        left: 0,
        width: 100,
      };
    });

    // Sort by start time, then by duration (longer events first)
    positioned.sort((a, b) => {
      if (a.top !== b.top) return a.top - b.top;
      return b.height - a.height;
    });

    // Detect overlaps and assign columns
    const columns: PositionedEvent[][] = [];

    positioned.forEach(event => {
      // Find a column where this event doesn't overlap
      let placed = false;
      for (const column of columns) {
        const hasOverlap = column.some(e => {
          return event.top < e.top + e.height && event.top + event.height > e.top;
        });

        if (!hasOverlap) {
          column.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    });

    // Calculate widths and left positions
    const totalColumns = columns.length;
    columns.forEach((column, columnIndex) => {
      column.forEach(event => {
        event.width = 100 / totalColumns;
        event.left = (100 / totalColumns) * columnIndex;
      });
    });

    return positioned;
  }, [timedEvents]);

  const handleSlotClick = (hour: number) => {
    if (onCreateEvent) {
      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);
      onCreateEvent(slotDate, hour);
    }
  };

  const isToday = dateHelpers.isToday(currentDate);

  return (
    <div className="flex flex-col h-full">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="flex">
            <div className="w-24 flex-shrink-0 py-1 px-2 text-xs font-medium text-muted-foreground border-r border-border flex items-center justify-end">
              All day
            </div>
            <div className="flex-1 py-0.5 px-2 space-y-0.5">
              {allDayEvents.slice(0, MAX_VISIBLE_ALL_DAY).map(event => {
                const calendar = calendars.find(cal => cal.id === event.calendarId);
                const eventColor = calendar?.color || '#0ea5e9';

                return (
                  <div
                    key={event.id}
                    className="rounded px-2 py-0.5 text-xs cursor-pointer transition-opacity hover:opacity-80 truncate"
                    style={{
                      backgroundColor: `${eventColor}40`,
                      color: eventColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.subject}
                  </div>
                );
              })}
              {allDayEvents.length > MAX_VISIBLE_ALL_DAY && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-full text-xs hover:bg-muted/50 py-0"
                  onClick={() => setAllDayDialogOpen(true)}
                >
                  +{allDayEvents.length - MAX_VISIBLE_ALL_DAY} more
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-background overlay-scrollbar">
        <div className="flex min-h-full">
          {/* Hour labels */}
          <div className="w-24 flex-shrink-0 bg-card border-r border-border">
            {hours.map(hour => (
              <div
                key={hour}
                ref={hour === 7 ? sevenAmRef : null}
                className="p-2 text-xs text-muted-foreground text-right border-b border-border"
                style={{ minHeight: '70px' }}
              >
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Events area */}
          <div className="flex-1 relative">
            {/* Hour slots (background grid) */}
            {hours.map(hour => (
              <div
                key={hour}
                className={`border-b border-border cursor-pointer transition-colors hover:bg-secondary/20 touch-optimized ${
                  isToday ? 'bg-secondary/80' : 'bg-card'
                }`}
                style={{ minHeight: '70px' }}
                onClick={() => handleSlotClick(hour)}
              >
                {positionedEvents.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Plus size={18} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Positioned events (absolute overlay) */}
            {positionedEvents.map(({ event, top, height, left, width }) => (
              <div
                key={event.id}
                className="absolute p-1"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `${left}%`,
                  width: `${width}%`,
                }}
              >
                <div className="h-full">
                  <EventCard
                    event={event}
                    compact
                    onClick={() => onEventClick?.(event)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All-day events dialog */}
      <Dialog open={allDayDialogOpen} onOpenChange={setAllDayDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              All-day events - {dateHelpers.formatDate(currentDate, 'EEEE, MMMM d')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {allDayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => {
                  setAllDayDialogOpen(false);
                  onEventClick?.(event);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
