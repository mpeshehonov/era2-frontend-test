import { Search } from "lucide-react";
import type { GenType } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import type { QueueSort, StatusFilter, TypeFilter } from "../model/selectors";

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Все типы" },
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображения" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" },
];

interface QueueToolbarProps {
  status: StatusFilter;
  type: TypeFilter;
  sort: QueueSort;
  query: string;
  onStatusChange: (status: StatusFilter) => void;
  onTypeChange: (type: TypeFilter) => void;
  onSortChange: (sort: QueueSort) => void;
  onQueryChange: (query: string) => void;
}

function isGenType(value: TypeFilter): value is GenType {
  return value !== "all";
}

export function QueueToolbar({
  status,
  type,
  sort,
  query,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onQueryChange,
}: QueueToolbarProps) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {statusFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={cn(
              "h-[34px] shrink-0 rounded-full px-3.5 text-[13px] font-medium transition",
              status === item.value
                ? "bg-[var(--c-accent)] text-white shadow-[0_10px_30px_-12px_var(--c-accent)]"
                : "border border-[var(--c-line)] bg-secondary text-[var(--c-fg-dim)] hover:border-[var(--c-line-2)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_160px] lg:ml-auto lg:w-[560px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--c-fg-low)]" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по промпту"
            className="h-[34px] rounded-full border-[var(--c-line)] bg-secondary pl-9 text-[13px]"
          />
        </label>

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as QueueSort)}
          className="h-[34px] rounded-full border border-[var(--c-line)] bg-secondary px-3.5 text-[13px] text-[var(--c-fg-dim)] outline-none transition hover:border-[var(--c-line-2)]"
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
        </select>

        <select
          value={type}
          onChange={(event) => {
            const nextType = event.target.value as TypeFilter;
            onTypeChange(isGenType(nextType) ? nextType : "all");
          }}
          className="h-[34px] rounded-full border border-[var(--c-line)] bg-secondary px-3.5 text-[13px] text-[var(--c-fg-dim)] outline-none transition hover:border-[var(--c-line-2)]"
        >
          {typeFilters.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
