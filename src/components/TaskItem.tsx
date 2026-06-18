import { Task } from '../types';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
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

export default function TaskItem({ task, onToggle }: Props) {
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
      
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium ${task.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
            {task.title}
          </span>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--muted)]">
          <span className="text-lg leading-none">🍅</span>
          <span className="font-medium mr-2">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
          <div className="flex gap-1 items-center ml-1 tracking-widest text-xs text-[var(--muted)]">
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
