import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { generationTaskSeed } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { QueueContext } from "./queueContext";
import type { QueueContextValue } from "./queueContext";
import { createQueueEngine } from "./queueEngine";
import { queueReducer } from "./queueReducer";
import type { QueueAction, QueueState } from "./queueReducer";
import {
  getActiveSummary,
  getQueueStats,
  selectVisibleTasks,
} from "./selectors";
import type { QueueFilters, QueueSort, StatusFilter, TypeFilter } from "./selectors";

const STORAGE_KEY = "era2-generation-queue";
const INITIAL_LOAD_MS = 600;

const initialState: QueueState = { tasks: [] };

function restoreTasks(): GenerationTask[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return generationTaskSeed;

  const parsed = JSON.parse(stored) as GenerationTask[];
  if (!Array.isArray(parsed)) throw new Error("Некорректный формат очереди");

  return parsed.map((task) => (
    task.status === "running"
      ? { ...task, status: "queued", progress: Math.max(0, task.progress - 6) }
      : task
  ));
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<QueueSort>("newest");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadQueue = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);

    const timeoutId = window.setTimeout(() => {
      try {
        dispatch({ type: "SET_TASKS", tasks: restoreTasks() });
      } catch {
        setLoadError("Не удалось восстановить очередь. Можно сбросить состояние и попробовать снова.");
      } finally {
        setIsLoading(false);
      }
    }, INITIAL_LOAD_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => loadQueue(), [loadQueue]);

  useEffect(() => {
    if (isLoading || loadError) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }, [isLoading, loadError, state.tasks]);

  useEffect(() => {
    if (isLoading || loadError) return;

    const engine = createQueueEngine({
      getState: () => stateRef.current,
      dispatch: (action: QueueAction) => dispatch(action),
    });

    engine.start();
    return () => engine.stop();
  }, [isLoading, loadError]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const retryLoad = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    loadQueue();
  }, [loadQueue]);

  const filters = useMemo<QueueFilters>(() => ({
    status: statusFilter,
    type: typeFilter,
    sort,
    query: debouncedQuery,
  }), [debouncedQuery, sort, statusFilter, typeFilter]);

  const stats = useMemo(() => getQueueStats(state.tasks), [state.tasks]);
  const activeSummary = useMemo(() => getActiveSummary(state.tasks), [state.tasks]);
  const visibleTasks = useMemo(
    () => selectVisibleTasks(state.tasks, filters),
    [filters, state.tasks],
  );

  const value = useMemo<QueueContextValue>(() => ({
    tasks: state.tasks,
    visibleTasks,
    filters: { ...filters, query },
    stats,
    activeSummary,
    isLoading,
    loadError,
    setStatusFilter,
    setTypeFilter,
    setSort,
    setQuery,
    cancelTask: (taskId) => dispatch({ type: "CANCEL_TASK", taskId }),
    retryTask: (taskId) => dispatch({ type: "RETRY_TASK", taskId, now: Date.now() }),
    deleteTask: (taskId) => dispatch({ type: "DELETE_TASK", taskId }),
    clearDone: () => dispatch({ type: "CLEAR_DONE" }),
    retryLoad,
  }), [
    activeSummary,
    filters,
    isLoading,
    loadError,
    query,
    retryLoad,
    state.tasks,
    stats,
    visibleTasks,
  ]);

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
