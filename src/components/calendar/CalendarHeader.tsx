import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useLocale } from '../../contexts/LocaleContext';
import { StorageService } from '../../services/storage.service';
import { ViewSwitcher } from './ViewSwitcher';
import type { CalendarView } from '../../types/calendar.types';
import { dateHelpers } from '../../utils/dateHelpers';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  monthYearDisplay: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
  monthYearDisplay
}) => {
  const { isSyncing, isLoading, lastSyncTime } = useCalendar();
  const { t } = useLocale();
  const [calendarName, setCalendarName] = useState('');

  useEffect(() => {
    // Load calendar name from settings
    const loadCalendarName = () => {
      const settings = StorageService.getSettings();
      setCalendarName(settings.calendarName || t.calendar.title);
    };

    loadCalendarName();

    // Listen for settings updates and locale changes
    window.addEventListener('settings-updated', loadCalendarName);
    window.addEventListener('locale-changed', loadCalendarName);
    return () => {
      window.removeEventListener('settings-updated', loadCalendarName);
      window.removeEventListener('locale-changed', loadCalendarName);
    };
  }, [t]);

  const handlePrevious = () => {
    if (currentView === 'day') {
      onDateChange(dateHelpers.previousDay(currentDate));
    } else if (currentView === 'agenda' || currentView === 'week') {
      onDateChange(dateHelpers.previousWeek(currentDate));
    } else if (currentView === 'month') {
      onDateChange(dateHelpers.previousMonth(currentDate));
    }
  };

  const handleNext = () => {
    if (currentView === 'day') {
      onDateChange(dateHelpers.nextDay(currentDate));
    } else if (currentView === 'agenda' || currentView === 'week') {
      onDateChange(dateHelpers.nextWeek(currentDate));
    } else if (currentView === 'month') {
      onDateChange(dateHelpers.nextMonth(currentDate));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Single Row: All Header Components */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3">
        {/* Calendar Name */}
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{calendarName}</h1>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-11 sm:w-11" onClick={handlePrevious} aria-label="Previous">
            <ChevronLeft size={22} />
          </Button>
          <Button variant="secondary" className="h-10 px-3 sm:h-11 sm:px-5 text-sm sm:text-base" onClick={handleToday}>
            {t.actions.today}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-11 sm:w-11" onClick={handleNext} aria-label="Next">
            <ChevronRight size={22} />
          </Button>
        </div>

        {/* Month/Year Display */}
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          {monthYearDisplay}
        </h2>

        {/* Spacer to push right items to the end */}
        <div className="flex-1 min-w-0" />

        {/* View Switcher */}
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />

        {/* Sync status */}
        <div className="flex items-center">
          {(isSyncing || isLoading) ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 size={18} className="text-primary animate-spin" />
            </div>
          ) : lastSyncTime ? (
            <div className="w-9 h-9 flex items-center justify-center text-green-500">
              <Check size={18} strokeWidth={3} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
