import { Inbox } from "lucide-react";

interface EmptyStateProps {
  hasTasks: boolean;
}

export function EmptyState({ hasTasks }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--c-line)] bg-card/60 px-6 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-[var(--c-accent-soft)] text-[var(--c-accent-2)]">
        <Inbox className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[var(--c-fg)]">
        {hasTasks ? "Ничего не найдено" : "Очередь пуста"}
      </h3>
      <p className="mt-2 max-w-[360px] text-sm text-[var(--c-fg-mute)]">
        {hasTasks
          ? "Попробуйте сменить фильтр, тип генерации или поисковый запрос."
          : "Когда вы отправите задачу на генерацию, она появится здесь и начнёт двигаться по очереди."}
      </p>
    </div>
  );
}
