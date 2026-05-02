"use client";

import { useEffect, useState, useRef } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type RiskResult,
  getKDescription,
  getRiskSublabel,
} from "@/lib/risk";
import { cn } from "@/lib/utils";

interface AnalysisStepProps {
  riskResult: RiskResult;
  timestamp: string;
  onRerun: () => void;
  onSuggestFixes: () => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

export function AnalysisStep({
  riskResult,
  timestamp,
  onRerun,
  onSuggestFixes,
}: AnalysisStepProps) {
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE * (1 - riskResult.score / 100);
    setTimeout(() => setAnimatedOffset(targetOffset), 50);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [riskResult.score]);

  const gaugeColor =
    riskResult.level === "HIGH"
      ? "#dc2626"
      : riskResult.level === "MEDIUM"
        ? "#d97706"
        : "#16a34a";

  const chipClasses =
    riskResult.level === "HIGH"
      ? "bg-red-light text-red border-red-mid"
      : riskResult.level === "MEDIUM"
        ? "bg-yellow-light text-yellow border-yellow-mid"
        : "bg-green-light text-green border-green-mid";

  const kColor =
    riskResult.k < 3
      ? "text-red"
      : riskResult.k < 5
        ? "text-yellow"
        : "text-green";

  return (
    <div ref={sectionRef} className="anim-in">
      <div className="h-px bg-border my-8" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-red rounded-[6px] flex items-center justify-center text-white text-[11px] font-bold">
            3
          </div>
          <h2 className="text-[15px] font-bold text-text-1">Risk Analysis</h2>
          <span className="text-[12px] text-text-3">· analyzed at {timestamp}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRerun}>
          <RotateCcw className="w-3.5 h-3.5" />
          Re-run
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-[220px_1fr] min-h-[260px]">
          {/* Score Column */}
          <div className="p-7 border-r border-border flex flex-col items-center justify-center gap-3 text-center bg-bg-subtle">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-3">
              Re-id Risk Score
            </div>
            <div className="relative w-[100px] h-[100px]">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  className="gauge-fill"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={animatedOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[26px] font-bold leading-none"
                  style={{ color: gaugeColor }}
                >
                  {riskResult.score}
                </span>
                <span className="text-[10px] text-text-3 mt-0.5">/100</span>
              </div>
            </div>
            <div
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
                chipClasses
              )}
            >
              {riskResult.level} RISK
            </div>
            <div className="text-[12px] text-text-3 max-w-[150px] leading-relaxed">
              {getRiskSublabel(riskResult.level)}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col">
            {/* K-Anonymity */}
            <div className="p-[18px_22px] border-b border-border">
              <div className="flex items-baseline justify-between mb-2.5 gap-3">
                <span className="text-[11.5px] font-semibold uppercase tracking-wide text-text-3">
                  k-Anonymity
                </span>
                <span className={cn("text-[22px] font-bold tabular-nums tracking-tight", kColor)}>
                  k = {riskResult.k}
                </span>
              </div>
              <div
                className="text-[13px] text-text-2 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: getKDescription(riskResult.k, riskResult.q, riskResult.d),
                }}
              />
            </div>

            {/* Dangerous Combinations */}
            <div className="p-[18px_22px] flex-1">
              <div className="flex items-baseline justify-between mb-2.5 gap-3">
                <span className="text-[11.5px] font-semibold uppercase tracking-wide text-text-3">
                  Dangerous Combinations
                </span>
                {riskResult.combos.length > 0 && (
                  <span className="text-[12px] font-semibold text-red">
                    {riskResult.combos.length} issue{riskResult.combos.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {riskResult.combos.map((combo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 px-3 bg-red-light border border-red-mid rounded-md"
                  >
                    <div className="flex gap-1.5 flex-wrap flex-1">
                      {combo.cols.map((col, j) => (
                        <span
                          key={j}
                          className="font-mono text-[11px] font-medium text-red bg-white border border-red-mid rounded px-1.5 py-0.5"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11.5px] font-medium text-red text-right max-w-[220px] shrink-0">
                      {combo.label}
                    </span>
                  </div>
                ))}
                {riskResult.combos.length === 0 && (
                  <div className="text-[13px] text-text-3">
                    No dangerous column combinations detected.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4">
        <span className="text-[12px] text-text-3">
          Review risks above, then generate fixes
        </span>
        <Button variant="green" onClick={onSuggestFixes}>
          <ArrowRight className="w-3.5 h-3.5" />
          Suggest Fixes
        </Button>
      </div>
    </div>
  );
}
