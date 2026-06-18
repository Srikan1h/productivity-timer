import { useState } from 'react';
import { Task, Priority } from '../types';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import CompletedTasksSection from './CompletedTasksSection';

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Finish Assignment",
    priority: "high",
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    completed: false
  },
  {
    id: "2",
    title: "Read Chapter 4",
    priority: "medium",
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    completed: false
  },
  {
    id: "3",
    title: "Workout",
    priority: "low",
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true
  }
];

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

  const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const pMap: Record<Priority, number> = { high: 1, medium: 2, low: 3 };
    return pMap[a.priority] - pMap[b.priority];
  });
  
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 w-full text-[var(--text)] mt-4 mb-8 px-4 sm:px-0">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold px-2">Tasks</h2>
        <AddTaskForm onAdd={addTask} />
      </div>

      {activeTasks.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider px-2">Active Tasks</h3>
          <TaskList tasks={activeTasks} onToggle={toggleTaskCompleted} />
        </div>
      )}

      <CompletedTasksSection tasks={completedTasks} onToggle={toggleTaskCompleted} />
    </div>
  );
}
