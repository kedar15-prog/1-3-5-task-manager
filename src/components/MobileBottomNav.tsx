import React from 'react';
import { ListTodo, Archive, FileText, Smartphone, Plus } from 'lucide-react';
import { ActiveTimer } from '../types/todo';

interface MobileBottomNavProps {
  activeTab: 'today' | 'backlog' | 'notes' | 'history' | 'backup';
  setActiveTab: (tab: 'today' | 'backlog' | 'notes' | 'history' | 'backup') => void;
  pendingBacklogCount: number;
  notesCount?: number;
  activeTimer: ActiveTimer | null;
  onOpenTimerModal: () => void;
  onOpenNewTask: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingBacklogCount,
  notesCount = 0,
  activeTimer,
  onOpenTimerModal,
  onOpenNewTask,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Today's 1-3-5 */}
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-colors ${
            activeTab === 'today'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Today's 1-3-5 Tasks"
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Today</span>
        </button>

        {/* Tab 2: Master Backlog */}
        <button
          onClick={() => setActiveTab('backlog')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 relative transition-colors ${
            activeTab === 'backlog'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Master Backlog"
        >
          <div className="relative">
            <Archive className="w-5 h-5" />
            {pendingBacklogCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono tabular-nums">
                {pendingBacklogCount > 99 ? '99+' : pendingBacklogCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Backlog</span>
        </button>

        {/* Center Thumb Action: Quick Add Task */}
        <button
          onClick={onOpenNewTask}
          className="flex flex-col items-center justify-center h-full min-h-[44px] py-1 text-slate-700 hover:text-indigo-600"
          aria-label="Add Task"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-semibold text-slate-600 mt-0.5">Add</span>
        </button>

        {/* Tab 4: Notes List */}
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 relative transition-colors ${
            activeTab === 'notes'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Notes List"
        >
          <div className="relative">
            <FileText className="w-5 h-5" />
            {notesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono tabular-nums">
                {notesCount > 99 ? '99+' : notesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Notes</span>
        </button>

        {/* Tab 5: Backup & APK */}
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-colors ${
            activeTab === 'backup'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Local Device Backup and APK"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Backup/APK</span>
        </button>
      </div>
    </nav>
  );
};
