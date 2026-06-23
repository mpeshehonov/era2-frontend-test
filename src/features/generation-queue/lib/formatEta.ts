export function formatDuration(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1_000));
  if (seconds < 60) return `≈ ${seconds} сек`;

  const minutes = Math.round(seconds / 60);
  return `≈ ${minutes} мин`;
}

export function formatCredits(credits: number): string {
  return `${credits} cr`;
}
