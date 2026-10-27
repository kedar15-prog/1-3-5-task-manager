import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Trash2, 
  Edit3, 
  FolderCheck,
  Filter
} from 'lucide-react';
import { Task, TaskTier, TaskPriority, ActiveTimer } from '../types/todo';
import { formatDurationHuman } from '../utils/dates';

interface MainBacklogProps {
  tasks: Task[];
  activeTimer: ActiveTimer | null;
  onAddTaskToToday: (taskId: string, targetTier?: TaskTier) => void;
  onStartTimer: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
  onQuickAddBacklogTask?: (title: string, tier: TaskTier) => void;
  onRunAutoUpdate: () => void;
  todaySlotCounts: Record<TaskTier, { filled: number; max: number }>;
}

export const MainBacklog: React.FC<MainBacklogProps> = ({
  tasks,
  activeTimer,
  onAddTaskToToday,
  onStartTimer,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
  onQuickAddBacklogTask,
  onRunAutoUpdate,
  todaySlotCounts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | TaskTier>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | TaskPriority>('all');
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineTier, setInlineTier] = useState<TaskTier>('medium');

  const handleInlineSubmit = () => {
    const trimmed = inlineTitle.trim();
    if (!trimmed) return;
    if (onQuickAddBacklogTask) {
      onQuickAddBacklogTask(trimmed, inlineTier);
    }
    setInlineTitle('');
  };

  // Backlog tasks: not currently in daily list (or pending with null/past date)
  const backlogTasks = useMemo(() => {
    return tasks.filter(t => !t.inDailyList);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return backlogTasks.filter(task => {
      if (selectedTier !== 'all' && task.tier !== selectedTier) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchTag = task.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }
      return true;
    });
  }, [backlogTasks, selectedTier, selectedPriority, searchQuery]);

  const priorityColors: Record<TaskPriority, string> = {
    high: 'text-rose-700',
    medium: 'text-amber-700',
    low: 'text-slate-500',
  };

  const tierBadgeColors: Record<TaskTier, string> = {
    major: 'text-indigo-700',
    medium: 'text-amber-800',
    small: 'text-emerald-800',
  };

  return (
    <div className="space-y-6">
      {/* Backlog Header & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Master Backlog &amp; Project Repository
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Central staging area for all upcoming deliverables. Daily 1-3-5 auto-pulls priority items from here.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRunAutoUpdate}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
              title="Auto-feed backlog tasks into today's empty 1-3-5 slots"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto-Fill Today's 1·3·5</span>
            </button>

            <button
              onClick={onOpenNewTask}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Backlog Task</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search backlog tasks or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Tier Segmented Filter (Functional Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'major', 'medium', 'small'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap capitalize ${
                  selectedTier === tier
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tier === 'all' ? 'All Tiers' : tier}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'high', 'medium', 'low'] as const).map(priority => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap capitalize ${
                  selectedPriority === priority
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {priority === 'all' ? 'All' : priority}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Inline List Creator for Backlog */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
            <span className="text-slate-400 text-xs font-bold select-none">+</span>
            <input
              type="text"
              placeholder="Add backlog task to list (press Enter to create)..."
              value={inlineTitle}
              onChange={e => setInlineTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInlineSubmit();
                }
              }}
              className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1 shrink-0">
              {(['major', 'medium', 'small'] as TaskTier[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInlineTier(t)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase transition-colors ${
                    inlineTier === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-700 bg-slate-100'
                  }`}
                >
                  {t === 'major' ? 'Maj' : t === 'medium' ? 'Med' : 'Sml'}
                </button>
              ))}
            </div>
            {inlineTitle.trim() && (
              <button
                type="button"
                onClick={handleInlineSubmit}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backlog Tasks Grid / List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <FolderCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No backlog tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedTier !== 'all' || selectedPriority !== 'all'
                ? 'Try clearing your active search or filters.'
                : 'All tasks have been scheduled into daily 1-3-5 boards! Add new tasks to keep your pipeline full.'}
            </p>
            <button
              onClick={onOpenNewTask}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isTimerRunning = activeTimer?.taskId === task.id && activeTimer.isRunning;
            const openSlots = todaySlotCounts[task.tier].max - todaySlotCounts[task.tier].filled;

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold capitalize ${tierBadgeColors[task.tier]}`}>
                      {task.tier}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className={`text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
                      {task.priority} Priority
                    </span>
                    {task.estimatedMinutes > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          ~{task.estimatedMinutes}m est
                        </span>
                      </>
                    )}
                    {task.timeSpentSeconds > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {formatDurationHuman(task.timeSpentSeconds)} logged
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="mt-1 text-sm font-medium text-slate-900 leading-snug break-words">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Tags:</span>
                      <span>{task.tags.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Actions: Push to Today's 1-3-5 or Start Timer */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onStartTimer(task)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Start focus timer on this backlog item"
                  >
                    <Clock className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onAddTaskToToday(task.id)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    title={
                      openSlots > 0
                        ? `Move to Today's ${task.tier} slot (${openSlots} available)`
                        : `Today's ${task.tier} quota is full, but you can assign anyway`
                    }
                  >
                    <span>Move to Today</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
