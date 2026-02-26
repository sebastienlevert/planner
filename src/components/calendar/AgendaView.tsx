import React, { useMemo, useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useLocale } from '../../contexts/LocaleContext';
import { dateHelpers } from '../../utils/dateHelpers';
import type { CalendarEvent } from '../../types/calendar.types';
import { EventCard } from './EventCard';
import { addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AgendaViewProps {
  currentDate: Date;
  onCreateEvent?: (date: Date, hour: number) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ currentDate, onCreateEvent, onDateChange, onEventClick }) => {
  const { events, getEventsForDateRange, ensureDateRange } = useCalendar();
  const { locale, t } = useLocale();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);

  const MAX_VISIBLE_EVENTS = 3;

  // Always snap to the week start (Sunday)
  const weekStart = useMemo(() => dateHelpers.getWeekStart(currentDate), [currentDate]);

  // 7 days of the current week (Sun–Sat)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Next week days for the preview tile
  const nextWeekStart = useMemo(() => dateHelpers.nextWeek(weekStart), [weekStart]);
  const nextWeekEnd = useMemo(() => addDays(nextWeekStart, 6), [nextWeekStart]);
  const nextWeekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i));
  }, [nextWeekStart]);

  // Format next week title: "Mar 1–8" if same month, "Feb 25 – Mar 3" if different
  const nextWeekTitle = useMemo(() => {
    const sameMonth = nextWeekStart.getMonth() === nextWeekEnd.getMonth();
    if (sameMonth) {
      return `${dateHelpers.formatDate(nextWeekStart, 'MMM d', locale)}–${dateHelpers.formatDate(nextWeekEnd, 'd', locale)}`;
    }
    return `${dateHelpers.formatDate(nextWeekStart, 'MMM d', locale)} – ${dateHelpers.formatDate(nextWeekEnd, 'MMM d', locale)}`;
  }, [nextWeekStart, nextWeekEnd, locale]);

  // Fetch events for current week + next week (for preview)
  const rangeStart = useMemo(() => dateHelpers.getDayStart(weekDays[0]), [weekDays]);
  const rangeEnd = useMemo(() => dateHelpers.getDayEnd(nextWeekDays[nextWeekDays.length - 1]), [nextWeekDays]);

  // Ensure events are loaded for the visible range
  React.useEffect(() => {
    ensureDateRange(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, ensureDateRange]);

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

  // Collect upcoming events from next week for the preview tile
  const nextWeekPreviewEvents = useMemo(() => {
    const allNext: CalendarEvent[] = [];
    for (const day of nextWeekDays) {
      allNext.push(...getEventsForDay(day));
    }
    // Dedupe by id (multi-day events appear in multiple days)
    const seen = new Set<string>();
    return allNext.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    }).slice(0, 5);
  }, [nextWeekDays, rangeEvents]);

  const handleDayClick = (day: Date) => {
    if (onCreateEvent) {
      const hour = new Date().getHours();
      onCreateEvent(day, hour);
    }
  };

  const handleGoToNextWeek = () => {
    if (onDateChange) {
      onDateChange(nextWeekStart);
    }
  };

  // Swipe to navigate weeks
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
      onDateChange(dateHelpers.nextWeek(currentDate));
    } else if (isRightSwipe) {
      onDateChange(dateHelpers.previousWeek(currentDate));
    }
  };

  // Top row: Sun(0)–Wed(3), Bottom row: Thu(4)–Sat(6) + next week preview
  const topRow = weekDays.slice(0, 4);
  const bottomRow = weekDays.slice(4, 7);

  const renderDayCell = (day: Date) => {
    const isToday = dateHelpers.isToday(day);
    const dayEvents = getEventsForDay(day);
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const remainingCount = dayEvents.length - MAX_VISIBLE_EVENTS;

    return (
      <div
        key={day.toISOString()}
        className={`flex flex-col border border-border rounded-xl overflow-hidden ${
          isToday ? 'ring-2 ring-primary bg-secondary/50' : 'bg-card'
        }`}
      >
        {/* Day header */}
        <div
          className={`px-4 py-3 border-b border-border flex items-center justify-between ${
            isToday ? 'bg-primary/10' : 'bg-muted/30'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {dateHelpers.formatDate(day, 'd')}
            </span>
            <span className={`text-base font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {dateHelpers.formatDate(day, 'EEE', locale)}
            </span>
          </div>
          {dayEvents.length === 0 && (
            <button
              onClick={() => handleDayClick(day)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Events */}
        <div className="p-3 space-y-2 overflow-hidden">
          {visibleEvents.map(event => {
            const eventEnd = new Date(event.end.dateTime);
            const isPast = eventEnd < new Date();

            return (
              <EventCard
                key={event.id}
                event={event}
                compact
                isPast={isPast}
                onClick={() => onEventClick?.(event)}
              />
            );
          })}
          {remainingCount > 0 && (
            <button
              onClick={() => setExpandedDay({ date: day, events: dayEvents })}
              className="w-full rounded-lg p-3 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              +{remainingCount} {t.calendar.more}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full bg-background p-4 gap-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top row: Sun–Wed (4 cells) */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {topRow.map(day => renderDayCell(day))}
      </div>

      {/* Bottom row: Thu–Sat (3 cells) + Next week preview (1 cell) */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {bottomRow.map(day => renderDayCell(day))}

        {/* Next week preview tile */}
        <div
          className="flex flex-col border border-border rounded-xl overflow-hidden bg-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={handleGoToNextWeek}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">
              {nextWeekTitle}
            </span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>

          {/* Preview events */}
          <div className="p-3 space-y-2 overflow-hidden">
            {nextWeekPreviewEvents.length > 0 ? (
              nextWeekPreviewEvents.slice(0, MAX_VISIBLE_EVENTS).map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  compact
                  onClick={() => onEventClick?.(event)}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t.common.noResults}
              </div>
            )}
            {nextWeekPreviewEvents.length > MAX_VISIBLE_EVENTS && (
              <div className="w-full rounded-lg p-3 text-sm font-medium text-muted-foreground bg-muted/50 text-center">
                +{nextWeekPreviewEvents.length - MAX_VISIBLE_EVENTS} {t.calendar.more}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded day dialog */}
      <Dialog open={!!expandedDay} onOpenChange={(open) => !open && setExpandedDay(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {expandedDay && (
            <>
              <DialogHeader className="px-5 pt-5 pb-0">
                <DialogTitle className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {dateHelpers.formatDate(expandedDay.date, 'd')}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">
                    {dateHelpers.formatDate(expandedDay.date, 'EEEE', locale)}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                {expandedDay.events.map(event => {
                  const eventEnd = new Date(event.end.dateTime);
                  const isPast = eventEnd < new Date();

                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact
                      isPast={isPast}
                      onClick={() => {
                        setExpandedDay(null);
                        onEventClick?.(event);
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
