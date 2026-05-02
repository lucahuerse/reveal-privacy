"use client";

import { useState, useCallback } from "react";
import { TopBanner, Header } from "./Header";
import { StepIndicator, type Step } from "./StepIndicator";
import { UploadStep } from "./UploadStep";
import { SchemaStep } from "./SchemaStep";
import { AnalyzingOverlay } from "./AnalyzingOverlay";
import { AnalysisStep } from "./AnalysisStep";
import { FixStep } from "./FixStep";
import { type SchemaRow } from "@/lib/schema";
import { computeRisk, type RiskResult } from "@/lib/risk";
import { uid } from "@/lib/utils";

const DEFAULT_ROWS: SchemaRow[] = [
  { id: uid(), name: "ZIP Code", sens: "Quasi-identifier", auto: false },
  { id: uid(), name: "Age", sens: "Quasi-identifier", auto: false },
  { id: uid(), name: "Gender", sens: "Quasi-identifier", auto: false },
  { id: uid(), name: "Diagnosis", sens: "Sensitive", auto: false },
];

export function RevealApp() {
  const [step, setStep] = useState<Step>(1);
  const [rows, setRows] = useState<SchemaRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fromFile, setFromFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState("");
  const [showFixes, setShowFixes] = useState(false);

  const handleFileProcessed = useCallback((newRows: SchemaRow[], name: string) => {
    setRows(newRows);
    setFileName(name);
    setFromFile(true);
    setStep(2);
    setRiskResult(null);
    setShowFixes(false);
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setRows(DEFAULT_ROWS.map((r) => ({ ...r, id: uid() })));
    setFileName(null);
    setFromFile(false);
    setStep(2);
    setRiskResult(null);
    setShowFixes(false);
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setRows([]);
    setFileName(null);
    setFromFile(false);
    setRiskResult(null);
    setShowFixes(false);
  }, []);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setShowFixes(false);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    const result = computeRisk(rows);
    setRiskResult(result);
    setAnalysisTimestamp(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
    setIsAnalyzing(false);
    setStep(3);
  }, [rows]);

  const handleSuggestFixes = useCallback(() => {
    setShowFixes(true);
    setStep(4);
  }, []);

  const hasDirectIdentifiers = rows.some((r) => r.sens === "Direct identifier");
  const hasSensitive = rows.some((r) => r.sens === "Sensitive");

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <Header />

      {isAnalyzing && <AnalyzingOverlay onComplete={handleAnalysisComplete} />}

      <main className="flex-1">
        <div className="max-w-[960px] mx-auto px-6 py-10 pb-20">
          <StepIndicator currentStep={step} />

          {step === 1 && (
            <UploadStep
              onFileProcessed={handleFileProcessed}
              onStartFromScratch={handleStartFromScratch}
            />
          )}

          {step >= 2 && (
            <SchemaStep
              rows={rows}
              fileName={fileName}
              fromFile={fromFile}
              onRowsChange={setRows}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
            />
          )}

          {step >= 3 && riskResult && (
            <AnalysisStep
              riskResult={riskResult}
              timestamp={analysisTimestamp}
              onRerun={handleAnalyze}
              onSuggestFixes={handleSuggestFixes}
            />
          )}

          {step >= 4 && showFixes && (
            <FixStep
              rows={rows}
              hasDirectIdentifiers={hasDirectIdentifiers}
              hasSensitive={hasSensitive}
            />
          )}
        </div>
      </main>
    </div>
  );
}
