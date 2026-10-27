import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckSquare, 
  ArrowRight, 
  Tag, 
  FileText, 
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { Note, TaskTier } from '../types/todo';
import { formatDayTitle, getTodayKey } from '../utils/dates';

interface NotesViewProps {
  notes: Note[];
  currentDateKey: string;
  onSaveNote: (note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePinNote: (id: string) => void;
  onConvertNoteToTask: (title: string, tier: TaskTier) => void;
  onOpenCalendar: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  currentDateKey,
  onSaveNote,
  onDeleteNote,
  onTogglePinNote,
  onConvertNoteToTask,
  onOpenCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'pinned'>('all');
  
  // Note editor state
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorColor, setEditorColor] = useState<Note['color']>('indigo');
  const [editorAttachDate, setEditorAttachDate] = useState(true);
  const [editorTags, setEditorTags] = useState('');

  // Convert note line to task popover
  const [convertingNoteId, setConvertingNoteId] = useState<string | null>(null);
  const [selectedConvertTier, setSelectedConvertTier] = useState<TaskTier>('medium');

  const todayKey = getTodayKey();

  const handleStartCreate = () => {
    setEditingNoteId(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorColor('indigo');
    setEditorAttachDate(true);
    setEditorTags('');
    setIsCreating(true);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorColor(note.color);
    setEditorAttachDate(!!note.date);
    setEditorTags(note.tags ? note.tags.join(', ') : '');
    setIsCreating(true);
  };

  const handleCancelEditor = () => {
    setIsCreating(false);
    setEditingNoteId(null);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim() && !editorContent.trim()) return;

    const tags = editorTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const notePayload: Partial<Note> = {
      id: editingNoteId || undefined,
      title: editorTitle.trim() || 'Untitled Note',
      content: editorContent.trim(),
      color: editorColor,
      date: editorAttachDate ? currentDateKey : null,
      tags,
    };

    onSaveNote(notePayload);
    setIsCreating(false);
    setEditingNoteId(null);
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        if (filterMode === 'today' && note.date !== currentDateKey) return false;
        if (filterMode === 'pinned' && !note.isPinned) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchTag = note.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes always first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [notes, filterMode, searchQuery, currentDateKey]);

  const colorStyles: Record<Note['color'], { bg: string; border: string; text: string; ring: string }> = {
    indigo: { bg: 'bg-indigo-50/50', border: 'border-indigo-200/90', text: 'text-indigo-950', ring: 'ring-indigo-400' },
    amber: { bg: 'bg-amber-50/50', border: 'border-amber-200/90', text: 'text-amber-950', ring: 'ring-amber-400' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-200/90', text: 'text-emerald-950', ring: 'ring-emerald-400' },
    rose: { bg: 'bg-rose-50/50', border: 'border-rose-200/90', text: 'text-rose-950', ring: 'ring-rose-400' },
    slate: { bg: 'bg-slate-50/80', border: 'border-slate-200', text: 'text-slate-900', ring: 'ring-slate-400' },
  };

  return (
    <div className="space-y-6">
      {/* Top Notes Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Notes List &amp; Daily Scratchpad</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jot quick thoughts, meeting notes, or ideas. Easily convert any note into a 1-3-5 task!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCalendar}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px]"
              title="Open Calendar to jump to another date"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{formatDayTitle(currentDateKey)}</span>
            </button>

            <button
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            {(['all', 'today', 'pinned'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  filterMode === mode
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'All Notes' : mode === 'today' ? "Today's Notes" : 'Pinned'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Create / Edit Note Drawer */}
      {isCreating && (
        <form
          onSubmit={handleSaveEditor}
          className="bg-white rounded-2xl border-2 border-indigo-300 p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {editingNoteId ? 'Edit Note' : 'Create New Note'}
            </h3>
            <button
              type="button"
              onClick={handleCancelEditor}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <input
              type="text"
              autoFocus
              placeholder="Note Title (e.g. Sprint Highlights or Morning Reflection)..."
              value={editorTitle}
              onChange={e => setEditorTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <textarea
              rows={4}
              placeholder="Write your note here... (Tip: type bullets with • or numbered lists)"
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Color Palette Selection */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Color:</span>
              <div className="flex items-center gap-1.5">
                {(['indigo', 'amber', 'emerald', 'rose', 'slate'] as Note['color'][]).map(c => {
                  const bgDots: Record<Note['color'], string> = {
                    indigo: 'bg-indigo-500',
                    amber: 'bg-amber-500',
                    emerald: 'bg-emerald-500',
                    rose: 'bg-rose-500',
                    slate: 'bg-slate-400',
                  };
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditorColor(c)}
                      className={`w-5 h-5 rounded-full ${bgDots[c]} transition-all ${
                        editorColor === c ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Date association toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={editorAttachDate}
                onChange={e => setEditorAttachDate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>Attach to current date ({currentDateKey})</span>
            </label>

            {/* Tags input */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Tags (e.g. Work, Ideas)"
                value={editorTags}
                onChange={e => setEditorTags(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelEditor}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {editingNoteId ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No notes found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || filterMode !== 'all'
                ? 'Try clearing your active search or filters.'
                : 'Create your first note to keep meeting memos, scratchpads, and daily thoughts organized.'}
            </p>
            <button
              onClick={handleStartCreate}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note</span>
            </button>
          </div>
        ) : (
          filteredNotes.map(note => {
            const style = colorStyles[note.color] || colorStyles.slate;
            const isConverting = convertingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between ${style.bg} ${style.border}`}
              >
                <div>
                  {/* Top Note Row: Title & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold ${style.text} leading-snug break-words`}>
                      {note.title}
                    </h3>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onTogglePinNote(note.id)}
                        className={`p-1 rounded hover:bg-black/5 transition-colors ${
                          note.isPinned ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-black/5 transition-colors"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <div className="mt-2.5 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans break-words">
                    {note.content}
                  </div>
                </div>

                {/* Bottom Metadata & Convert to Task */}
                <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {note.date ? (
                      <span className="flex items-center gap-1 font-medium text-indigo-700">
                        <Calendar className="w-3 h-3" />
                        {note.date === todayKey ? 'Today' : note.date}
                      </span>
                    ) : (
                      <span>General Note</span>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{note.tags.join(', ')}</span>
                      </>
                    )}
                  </div>

                  {/* Convert to 1-3-5 Task Trigger */}
                  <div className="relative">
                    {isConverting ? (
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg shadow-sm border border-slate-200">
                        <select
                          value={selectedConvertTier}
                          onChange={e => setSelectedConvertTier(e.target.value as TaskTier)}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded border border-slate-200 bg-white"
                        >
                          <option value="major">1 Major</option>
                          <option value="medium">3 Medium</option>
                          <option value="small">5 Small</option>
                        </select>
                        <button
                          onClick={() => {
                            onConvertNoteToTask(note.title, selectedConvertTier);
                            setConvertingNoteId(null);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setConvertingNoteId(null)}
                          className="p-0.5 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConvertingNoteId(note.id)}
                        className="px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100/60 rounded-md transition-colors flex items-center gap-1"
                        title="Turn this note into a 1-3-5 daily task"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Turn into Task</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
