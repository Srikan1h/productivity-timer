export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
};
