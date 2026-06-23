import { FileText, ImageIcon, Music, Video } from "lucide-react";
import type { ComponentType } from "react";
import type { GenerationTask, GenType } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { formatCredits, formatDuration } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";

const typeIcons: Record<GenType, ComponentType<{ className?: string }>> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

interface TaskRowProps {
  task: GenerationTask;
  queuePosition?: number;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
}

function getMeta(task: GenerationTask, queuePosition?: number): string {
  switch (task.status) {
    case "queued":
      return queuePosition ? `позиция ${queuePosition} · ${formatCredits(task.credits)}` : formatCredits(task.credits);
    case "running":
      return `${formatDuration(task.estimatedMs)} · ${formatCredits(task.credits)}`;
    case "done":
      return `готово за ${formatDuration(task.estimatedMs).replace("≈ ", "")} · ${formatCredits(task.credits)}`;
    case "failed":
      return task.error ?? "ошибка генерации";
    case "canceled":
      return task.error ?? "отменено пользователем";
    default: {
      const exhaustiveCheck: never = task.status;
      return exhaustiveCheck;
    }
  }
}

export function TaskRow({ task, queuePosition, onCancel, onRetry, onDelete }: TaskRowProps) {
  const Icon = typeIcons[task.type];
  const isActive = task.status === "running";

  return (
    <article
      className={cn(
        "group grid min-h-[89px] grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border bg-card px-4 py-3.5 transition duration-300",
        isActive
          ? "border-[rgba(232,84,32,0.45)] shadow-[0_0_0_1px_rgba(232,84,32,0.12)]"
          : "border-[var(--c-line)] hover:border-[var(--c-line-2)]",
      )}
    >
      <div className="grid size-14 place-items-center rounded-xl bg-gradient-to-br from-[var(--c-accent-soft)] to-[var(--c-bg-2)] text-[var(--c-accent-2)]">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--c-fg)]">
          {task.prompt}
        </h3>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--c-fg-mute)]">
          <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-secondary px-2 font-mono text-[11px] text-[var(--c-fg-dim)]">
            <span className="size-1.5 rounded-full bg-[var(--c-accent)]" />
            {task.model}
          </span>
          <span className="text-[var(--c-fg-low)]">·</span>
          <span>{getMeta(task, queuePosition)}</span>
        </div>
        {task.status === "running" && (
          <ProgressBar value={task.progress} className="mt-2.5 h-[5px]" />
        )}
      </div>

      <div className="flex items-center gap-3">
        {task.status === "running" && (
          <span className="font-mono text-xs font-semibold text-[var(--c-accent-2)]">
            {task.progress}%
          </span>
        )}
        <StatusBadge status={task.status} />
        <TaskActions
          status={task.status}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
