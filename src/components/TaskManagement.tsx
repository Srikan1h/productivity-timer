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
    <div className="task-menu" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="task-menu-btn"
        aria-label="Task options"
      >
        <MoreVertical size={20} />
      </button>
      
      {isOpen && (
        <div className="task-menu-dropdown">
          <button 
            onClick={() => { onClearCompleted(); setIsOpen(false); }}
            className="task-menu-item"
          >
            <CheckCircle size={16} className="icon" />
            Delete finished tasks
          </button>
          <button 
            onClick={() => { onClearAll(); setIsOpen(false); }}
            className="task-menu-item danger"
          >
            <Trash2 size={16} className="icon" />
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
    <div className="task-management">
      <div className="task-header">
        <div className="task-header-top">
          <h2 className="task-header-title">Tasks</h2>
          <TaskMenu onClearAll={clearAllTasks} onClearCompleted={clearCompletedTasks} />
        </div>
        <AddTaskForm onAdd={addTask} />
      </div>

      {activeTasks.length > 0 && (
        <div className="task-section">
          <h3 className="task-section-title">Active Tasks</h3>
          <TaskList tasks={activeTasks} onToggle={toggleTaskCompleted} onEdit={editTask} onDelete={deleteTask} />
        </div>
      )}

      <CompletedTasksSection tasks={completedTasks} onToggle={toggleTaskCompleted} onEdit={editTask} onDelete={deleteTask} />
    </div>
  );
}
