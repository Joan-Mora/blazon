"use client";

import { useEffect, useState } from "react";

function diffParts(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso);
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(diffParts(target)), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso]);

  if (parts.done) {
    return (
      <p className="text-2xl font-black org-accent animate-pulse">¡EN VIVO!</p>
    );
  }

  const cells = [
    { label: "Días", value: parts.days },
    { label: "Horas", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Seg", value: parts.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="org-surface rounded-md px-4 py-3 min-w-[72px] text-center"
        >
          <div className="text-3xl font-black org-accent tabular-nums">
            {String(cell.value).padStart(2, "0")}
          </div>
          <div
            className="text-[10px] uppercase tracking-widest mt-1"
            style={{ color: "var(--org-text-muted)" }}
          >
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
