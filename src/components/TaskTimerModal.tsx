import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Volume2, 
  VolumeX, 
  Minimize2,
  Coffee,
  Flame,
  Plus
} from 'lucide-react';
import { ActiveTimer, TimerMode, Task } from '../types/todo';
import { formatSecondsClock, formatDurationHuman } from '../utils/dates';

interface TaskTimerModalProps {
  timer: ActiveTimer | null;
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeMode: (mode: TimerMode, durationMinutes?: number) => void;
  onAddMinutes: (minutes: number) => void;
  onCompleteTask: (taskId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TaskTimerModal: React.FC<TaskTimerModalProps> = ({
  timer,
  task,
  isOpen,
  onClose,
  onToggleTimer,
  onResetTimer,
  onChangeMode,
  onAddMinutes,
  onCompleteTask,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen || !timer || !task) return null;

  const isCountdown = timer.mode === 'pomodoro' || timer.mode === 'countdown';
  const progressPercent = isCountdown && timer.targetSeconds > 0
    ? Math.min(100, Math.max(0, ((timer.targetSeconds - timer.remainingSeconds) / timer.targetSeconds) * 100))
    : 0;

  const displayTime = isCountdown
    ? formatSecondsClock(timer.remainingSeconds)
    : formatSecondsClock(timer.elapsedSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              {timer.isBreak ? 'Break Interval' : 'Deep Focus Session'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title={soundEnabled ? 'Mute audio' : 'Enable audio chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Minimize to floating bar"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Header & Context */}
        <div className="px-6 pt-5 pb-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {task.tier} Task
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            Total logged so far: {formatDurationHuman(task.timeSpentSeconds)}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 py-3 flex justify-center">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => onChangeMode('pomodoro', 25)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timer.mode === 'pomodoro'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pomodoro (25m)
            </button>

            <button
              onClick={() => onChangeMode('countdown', 15)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timer.mode === 'countdown'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sprint (15m)
            </button>

            <button
              onClick={() => onChangeMode('countdown', 45)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timer.mode === 'countdown' && timer.targetSeconds === 45 * 60
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deep Work (45m)
            </button>

            <button
              onClick={() => onChangeMode('stopwatch')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timer.mode === 'stopwatch'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stopwatch
            </button>
          </div>
        </div>

        {/* Big Digital Display */}
        <div className="px-6 py-6 flex flex-col items-center justify-center">
          <div className="font-mono tabular-nums text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 select-none">
            {displayTime}
          </div>

          {/* Linear Progress Bar for countdown */}
          {isCountdown && (
            <div className="w-full max-w-xs mt-4 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Quick extension */}
          <div className="flex items-center gap-1.5">
            {isCountdown && (
              <button
                onClick={() => onAddMinutes(5)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                title="Add 5 minutes to countdown"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+5 min</span>
              </button>
            )}

            <button
              onClick={onResetTimer}
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Main Play/Pause Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTimer}
              className={`px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-white shadow-md transition-all active:scale-95 ${
                timer.isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{timer.remainingSeconds === timer.targetSeconds ? 'Start Focus' : 'Resume'}</span>
                </>
              )}
            </button>
          </div>

          {/* Finish & Mark Complete */}
          <button
            onClick={() => {
              onCompleteTask(task.id);
              onClose();
            }}
            className="px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5"
            title="Mark this task completed and finish session"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Complete Task</span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="px-6 py-2 bg-slate-100/70 border-t border-slate-200/50 text-center text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700">Space</kbd> to Play/Pause · <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700">Esc</kbd> to minimize
        </div>
      </div>
    </div>
  );
};
