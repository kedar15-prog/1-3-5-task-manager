import React from 'react';
import { Plus, History, ListTodo, Sparkles, Smartphone, Download, FileText, Calendar } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: 'today' | 'backlog' | 'notes' | 'history' | 'backup';
  setActiveTab: (tab: 'today' | 'backlog' | 'notes' | 'history' | 'backup') => void;
  onOpenNewTask: () => void;
  onOpenAutoUpdateSettings: () => void;
  onOpenCalendar: () => void;
  pendingBacklogCount: number;
  notesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenAutoUpdateSettings,
  onOpenCalendar,
  pendingBacklogCount,
  notesCount = 0,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand title, single line */}
        <div 
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm">
            1·3·5
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Focus Daily
          </span>
        </div>

        {/* Zone 2: Navigation Links (hidden on small mobile, bottom nav used instead) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === 'today'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Today's 1·3·5</span>
          </button>

          <button
            onClick={() => setActiveTab('backlog')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === 'backlog'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Master Backlog</span>
            {pendingBacklogCount > 0 && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                ({pendingBacklogCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === 'notes'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes List</span>
            {notesCount > 0 && (
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                ({notesCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === 'history'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Daily History</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === 'backup'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Backup &amp; APK</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Calendar Picker + PWA Install + Auto-update + Add Task) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Calendar Icon Button */}
          <button
            onClick={onOpenCalendar}
            title="Open Calendar to jump to any date"
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium min-h-[36px]"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="hidden lg:inline">Calendar</span>
          </button>

          {/* PWA Install Button when available */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors flex items-center gap-1.5 min-h-[36px]"
              title="Install App as Native WebAPK"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          <button
            onClick={onOpenAutoUpdateSettings}
            title="Configure Daily Auto-Update"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium min-h-[36px]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="hidden xl:inline">Auto-Update</span>
          </button>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
