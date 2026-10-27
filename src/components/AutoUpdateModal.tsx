import React from 'react';
import { 
  X, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  Sliders, 
  Clock, 
  HelpCircle,
  Archive,
  ArrowRight
} from 'lucide-react';
import { AutoUpdateLog, AutoUpdateSettings } from '../types/todo';

interface AutoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutoUpdateSettings;
  onUpdateSettings: (newSettings: AutoUpdateSettings) => void;
  onTriggerManualAutoUpdate: () => void;
  lastLog: AutoUpdateLog | null;
}

export const AutoUpdateModal: React.FC<AutoUpdateModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerManualAutoUpdate,
  lastLog,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Daily Auto-Update Engine
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <h4 className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <span>How Auto-Update Works Daily</span>
            </h4>
            <p className="text-indigo-900/80 leading-relaxed">
              Every day at midnight (or upon first opening the app), the engine prepares your 1-3-5 board automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-indigo-900/80 pl-1">
              <li>
                <strong className="text-indigo-950 font-medium">Unfinished Rollover:</strong> Incomplete tasks from yesterday stay in today's slots so you never lose context.
              </li>
              <li>
                <strong className="text-indigo-950 font-medium">Auto-Replenish:</strong> Empty slots (1 Major, 3 Medium, 5 Small) are automatically filled from your Master Backlog.
              </li>
            </ul>
          </div>

          {/* Configurable Rules */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Automated Rollover Rules
            </h4>

            {/* Rule 1: Rollover Unfinished */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.autoRolloverUnfinished}
                onChange={e =>
                  onUpdateSettings({ ...settings, autoRolloverUnfinished: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-900 block">
                  Rollover Incomplete Tasks
                </span>
                <span className="text-slate-500 mt-0.5 block">
                  Automatically move unfinished tasks from past days into today's 1-3-5 slots.
                </span>
              </div>
            </label>

            {/* Rule 2: Auto-Fill from Master Backlog */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.autoFillFromBacklog}
                onChange={e =>
                  onUpdateSettings({ ...settings, autoFillFromBacklog: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-900 block">
                  Auto-Replenish Empty Slots from Master Backlog
                </span>
                <span className="text-slate-500 mt-0.5 block">
                  If today's Major, Medium, or Small slots have open capacity, pull tasks from your backlog.
                </span>
              </div>
            </label>

            {/* Strategy Selection */}
            {settings.autoFillFromBacklog && (
              <div className="pl-7 pt-1 space-y-2">
                <span className="text-xs font-medium text-slate-700">
                  Replenish Backlog Priority:
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="strategy"
                      value="priority"
                      checked={settings.replenishStrategy === 'priority'}
                      onChange={() =>
                        onUpdateSettings({ ...settings, replenishStrategy: 'priority' })
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>High Priority First</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="strategy"
                      value="oldest"
                      checked={settings.replenishStrategy === 'oldest'}
                      onChange={() =>
                        onUpdateSettings({ ...settings, replenishStrategy: 'oldest' })
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Oldest First (FIFO)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Manual Run Action */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Want to auto-fill today's board right now?
            </div>
            <button
              onClick={() => {
                onTriggerManualAutoUpdate();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Run Auto-Update Now</span>
            </button>
          </div>

          {/* Last Run Summary / Log */}
          {lastLog && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>Recent Auto-Update Summary</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {lastLog.date} at {lastLog.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <span>
                  Rolled over: <strong className="text-slate-900">{lastLog.rolledOverCount}</strong>
                </span>
                <span>
                  Backlog pulled: <strong className="text-slate-900">{lastLog.backlogFilledCount}</strong>
                </span>
              </div>
              {lastLog.details && lastLog.details.length > 0 && (
                <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                  {lastLog.details.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-indigo-500">·</span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
