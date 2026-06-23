import type { GenerationTask, GenType, TaskStatus } from "@/entities/generation-task";

export type StatusFilter = TaskStatus | "all";
export type TypeFilter = GenType | "all";
export type QueueSort = "newest" | "oldest";

export interface QueueFilters {
  status: StatusFilter;
  type: TypeFilter;
  sort: QueueSort;
  query: string;
}

export interface QueueStats {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export interface ActiveSummary {
  count: number;
  averageProgress: number;
  tasks: GenerationTask[];
}

export function getQueueStats(tasks: GenerationTask[]): QueueStats {
  return tasks.reduce<QueueStats>(
    (stats, task) => {
      switch (task.status) {
        case "queued":
          return { ...stats, queued: stats.queued + 1 };
        case "running":
          return { ...stats, running: stats.running + 1 };
        case "done":
          return { ...stats, done: stats.done + 1 };
        case "failed":
          return { ...stats, failed: stats.failed + 1 };
        case "canceled":
          return stats;
        default: {
          const exhaustiveCheck: never = task.status;
          return exhaustiveCheck;
        }
      }
    },
    { queued: 0, running: 0, done: 0, failed: 0 },
  );
}

export function getActiveSummary(tasks: GenerationTask[]): ActiveSummary {
  const activeTasks = tasks
    .filter((task) => task.status === "running" || task.status === "queued")
    .sort((first, second) => first.createdAt - second.createdAt);

  const progressSum = activeTasks.reduce((sum, task) => sum + task.progress, 0);

  return {
    count: activeTasks.length,
    averageProgress: activeTasks.length > 0 ? Math.round(progressSum / activeTasks.length) : 0,
    tasks: activeTasks,
  };
}

export function selectVisibleTasks(tasks: GenerationTask[], filters: QueueFilters): GenerationTask[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return tasks
    .filter((task) => filters.status === "all" || task.status === filters.status)
    .filter((task) => filters.type === "all" || task.type === filters.type)
    .filter((task) => (
      normalizedQuery.length === 0
      || task.prompt.toLowerCase().includes(normalizedQuery)
      || task.model.toLowerCase().includes(normalizedQuery)
    ))
    .sort((first, second) => (
      filters.sort === "newest"
        ? second.createdAt - first.createdAt
        : first.createdAt - second.createdAt
    ));
}
