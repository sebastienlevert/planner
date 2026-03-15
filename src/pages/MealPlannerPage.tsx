import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, UtensilsCrossed, Link as LinkIcon, Trash2, Pencil } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import { useLocale } from '../contexts/LocaleContext';
import { StorageService } from '../services/storage.service';
import { dateHelpers } from '../utils/dateHelpers';
import type { CalendarEvent } from '../types/calendar.types';
import { addDays } from 'date-fns';

const MEAL_TYPES = [
  { key: 'breakfast', emoji: '🥐', defaultStartHour: 7, defaultStartMin: 30, defaultEndHour: 8, defaultEndMin: 0 },
  { key: 'lunch', emoji: '🥗', defaultStartHour: 12, defaultStartMin: 0, defaultEndHour: 12, defaultEndMin: 30 },
  { key: 'dinner', emoji: '🍽️', defaultStartHour: 17, defaultStartMin: 30, defaultEndHour: 18, defaultEndMin: 0 },
] as const;

type MealKey = typeof MEAL_TYPES[number]['key'];

function classifyMeal(event: CalendarEvent): MealKey | null {
  const start = new Date(event.start.dateTime);
  const hour = start.getHours();
  const minutes = start.getMinutes();
  const time = hour + minutes / 60;

  if (time >= 6 && time < 10) return 'breakfast';
  if (time >= 11 && time < 13.5) return 'lunch';
  if (time >= 17 && time < 21) return 'dinner';
  return null;
}

function getMealType(key: MealKey) {
  return MEAL_TYPES.find(m => m.key === key)!;
}

export const MealPlannerPage: React.FC = () => {
  const { calendars, events, createEvent, updateEvent, deleteEvent, getEventsForDateRange, ensureDateRange } = useCalendar();
  const { locale, t } = useLocale();
  const todayRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [addingDay, setAddingDay] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<MealKey>('breakfast');
  const [mealInput, setMealInput] = useState('');
  const [recipeLink, setRecipeLink] = useState('');

  // Edit state
  const [editingMeal, setEditingMeal] = useState<CalendarEvent | null>(null);
  const [editName, setEditName] = useState('');
  const [editRecipeLink, setEditRecipeLink] = useState('');
  const [editType, setEditType] = useState<MealKey>('breakfast');
  const [editDay, setEditDay] = useState<Date | null>(null);
  const mealCalendarId = useMemo(() => {
    return StorageService.getSettings().mealCalendarId || null;
  }, []);

  const mealCalendar = useMemo(() => {
    return calendars.find(c => c.id === mealCalendarId) || null;
  }, [calendars, mealCalendarId]);

  // Week navigation
  const weekStart = useMemo(() => dateHelpers.getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const topRow = weekDays.slice(0, 4);
  const bottomRow = weekDays.slice(4, 7);

  // Next week
  const nextWeekStart = useMemo(() => dateHelpers.nextWeek(weekStart), [weekStart]);
  const nextWeekEnd = useMemo(() => addDays(nextWeekStart, 6), [nextWeekStart]);
  const nextWeekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i)), [nextWeekStart]);

  // Ensure events loaded (current + next week)
  useEffect(() => {
    const rangeEnd = dateHelpers.getDayEnd(nextWeekEnd);
    ensureDateRange(weekStart, rangeEnd);
  }, [weekStart, nextWeekEnd, ensureDateRange]);

  // Get meal events for both weeks
  const allMealEvents = useMemo(() => {
    if (!mealCalendarId) return [];
    const rangeEnd = dateHelpers.getDayEnd(nextWeekEnd);
    return getEventsForDateRange(weekStart, rangeEnd).filter(e => e.calendarId === mealCalendarId);
  }, [mealCalendarId, weekStart, nextWeekEnd, getEventsForDateRange, events]);

  // Classify meals per day
  const getMealsForDay = useCallback((day: Date): Record<MealKey, CalendarEvent[]> => {
    const dayStart = dateHelpers.getDayStart(day);
    const dayEnd = dateHelpers.getDayEnd(day);
    const dayEvents = allMealEvents.filter(event => {
      const eventStart = new Date(event.start.dateTime);
      return eventStart >= dayStart && eventStart < dayEnd;
    });

    const result: Record<MealKey, CalendarEvent[]> = { breakfast: [], lunch: [], dinner: [] };
    for (const event of dayEvents) {
      const type = classifyMeal(event);
      if (type) result[type].push(event);
    }
    return result;
  }, [allMealEvents]);

  // Next week meals grouped by day
  const nextWeekByDay = useMemo(() => {
    return nextWeekDays.map(day => ({
      day,
      meals: getMealsForDay(day),
    })).filter(d => d.meals.breakfast.length > 0 || d.meals.lunch.length > 0 || d.meals.dinner.length > 0);
  }, [nextWeekDays, getMealsForDay]);

  // Auto-scroll to today on mobile
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentDate]);

  const handleAddMeal = useCallback(async () => {
    if (!mealInput.trim() || !mealCalendar || !addingDay) return;

    const type = getMealType(selectedType);
    const start = new Date(addingDay);
    start.setHours(type.defaultStartHour, type.defaultStartMin, 0, 0);
    const end = new Date(addingDay);
    end.setHours(type.defaultEndHour, type.defaultEndMin, 0, 0);

    try {
      await createEvent({
        subject: mealInput.trim(),
        start,
        end,
        calendarId: mealCalendar.id,
        accountId: mealCalendar.accountId,
        isReminderOn: false,
        location: recipeLink.trim() || undefined,
      });

      setAddingDay(null);
      setMealInput('');
      setRecipeLink('');
    } catch (err) {
      console.error('Failed to add meal:', err);
    }
  }, [addingDay, selectedType, mealInput, recipeLink, mealCalendar, createEvent]);

  const startEditing = useCallback((meal: CalendarEvent) => {
    const mealType = classifyMeal(meal) || 'breakfast';
    setEditingMeal(meal);
    setEditName(meal.subject);
    setEditRecipeLink(meal.location?.locationUri || meal.location?.displayName || '');
    setEditType(mealType);
    setEditDay(new Date(meal.start.dateTime));
    setAddingDay(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMeal(null);
    setEditName('');
    setEditRecipeLink('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMeal || !editName.trim() || !mealCalendar || !editDay) return;

    const type = getMealType(editType);
    const newStart = new Date(editDay);
    newStart.setHours(type.defaultStartHour, type.defaultStartMin, 0, 0);
    const newEnd = new Date(editDay);
    newEnd.setHours(type.defaultEndHour, type.defaultEndMin, 0, 0);

    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${mo}-${da}T${h}:${mi}:00`;
    };
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      await updateEvent(editingMeal.id, {
        subject: editName.trim(),
        start: { dateTime: formatLocal(newStart), timeZone: tz },
        end: { dateTime: formatLocal(newEnd), timeZone: tz },
        location: editRecipeLink.trim() ? { displayName: editRecipeLink.trim(), locationUri: editRecipeLink.trim() } : undefined,
      });
      cancelEditing();
    } catch (err) {
      console.error('Failed to update meal:', err);
    }
  }, [editingMeal, editName, editRecipeLink, editType, editDay, mealCalendar, updateEvent, cancelEditing]);

  const handleDeleteMeal = useCallback(async (meal: CalendarEvent) => {
    try {
      await deleteEvent(meal.id, meal.accountId);
      if (editingMeal?.id === meal.id) cancelEditing();
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  }, [deleteEvent, editingMeal, cancelEditing]);

  const goToPrevWeek = () => setCurrentDate(prev => addDays(dateHelpers.getWeekStart(prev), -7));
  const goToNextWeek = () => setCurrentDate(prev => addDays(dateHelpers.getWeekStart(prev), 7));
  const goToToday = () => setCurrentDate(new Date());
  const goToNextWeekNav = () => setCurrentDate(nextWeekStart);

  const isCurrentlyAdding = (day: Date) =>
    addingDay?.toDateString() === day.toDateString();

  // No meal calendar selected
  if (!mealCalendar) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <UtensilsCrossed size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t.mealPlanner?.noCalendar || 'No Meal Calendar Selected'}</h2>
        <p className="text-muted-foreground max-w-md">
          {t.mealPlanner?.noCalendarDesc || 'Go to Settings → Calendars and select a calendar for meal planning.'}
        </p>
      </div>
    );
  }

  const renderMealLine = (type: typeof MEAL_TYPES[number], meals: CalendarEvent[], day: Date) => (
    <div key={type.key} className="flex items-start gap-2 min-h-[28px]">
      <span className="text-sm shrink-0 mt-0.5" title={t.mealPlanner?.[type.key] || type.key}>{type.emoji}</span>
      <div className="flex-1 min-w-0">
        {meals.length > 0 ? (
          <div className="space-y-0.5">
            {meals.map(meal => {
              const isEditing = editingMeal?.id === meal.id;
              if (isEditing) return renderEditForm(meal, day);

              const recipeUrl = meal.location?.locationUri || meal.location?.displayName;
              const hasRecipe = recipeUrl && (recipeUrl.startsWith('http://') || recipeUrl.startsWith('https://'));
              return (
                <div
                  key={meal.id}
                  className="group text-sm font-medium rounded px-1.5 py-0.5 flex items-center gap-1 min-w-0 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                  style={{ backgroundColor: `${mealCalendar.color}20`, color: mealCalendar.color }}
                  onClick={() => startEditing(meal)}
                >
                  <span className="truncate flex-1">{meal.subject}</span>
                  {hasRecipe && (
                    <a
                      href={recipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                      title={recipeUrl}
                    >
                      <LinkIcon size={12} />
                    </a>
                  )}
                  <Pencil size={12} className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/40 italic">—</span>
        )}
      </div>
    </div>
  );

  const renderEditForm = (meal: CalendarEvent, _day: Date) => (
    <div key={meal.id} className="border border-primary/30 rounded-lg p-2 space-y-2 bg-background" onClick={e => e.stopPropagation()}>
      {/* Meal type selector */}
      <div className="flex gap-1">
        {MEAL_TYPES.map(type => (
          <button
            key={type.key}
            onClick={() => setEditType(type.key)}
            className={`flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              editType === type.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{type.emoji}</span>
            <span className="hidden sm:inline">{t.mealPlanner?.[type.key] || type.key}</span>
          </button>
        ))}
      </div>
      {/* Name input */}
      <input
        type="text"
        value={editName}
        onChange={e => setEditName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSaveEdit();
          if (e.key === 'Escape') cancelEditing();
        }}
        className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        autoFocus
      />
      {/* Recipe link */}
      <input
        type="url"
        value={editRecipeLink}
        onChange={e => setEditRecipeLink(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSaveEdit();
          if (e.key === 'Escape') cancelEditing();
        }}
        placeholder={t.mealPlanner?.recipeLinkPlaceholder || 'Recipe link (optional)'}
        className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
      />
      {/* Day reassignment */}
      <div className="flex gap-1 flex-wrap">
        {weekDays.map(d => {
          const isSelected = editDay?.toDateString() === d.toDateString();
          return (
            <button
              key={d.toISOString()}
              onClick={() => setEditDay(d)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {dateHelpers.formatDate(d, 'EEE', locale).slice(0, 3)}
            </button>
          );
        })}
      </div>
      {/* Actions */}
      <div className="flex gap-1 justify-between">
        <button
          onClick={() => handleDeleteMeal(meal)}
          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title={t.mealPlanner?.delete || 'Delete'}
        >
          <Trash2 size={16} />
        </button>
        <div className="flex gap-1">
          <button
            onClick={cancelEditing}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {t.common?.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={!editName.trim()}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {t.mealPlanner?.save || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddForm = () => (
    <div className="border-t border-border mt-2 pt-2 space-y-2" onClick={e => e.stopPropagation()}>
      {/* Meal type selector */}
      <div className="flex gap-1">
        {MEAL_TYPES.map(type => (
          <button
            key={type.key}
            onClick={() => setSelectedType(type.key)}
            className={`flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              selectedType === type.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{type.emoji}</span>
            <span className="hidden sm:inline">{t.mealPlanner?.[type.key] || type.key}</span>
          </button>
        ))}
      </div>
      {/* Input */}
      <div className="flex gap-1">
        <input
          type="text"
          value={mealInput}
          onChange={e => setMealInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddMeal();
            if (e.key === 'Escape') { setAddingDay(null); setMealInput(''); setRecipeLink(''); }
          }}
          placeholder={t.mealPlanner?.placeholder || "What's cooking?"}
          className="flex-1 min-w-0 px-2 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <button
          onClick={handleAddMeal}
          disabled={!mealInput.trim()}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50 shrink-0"
        >
          {t.mealPlanner?.add || 'Add'}
        </button>
        <button
          onClick={() => { setAddingDay(null); setMealInput(''); setRecipeLink(''); }}
          className="p-1.5 text-muted-foreground hover:text-foreground shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      {/* Recipe link */}
      <input
        type="url"
        value={recipeLink}
        onChange={e => setRecipeLink(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleAddMeal();
          if (e.key === 'Escape') { setAddingDay(null); setMealInput(''); setRecipeLink(''); }
        }}
        placeholder={t.mealPlanner?.recipeLinkPlaceholder || 'Recipe link (optional)'}
        className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
      />
    </div>
  );

  const renderDayCell = (day: Date, isMobile = false) => {
    const isToday = dateHelpers.isToday(day);
    const meals = getMealsForDay(day);
    const adding = isCurrentlyAdding(day);

    return (
      <div
        key={day.toISOString()}
        ref={isToday ? todayRef : undefined}
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
            <span className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {dateHelpers.formatDate(day, 'd')}
            </span>
            <span className={`text-base font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {locale === 'en'
                ? dateHelpers.formatDate(day, 'EEE', locale).charAt(0).toUpperCase() + dateHelpers.formatDate(day, 'EEE', locale).slice(1)
                : dateHelpers.formatDate(day, 'EEE', locale)}
            </span>
            {isMobile && (
              <span className={`text-sm ${isToday ? 'text-primary/70' : 'text-muted-foreground/70'}`}>
                {dateHelpers.formatDate(day, 'MMM', locale)}
              </span>
            )}
          </div>
          {!adding && (
            <button
              onClick={() => { setAddingDay(day); setMealInput(''); setSelectedType('breakfast'); }}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus size={24} />
            </button>
          )}
        </div>

        {/* Meals content */}
        <div className={`p-3 space-y-1.5 ${isMobile ? '' : 'flex-1'}`}>
          {MEAL_TYPES.map(type => renderMealLine(type, meals[type.key], day))}
          {adding && renderAddForm()}
        </div>
      </div>
    );
  };

  const renderNextWeekTile = () => {
    const nextWeekEndDate = addDays(nextWeekStart, 6);
    const sameMonth = nextWeekStart.getMonth() === nextWeekEndDate.getMonth();
    const startMonth = dateHelpers.formatDate(nextWeekStart, 'MMM', locale);
    const endMonth = dateHelpers.formatDate(nextWeekEndDate, 'MMM', locale);
    const capitalize = (s: string) => locale === 'en' ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const monthLabel = sameMonth ? capitalize(startMonth) : `${capitalize(startMonth)} – ${capitalize(endMonth)}`;

    return (
      <div
        className="flex flex-col border border-border rounded-xl overflow-hidden bg-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
        onClick={goToNextWeekNav}
      >
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {dateHelpers.formatDate(nextWeekStart, 'd')}–{dateHelpers.formatDate(nextWeekEndDate, 'd')}
            </span>
            <span className="text-base font-medium text-muted-foreground">
              {monthLabel}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground">
            <ChevronRight size={24} />
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nextWeekByDay.length > 0 ? (
            nextWeekByDay.map(({ day, meals }) => (
              <div key={day.toISOString()}>
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {dateHelpers.formatDate(day, 'd')}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {locale === 'en'
                      ? dateHelpers.formatDate(day, 'EEE', locale).charAt(0).toUpperCase() + dateHelpers.formatDate(day, 'EEE', locale).slice(1)
                      : dateHelpers.formatDate(day, 'EEE', locale)}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {MEAL_TYPES.map(type => {
                    const typeMeals = meals[type.key];
                    if (typeMeals.length === 0) return null;
                    return typeMeals.map(meal => (
                      <div
                        key={meal.id}
                        className="text-sm rounded px-1.5 py-0.5 truncate"
                        style={{ backgroundColor: `${mealCalendar?.color || '#6366f1'}20`, color: mealCalendar?.color || '#6366f1' }}
                      >
                        {type.emoji} {meal.subject}
                      </div>
                    ));
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-base">
              {t.common.noResults}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t.mealPlanner?.title || 'Meal Planner'}</h1>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={goToPrevWeek} className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center hover:bg-muted touch-target">
              <ChevronLeft size={22} />
            </button>
            <button onClick={goToToday} className="h-10 px-3 sm:h-11 sm:px-5 text-sm sm:text-base font-medium rounded-lg hover:bg-muted">
              {t.mealPlanner?.today || 'Today'}
            </button>
            <button onClick={goToNextWeek} className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center hover:bg-muted touch-target">
              <ChevronRight size={22} />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {locale === 'en'
              ? dateHelpers.formatDate(weekStart, 'MMMM yyyy', locale).charAt(0).toUpperCase() + dateHelpers.formatDate(weekStart, 'MMMM yyyy', locale).slice(1)
              : dateHelpers.formatDate(weekStart, 'MMMM yyyy', locale)}
          </h2>

          <div className="flex-1 min-w-0" />

          <span className="text-sm text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {mealCalendar.emoji && <span className="mr-1">{mealCalendar.emoji}</span>}
            {mealCalendar.name}
          </span>
        </div>
      </div>

      {/* Mobile: single column scrollable list */}
      <div className="lg:hidden flex-1 overflow-y-auto p-3 space-y-3">
        {weekDays.map(day => renderDayCell(day, true))}
        {renderNextWeekTile()}
      </div>

      {/* Desktop: 4-column grid (same layout as calendar agenda) */}
      <div className="hidden lg:flex flex-col h-full p-4 gap-4">
        {/* Top row: Mon–Thu */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
          {topRow.map(day => renderDayCell(day))}
        </div>
        {/* Bottom row: Fri–Sun + Next week */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
          {bottomRow.map(day => renderDayCell(day))}
          {renderNextWeekTile()}
        </div>
      </div>
    </div>
  );
};
