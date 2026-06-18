import { useState } from 'react';
import { Task } from '../types';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const priorityText = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-green-500',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPomodoros, setEditPomodoros] = useState(task.estimatedPomodoros);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, {
      title: editTitle.trim(),
      estimatedPomodoros: Math.max(task.completedPomodoros, editPomodoros)
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPomodoros(task.estimatedPomodoros);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border border-[var(--accent-strong)] bg-[var(--surface-soft)] transition-colors duration-200`}>
        <div className="flex flex-col flex-1 gap-3">
          <input 
            type="text" 
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--line)] focus:border-[var(--accent-strong)] outline-none text-base text-[var(--text)] font-medium pb-1"
            autoFocus
          />
          <div className="flex items-center gap-2 bg-[var(--surface)] w-max rounded-lg px-2 py-1 border border-[var(--line)]">
            <span className="text-xs text-[var(--text)]">🍅 Est.</span>
            <input 
              type="number" 
              min={Math.max(1, task.completedPomodoros)}
              max="10" 
              value={editPomodoros} 
              onChange={(e) => setEditPomodoros(parseInt(e.target.value) || 1)}
              className="bg-transparent w-10 border-none outline-none text-sm text-[var(--text)] text-center font-medium font-variant-numeric:tabular-nums"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button onClick={handleSave} className="p-2 rounded-lg text-green-500 bg-green-500/10 hover:bg-green-500/20 transition-colors" title="Save">
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button onClick={handleCancel} className="p-2 rounded-lg text-[var(--text)] bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--muted)] transition-colors" title="Cancel">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] hover:bg-[var(--surface-hover)] transition-colors duration-200 group ${task.completed ? 'opacity-60' : ''}`}>
      <button 
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 border-[var(--muted)] flex items-center justify-center hover:border-[var(--accent-strong)] transition-colors"
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate ${task.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-200">
              <button onClick={() => setIsEditing(true)} className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors" title="Edit task">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors" title="Delete task">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--muted)]">
          <span className="text-lg leading-none">🍅</span>
          <span className="font-medium mr-2">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
          <div className="flex gap-1 items-center ml-1 tracking-widest text-xs text-[var(--muted)] flex-wrap">
            {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
              <span key={i} className={i < task.completedPomodoros ? priorityText[task.priority] : ''}>
                {i < task.completedPomodoros ? '●' : '○'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
