"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { RotateCcw, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type RiskResult } from "@/lib/risk";
import { type FileSchema } from "@/lib/schema";
import { buildFallbackAnalysis, type Analysis } from "@/lib/fallback-analysis";
import { cn } from "@/lib/utils";

interface AnalysisStepProps {
  riskResult: RiskResult;
  timestamp: string;
  schema: FileSchema;
  onRerun: () => void;
  onSuggestFixes: () => void;
  onBack: () => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

export function AnalysisStep({
  riskResult,
  timestamp,
  schema,
  onRerun,
  onSuggestFixes,
  onBack,
}: AnalysisStepProps) {
  const fallback = useMemo(
    () => buildFallbackAnalysis(schema, riskResult),
    [schema, riskResult],
  );

  const [analysis, setAnalysis] = useState<Analysis>(fallback);
  const [aiLoading, setAiLoading] = useState(true);
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnalysis(fallback);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    runAiAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskResult.score, schema]);

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE * (1 - analysis.score / 100);
    const t = setTimeout(() => setAnimatedOffset(targetOffset), 50);
    return () => clearTimeout(t);
  }, [analysis.score]);

  async function runAiAnalysis() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columns: schema.columns,
          sensitivity: schema.sensitivity,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis as Analysis);
      }
      // Silent fallback: keep predefined `analysis` on failure.
    } catch {
      // Silent fallback.
    } finally {
      setAiLoading(false);
    }
  }

  const gaugeColor =
    analysis.level === "HIGH"
      ? "#dc2626"
      : analysis.level === "MEDIUM"
        ? "#d97706"
        : "#16a34a";

  const chipClasses =
    analysis.level === "HIGH"
      ? "bg-red-light text-red border-red-mid"
      : analysis.level === "MEDIUM"
        ? "bg-yellow-light text-yellow border-yellow-mid"
        : "bg-green-light text-green border-green-mid";

  const kColor = kColorClass(analysis.currentK);

  return (
    <div ref={sectionRef} className="anim-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to schema
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-text-3">analyzed at {timestamp}</span>
          {aiLoading && (
            <span className="text-[11px] text-text-3 animate-pulse">refining…</span>
          )}
          <Button variant="ghost" size="sm" onClick={onRerun}>
            <RotateCcw className="w-3.5 h-3.5" />
            Re-run
          </Button>
        </div>
      </div>

      {/* Hero score */}
      <Card>
        <div className="flex flex-col items-center justify-center text-center gap-4 py-10 px-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-3">
            Re-Identification Risk Score
          </div>
          <div className="relative w-[180px] h-[180px]">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                className="gauge-fill"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={animatedOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-[56px] font-bold leading-none tabular-nums"
                style={{ color: gaugeColor }}
              >
                {analysis.score}
              </span>
              <span className="text-[12px] text-text-3 mt-1">/ 100</span>
            </div>
          </div>
          <div
            className={cn(
              "text-[12px] font-bold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full border",
              chipClasses,
            )}
          >
            {analysis.level} RISK
          </div>
          <div className="text-[14px] text-text-2 max-w-[440px] leading-relaxed">
            {analysis.levelSublabel}
          </div>
        </div>
      </Card>

      {/* k-anonymity + Dangerous combinations */}
      <Card className="mt-4">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-[18px_22px]">
            <div className="flex items-baseline justify-between mb-2.5 gap-3">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-text-3">
                k-Anonymity
              </span>
              <span className={cn("text-[22px] font-bold tabular-nums tracking-tight", kColor)}>
                k = {analysis.currentK}
              </span>
            </div>
            <div className="text-[13px] text-text-2 leading-relaxed">
              {analysis.kDescription}
            </div>
          </div>

          <div className="p-[18px_22px]">
            <div className="flex items-baseline justify-between mb-2.5 gap-3">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-text-3">
                Dangerous Combinations
              </span>
              {analysis.dangerousCombinations.length > 0 && (
                <span className="text-[12px] font-semibold text-red">
                  {analysis.dangerousCombinations.length} issue
                  {analysis.dangerousCombinations.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {analysis.dangerousCombinations.map((combo, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 px-3 bg-red-light border border-red-mid rounded-md"
                >
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {combo.columns.map((col, j) => (
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
              {analysis.dangerousCombinations.length === 0 && (
                <div className="text-[13px] text-text-3">
                  No dangerous column combinations detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Analysis Section */}
      <div className="mt-4 border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-bg-subtle border-b border-border">
          <Sparkles className="w-3.5 h-3.5 text-text-3" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-3">
            AI Analysis
          </span>
          {aiLoading && (
            <span className="text-[11px] text-text-3 animate-pulse ml-1">Analyzing...</span>
          )}
        </div>
        <div className="p-5 bg-white">
          <AiAnalysisView analysis={analysis} />
        </div>
      </div>

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

function kColorClass(k: number): string {
  if (k < 3) return "text-red";
  if (k < 5) return "text-yellow";
  return "text-green";
}

function severityDot(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "bg-red";
  if (severity === "medium") return "bg-yellow";
  return "bg-green";
}

function AiAnalysisView({ analysis }: { analysis: Analysis }) {
  const { currentK, afterFixesK, safeHarborK, issues, gdpr, fixes, summary } = analysis;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <Tile label="Current k" value={`${currentK}`} valueClass={kColorClass(currentK)} />
        <Tile
          label="After fixes"
          value={`~${afterFixesK}`}
          valueClass={kColorClass(afterFixesK)}
        />
        <Tile label="GDPR safe harbor" value={`≥ ${safeHarborK}`} valueClass="text-text-1" />
      </div>

      <Section title="Issues Detected">
        <div className="flex flex-col gap-2">
          {issues.map((issue, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 px-3.5 bg-bg-subtle border border-border rounded-md"
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  severityDot(issue.severity),
                )}
              />
              <span className="text-[13px] leading-relaxed text-text-2">{issue.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="GDPR Assessment">
        <div className="flex flex-col gap-2">
          {gdpr.map((g, i) => (
            <div
              key={i}
              className="border-l-[3px] border-red bg-bg-subtle p-3 px-3.5 rounded-r-md"
            >
              <div className="text-[12px] font-semibold text-text-1 mb-1">{g.citation}</div>
              <div className="text-[13px] leading-relaxed text-text-2">{g.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recommended Fixes">
        <div className="flex flex-col">
          {fixes.map((fix, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between gap-3 py-2.5",
                i !== fixes.length - 1 && "border-b border-border",
              )}
            >
              <span className="text-[13px] text-text-2">{fix.label}</span>
              <span
                className={cn(
                  "text-[11.5px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap",
                  fix.required
                    ? "bg-red-light text-red border-red-mid"
                    : "bg-green-light text-green border-green-mid",
                )}
              >
                {fix.impact}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {summary && (
        <div className="text-[12.5px] leading-relaxed text-text-3 italic border-t border-border pt-3">
          {summary}
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="border border-border rounded-md p-3 bg-bg-subtle">
      <div className="text-[11px] text-text-3 mb-1">{label}</div>
      <div className={cn("text-[22px] font-bold tabular-nums leading-none", valueClass)}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-3 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
