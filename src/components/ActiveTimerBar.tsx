import React from 'react';
import { Play, Pause, Square, Maximize2, Check, Clock } from 'lucide-react';
import { ActiveTimer } from '../types/todo';
import { formatSecondsClock } from '../utils/dates';

interface ActiveTimerBarProps {
  timer: ActiveTimer | null;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onExpandTimer: () => void;
  onCompleteTask: (taskId: string) => void;
}

export const ActiveTimerBar: React.FC<ActiveTimerBarProps> = ({
  timer,
  onToggleTimer,
  onStopTimer,
  onExpandTimer,
  onCompleteTask,
}) => {
  if (!timer) return null;

  const isCountdown = timer.mode === 'pomodoro' || timer.mode === 'countdown';
  const displayTime = isCountdown
    ? formatSecondsClock(timer.remainingSeconds)
    : formatSecondsClock(timer.elapsedSeconds);

  const tierColors = {
    major: 'bg-indigo-600 text-white',
    medium: 'bg-amber-600 text-white',
    small: 'bg-emerald-600 text-white',
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-800 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Left: Indicator & Task Info */}
        <div 
          onClick={onExpandTimer}
          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
          title="Click to expand focus timer"
        >
          <div className="relative shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full block ${
                timer.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tierColors[timer.tier]}`}>
                {timer.tier}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {timer.mode}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 truncate mt-0.5">
              {timer.taskTitle}
            </p>
          </div>
        </div>

        {/* Center: Monospace Digital Time */}
        <div 
          onClick={onExpandTimer}
          className="font-mono tabular-nums text-lg sm:text-xl font-bold tracking-tight text-white cursor-pointer px-2 select-none"
        >
          {displayTime}
        </div>

        {/* Right: Interactive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onToggleTimer}
            className={`p-2 rounded-xl text-white font-medium shadow-sm transition-all active:scale-95 ${
              timer.isRunning
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
            title={timer.isRunning ? 'Pause timer (Space)' : 'Resume timer (Space)'}
          >
            {timer.isRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <button
            onClick={() => onCompleteTask(timer.taskId)}
            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-colors"
            title="Mark completed"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onStopTimer}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Stop timer"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={onExpandTimer}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
            title="Expand to Fullscreen Focus Modal"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
