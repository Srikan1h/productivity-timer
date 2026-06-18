import { useState } from 'react';
import { Priority } from '../types';

interface Props {
  onAdd: (title: string, priority: Priority, estimatedPomodoros: number) => void;
}

export default function AddTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), priority, pomodoros);
    setTitle('');
    setPriority('medium');
    setPomodoros(1);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] shadow-sm hover:border-[var(--muted)] transition-colors duration-200">
      <input
        type="text"
        placeholder="What are you working on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent border-none outline-none text-lg placeholder-[var(--muted)] text-[var(--text)] font-medium"
      />
      <div className="h-px w-full bg-[var(--line)]" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="bg-[var(--surface)] text-[var(--text)] text-sm rounded-xl px-3 py-2 border border-[var(--line)] outline-none focus:border-[var(--accent-strong)] hover:border-[var(--muted)] transition-colors appearance-none font-medium cursor-pointer"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <div className="flex items-center gap-2 bg-[var(--surface)] rounded-xl px-3 py-2 border border-[var(--line)] focus-within:border-[var(--accent-strong)] hover:border-[var(--muted)] transition-colors">
            <span className="text-sm text-[var(--text)]">🍅 Est.</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={pomodoros} 
              onChange={(e) => setPomodoros(parseInt(e.target.value) || 1)}
              className="bg-transparent w-10 border-none outline-none text-sm text-[var(--text)] text-center font-medium font-variant-numeric:tabular-nums"
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!title.trim()}
          className="bg-[var(--text)] text-[var(--app)] px-6 py-2 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-30 transition-all shadow-sm disabled:cursor-not-allowed"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
