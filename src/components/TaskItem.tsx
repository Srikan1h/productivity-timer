import { useState } from 'react';
import { Task } from '../types';
import { Edit2, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

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
      <div className="task-item editing">
        <div className="task-edit-inputs">
          <input 
            type="text" 
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="task-edit-title-input"
            autoFocus
          />
          <div className="task-edit-pomodoros">
            <span>🍅 Est.</span>
            <input 
              type="number" 
              min={Math.max(1, task.completedPomodoros)}
              max="10" 
              value={editPomodoros} 
              onChange={(e) => setEditPomodoros(parseInt(e.target.value) || 1)}
            />
            <div className="pomodoro-spin-controls">
              <button type="button" onClick={() => setEditPomodoros(Math.min(10, editPomodoros + 1))} className="pomodoro-spin-btn" aria-label="Increase pomodoros"><ChevronUp size={12} strokeWidth={3} /></button>
              <button type="button" onClick={() => setEditPomodoros(Math.max(Math.max(1, task.completedPomodoros), editPomodoros - 1))} className="pomodoro-spin-btn" aria-label="Decrease pomodoros"><ChevronDown size={12} strokeWidth={3} /></button>
            </div>
          </div>
        </div>
        <div className="task-edit-buttons">
          <button onClick={handleSave} className="task-edit-btn save" title="Save">
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button onClick={handleCancel} className="task-edit-btn cancel" title="Cancel">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <button 
        onClick={() => onToggle(task.id)}
        className="task-item-checkbox"
      >
        {task.completed && (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="task-item-content">
        <div className="task-item-header">
          <span className="task-item-title">
            {task.title}
          </span>
          <div className="task-item-right">
            <span className={`task-priority-badge ${task.priority}`}>
              {task.priority}
            </span>
            <div className="task-item-actions">
              <button onClick={() => setIsEditing(true)} className="task-item-action-btn" title="Edit task">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(task.id)} className="task-item-action-btn danger" title="Delete task">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="task-item-footer">
          <span className="emoji">🍅</span>
          <span className="count">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
          <div className="task-pomodoro-dots">
            {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
              <span key={i} className={`pomodoro-dot ${i < task.completedPomodoros ? task.priority : 'empty'}`}>
                {i < task.completedPomodoros ? '●' : '○'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
