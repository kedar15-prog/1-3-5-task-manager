import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Task, DayHistoryRecord } from '../types/todo';
import { getTodayKey, offsetDateKey } from '../utils/dates';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateKey: string) => void;
  tasks: Task[];
  historyRecords: Record<string, DayHistoryRecord>;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  tasks,
  historyRecords,
}) => {
  if (!isOpen) return null;

  const todayKey = getTodayKey();

  // Parse current active viewing month from selectedDate
  const [currentYear, setCurrentYear] = useState(() => {
    const parts = selectedDate.split('-');
    return parts.length === 3 ? parseInt(parts[0], 10) : new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = selectedDate.split('-');
    return parts.length === 3 ? parseInt(parts[1], 10) - 1 : new Date().getMonth();
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onSelectDate(todayKey);
    onClose();
  };

  // Month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long' });

  // Build grid days
  interface DayCell {
    dateKey: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    taskCount: number;
    completedCount: number;
    hasHistory: boolean;
  }

  const cells: DayCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthNum = currentMonth === 0 ? 12 : currentMonth;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const key = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.inDailyList && t.date === key);

    cells.push({
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
      isSelected: key === selectedDate,
      taskCount: dayTasks.length,
      completedCount: dayTasks.filter(t => t.status === 'completed').length,
      hasHistory: !!historyRecords[key],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.inDailyList && t.date === key);

    cells.push({
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: key === todayKey,
      isSelected: key === selectedDate,
      taskCount: dayTasks.length,
      completedCount: dayTasks.filter(t => t.status === 'completed').length,
      hasHistory: !!historyRecords[key],
    });
  }

  // Next month leading days to complete 35 or 42 grid
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthNum = currentMonth === 11 ? 1 : currentMonth + 2;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const key = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.inDailyList && t.date === key);

    cells.push({
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
      isSelected: key === selectedDate,
      taskCount: dayTasks.length,
      completedCount: dayTasks.filter(t => t.status === 'completed').length,
      hasHistory: !!historyRecords[key],
    });
  }

  const weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Jump to Date
              </h3>
              <p className="text-[11px] text-slate-500">
                Select any day to view or plan its 1-3-5 tasks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Selector Bar */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-slate-900">
            {monthName} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-5">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayNames.map(day => (
              <span
                key={day}
                className="text-[11px] font-bold text-slate-400 py-1 uppercase tracking-wider"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map(cell => {
              const hasTasks = cell.taskCount > 0;
              const isAllDone = hasTasks && cell.completedCount === cell.taskCount;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => {
                    onSelectDate(cell.dateKey);
                    onClose();
                  }}
                  className={`min-h-[44px] p-1 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    cell.isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : cell.isToday
                      ? 'border-2 border-indigo-500 font-bold text-indigo-900 bg-indigo-50/40'
                      : cell.isCurrentMonth
                      ? 'hover:bg-slate-100 text-slate-800 font-medium'
                      : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-mono tabular-nums leading-none">
                    {cell.dayNumber}
                  </span>

                  {/* Task indicator dots */}
                  {hasTasks && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cell.isSelected
                            ? 'bg-white'
                            : isAllDone
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onSelectDate(offsetDateKey(todayKey, -1));
                onClose();
              }}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={handleJumpToday}
              className="px-2.5 py-1 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                onSelectDate(offsetDateKey(todayKey, 1));
                onClose();
              }}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              Tomorrow
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-500 hover:text-slate-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
