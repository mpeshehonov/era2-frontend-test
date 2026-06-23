import { cn } from "@/shared/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-[var(--c-bg-3)]", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#E85420] to-[#ff7a3d] transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
