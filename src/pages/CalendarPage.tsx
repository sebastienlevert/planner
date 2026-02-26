import React, { useState } from 'react';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useLocale } from '../contexts/LocaleContext';
import { LoginButton } from '../components/auth/LoginButton';
import { AgendaView } from '../components/calendar/AgendaView';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { MonthView } from '../components/calendar/MonthView';
import { CreateEventModal } from '../components/calendar/CreateEventModal';
import { EventDetailsModal } from '../components/calendar/EventDetailsModal';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { dateHelpers } from '../utils/dateHelpers';
import type { CalendarView, CalendarEvent } from '../types/calendar.types';

export const CalendarPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isLoading, isSyncing } = useCalendar();
  const { t } = useLocale();
  const [currentView, setCurrentView] = useState<CalendarView>('agenda');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createEventDate, setCreateEventDate] = useState<Date>();
  const [createEventHour, setCreateEventHour] = useState<number>(9);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Listen for create-event custom event from FAB
  React.useEffect(() => {
    const handleCreateEventFromFAB = () => {
      setCreateEventDate(new Date());
      setCreateEventHour(new Date().getHours());
      setIsCreateModalOpen(true);
    };

    window.addEventListener('create-event', handleCreateEventFromFAB);
    return () => window.removeEventListener('create-event', handleCreateEventFromFAB);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <CalendarIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t.auth.welcome}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.auth.signInMessage}
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  const handleCreateEvent = (date: Date, hour: number) => {
    setCreateEventDate(date);
    setCreateEventHour(hour);
    setIsCreateModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  // Calculate month/year display based on current view and date
  const getMonthYearDisplay = (): string => {
    if (currentView === 'agenda') {
      // For agenda view, show range of visible days (5 days)
      const visibleDays = Array.from({ length: 5 }, (_, i) => {
        const day = new Date(currentDate);
        day.setDate(day.getDate() + i);
        return day;
      });

      const firstDay = visibleDays[0];
      const lastDay = visibleDays[visibleDays.length - 1];

      const firstMonth = firstDay.getMonth();
      const firstYear = firstDay.getFullYear();
      const lastMonth = lastDay.getMonth();
      const lastYear = lastDay.getFullYear();

      // Same month and year
      if (firstMonth === lastMonth && firstYear === lastYear) {
        return dateHelpers.formatDate(firstDay, 'MMMM yyyy');
      }

      // Different months, same year
      if (firstYear === lastYear) {
        return `${dateHelpers.formatDate(firstDay, 'MMMM')} / ${dateHelpers.formatDate(lastDay, 'MMMM yyyy')}`;
      }

      // Different years
      return `${dateHelpers.formatDate(firstDay, 'MMMM yyyy')} / ${dateHelpers.formatDate(lastDay, 'MMMM yyyy')}`;
    } else if (currentView === 'week') {
      return dateHelpers.formatDate(currentDate, 'MMMM yyyy');
    } else if (currentView === 'day') {
      return dateHelpers.formatDate(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (currentView === 'month') {
      return dateHelpers.formatDate(currentDate, 'MMMM yyyy');
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header with View Switcher */}
      <CalendarHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        monthYearDisplay={getMonthYearDisplay()}
      />

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden relative">
        {/* Always render calendar view */}
        {currentView === 'agenda' && (
          <AgendaView
            currentDate={currentDate}
            onCreateEvent={handleCreateEvent}
            onDateChange={setCurrentDate}
            onEventClick={handleEventClick}
          />
        )}
        {currentView === 'week' && (
          <WeekView
            currentDate={currentDate}
            onCreateEvent={handleCreateEvent}
            onEventClick={handleEventClick}
          />
        )}
        {currentView === 'day' && (
          <DayView
            currentDate={currentDate}
            onCreateEvent={handleCreateEvent}
            onEventClick={handleEventClick}
          />
        )}
        {currentView === 'month' && (
          <MonthView
            currentDate={currentDate}
            onDateClick={(date) => {
              setCreateEventDate(date);
              setCreateEventHour(9);
              setIsCreateModalOpen(true);
            }}
            onEventClick={handleEventClick}
          />
        )}

        {/* Loading Overlay - appears on top of calendar content */}
        {(isLoading || isSyncing) && (
          <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-center bg-card rounded-2xl shadow-2xl p-8 pointer-events-auto border border-border">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Loading events...</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialDate={createEventDate}
        initialHour={createEventHour}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};
