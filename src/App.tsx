import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Task, 
  TaskTier, 
  ActiveTimer, 
  TimerMode, 
  AutoUpdateSettings, 
  AutoUpdateLog, 
  DayHistoryRecord,
  Note,
  TIER_LIMITS 
} from './types/todo';
import { 
  loadTasks, 
  saveTasks, 
  loadSettings, 
  saveSettings, 
  loadLastLog, 
  saveLastLog, 
  loadHistory, 
  saveDayHistory, 
  executeDailyAutoUpdate,
  loadNotes,
  saveNotes
} from './utils/storage';
import { saveLocalSnapshot, loadLocalSnapshots } from './utils/backup';
import { getTodayKey, offsetDateKey } from './utils/dates';
import { playTimerFinishChime, playTaskCompleteChime, playTickSound } from './utils/audio';
import { Header } from './components/Header';
import { DailyOneThreeFive } from './components/DailyOneThreeFive';
import { MainBacklog } from './components/MainBacklog';
import { NotesView } from './components/NotesView';
import { LocalDeviceBackupView } from './components/LocalDeviceBackupView';
import { TaskTimerModal } from './components/TaskTimerModal';
import { ActiveTimerBar } from './components/ActiveTimerBar';
import { AutoUpdateModal } from './components/AutoUpdateModal';
import { TaskFormModal } from './components/TaskFormModal';
import { HistoryModal } from './components/HistoryModal';
import { CalendarModal } from './components/CalendarModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sparkles, WifiOff } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [settings, setSettings] = useState<AutoUpdateSettings>(loadSettings);
  const [lastLog, setLastLog] = useState<AutoUpdateLog | null>(loadLastLog);
  const [historyRecords, setHistoryRecords] = useState<Record<string, DayHistoryRecord>>(loadHistory);

  const [currentDateKey, setCurrentDateKey] = useState<string>(getTodayKey);
  const [activeTab, setActiveTab] = useState<'today' | 'backlog' | 'notes' | 'history' | 'backup'>('today');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Online / Offline tracking
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // Modals state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTierForNewTask, setDefaultTierForNewTask] = useState<TaskTier>('medium');
  const [isAutoUpdateModalOpen, setIsAutoUpdateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Auto-Update Banner alert
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // 1. Initial Auto-Update & Local Snapshot check on mount
  useEffect(() => {
    const today = getTodayKey();
    if (settings.lastAutoUpdatedDate !== today) {
      const { updatedTasks, log, updatedSettings } = executeDailyAutoUpdate(tasks, settings, false);
      if (log) {
        setTasks(updatedTasks);
        setSettings(updatedSettings);
        setLastLog(log);
        if (settings.notifyOnAutoUpdate && (log.rolledOverCount > 0 || log.backlogFilledCount > 0)) {
          setBannerNotice(
            `Good morning! Daily Auto-Update prepared today's 1-3-5: ${log.rolledOverCount} task(s) rolled over and ${log.backlogFilledCount} added from Master Backlog.`
          );
        }
      }
    }

    // Ensure initial snapshot is present
    if (loadLocalSnapshots().length === 0) {
      saveLocalSnapshot(tasks, settings, historyRecords, notes);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Periodic Midnight Check (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayKey();
      if (settings.lastAutoUpdatedDate !== today) {
        const { updatedTasks, log, updatedSettings } = executeDailyAutoUpdate(tasks, settings, false);
        setTasks(updatedTasks);
        setSettings(updatedSettings);
        setLastLog(log);
        setCurrentDateKey(today);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, settings]);

  // 3. Save tasks & update history record on changes
  const updateTasksAndPersist = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
    saveDayHistory(currentDateKey, newTasks);
    setHistoryRecords(loadHistory());
  }, [currentDateKey]);

  // 4. Timer Interval Worker (runs every second)
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning) return prev;

        const isCountdown = prev.mode === 'pomodoro' || prev.mode === 'countdown';

        if (isCountdown) {
          const newRemaining = prev.remainingSeconds - 1;
          const newElapsed = prev.elapsedSeconds + 1;

          // Increment timeSpent on the task
          setTasks(currentTasks => {
            const updated = currentTasks.map(t =>
              t.id === prev.taskId
                ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + 1 }
                : t
            );
            saveTasks(updated);
            return updated;
          });

          // Check if session finished
          if (newRemaining <= 0) {
            if (settings.soundEnabled) {
              playTimerFinishChime();
            }
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
            });

            // If it was pomodoro focus, prompt short break
            if (prev.mode === 'pomodoro' && !prev.isBreak) {
              return {
                ...prev,
                isBreak: true,
                targetSeconds: 5 * 60,
                remainingSeconds: 5 * 60,
                isRunning: false,
              };
            }

            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
            };
          }

          return {
            ...prev,
            remainingSeconds: newRemaining,
            elapsedSeconds: newElapsed,
          };
        } else {
          // Stopwatch mode: counts up
          const newElapsed = prev.elapsedSeconds + 1;
          setTasks(currentTasks => {
            const updated = currentTasks.map(t =>
              t.id === prev.taskId
                ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + 1 }
                : t
            );
            saveTasks(updated);
            return updated;
          });

          return {
            ...prev,
            elapsedSeconds: newElapsed,
            remainingSeconds: newElapsed,
          };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, settings.soundEnabled]);

  // 5. Global Keyboard Shortcuts: Space to Play/Pause Timer, N for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.code === 'Space' && activeTimer) {
        e.preventDefault();
        toggleTimer();
      }

      if (e.key === 'n' || e.key === 'N') {
        if (!isTaskFormOpen && !isTimerModalOpen) {
          e.preventDefault();
          handleOpenNewTask();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTimer, isTaskFormOpen, isTimerModalOpen]);

  // Timer control handlers
  const startTimerForTask = (task: Task) => {
    if (settings.soundEnabled) playTickSound();

    setActiveTimer({
      taskId: task.id,
      taskTitle: task.title,
      tier: task.tier,
      mode: 'pomodoro',
      targetSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      elapsedSeconds: 0,
      isRunning: true,
      isBreak: false,
    });
    setIsTimerModalOpen(true);
  };

  const toggleTimer = () => {
    if (!activeTimer) return;
    if (settings.soundEnabled) playTickSound();
    setActiveTimer(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
  };

  const resetTimer = () => {
    if (!activeTimer) return;
    if (settings.soundEnabled) playTickSound();
    setActiveTimer(prev =>
      prev
        ? {
            ...prev,
            remainingSeconds: prev.targetSeconds,
            elapsedSeconds: 0,
            isRunning: false,
          }
        : null
    );
  };

  const changeTimerMode = (mode: TimerMode, durationMinutes?: number) => {
    if (!activeTimer) return;
    if (settings.soundEnabled) playTickSound();

    let target = 25 * 60;
    if (mode === 'countdown' && durationMinutes) {
      target = durationMinutes * 60;
    } else if (mode === 'pomodoro') {
      target = 25 * 60;
    } else if (mode === 'stopwatch') {
      target = 0;
    }

    setActiveTimer({
      ...activeTimer,
      mode,
      targetSeconds: target,
      remainingSeconds: target,
      elapsedSeconds: 0,
      isRunning: false,
      isBreak: false,
    });
  };

  const addTimerMinutes = (minutes: number) => {
    if (!activeTimer) return;
    setActiveTimer(prev =>
      prev
        ? {
            ...prev,
            remainingSeconds: prev.remainingSeconds + minutes * 60,
            targetSeconds: prev.targetSeconds + minutes * 60,
          }
        : null
    );
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setIsTimerModalOpen(false);
  };

  // Task manipulation handlers
  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const willBeCompleted = task.status !== 'completed';
    if (willBeCompleted && settings.soundEnabled) {
      playTaskCompleteChime();
    }

    if (willBeCompleted) {
      confetti({
        particleCount: task.tier === 'major' ? 80 : 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    }

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: (willBeCompleted ? 'completed' : 'pending') as 'completed' | 'pending',
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          }
        : t
    );

    updateTasksAndPersist(updated);

    if (activeTimer?.taskId === taskId && willBeCompleted) {
      setActiveTimer(prev => (prev ? { ...prev, isRunning: false } : null));
    }
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      const updated = tasks.map(t =>
        t.id === editingTask.id ? { ...t, ...taskData } : t
      );
      updateTasksAndPersist(updated);
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        tier: taskData.tier || 'medium',
        status: 'pending',
        date: taskData.date !== undefined ? taskData.date : currentDateKey,
        inDailyList: taskData.inDailyList ?? true,
        estimatedMinutes: taskData.estimatedMinutes || (taskData.tier === 'major' ? 60 : taskData.tier === 'medium' ? 30 : 15),
        timeSpentSeconds: 0,
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        createdAt: new Date().toISOString(),
        rolloverCount: 0,
      };

      updateTasksAndPersist([newTask, ...tasks]);
    }
  };

  // Batch / List Format task creation handler
  const handleSaveMultipleTasks = (tasksData: Partial<Task>[]) => {
    const newTasks: Task[] = tasksData.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      title: item.title || 'Untitled Task',
      description: item.description,
      tier: item.tier || 'medium',
      status: 'pending',
      date: item.date !== undefined ? item.date : currentDateKey,
      inDailyList: item.inDailyList ?? true,
      estimatedMinutes: item.estimatedMinutes || (item.tier === 'major' ? 60 : item.tier === 'medium' ? 30 : 15),
      timeSpentSeconds: 0,
      priority: item.priority || 'medium',
      tags: item.tags || [],
      createdAt: new Date().toISOString(),
      rolloverCount: 0,
    }));

    updateTasksAndPersist([...newTasks, ...tasks]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Direct Inline List task creation on Daily Board
  const handleQuickAddTask = (title: string, tier: TaskTier) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      tier,
      status: 'pending',
      date: currentDateKey,
      inDailyList: true,
      estimatedMinutes: tier === 'major' ? 60 : tier === 'medium' ? 30 : 15,
      timeSpentSeconds: 0,
      priority: tier === 'major' ? 'high' : tier === 'medium' ? 'medium' : 'low',
      tags: [],
      createdAt: new Date().toISOString(),
      rolloverCount: 0,
    };
    updateTasksAndPersist([newTask, ...tasks]);
    if (settings.soundEnabled) playTickSound();
  };

  // Direct Inline List task creation in Master Backlog
  const handleQuickAddBacklogTask = (title: string, tier: TaskTier) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      tier,
      status: 'pending',
      date: null,
      inDailyList: false,
      estimatedMinutes: tier === 'major' ? 60 : tier === 'medium' ? 30 : 15,
      timeSpentSeconds: 0,
      priority: tier === 'major' ? 'high' : tier === 'medium' ? 'medium' : 'low',
      tags: [],
      createdAt: new Date().toISOString(),
      rolloverCount: 0,
    };
    updateTasksAndPersist([newTask, ...tasks]);
    if (settings.soundEnabled) playTickSound();
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    updateTasksAndPersist(updated);
    if (activeTimer?.taskId === taskId) {
      setActiveTimer(null);
    }
  };

  const handleMoveTier = (taskId: string, newTier: TaskTier) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, tier: newTier } : t
    );
    updateTasksAndPersist(updated);
  };

  const handleMoveToBacklog = (taskId: string) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, inDailyList: false, date: null } : t
    );
    updateTasksAndPersist(updated);
  };

  const handlePostponeTomorrow = (taskId: string) => {
    const tomorrowKey = offsetDateKey(currentDateKey, 1);
    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            date: tomorrowKey,
            inDailyList: true,
            rolloverCount: (t.rolloverCount || 0) + 1,
          }
        : t
    );
    updateTasksAndPersist(updated);
  };

  const handleAddTaskToToday = (taskId: string) => {
    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            date: currentDateKey,
            inDailyList: true,
          }
        : t
    );
    updateTasksAndPersist(updated);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setDefaultTierForNewTask('medium');
    setIsTaskFormOpen(true);
  };

  const handleOpenNewTaskWithTier = (tier: TaskTier) => {
    setEditingTask(null);
    setDefaultTierForNewTask(tier);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // Note manipulation handlers
  const handleSaveNote = (noteData: Partial<Note>) => {
    let updatedNotes: Note[];
    if (noteData.id) {
      updatedNotes = notes.map(n =>
        n.id === noteData.id
          ? {
              ...n,
              ...noteData,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        color: noteData.color || 'indigo',
        date: noteData.date !== undefined ? noteData.date : currentDateKey,
        isPinned: false,
        tags: noteData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    if (settings.soundEnabled) playTickSound();
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleTogglePinNote = (id: string) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    saveNotes(updated);
    if (settings.soundEnabled) playTickSound();
  };

  const handleConvertNoteToTask = (title: string, tier: TaskTier) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      tier,
      status: 'pending',
      date: currentDateKey,
      inDailyList: true,
      estimatedMinutes: tier === 'major' ? 60 : tier === 'medium' ? 30 : 15,
      timeSpentSeconds: 0,
      priority: tier === 'major' ? 'high' : tier === 'medium' ? 'medium' : 'low',
      tags: ['from-notes'],
      createdAt: new Date().toISOString(),
      rolloverCount: 0,
    };
    updateTasksAndPersist([newTask, ...tasks]);
    if (settings.soundEnabled) playTickSound();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // Restore Handler for local backups
  const handleRestoreData = (
    restoredTasks: Task[],
    restoredSettings?: AutoUpdateSettings,
    restoredHistory?: Record<string, DayHistoryRecord>,
    restoredNotes?: Note[]
  ) => {
    setTasks(restoredTasks);
    saveTasks(restoredTasks);

    if (restoredNotes) {
      setNotes(restoredNotes);
      saveNotes(restoredNotes);
    }
    if (restoredSettings) {
      setSettings(restoredSettings);
      saveSettings(restoredSettings);
    }
    if (restoredHistory) {
      setHistoryRecords(restoredHistory);
      localStorage.setItem('one_three_five_history_v1', JSON.stringify(restoredHistory));
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Auto-Update Trigger
  const handleTriggerManualAutoUpdate = () => {
    const { updatedTasks, log, updatedSettings } = executeDailyAutoUpdate(tasks, settings, true);
    setTasks(updatedTasks);
    setSettings(updatedSettings);
    setLastLog(log);
    setBannerNotice(
      `Manual Auto-Update executed: ${log?.rolledOverCount} task(s) rolled over, ${log?.backlogFilledCount} filled from Master Backlog.`
    );
  };

  // Slot calculations
  const dayTasks = tasks.filter(t => t.inDailyList && t.date === currentDateKey);
  const currentTierCounts: Record<TaskTier, number> = {
    major: dayTasks.filter(t => t.tier === 'major').length,
    medium: dayTasks.filter(t => t.tier === 'medium').length,
    small: dayTasks.filter(t => t.tier === 'small').length,
  };

  const todaySlotCounts: Record<TaskTier, { filled: number; max: number }> = {
    major: { filled: currentTierCounts.major, max: TIER_LIMITS.major },
    medium: { filled: currentTierCounts.medium, max: TIER_LIMITS.medium },
    small: { filled: currentTierCounts.small, max: TIER_LIMITS.small },
  };

  const pendingBacklogCount = tasks.filter(t => !t.inDailyList).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-28 md:pb-20">
      {/* Top Bar matching Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={tab => {
          if (tab === 'history') {
            setIsHistoryModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenNewTask={handleOpenNewTask}
        onOpenAutoUpdateSettings={() => setIsAutoUpdateModalOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        pendingBacklogCount={pendingBacklogCount}
        notesCount={notes.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Offline indicator banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white rounded-xl p-3 text-xs font-medium flex items-center gap-2 shadow-sm">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Offline Mode: Working from local device memory. All changes are saved on your phone.</span>
          </div>
        )}

        {/* Daily Auto-Update Banner Notice */}
        {bannerNotice && (
          <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-3 sm:p-4 text-xs text-indigo-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switching */}
        {activeTab === 'today' ? (
          <DailyOneThreeFive
            currentDateKey={currentDateKey}
            onChangeDate={setCurrentDateKey}
            tasks={tasks}
            activeTimer={activeTimer}
            onToggleComplete={handleToggleComplete}
            onStartTimer={startTimerForTask}
            onToggleTimer={toggleTimer}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onMoveTier={handleMoveTier}
            onMoveToBacklog={handleMoveToBacklog}
            onPostponeTomorrow={handlePostponeTomorrow}
            onOpenNewTaskWithTier={handleOpenNewTaskWithTier}
            onQuickAddTask={handleQuickAddTask}
            onOpenAutoFillModal={handleTriggerManualAutoUpdate}
            onNavigateToBacklog={() => setActiveTab('backlog')}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            backlogAvailableCount={pendingBacklogCount}
          />
        ) : activeTab === 'backlog' ? (
          <MainBacklog
            tasks={tasks}
            activeTimer={activeTimer}
            onAddTaskToToday={handleAddTaskToToday}
            onStartTimer={startTimerForTask}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={handleOpenNewTask}
            onQuickAddBacklogTask={handleQuickAddBacklogTask}
            onRunAutoUpdate={handleTriggerManualAutoUpdate}
            todaySlotCounts={todaySlotCounts}
          />
        ) : activeTab === 'notes' ? (
          <NotesView
            notes={notes}
            currentDateKey={currentDateKey}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onTogglePinNote={handleTogglePinNote}
            onConvertNoteToTask={handleConvertNoteToTask}
            onOpenCalendar={() => setIsCalendarOpen(true)}
          />
        ) : (
          <LocalDeviceBackupView
            tasks={tasks}
            notes={notes}
            settings={settings}
            historyRecords={historyRecords}
            onRestoreData={handleRestoreData}
          />
        )}
      </main>

      {/* Floating Active Timer Bottom Bar */}
      <ActiveTimerBar
        timer={activeTimer}
        onToggleTimer={toggleTimer}
        onStopTimer={stopTimer}
        onExpandTimer={() => setIsTimerModalOpen(true)}
        onCompleteTask={handleToggleComplete}
      />

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={tab => {
          if (tab === 'history') {
            setIsHistoryModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        pendingBacklogCount={pendingBacklogCount}
        notesCount={notes.length}
        activeTimer={activeTimer}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onOpenNewTask={handleOpenNewTask}
      />

      {/* Modals */}
      <TaskTimerModal
        timer={activeTimer}
        task={tasks.find(t => t.id === activeTimer?.taskId) || null}
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        onChangeMode={changeTimerMode}
        onAddMinutes={addTimerMinutes}
        onCompleteTask={handleToggleComplete}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))
        }
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        onSaveMultipleTasks={handleSaveMultipleTasks}
        initialTask={editingTask}
        defaultTier={defaultTierForNewTask}
        targetDateKey={currentDateKey}
        currentTierCounts={currentTierCounts}
      />

      <AutoUpdateModal
        isOpen={isAutoUpdateModalOpen}
        onClose={() => setIsAutoUpdateModalOpen(false)}
        settings={settings}
        onUpdateSettings={newS => {
          setSettings(newS);
          saveSettings(newS);
        }}
        onTriggerManualAutoUpdate={handleTriggerManualAutoUpdate}
        lastLog={lastLog}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyRecords={historyRecords}
        allTasks={tasks}
        onExportData={() => {
          setActiveTab('backup');
          setIsHistoryModalOpen(false);
        }}
        onImportData={() => {}}
      />

      {/* Interactive Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={currentDateKey}
        onSelectDate={dateKey => {
          setCurrentDateKey(dateKey);
          setActiveTab('today');
        }}
        tasks={tasks}
        historyRecords={historyRecords}
      />
    </div>
  );
}
