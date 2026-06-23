import type { QueueStats as QueueStatsValue } from "../model/selectors";

const statItems = [
  { key: "queued", label: "В очереди", color: "bg-[#a59b94]" },
  { key: "running", label: "Идёт", color: "bg-[var(--c-accent-2)]" },
  { key: "done", label: "Готово", color: "bg-emerald-400" },
  { key: "failed", label: "Ошибка", color: "bg-red-400" },
] as const;

interface QueueStatsProps {
  stats: QueueStatsValue;
}

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-[var(--c-line)] bg-card p-3.5 md:rounded-[18px] md:p-[18px]"
        >
          <div className="flex items-center gap-2 text-[13px] text-[var(--c-fg-mute)]">
            <span className={`size-2 rounded-full ${item.color}`} />
            {item.label}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-[-0.04em] text-[var(--c-fg)] md:text-[28px]">
            {stats[item.key]}
          </div>
        </div>
      ))}
    </section>
  );
}
