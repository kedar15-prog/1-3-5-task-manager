import React from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload, 
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import { DayHistoryRecord, Task } from '../types/todo';
import { formatFullDate, formatDurationHuman, getTodayKey } from '../utils/dates';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: Record<string, DayHistoryRecord>;
  allTasks: Task[];
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyRecords,
  allTasks,
  onExportData,
  onImportData,
}) => {
  if (!isOpen) return null;

  const today = getTodayKey();
  const sortedDates = Object.keys(historyRecords).sort().reverse();

  // Calculate total focus time across all history
  const totalFocusSecondsAllTime = Object.values(historyRecords).reduce(
    (acc, r) => acc + (r.totalFocusSeconds || 0),
    0
  );

  const totalCompletedAllTime = Object.values(historyRecords).reduce(
    (acc, r) => acc + (r.completedTasks || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Daily 1-3-5 Performance &amp; History
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top All-Time Stats */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Total Focus Time</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-indigo-600">
              {formatDurationHuman(totalFocusSecondsAllTime)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Total Tasks Completed</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-emerald-600">
              {totalCompletedAllTime}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-500 block">Active Days Tracked</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-900">
              {sortedDates.length} days
            </span>
          </div>
        </div>

        {/* Content: Days List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {sortedDates.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No completed day records yet. Keep checking off today's 1-3-5 tasks to build your record!</span>
            </div>
          ) : (
            sortedDates.map(dateKey => {
              const record = historyRecords[dateKey];
              const isTodayDate = dateKey === today;

              return (
                <div
                  key={dateKey}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {formatFullDate(dateKey)}
                      </span>
                      {isTodayDate && (
                        <span className="text-indigo-600 font-medium">· Today</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-emerald-700 font-semibold">
                        {record.completedTasks} / {record.totalTasks || 9} done
                      </span>
                      <span aria-hidden="true" className="text-slate-200">·</span>
                      <span className="text-slate-600">
                        {formatDurationHuman(record.totalFocusSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Linear mini progress */}
                  <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1 rounded-full"
                      style={{
                        width: `${record.totalTasks > 0 ? (record.completedTasks / record.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Export / Backup utilities */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportData}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
