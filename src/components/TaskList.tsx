import { Task } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
