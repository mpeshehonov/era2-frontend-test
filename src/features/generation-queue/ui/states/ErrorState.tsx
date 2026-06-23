import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 px-6 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-500/15 text-red-300">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[var(--c-fg)]">Очередь не загрузилась</h3>
      <p className="mt-2 max-w-[420px] text-sm text-[var(--c-fg-mute)]">{message}</p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
