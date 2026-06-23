export function LoadingState() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[89px] animate-pulse rounded-2xl border border-[var(--c-line)] bg-card"
        />
      ))}
    </div>
  );
}
