import { AutoUpdateLog, AutoUpdateSettings, DayHistoryRecord, Task, TIER_LIMITS, TaskTier, Note } from '../types/todo';
import { getTodayKey, offsetDateKey } from './dates';

const STORAGE_KEYS = {
  TASKS: 'one_three_five_tasks_v1',
  SETTINGS: 'one_three_five_settings_v1',
  HISTORY: 'one_three_five_history_v1',
  LAST_LOG: 'one_three_five_last_log_v1',
  NOTES: 'one_three_five_notes_v1',
};

export const DEFAULT_SETTINGS: AutoUpdateSettings = {
  autoRolloverUnfinished: true,
  autoFillFromBacklog: true,
  replenishStrategy: 'priority',
  notifyOnAutoUpdate: true,
  soundEnabled: true,
  lastAutoUpdatedDate: '',
};

export function getInitialTasks(): Task[] {
  const today = getTodayKey();
  const yesterday = offsetDateKey(today, -1);

  return [
    // Today's 1 Major Task
    {
      id: 'task-major-1',
      title: 'Finalize Q4 Strategic Product Roadmap',
      description: 'Synthesize user feedback, map milestone dependencies, and prepare the executive slide deck.',
      tier: 'major',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 90,
      timeSpentSeconds: 1500, // 25 mins already logged
      priority: 'high',
      tags: ['Strategy', 'Roadmap'],
      createdAt: `${today}T08:00:00.000Z`,
      rolloverCount: 0,
    },
    // Today's 3 Medium Tasks
    {
      id: 'task-med-1',
      title: 'Review and merge pull request #142',
      description: 'Audit test coverage for background task synchronization and memory leak protection.',
      tier: 'medium',
      status: 'completed',
      date: today,
      inDailyList: true,
      estimatedMinutes: 45,
      timeSpentSeconds: 2700,
      priority: 'high',
      tags: ['Dev', 'CodeReview'],
      createdAt: `${today}T08:15:00.000Z`,
      completedAt: `${today}T09:30:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-med-2',
      title: 'Draft customer release update notes',
      description: 'Outline key highlights of the new auto-rollover and task timer features for users.',
      tier: 'medium',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 30,
      timeSpentSeconds: 600,
      priority: 'medium',
      tags: ['Writing', 'Launch'],
      createdAt: `${today}T08:20:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-med-3',
      title: 'Conduct team sprint grooming session',
      description: 'Estimate backlog story points and review next sprint targets.',
      tier: 'medium',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 45,
      timeSpentSeconds: 0,
      priority: 'medium',
      tags: ['Team', 'Agile'],
      createdAt: `${today}T08:25:00.000Z`,
      rolloverCount: 0,
    },
    // Today's 5 Small Tasks
    {
      id: 'task-small-1',
      title: 'Reply to Sarah regarding enterprise API limits',
      tier: 'small',
      status: 'completed',
      date: today,
      inDailyList: true,
      estimatedMinutes: 15,
      timeSpentSeconds: 900,
      priority: 'high',
      tags: ['Email', 'Customer'],
      createdAt: `${today}T08:30:00.000Z`,
      completedAt: `${today}T09:10:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-small-2',
      title: 'Submit monthly office SaaS expense receipt',
      tier: 'small',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 10,
      timeSpentSeconds: 0,
      priority: 'medium',
      tags: ['Admin'],
      createdAt: `${today}T08:35:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-small-3',
      title: 'Schedule quarterly 1:1 check-in with design lead',
      tier: 'small',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 10,
      timeSpentSeconds: 0,
      priority: 'low',
      tags: ['Calendar'],
      createdAt: `${today}T08:40:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-small-4',
      title: 'Clean up browser tabs and triage inbox',
      tier: 'small',
      status: 'pending',
      date: today,
      inDailyList: true,
      estimatedMinutes: 15,
      timeSpentSeconds: 300,
      priority: 'low',
      tags: ['Hygiene'],
      createdAt: `${today}T08:45:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'task-small-5',
      title: 'Verify production SSL certificate renewal',
      tier: 'small',
      status: 'completed',
      date: today,
      inDailyList: true,
      estimatedMinutes: 10,
      timeSpentSeconds: 600,
      priority: 'high',
      tags: ['DevOps'],
      createdAt: `${today}T08:50:00.000Z`,
      completedAt: `${today}T09:05:00.000Z`,
      rolloverCount: 0,
    },

    // Master Backlog items (Ready to auto-fill or manually schedule)
    {
      id: 'backlog-1',
      title: 'Design automated CSV and JSON data export utility',
      description: 'Allow users to export all task history and focus time records.',
      tier: 'major',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 120,
      timeSpentSeconds: 0,
      priority: 'high',
      tags: ['Feature', 'Data'],
      createdAt: `${yesterday}T10:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-2',
      title: 'Architect offline storage synchronization bridge',
      description: 'Ensure seamless IndexedDB fallback with multi-tab storage events.',
      tier: 'major',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 90,
      timeSpentSeconds: 0,
      priority: 'medium',
      tags: ['Architecture'],
      createdAt: `${yesterday}T11:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-3',
      title: 'Implement sound volume slider and audio theme toggle',
      description: 'Provide gentle acoustic bell, subtle digital ping, and silent mode.',
      tier: 'medium',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 35,
      timeSpentSeconds: 0,
      priority: 'high',
      tags: ['UI', 'Audio'],
      createdAt: `${yesterday}T12:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-4',
      title: 'Optimize bundle size & purge unused icon imports',
      description: 'Tree-shake Lucide icons and inspect production dist chunking.',
      tier: 'medium',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 40,
      timeSpentSeconds: 0,
      priority: 'medium',
      tags: ['Performance'],
      createdAt: `${yesterday}T13:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-5',
      title: 'Document keyboard navigation cheatsheet',
      description: 'Add tooltip reference for spacebar timer play/pause and shortcut keys.',
      tier: 'small',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 15,
      timeSpentSeconds: 0,
      priority: 'high',
      tags: ['Docs', 'Accessibility'],
      createdAt: `${yesterday}T14:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-6',
      title: 'Update GitHub repository README badges',
      tier: 'small',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 10,
      timeSpentSeconds: 0,
      priority: 'low',
      tags: ['Docs'],
      createdAt: `${yesterday}T15:00:00.000Z`,
      rolloverCount: 0,
    },
    {
      id: 'backlog-7',
      title: 'Archive resolved Slack channel discussions',
      tier: 'small',
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: 10,
      timeSpentSeconds: 0,
      priority: 'low',
      tags: ['Ops'],
      createdAt: `${yesterday}T16:00:00.000Z`,
      rolloverCount: 0,
    },
  ];
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function getInitialNotes(): Note[] {
  const today = getTodayKey();
  return [
    {
      id: 'note-1',
      title: "Today's Focus & Reflection",
      content: "• Anchor task is the Q4 Roadmap deck\n• Target 2 hours of uninterrupted deep work before lunch\n• Remember to hydrate and stretch during 5m breaks",
      date: today,
      isPinned: true,
      color: 'indigo',
      createdAt: `${today}T08:00:00.000Z`,
      updatedAt: `${today}T08:00:00.000Z`,
      tags: ['Daily', 'Mindset'],
    },
    {
      id: 'note-2',
      title: 'Sprint Retrospective Takeaways',
      content: "1. Background task synchronization is working smoothly.\n2. Need to add keyboard shortcut tooltip.\n3. Verify Android APK icon display across dark/light themes.",
      date: today,
      isPinned: false,
      color: 'emerald',
      createdAt: `${today}T08:30:00.000Z`,
      updatedAt: `${today}T08:30:00.000Z`,
      tags: ['Sprint', 'Dev'],
    },
    {
      id: 'note-3',
      title: 'Long-term Feature Ideas',
      content: "- Integration with Google Calendar events\n- Sound themes for Pomodoro timer\n- Markdown checklist parsing for instant 1-3-5 assignment",
      date: null,
      isPinned: false,
      color: 'amber',
      createdAt: `${today}T09:00:00.000Z`,
      updatedAt: `${today}T09:00:00.000Z`,
      tags: ['Ideas', 'Backlog'],
    },
  ];
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      const initial = getInitialNotes();
      saveNotes(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load notes', err);
    return getInitialNotes();
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes', err);
  }
}

export function loadSettings(): AutoUpdateSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AutoUpdateSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function loadLastLog(): AutoUpdateLog | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_LOG);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastLog(log: AutoUpdateLog | null): void {
  try {
    if (log) {
      localStorage.setItem(STORAGE_KEYS.LAST_LOG, JSON.stringify(log));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_LOG);
    }
  } catch {
    // Ignore
  }
}

export function loadHistory(): Record<string, DayHistoryRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDayHistory(dateKey: string, tasks: Task[]): void {
  try {
    const history = loadHistory();
    const dayTasks = tasks.filter(t => t.inDailyList && t.date === dateKey);
    const completedTasks = dayTasks.filter(t => t.status === 'completed');
    const totalFocusSeconds = dayTasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);

    history[dateKey] = {
      date: dateKey,
      totalTasks: dayTasks.length,
      completedTasks: completedTasks.length,
      totalFocusSeconds,
      tasksCompletedIds: completedTasks.map(t => t.id),
    };
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history', err);
  }
}

/**
 * Executes the Daily Auto-Update Routine:
 * 1. Checks if today's date differs from lastAutoUpdatedDate.
 * 2. Unfinished tasks from past days in the daily 1-3-5 list:
 *    - If autoRolloverUnfinished: carried over to today's date with rolloverCount incremented.
 *    - If tier quota is exceeded, excess unfinished items return to Master Backlog.
 * 3. Master Backlog items:
 *    - If autoFillFromBacklog: automatically replenishes remaining empty slots for 1 Major, 3 Medium, and 5 Small!
 * 4. Logs the summary of updates and updates lastAutoUpdatedDate.
 */
export function executeDailyAutoUpdate(
  currentTasks: Task[],
  settings: AutoUpdateSettings,
  forceManual: boolean = false
): { updatedTasks: Task[]; log: AutoUpdateLog | null; updatedSettings: AutoUpdateSettings } {
  const today = getTodayKey();

  // If already auto-updated today and not forced, return as is
  if (!forceManual && settings.lastAutoUpdatedDate === today) {
    return { updatedTasks: currentTasks, log: null, updatedSettings: settings };
  }

  const details: string[] = [];
  let rolledOverCount = 0;
  let backlogFilledCount = 0;

  let tasks = [...currentTasks];

  // 1. Process unfinished tasks from past days that were in the daily list
  if (settings.autoRolloverUnfinished) {
    const pastIncompleteDaily = tasks.filter(
      t => t.inDailyList && t.status === 'pending' && t.date && t.date < today
    );

    // Group current today's tasks by tier
    const todayCounts: Record<TaskTier, number> = {
      major: tasks.filter(t => t.inDailyList && t.date === today && t.tier === 'major').length,
      medium: tasks.filter(t => t.inDailyList && t.date === today && t.tier === 'medium').length,
      small: tasks.filter(t => t.inDailyList && t.date === today && t.tier === 'small').length,
    };

    pastIncompleteDaily.forEach(pastTask => {
      const tier = pastTask.tier;
      if (todayCounts[tier] < TIER_LIMITS[tier]) {
        // Carry forward to today
        todayCounts[tier] += 1;
        rolledOverCount += 1;
        tasks = tasks.map(t =>
          t.id === pastTask.id
            ? {
                ...t,
                date: today,
                rolloverCount: (t.rolloverCount || 0) + 1,
              }
            : t
        );
        details.push(`Rolled over "${pastTask.title}" (${tier}) from ${pastTask.date}`);
      } else {
        // Quota full for today; safely return to Master Backlog so it's not lost
        tasks = tasks.map(t =>
          t.id === pastTask.id
            ? {
                ...t,
                date: null,
                inDailyList: false,
                rolloverCount: (t.rolloverCount || 0) + 1,
              }
            : t
        );
        details.push(`Moved overflow task "${pastTask.title}" (${tier}) back to Master Backlog`);
      }
    });
  }

  // 2. Auto-Replenish empty slots from the Master Backlog
  if (settings.autoFillFromBacklog) {
    const tiers: TaskTier[] = ['major', 'medium', 'small'];

    tiers.forEach(tier => {
      const currentCount = tasks.filter(
        t => t.inDailyList && t.date === today && t.tier === tier
      ).length;
      const needed = TIER_LIMITS[tier] - currentCount;

      if (needed > 0) {
        // Find candidate tasks in backlog
        let candidates = tasks.filter(
          t => !t.inDailyList && t.status === 'pending' && t.tier === tier
        );

        // Sort candidates
        if (settings.replenishStrategy === 'priority') {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          candidates.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
        } else {
          // Oldest first
          candidates.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }

        const toAdd = candidates.slice(0, needed);
        toAdd.forEach(item => {
          tasks = tasks.map(t =>
            t.id === item.id
              ? {
                  ...t,
                  date: today,
                  inDailyList: true,
                }
              : t
          );
          backlogFilledCount += 1;
          details.push(`Auto-assigned "${item.title}" to today's ${tier} slot`);
        });
      }
    });
  }

  const log: AutoUpdateLog = {
    date: today,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rolledOverCount,
    backlogFilledCount,
    details: details.length > 0 ? details : ['All 1-3-5 daily slots already satisfied.'],
  };

  const updatedSettings: AutoUpdateSettings = {
    ...settings,
    lastAutoUpdatedDate: today,
  };

  saveTasks(tasks);
  saveSettings(updatedSettings);
  saveLastLog(log);

  return { updatedTasks: tasks, log, updatedSettings };
}
