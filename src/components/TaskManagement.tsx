import { useState, useRef, useEffect } from 'react';
import { Task, Priority } from '../types';
import { MoreVertical, Trash2, CheckCircle } from 'lucide-react';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import CompletedTasksSection from './CompletedTasksSection';

function TaskMenu({ onClearAll, onClearCompleted }: { onClearAll: () => void, onClearCompleted: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors"
        aria-label="Task options"
      >
        <MoreVertical size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] shadow-lg overflow-hidden z-10 py-1">
          <button 
            onClick={() => { onClearCompleted(); setIsOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors text-left"
          >
            <CheckCircle size={16} className="text-[var(--muted)]" />
            Delete finished tasks
          </button>
          <button 
            onClick={() => { onClearAll(); setIsOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-[var(--surface-hover)] transition-colors text-left"
          >
            <Trash2 size={16} />
            Clear all tasks
          </button>
        </div>
      )}
    </div>
  );
}

const initialTasks: Task[] = [];

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (title: string, priority: Priority, estimatedPomodoros: number) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      priority,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const pMap: Record<Priority, number> = { high: 1, medium: 2, low: 3 };
    return pMap[a.priority] - pMap[b.priority];
  });
  
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 w-full text-[var(--text)] mt-4 mb-8 px-4 sm:px-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <TaskMenu onClearAll={clearAllTasks} onClearCompleted={clearCompletedTasks} />
        </div>
        <AddTaskForm onAdd={addTask} />
      </div>

      {activeTasks.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider px-2">Active Tasks</h3>
          <TaskList tasks={activeTasks} onToggle={toggleTaskCompleted} onEdit={editTask} onDelete={deleteTask} />
        </div>
      )}

      <CompletedTasksSection tasks={completedTasks} onToggle={toggleTaskCompleted} onEdit={editTask} onDelete={deleteTask} />
    </div>
  );
}
