import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Priority } from '../types';

interface Props {
  onAdd: (title: string, priority: Priority, estimatedPomodoros: number) => void;
}

export default function AddTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !priority) return;
    onAdd(title.trim(), priority as Priority, pomodoros);
    setTitle('');
    setPriority('');
    setPomodoros(1);
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        placeholder="What are you working on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="add-task-input"
      />
      <div className="add-task-divider" />
      <div className="add-task-controls">
        <div className="add-task-left-controls">
          <div className="add-task-select-wrapper">
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="add-task-select"
            >
              <option value="" disabled hidden>Choose Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <ChevronDown className="add-task-select-icon" size={16} strokeWidth={2.5} />
          </div>
          <div className="add-task-pomodoros">
            <span>🍅 Est.</span>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={pomodoros} 
              onChange={(e) => setPomodoros(parseInt(e.target.value) || 1)}
            />
            <div className="pomodoro-spin-controls">
              <button type="button" onClick={() => setPomodoros(Math.min(10, pomodoros + 1))} className="pomodoro-spin-btn" aria-label="Increase pomodoros"><ChevronUp size={12} strokeWidth={3} /></button>
              <button type="button" onClick={() => setPomodoros(Math.max(1, pomodoros - 1))} className="pomodoro-spin-btn" aria-label="Decrease pomodoros"><ChevronDown size={12} strokeWidth={3} /></button>
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!title.trim() || !priority}
          className="add-task-submit"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
