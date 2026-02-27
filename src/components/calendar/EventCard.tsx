import React from 'react';
import { Clock, MapPin, Users, Repeat } from 'lucide-react';
import type { CalendarEvent } from '../../types/calendar.types';
import { useCalendar } from '../../contexts/CalendarContext';
import { useLocale } from '../../contexts/LocaleContext';
import { dateHelpers } from '../../utils/dateHelpers';

interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
  isPast?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false, onClick, isPast = false }) => {
  const { calendars } = useCalendar();
  const { t } = useLocale();

  const calendar = calendars.find(cal => cal.id === event.calendarId);
  const eventColor = calendar?.color || '#0ea5e9';

  const startTime = dateHelpers.formatTime(event.start.dateTime);
  const endTime = dateHelpers.formatTime(event.end.dateTime);

  if (compact) {
    return (
      <div
        className={`rounded-lg p-4 text-base cursor-pointer transition-opacity hover:opacity-80 relative ${isPast ? 'opacity-50 bg-muted' : ''}`}
        style={{
          backgroundColor: isPast ? undefined : `${eventColor}40`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className={`font-semibold line-clamp-2 ${isPast ? 'text-muted-foreground' : ''}`} style={isPast ? {} : { color: eventColor }}>
          {event.subject}
        </div>
        {!event.isAllDay && (
          <div className={`text-sm mt-0.5 ${isPast ? 'text-muted-foreground/70' : 'opacity-70'}`} style={isPast ? {} : { color: eventColor }}>
            {startTime} – {endTime}
          </div>
        )}
        {event.recurrence && (
          <Repeat size={14} className="absolute bottom-2 right-2 opacity-70" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 text-base font-medium cursor-pointer transition-opacity hover:opacity-80 relative ${isPast ? 'opacity-60 bg-muted' : ''}`}
      style={{
        backgroundColor: isPast ? undefined : `${eventColor}35`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-base ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
          {event.subject}
        </h3>
        {calendar && (
          <span
            className="text-sm px-3 py-1 rounded flex-shrink-0"
            style={{
              backgroundColor: isPast ? 'hsl(var(--muted))' : eventColor,
              color: 'white',
            }}
          >
            {calendar.name}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        {!event.isAllDay && (
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>
              {startTime} - {endTime}
            </span>
          </div>
        )}

        {event.isAllDay && (
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>{t.calendar.allDay}</span>
          </div>
        )}

        {event.location && event.location.displayName && (
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span className="truncate">{event.location.displayName}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>{event.attendees.length} {t.calendar.attendees}</span>
          </div>
        )}
      </div>

      {event.bodyPreview && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.bodyPreview}</p>
      )}

      {event.recurrence && (
        <Repeat size={16} className="absolute bottom-3 right-3 opacity-70" />
      )}
    </div>
  );
};
