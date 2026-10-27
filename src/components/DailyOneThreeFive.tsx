import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  FolderOpen,
  CornerDownLeft
} from 'lucide-react';
import { Task, TaskTier, ActiveTimer, TIER_LIMITS } from '../types/todo';
import { TaskCard } from './TaskCard';
import { formatDayTitle, formatDurationHuman, getTodayKey, offsetDateKey } from '../utils/dates';

interface DailyOneThreeFiveProps {
  currentDateKey: string;
  onChangeDate: (newDateKey: string) => void;
  tasks: Task[];
  activeTimer: ActiveTimer | null;
  onToggleComplete: (id: string) => void;
  onStartTimer: (task: Task) => void;
  onToggleTimer: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTier: (id: string, tier: TaskTier) => void;
  onMoveToBacklog: (id: string) => void;
  onPostponeTomorrow: (id: string) => void;
  onOpenNewTaskWithTier: (tier: TaskTier) => void;
  onQuickAddTask?: (title: string, tier: TaskTier) => void;
  onOpenAutoFillModal: () => void;
  onNavigateToBacklog: () => void;
  onOpenCalendar?: () => void;
  backlogAvailableCount: number;
}

export const DailyOneThreeFive: React.FC<DailyOneThreeFiveProps> = ({
  currentDateKey,
  onChangeDate,
  tasks,
  activeTimer,
  onToggleComplete,
  onStartTimer,
  onToggleTimer,
  onEditTask,
  onDeleteTask,
  onMoveTier,
  onMoveToBacklog,
  onPostponeTomorrow,
  onOpenNewTaskWithTier,
  onQuickAddTask,
  onOpenAutoFillModal,
  onNavigateToBacklog,
  onOpenCalendar,
  backlogAvailableCount,
}) => {
  const todayKey = getTodayKey();
  const isToday = currentDateKey === todayKey;

  // Inline list input state for each tier
  const [inlineInputs, setInlineInputs] = useState<{ major: string; medium: string; small: string }>({
    major: '',
    medium: '',
    small: '',
  });

  const handleInlineSubmit = (tier: TaskTier) => {
    const text = inlineInputs[tier].trim();
    if (!text) return;
    if (onQuickAddTask) {
      onQuickAddTask(text, tier);
    }
    setInlineInputs(prev => ({ ...prev, [tier]: '' }));
  };

  // Filter tasks belonging to current day's 1-3-5 board
  const dayTasks = tasks.filter(t => t.inDailyList && t.date === currentDateKey);

  const majorTasks = dayTasks.filter(t => t.tier === 'major');
  const mediumTasks = dayTasks.filter(t => t.tier === 'medium');
  const smallTasks = dayTasks.filter(t => t.tier === 'small');

  const totalFilled = dayTasks.length;
  const totalCompleted = dayTasks.filter(t => t.status === 'completed').length;
  const totalFocusSeconds = dayTasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);
  const completionPercentage = totalFilled > 0 ? Math.round((totalCompleted / totalFilled) * 100) : 0;

  const emptyMajorCount = Math.max(0, TIER_LIMITS.major - majorTasks.length);
  const emptyMediumCount = Math.max(0, TIER_LIMITS.medium - mediumTasks.length);
  const emptySmallCount = Math.max(0, TIER_LIMITS.small - smallTasks.length);
  const totalEmptySlots = emptyMajorCount + emptyMediumCount + emptySmallCount;

  return (
    <div className="space-y-6">
      {/* Top Date Navigation & Summary Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeDate(offsetDateKey(currentDateKey, -1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onOpenCalendar}
              className="flex items-center gap-2 px-2.5 py-1.5 -my-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"
              title="Click calendar icon to show interactive calendar"
            >
              <Calendar className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                {formatDayTitle(currentDateKey)}
              </h2>
            </button>

            <button
              onClick={() => onChangeDate(offsetDateKey(currentDateKey, 1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                onClick={() => onChangeDate(todayKey)}
                className="ml-2 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                Jump to Today
              </button>
            )}
          </div>

          {/* Day Metrics & Auto-Replenish Prompt */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Progress:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {totalCompleted}/{totalFilled || 9} ({completionPercentage}%)
              </span>
            </div>

            <span aria-hidden="true" className="text-slate-200 hidden sm:inline">|</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Focus Time:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatDurationHuman(totalFocusSeconds)}
              </span>
            </div>

            {totalEmptySlots > 0 && backlogAvailableCount > 0 && isToday && (
              <button
                onClick={onOpenAutoFillModal}
                className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                title="Fill empty slots from your master backlog"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Fill {totalEmptySlots} Slot{totalEmptySlots > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* TIER 1: The 1 Major Task */}
      <section className="bg-white rounded-xl border border-indigo-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="text-sm font-semibold text-indigo-950">
                Major Task
              </h3>
              <p className="text-[11px] text-indigo-900/70">
                Your primary focus &amp; highest impact goal for today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tabular-nums font-semibold text-indigo-900">
              {majorTasks.length} / 1 Slot
            </span>
            {majorTasks.length === 0 && (
              <button
                onClick={() => onOpenNewTaskWithTier('major')}
                className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign in List</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {majorTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              activeTimer={activeTimer}
              onToggleComplete={onToggleComplete}
              onStartTimer={onStartTimer}
              onToggleTimer={onToggleTimer}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTier={onMoveTier}
              onMoveToBacklog={onMoveToBacklog}
              onPostponeTomorrow={onPostponeTomorrow}
            />
          ))}

          {/* Inline List Input for Major Task */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/20 focus-within:border-indigo-400 focus-within:bg-white transition-all">
            <span className="text-indigo-400 text-xs font-bold px-2 select-none">1.</span>
            <input
              type="text"
              placeholder={majorTasks.length === 0 ? "Type major task and press Enter to add..." : "Add another major task to list (press Enter)..."}
              value={inlineInputs.major}
              onChange={e => setInlineInputs({ ...inlineInputs, major: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInlineSubmit('major');
                }
              }}
              className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-indigo-900/40"
            />
            {inlineInputs.major.trim() ? (
              <button
                onClick={() => handleInlineSubmit('major')}
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Add</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            ) : majorTasks.length === 0 && (
              <button
                onClick={onNavigateToBacklog}
                className="px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                <span className="hidden sm:inline">From Backlog</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TIER 2: The 3 Medium Tasks */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-amber-50/40 border-b border-amber-100/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Medium Tasks
              </h3>
              <p className="text-[11px] text-slate-500">
                Important secondary goals and core project milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tabular-nums font-semibold text-slate-700">
              {mediumTasks.length} / 3 Slots
            </span>
            <button
              onClick={() => onOpenNewTaskWithTier('medium')}
              className="px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100/60 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {mediumTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              activeTimer={activeTimer}
              onToggleComplete={onToggleComplete}
              onStartTimer={onStartTimer}
              onToggleTimer={onToggleTimer}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTier={onMoveTier}
              onMoveToBacklog={onMoveToBacklog}
              onPostponeTomorrow={onPostponeTomorrow}
            />
          ))}

          {/* Inline List Input for Medium Tasks */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/20 focus-within:border-amber-400 focus-within:bg-white transition-all">
            <span className="text-amber-500 text-xs font-bold px-2 select-none">
              {mediumTasks.length + 1}.
            </span>
            <input
              type="text"
              placeholder={`Add medium task to list (press Enter to add #` + (mediumTasks.length + 1) + `)...`}
              value={inlineInputs.medium}
              onChange={e => setInlineInputs({ ...inlineInputs, medium: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInlineSubmit('medium');
                }
              }}
              className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            {inlineInputs.medium.trim() && (
              <button
                onClick={() => handleInlineSubmit('medium')}
                className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Add</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TIER 3: The 5 Small Tasks */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-50/30 border-b border-emerald-100/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              5
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Small Tasks
              </h3>
              <p className="text-[11px] text-slate-500">
                Quick administrative items, email replies, and 5–15 min quick wins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tabular-nums font-semibold text-slate-700">
              {smallTasks.length} / 5 Slots
            </span>
            <button
              onClick={() => onOpenNewTaskWithTier('small')}
              className="px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100/60 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {smallTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              activeTimer={activeTimer}
              onToggleComplete={onToggleComplete}
              onStartTimer={onStartTimer}
              onToggleTimer={onToggleTimer}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTier={onMoveTier}
              onMoveToBacklog={onMoveToBacklog}
              onPostponeTomorrow={onPostponeTomorrow}
            />
          ))}

          {/* Inline List Input for Small Tasks */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/20 focus-within:border-emerald-400 focus-within:bg-white transition-all">
            <span className="text-emerald-600 text-xs font-bold px-2 select-none">
              {smallTasks.length + 1}.
            </span>
            <input
              type="text"
              placeholder={`Add small quick task to list (press Enter to add #` + (smallTasks.length + 1) + `)...`}
              value={inlineInputs.small}
              onChange={e => setInlineInputs({ ...inlineInputs, small: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInlineSubmit('small');
                }
              }}
              className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            {inlineInputs.small.trim() && (
              <button
                onClick={() => handleInlineSubmit('small')}
                className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Add</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
