"use client";

import { useEffect, useState } from "react";

interface AnalyzingOverlayProps {
  onComplete: () => void;
}

export function AnalyzingOverlay({ onComplete }: AnalyzingOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const interval = 20;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      setProgress((current / steps) * 100);
      if (current >= steps) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
      <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-blue animate-spin" />
      <div className="text-[14px] font-medium text-text-2">Analyzing schema...</div>
      <div className="w-60 h-[3px] bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-blue rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
