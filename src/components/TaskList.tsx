import { Task } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  activeTaskId?: string | null;
  onSelectTask?: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete, activeTaskId, onSelectTask }: Props) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          isActive={activeTaskId === task.id}
          onSelect={onSelectTask}
        />
      ))}
    </div>
  );
}
