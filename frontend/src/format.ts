/** Wall-clock duration for the player and the history rows. */
export function formatClock(seconds: number): string {
  const total =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * How a history row names its timestamp. Recent entries read in words
 * because that is how someone thinks about a message they just left; older
 * ones get a time, and older still a date, because "3 days ago" stops being
 * useful once you are choosing between several.
 */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return "Unknown time";
  }
  const seconds = (now.getTime() - then.getTime()) / 1000;
  if (seconds < 60) {
    return "Just now";
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (sameDay(then, now)) {
    return `Today ${clock(then)}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(then, yesterday)) {
    return `Yesterday ${clock(then)}`;
  }
  const date = then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${date} ${clock(then)}`;
}
