import type { GenerationTask } from "@/entities/generation-task";

export const MAX_CONCURRENT = 2;

export interface QueueState {
  tasks: GenerationTask[];
}

export type QueueAction =
  | { type: "SET_TASKS"; tasks: GenerationTask[] }
  | { type: "SCHEDULE_NEXT" }
  | { type: "TICK_TASK"; taskId: string; progressDelta: number; now?: number }
  | { type: "FAIL_TASK"; taskId: string; error: string }
  | { type: "CANCEL_TASK"; taskId: string }
  | { type: "RETRY_TASK"; taskId: string; now: number }
  | { type: "DELETE_TASK"; taskId: string }
  | { type: "CLEAR_DONE" };

const terminalStatuses = new Set<GenerationTask["status"]>(["done", "failed", "canceled"]);

function scheduleNext(tasks: GenerationTask[]): GenerationTask[] {
  const runningCount = tasks.filter((task) => task.status === "running").length;
  const freeSlots = Math.max(0, MAX_CONCURRENT - runningCount);
  if (freeSlots === 0) return tasks;

  const nextIds = new Set(
    tasks
      .filter((task) => task.status === "queued")
      .sort((first, second) => first.createdAt - second.createdAt)
      .slice(0, freeSlots)
      .map((task) => task.id),
  );

  return tasks.map((task) => (
    nextIds.has(task.id)
      ? { ...task, status: "running", error: undefined }
      : task
  ));
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "SET_TASKS":
      return { tasks: action.tasks };

    case "SCHEDULE_NEXT":
      return { tasks: scheduleNext(state.tasks) };

    case "TICK_TASK":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id !== action.taskId || task.status !== "running") return task;

          const progress = Math.min(100, task.progress + action.progressDelta);
          if (progress >= 100) {
            return {
              ...task,
              progress: 100,
              status: "done",
              completedAt: action.now ?? Date.now(),
            };
          }

          return { ...task, progress };
        }),
      };

    case "FAIL_TASK":
      return {
        tasks: state.tasks.map((task) => (
          task.id === action.taskId && task.status === "running"
            ? { ...task, status: "failed", error: action.error }
            : task
        )),
      };

    case "CANCEL_TASK":
      return {
        tasks: state.tasks.map((task) => (
          task.id === action.taskId && !terminalStatuses.has(task.status)
            ? { ...task, status: "canceled", error: "Отменено пользователем" }
            : task
        )),
      };

    case "RETRY_TASK":
      return {
        tasks: state.tasks.map((task) => (
          task.id === action.taskId && (task.status === "failed" || task.status === "canceled")
            ? {
                ...task,
                status: "queued",
                progress: 0,
                createdAt: action.now,
                completedAt: undefined,
                error: undefined,
              }
            : task
        )),
      };

    case "DELETE_TASK":
      return { tasks: state.tasks.filter((task) => task.id !== action.taskId) };

    case "CLEAR_DONE":
      return { tasks: state.tasks.filter((task) => task.status !== "done") };

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
