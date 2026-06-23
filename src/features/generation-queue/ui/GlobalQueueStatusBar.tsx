import { ChevronDown, FileText, ImageIcon, Music, Video } from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";
import type { GenType, GenerationTask } from "@/entities/generation-task";
import { useQueue } from "@/features/generation-queue";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "@/shared/routing";
import { ProgressBar } from "./ProgressBar";

const typeIcons: Record<GenType, ComponentType<{ className?: string }>> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

function MiniTask({ task }: { task: GenerationTask }) {
  const Icon = typeIcons[task.type];

  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[var(--c-accent-soft)] to-[var(--c-bg-2)] text-[var(--c-accent-2)]">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-[var(--c-fg-dim)]">{task.prompt}</p>
        {task.status === "running" && <ProgressBar value={task.progress} className="mt-1 h-1" />}
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-[11px] font-medium",
          task.status === "running" ? "text-[var(--c-accent-2)]" : "text-[var(--c-fg-mute)]",
        )}
      >
        {task.status === "running" ? `${task.progress}%` : "в очереди"}
      </span>
    </div>
  );
}

export function GlobalQueueStatusBar() {
  const { activeSummary } = useQueue();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (activeSummary.count === 0) return null;

  const firstTask = activeSummary.tasks[0];
  const title = activeSummary.count === 1 && firstTask
    ? `Генерация ${firstTask.type === "image" ? "изображения" : "идёт"}`
    : "Генерации идут";

  const openQueue = () => navigate("/queue");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:inset-x-auto md:bottom-6 md:right-6 md:w-[332px] md:px-0 md:pb-0">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto flex h-[37px] items-center gap-2 rounded-full border border-[rgba(232,84,32,0.4)] bg-[var(--c-bg-2)] px-3.5 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:mx-0"
        >
          <span className="size-4 rounded-full border-2 border-[var(--c-accent-2)] border-t-transparent" />
          <span className="font-medium text-[var(--c-fg)]">{activeSummary.count} генерации</span>
          <span className="font-mono text-[var(--c-accent-2)]">· {activeSummary.averageProgress}%</span>
        </button>
      ) : (
        <aside className="overflow-hidden rounded-[18px] border border-[rgba(232,84,32,0.35)] bg-[var(--c-bg-2)] shadow-[0_0_30px_-6px_rgba(232,84,32,0.18),0_16px_40px_-4px_rgba(0,0,0,0.55)]">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
            onClick={openQueue}
          >
            <span className="size-[18px] rounded-full border-2 border-[var(--c-accent-2)] border-t-transparent animate-spin" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-[var(--c-fg)]">{title}</span>
              <span className="block font-mono text-[11px] text-[var(--c-fg-mute)]">
                {activeSummary.count} активны · {activeSummary.averageProgress}%
              </span>
            </span>
            <ChevronDown
              className="hidden size-4 text-[var(--c-fg-mute)] md:block"
              onClick={(event) => {
                event.stopPropagation();
                setCollapsed(true);
              }}
            />
            <span className="text-[var(--c-fg-mute)] md:hidden">→</span>
          </button>

          <div className="hidden px-3.5 pb-2.5 pt-0 md:flex md:flex-col md:gap-2.5">
            {activeSummary.tasks.slice(0, 3).map((task) => (
              <MiniTask key={task.id} task={task} />
            ))}
          </div>

          {activeSummary.count > 1 && (
            <button
              type="button"
              onClick={openQueue}
              className="hidden w-full items-center justify-center gap-1.5 border-t border-[var(--c-line)] py-2.5 text-[13px] font-medium text-[var(--c-accent-2)] md:flex"
            >
              Открыть очередь →
            </button>
          )}

          <div className="md:hidden">
            <ProgressBar value={activeSummary.averageProgress} className="h-[3px] rounded-none" />
          </div>
        </aside>
      )}
    </div>
  );
}
