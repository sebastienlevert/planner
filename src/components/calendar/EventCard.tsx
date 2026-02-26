import React from 'react';
import { Clock, MapPin, Users, Repeat } from 'lucide-react';
import type { CalendarEvent } from '../../types/calendar.types';
import { useCalendar } from '../../contexts/CalendarContext';
import { dateHelpers } from '../../utils/dateHelpers';

interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
  isPast?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false, onClick, isPast = false }) => {
  const { calendars } = useCalendar();

  const calendar = calendars.find(cal => cal.id === event.calendarId);
  const eventColor = calendar?.color || '#0ea5e9';

  const startTime = dateHelpers.formatTime(event.start.dateTime);
  const endTime = dateHelpers.formatTime(event.end.dateTime);

  if (compact) {
    return (
      <div
        className={`rounded p-2 text-xs cursor-pointer transition-opacity hover:opacity-80 h-full relative ${isPast ? 'opacity-50 bg-muted' : ''}`}
        style={{
          backgroundColor: isPast ? undefined : `${eventColor}40`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className={`font-semibold truncate ${isPast ? 'text-muted-foreground' : ''}`} style={isPast ? {} : { color: eventColor }}>
          {event.subject}
        </div>
        {event.recurrence && (
          <Repeat size={10} className="absolute bottom-1 right-1 opacity-70" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded p-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 relative ${isPast ? 'opacity-60 bg-muted' : ''}`}
      style={{
        backgroundColor: isPast ? undefined : `${eventColor}35`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
          {event.subject}
        </h3>
        {calendar && (
          <span
            className="text-xs px-2 py-1 rounded flex-shrink-0"
            style={{
              backgroundColor: isPast ? 'hsl(var(--muted))' : eventColor,
              color: 'white',
            }}
          >
            {calendar.name}
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {!event.isAllDay && (
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>
              {startTime} - {endTime}
            </span>
          </div>
        )}

        {event.isAllDay && (
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>All day</span>
          </div>
        )}

        {event.location && event.location.displayName && (
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="truncate">{event.location.displayName}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>{event.attendees.length} attendees</span>
          </div>
        )}
      </div>

      {event.bodyPreview && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.bodyPreview}</p>
      )}

      {event.recurrence && (
        <Repeat size={12} className="absolute bottom-2 right-2 opacity-70" />
      )}
    </div>
  );
};
