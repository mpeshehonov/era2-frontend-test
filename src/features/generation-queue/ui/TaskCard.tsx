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

interface TaskCardProps {
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
      return `за ${formatDuration(task.estimatedMs).replace("≈ ", "")} · ${formatCredits(task.credits)}`;
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

export function TaskCard({ task, queuePosition, onCancel, onRetry, onDelete }: TaskCardProps) {
  const Icon = typeIcons[task.type];
  const isActive = task.status === "running";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-3.5 transition duration-300",
        isActive ? "border-[rgba(232,84,32,0.45)]" : "border-[var(--c-line)]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--c-accent-soft)] to-[var(--c-bg-2)] text-[var(--c-accent-2)]">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--c-fg)]">
            {task.prompt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--c-fg-mute)]">
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-secondary px-2 font-mono text-[11px] text-[var(--c-fg-dim)]">
              <span className="size-1.5 rounded-full bg-[var(--c-accent)]" />
              {task.model}
            </span>
            <span>{getMeta(task, queuePosition)}</span>
          </div>
        </div>
      </div>

      {task.status === "running" && (
        <ProgressBar value={task.progress} className="mt-3 h-[5px]" />
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {task.status === "running" && (
            <span className="font-mono text-[13px] font-semibold text-[var(--c-accent-2)]">
              {task.progress}%
            </span>
          )}
        </div>
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
