export type TaskTier = 'major' | 'medium' | 'small';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch';

export interface Task {
  id: string;
  title: string;
  description?: string;
  tier: TaskTier;
  status: 'pending' | 'completed';
  // If assigned to a specific day: 'YYYY-MM-DD'. If null/empty, exists in master backlog.
  date: string | null;
  // Whether actively assigned to today's 1-3-5 board
  inDailyList: boolean;
  estimatedMinutes: number;
  timeSpentSeconds: number;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;
  completedAt?: string;
  rolloverCount: number;
}

export interface AutoUpdateSettings {
  autoRolloverUnfinished: boolean; // Carry incomplete tasks to today
  autoFillFromBacklog: boolean;    // Replenish empty slots from master backlog
  replenishStrategy: 'priority' | 'oldest';
  notifyOnAutoUpdate: boolean;
  soundEnabled: boolean;
  lastAutoUpdatedDate: string;     // 'YYYY-MM-DD'
}

export interface AutoUpdateLog {
  date: string;
  timestamp: string;
  rolledOverCount: number;
  backlogFilledCount: number;
  details: string[];
}

export interface DayHistoryRecord {
  date: string; // 'YYYY-MM-DD'
  totalTasks: number;
  completedTasks: number;
  totalFocusSeconds: number;
  tasksCompletedIds: string[];
}

export interface ActiveTimer {
  taskId: string;
  taskTitle: string;
  tier: TaskTier;
  mode: TimerMode;
  targetSeconds: number; // e.g., 25*60 for pomodoro
  remainingSeconds: number;
  elapsedSeconds: number; // for stopwatch or tracking
  isRunning: boolean;
  isBreak: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string | null; // Associated date YYYY-MM-DD or null for general notes
  isPinned: boolean;
  color: 'amber' | 'indigo' | 'emerald' | 'rose' | 'slate';
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const TIER_LIMITS: Record<TaskTier, number> = {
  major: 1,
  medium: 3,
  small: 5,
};

export const TIER_LABELS: Record<TaskTier, { title: string; subtitle: string; color: string; bg: string; border: string }> = {
  major: {
    title: '1 Major Task',
    subtitle: 'High-impact needle mover for the day',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-200',
  },
  medium: {
    title: '3 Medium Tasks',
    subtitle: 'Core deliverables and project progress',
    color: 'text-amber-800',
    bg: 'bg-amber-50/40',
    border: 'border-amber-200/70',
  },
  small: {
    title: '5 Small Tasks',
    subtitle: 'Quick wins, administrative, follow-ups',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50/40',
    border: 'border-emerald-200/70',
  },
};
