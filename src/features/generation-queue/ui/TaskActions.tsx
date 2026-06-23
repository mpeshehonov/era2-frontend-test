import { Download, MoreHorizontal, RotateCcw, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface TaskActionsProps {
  status: TaskStatus;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
}

function IconButton({
  children,
  label,
  className,
  onClick,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg border border-[var(--c-line)] bg-secondary text-[var(--c-fg-mute)] transition hover:border-[var(--c-line-2)] hover:text-[var(--c-fg)] md:size-8",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TaskActions({ status, onCancel, onRetry, onDelete }: TaskActionsProps) {
  const primaryAction = (() => {
    switch (status) {
      case "queued":
      case "running":
        return (
          <IconButton label="Отменить задачу" onClick={onCancel}>
            <X className="size-4" />
          </IconButton>
        );
      case "failed":
      case "canceled":
        return (
          <IconButton label="Повторить задачу" className="text-[var(--c-accent-2)]" onClick={onRetry}>
            <RotateCcw className="size-4" />
          </IconButton>
        );
      case "done":
        return (
          <IconButton label="Скачать результат" className="text-[var(--c-accent-2)]">
            <Download className="size-4" />
          </IconButton>
        );
      default: {
        const exhaustiveCheck: never = status;
        return exhaustiveCheck;
      }
    }
  })();

  return (
    <div className="flex items-center gap-1.5">
      {primaryAction}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Открыть меню задачи">
            <MoreHorizontal className="size-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-[var(--c-line)] bg-[var(--c-bg-2)]">
          <DropdownMenuItem
            className="gap-2 text-red-300 focus:bg-red-500/10 focus:text-red-200"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
