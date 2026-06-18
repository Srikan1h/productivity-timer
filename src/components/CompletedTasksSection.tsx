import { Task } from '../types';
import TaskList from './TaskList';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export default function CompletedTasksSection({ tasks, onToggle }: Props) {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-6">
      <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider px-2">Completed Tasks</h3>
      <TaskList tasks={tasks} onToggle={onToggle} />
    </div>
  );
}
