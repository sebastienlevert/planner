import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { dateHelpers } from '../../utils/dateHelpers';
import type { CalendarEvent } from '../../types/calendar.types';
import { EventCard } from './EventCard';
import { addDays } from 'date-fns';

interface AgendaViewProps {
  currentDate: Date;
  onCreateEvent?: (date: Date, hour: number) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ currentDate, onCreateEvent, onDateChange, onEventClick }) => {
  const { events, getEventsForDateRange } = useCalendar();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Generate array of days starting from currentDate - only show 5 days
  const visibleDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentDate, i));
  }, [currentDate]);

  // Get events for the visible date range
  const rangeStart = useMemo(() => dateHelpers.getDayStart(visibleDays[0]), [visibleDays]);
  const rangeEnd = useMemo(() => dateHelpers.getDayEnd(visibleDays[visibleDays.length - 1]), [visibleDays]);
  const rangeEvents = useMemo(() => {
    return getEventsForDateRange(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, events]);

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dayStart = dateHelpers.getDayStart(day);
    const dayEnd = dateHelpers.getDayEnd(day);

    return rangeEvents
      .filter(event => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        return eventStart < dayEnd && eventEnd > dayStart;
      })
      .sort((a, b) => {
        const aStart = new Date(a.start.dateTime);
        const bStart = new Date(b.start.dateTime);
        return aStart.getTime() - bStart.getTime();
      });
  };

  const handleDayClick = (day: Date) => {
    if (onCreateEvent) {
      const hour = new Date().getHours();
      onCreateEvent(day, hour);
    }
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !onDateChange) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next day
      onDateChange(dateHelpers.nextDay(currentDate));
    } else if (isRightSwipe) {
      // Swipe right = previous day
      onDateChange(dateHelpers.previousDay(currentDate));
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Day columns - no scroll */}
      <div className="flex-1 overflow-y-hidden">
        <div className="flex h-full">
          {visibleDays.map((day, index) => {
            const isToday = dateHelpers.isToday(day);
            const dayEvents = getEventsForDay(day);
            const isFirstDay = index === 0;

            return (
              <div
                key={day.toISOString()}
                className={`flex-shrink-0 border-r border-border ${
                  isFirstDay ? 'w-[40%] min-w-[320px]' : 'w-[15%] min-w-[180px]'
                }`}
                style={{
                  width: isFirstDay ? '40%' : '15%',
                }}
              >
                {/* Day header */}
                <div
                  className={`sticky top-0 z-10 p-4 border-b border-border bg-card ${
                    isToday ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {dateHelpers.formatDate(day, 'EEE')}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      isToday ? 'text-foreground' : 'text-foreground'
                    }`}>
                      {dateHelpers.formatDate(day, 'd')}
                    </div>
                  </div>
                </div>

                {/* Events container - scrollable vertically */}
                <div className="h-full overflow-y-auto pb-20">
                  <div className="p-3 space-y-2">
                    {dayEvents.length > 0 ? (
                      dayEvents.map(event => {
                        const eventEnd = new Date(event.end.dateTime);
                        const isPast = eventEnd < new Date();

                        return (
                          <EventCard
                            key={event.id}
                            event={event}
                            compact={!isFirstDay}
                            isPast={isPast}
                            onClick={() => onEventClick?.(event)}
                          />
                        );
                      })
                    ) : (
                      <button
                        onClick={() => handleDayClick(day)}
                        className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        <span className="text-sm">Add event</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
