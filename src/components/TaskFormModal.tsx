import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ListPlus, 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowDown, 
  Layers, 
  ClipboardList 
} from 'lucide-react';
import { Task, TaskPriority, TaskTier, TIER_LIMITS } from '../types/todo';
import { getTodayKey } from '../utils/dates';

interface ListItemDraft {
  id: string;
  title: string;
  tier: TaskTier;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  onSaveMultipleTasks?: (tasksData: Partial<Task>[]) => void;
  initialTask?: Task | null;
  defaultTier?: TaskTier;
  targetDateKey?: string;
  currentTierCounts?: Record<TaskTier, number>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onSaveMultipleTasks,
  initialTask,
  defaultTier = 'medium',
  targetDateKey,
  currentTierCounts,
}) => {
  // Mode: list format (default for new tasks) vs single detailed task (when editing)
  const [creationMode, setCreationMode] = useState<'list' | 'single'>(
    initialTask ? 'single' : 'list'
  );

  // List format state
  const [listInputText, setListInputText] = useState('');
  const [listItems, setListItems] = useState<ListItemDraft[]>([]);
  const [quickInput, setQuickInput] = useState('');
  const [listPlacement, setListPlacement] = useState<'today' | 'backlog'>('today');
  const [listDefaultTier, setListDefaultTier] = useState<TaskTier | 'auto'>('auto');

  // Single task state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<TaskTier>(defaultTier);
  const [placement, setPlacement] = useState<'today' | 'backlog'>('today');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tagInput, setTagInput] = useState('');

  // Reset or initialize state
  useEffect(() => {
    if (initialTask) {
      setCreationMode('single');
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setTier(initialTask.tier);
      setPlacement(initialTask.inDailyList ? 'today' : 'backlog');
      setEstimatedMinutes(initialTask.estimatedMinutes || 30);
      setPriority(initialTask.priority || 'medium');
      setTagInput(initialTask.tags ? initialTask.tags.join(', ') : '');
    } else {
      setCreationMode('list');
      setTitle('');
      setDescription('');
      setTier(defaultTier);
      setPlacement('today');
      setEstimatedMinutes(defaultTier === 'major' ? 60 : defaultTier === 'medium' ? 30 : 15);
      setPriority('medium');
      setTagInput('');
      setListInputText('');
      setQuickInput('');
      setListPlacement('today');
      setListDefaultTier('auto');

      // Prepopulate an empty starter list item
      setListItems([
        { id: 'item-1', title: '', tier: defaultTier },
      ]);
    }
  }, [initialTask, defaultTier, isOpen]);

  if (!isOpen) return null;

  // Auto-distribute helper according to 1-3-5 rule
  const calculateTierForIndex = (index: number, fallbackTier: TaskTier | 'auto'): TaskTier => {
    if (fallbackTier !== 'auto') return fallbackTier;
    if (index === 0) return 'major';
    if (index >= 1 && index <= 3) return 'medium';
    return 'small';
  };

  // Add a line item in interactive list
  const handleAddListItem = () => {
    const nextIndex = listItems.length;
    const assignedTier = calculateTierForIndex(nextIndex, listDefaultTier);
    setListItems([
      ...listItems,
      { id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, title: '', tier: assignedTier },
    ]);
  };

  const handleUpdateListItem = (id: string, updates: Partial<ListItemDraft>) => {
    setListItems(items =>
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveListItem = (id: string) => {
    if (listItems.length <= 1) {
      setListItems([{ id: `item-${Date.now()}`, title: '', tier: defaultTier }]);
    } else {
      setListItems(items => items.filter(item => item.id !== id));
    }
  };

  // Parse bulk paste into list format
  const handleParseBulkText = () => {
    const lines = listInputText
      .split('\n')
      .map(l => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    const parsed: ListItemDraft[] = lines.map((line, idx) => ({
      id: `parsed-${Date.now()}-${idx}`,
      title: line,
      tier: calculateTierForIndex(idx, listDefaultTier),
    }));

    setListItems(parsed);
    setListInputText('');
  };

  // Submit list format
  const handleSubmitList = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = listItems.filter(item => item.title.trim().length > 0);

    if (validItems.length === 0 && listInputText.trim().length > 0) {
      // Auto-parse textarea if user typed directly there
      const lines = listInputText
        .split('\n')
        .map(l => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
        .filter(l => l.length > 0);

      lines.forEach((line, idx) => {
        validItems.push({
          id: `item-${Date.now()}-${idx}`,
          title: line,
          tier: calculateTierForIndex(idx, listDefaultTier),
        });
      });
    }

    if (validItems.length === 0) return;

    const tasksToCreate: Partial<Task>[] = validItems.map(item => ({
      title: item.title.trim(),
      tier: item.tier,
      inDailyList: listPlacement === 'today',
      date: listPlacement === 'today' ? (targetDateKey || getTodayKey()) : null,
      estimatedMinutes: item.tier === 'major' ? 60 : item.tier === 'medium' ? 30 : 15,
      priority: item.tier === 'major' ? 'high' : item.tier === 'medium' ? 'medium' : 'low',
      tags: [],
    }));

    if (onSaveMultipleTasks) {
      onSaveMultipleTasks(tasksToCreate);
    } else {
      tasksToCreate.forEach(t => onSaveTask(t));
    }

    onClose();
  };

  // Submit single task
  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      tier,
      inDailyList: placement === 'today',
      date: placement === 'today' ? (targetDateKey || getTodayKey()) : null,
      estimatedMinutes: Number(estimatedMinutes) || 15,
      priority,
      tags,
    };

    onSaveTask(taskData);
    onClose();
  };

  const filledCount = listItems.filter(i => i.title.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Mode Switch */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-base font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'Add Tasks'}
            </h3>
          </div>

          {!initialTask && (
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setCreationMode('list')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  creationMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>List Format</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('single')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  creationMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Single Detailed</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LIST FORMAT MODE (The requested primary format) */}
        {creationMode === 'list' ? (
          <form onSubmit={handleSubmitList} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Guidance / Rule Bar */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-2 text-xs text-indigo-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>1-3-5 List Mode:</strong> Rapidly type or paste tasks. Items auto-assign to <strong>1 Major</strong>, <strong>3 Medium</strong>, and <strong>5 Small</strong>!
                  </span>
                </div>
              </div>

              {/* Destination selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">Destination:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="listPlacement"
                      value="today"
                      checked={listPlacement === 'today'}
                      onChange={() => setListPlacement('today')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Today's 1-3-5 Board</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="listPlacement"
                      value="backlog"
                      checked={listPlacement === 'backlog'}
                      onChange={() => setListPlacement('backlog')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Master Backlog</span>
                  </label>
                </div>

                {/* Tier distribution rule */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Auto-Tiering:</span>
                  <select
                    value={listDefaultTier}
                    onChange={e => {
                      const val = e.target.value as TaskTier | 'auto';
                      setListDefaultTier(val);
                      // Update current items
                      setListItems(items =>
                        items.map((item, idx) => ({
                          ...item,
                          tier: calculateTierForIndex(idx, val),
                        }))
                      );
                    }}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="auto">1-3-5 Rule (1 Major, 3 Med, 5 Small)</option>
                    <option value="major">All as Major (1)</option>
                    <option value="medium">All as Medium (3)</option>
                    <option value="small">All as Small (5)</option>
                  </select>
                </div>
              </div>

              {/* Interactive Checklist Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                  <span>Task List Items ({filledCount} ready)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Press Enter to add next line</span>
                </div>

                <div className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {listItems.map((item, idx) => {
                    const tierLabels: Record<TaskTier, { name: string; style: string }> = {
                      major: { name: '1 Major', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                      medium: { name: '3 Medium', style: 'bg-amber-50 text-amber-800 border-amber-200' },
                      small: { name: '5 Small', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    };

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white shadow-xs focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 transition-all"
                      >
                        {/* Number Index */}
                        <span className="w-5 text-center text-xs font-mono tabular-nums font-semibold text-slate-400 select-none">
                          {idx + 1}.
                        </span>

                        {/* Title Input */}
                        <input
                          type="text"
                          autoFocus={idx === listItems.length - 1}
                          placeholder={
                            idx === 0
                              ? 'e.g. Finalize Q4 Strategic Roadmap (1 Major)'
                              : idx <= 3
                              ? 'e.g. Review and merge pull request (3 Medium)'
                              : 'e.g. Quick email response or admin task (5 Small)'
                          }
                          value={item.title}
                          onChange={e => handleUpdateListItem(item.id, { title: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddListItem();
                            }
                          }}
                          className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                        />

                        {/* Tier Selector Toggle */}
                        <div className="flex items-center shrink-0">
                          {(['major', 'medium', 'small'] as TaskTier[]).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleUpdateListItem(item.id, { tier: t })}
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors uppercase ${
                                item.tier === t
                                  ? tierLabels[t].style + ' border'
                                  : 'text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {t === 'major' ? 'Maj' : t === 'medium' ? 'Med' : 'Sml'}
                            </button>
                          ))}
                        </div>

                        {/* Delete line */}
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Row Button */}
                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-indigo-400 text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-indigo-50/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Item to List</span>
                </button>
              </div>

              {/* Collapsible Quick Bulk Paste Box */}
              <div className="pt-2 border-t border-slate-100">
                <details className="group text-xs">
                  <summary className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center justify-between py-1">
                    <span>Or paste a raw checklist (from Notes, Slack, Email)</span>
                    <span className="text-[11px] text-indigo-600 group-open:hidden">+ Open Paste Box</span>
                  </summary>
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Paste tasks here (one per line):&#10;Prepare executive slides&#10;Write release summary&#10;Schedule design review&#10;Fix header typo"
                      value={listInputText}
                      onChange={e => setListInputText(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleParseBulkText}
                      disabled={!listInputText.trim()}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Convert Text Lines into Tasks</span>
                    </button>
                  </div>
                </details>
              </div>
            </div>

            {/* List Footer */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {filledCount} task{filledCount === 1 ? '' : 's'} will be added
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={filledCount === 0 && !listInputText.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Add {filledCount > 0 ? `${filledCount} Tasks` : 'Tasks'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* SINGLE TASK MODE (Detail view) */
          <form onSubmit={handleSubmitSingle} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g., Finalize executive roadmap presentation"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes or Context (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key deliverables, sub-points, or links..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 1-3-5 Tier Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1-3-5 Tier Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTier('major')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tier === 'major'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-indigo-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">1 Major</div>
                  <div className="text-[11px] text-slate-500">Highest impact</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('medium')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tier === 'medium'
                      ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600 text-amber-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">3 Medium</div>
                  <div className="text-[11px] text-slate-500">Core milestone</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('small')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tier === 'small'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">5 Small</div>
                  <div className="text-[11px] text-slate-500">Quick wins</div>
                </button>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination
              </label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="radio"
                    name="placement"
                    value="today"
                    checked={placement === 'today'}
                    onChange={() => setPlacement('today')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Assign to Today's 1-3-5 List</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="radio"
                    name="placement"
                    value="backlog"
                    checked={placement === 'backlog'}
                    onChange={() => setPlacement('backlog')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Save to Master Backlog</span>
                </label>
              </div>
            </div>

            {/* Priority & Estimated Focus */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Focus (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g., Strategy, Dev, Client, Admin"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                {initialTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
