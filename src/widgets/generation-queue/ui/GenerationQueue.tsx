import { useMemo } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  useQueue,
} from "@/features/generation-queue";
import { Button } from "@/shared/ui/button";

export function GenerationQueue() {
  const {
    tasks,
    visibleTasks,
    filters,
    stats,
    isLoading,
    loadError,
    setStatusFilter,
    setTypeFilter,
    setSort,
    setQuery,
    cancelTask,
    retryTask,
    deleteTask,
    clearDone,
    retryLoad,
  } = useQueue();

  const queuePositions = useMemo(() => {
    const queued = tasks
      .filter((task) => task.status === "queued")
      .sort((first, second) => first.createdAt - second.createdAt);

    return new Map(queued.map((task, index) => [task.id, index + 1]));
  }, [tasks]);

  const handleClearDone = () => {
    if (stats.done === 0) return;
    if (window.confirm("Удалить все готовые генерации из очереди?")) clearDone();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--c-bg)] pb-16 text-[var(--c-fg)]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pt-8 md:gap-7 md:px-8 md:pt-12 xl:px-0">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[var(--c-fg)] md:text-[32px]">
              Очередь генераций
            </h1>
            <p className="mt-1 text-sm text-[var(--c-fg-mute)] md:text-base">
              Все ваши задачи в реальном времени
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-10 self-start border-[var(--c-line)] bg-transparent px-4 text-[13px] md:self-auto"
            onClick={handleClearDone}
            disabled={stats.done === 0}
          >
            Очистить готовые
          </Button>
        </header>

        <QueueStats stats={stats} />

        <QueueToolbar
          status={filters.status}
          type={filters.type}
          sort={filters.sort}
          query={filters.query}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onSortChange={setSort}
          onQueryChange={setQuery}
        />

        {isLoading && <LoadingState />}
        {!isLoading && loadError && <ErrorState message={loadError} onRetry={retryLoad} />}
        {!isLoading && !loadError && visibleTasks.length === 0 && (
          <EmptyState hasTasks={tasks.length > 0} />
        )}
        {!isLoading && !loadError && visibleTasks.length > 0 && (
          <>
            <div className="hidden flex-col gap-2.5 md:flex">
              {visibleTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  queuePosition={queuePositions.get(task.id)}
                  onCancel={() => cancelTask(task.id)}
                  onRetry={() => retryTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2.5 md:hidden">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  queuePosition={queuePositions.get(task.id)}
                  onCancel={() => cancelTask(task.id)}
                  onRetry={() => retryTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
