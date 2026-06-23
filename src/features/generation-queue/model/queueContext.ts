import { createContext } from "react";
import type { GenerationTask } from "@/entities/generation-task";
import type {
  ActiveSummary,
  QueueFilters,
  QueueSort,
  QueueStats,
  StatusFilter,
  TypeFilter,
} from "./selectors";

export interface QueueContextValue {
  tasks: GenerationTask[];
  visibleTasks: GenerationTask[];
  filters: QueueFilters;
  stats: QueueStats;
  activeSummary: ActiveSummary;
  isLoading: boolean;
  loadError: string | null;
  setStatusFilter: (status: StatusFilter) => void;
  setTypeFilter: (type: TypeFilter) => void;
  setSort: (sort: QueueSort) => void;
  setQuery: (query: string) => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearDone: () => void;
  retryLoad: () => void;
}

export const QueueContext = createContext<QueueContextValue | null>(null);
