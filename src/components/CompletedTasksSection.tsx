import { Task } from '../types';
import TaskList from './TaskList';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function CompletedTasksSection({ tasks, onToggle, onEdit, onDelete }: Props) {
  if (tasks.length === 0) return null;

  return (
    <div className="task-section">
      <h3 className="task-section-title">Completed Tasks</h3>
      <TaskList tasks={tasks} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
