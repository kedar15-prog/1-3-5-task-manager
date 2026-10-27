import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  Clock, 
  MoreHorizontal, 
  ArrowRight, 
  Archive, 
  Trash2, 
  Edit3,
  Calendar
} from 'lucide-react';
import { Task, TaskTier, ActiveTimer } from '../types/todo';
import { formatDurationHuman, formatSecondsClock } from '../utils/dates';

interface TaskCardProps {
  task: Task;
  activeTimer: ActiveTimer | null;
  onToggleComplete: (id: string) => void;
  onStartTimer: (task: Task) => void;
  onToggleTimer: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTier: (id: string, tier: TaskTier) => void;
  onMoveToBacklog: (id: string) => void;
  onPostponeTomorrow?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  activeTimer,
  onToggleComplete,
  onStartTimer,
  onToggleTimer,
  onEditTask,
  onDeleteTask,
  onMoveTier,
  onMoveToBacklog,
  onPostponeTomorrow,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isTimerRunningOnThisTask = activeTimer?.taskId === task.id && activeTimer.isRunning;
  const isTimerPausedOnThisTask = activeTimer?.taskId === task.id && !activeTimer.isRunning;

  const isCompleted = task.status === 'completed';

  const priorityColors = {
    high: 'text-rose-700',
    medium: 'text-amber-700',
    low: 'text-slate-500',
  };

  return (
    <div
      className={`group relative rounded-xl border bg-white p-3.5 sm:p-4 transition-all duration-150 ${
        isCompleted
          ? 'border-slate-200/80 bg-slate-50/60 opacity-75'
          : isTimerRunningOnThisTask
          ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Custom Checkbox with 44px ergonomic touch area */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center shrink-0 cursor-pointer"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-indigo-500 bg-white'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-medium leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>

            {/* Quick Actions Dropdown Menu Trigger with 44px touch area */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-all"
                aria-label="Task options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-6 z-30 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEditTask(task);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Details</span>
                    </button>

                    {task.inDailyList && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onMoveToBacklog(task.id);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Archive className="w-3.5 h-3.5 text-slate-400" />
                        <span>Move to Master Backlog</span>
                      </button>
                    )}

                    {onPostponeTomorrow && task.inDailyList && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onPostponeTomorrow(task.id);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Postpone to Tomorrow</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />
                    
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Change Tier
                    </div>
                    {(['major', 'medium', 'small'] as TaskTier[]).map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setMenuOpen(false);
                          onMoveTier(task.id, t);
                        }}
                        disabled={task.tier === t}
                        className={`w-full px-3 py-1 text-left flex items-center justify-between capitalize ${
                          task.tier === t
                            ? 'text-indigo-600 font-semibold bg-indigo-50/50'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{t}</span>
                        {task.tier === t && <Check className="w-3 h-3" />}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteTask(task.id);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Clean Unboxed Metadata & Timer Controls */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-xs">
            {/* Metadata items with subtle typographic separators */}
            <div className="flex items-center gap-2 text-slate-500 flex-wrap">
              <span className={`font-medium capitalize ${priorityColors[task.priority]}`}>
                {task.priority} Priority
              </span>

              {task.tags && task.tags.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{task.tags.join(', ')}</span>
                </>
              )}

              {task.rolloverCount > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-indigo-600 font-medium">
                    Rolled over {task.rolloverCount}d
                  </span>
                </>
              )}

              {task.timeSpentSeconds > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {formatDurationHuman(task.timeSpentSeconds)} spent
                  </span>
                </>
              )}
            </div>

            {/* Task Timer Interactive Control */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isTimerRunningOnThisTask ? (
                <button
                  type="button"
                  onClick={onToggleTimer}
                  className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono tabular-nums text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 transition-colors"
                  title="Pause active timer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{formatSecondsClock(activeTimer.remainingSeconds)}</span>
                </button>
              ) : isTimerPausedOnThisTask ? (
                <button
                  type="button"
                  onClick={onToggleTimer}
                  className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-mono tabular-nums text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-amber-600 transition-colors"
                  title="Resume timer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{formatSecondsClock(activeTimer.remainingSeconds)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartTimer(task)}
                  disabled={isCompleted}
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                    isCompleted
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                  title="Start Task Timer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
