"use client";

import { useState, useCallback } from "react";
import { TopBanner, Header } from "./Header";
import { StepIndicator, type Step } from "./StepIndicator";
import { UploadStep } from "./UploadStep";
import { SchemaStep } from "./SchemaStep";
import { AnalyzingOverlay } from "./AnalyzingOverlay";
import { AnalysisStep } from "./AnalysisStep";
import { FixStep } from "./FixStep";
import { type FileSchema, type ColumnInfo, type SensitivityLevel } from "@/lib/schema";
import { computeRisk, type RiskResult } from "@/lib/risk";
import { uid } from "@/lib/utils";

const DEFAULT_SCHEMA: FileSchema = {
  columns: [
    { id: uid(), name: "ZIP Code" },
    { id: uid(), name: "Age" },
    { id: uid(), name: "Gender" },
    { id: uid(), name: "Diagnosis" },
  ],
  sensitivity: "Quasi-identifier",
  fileName: null,
  fromFile: false,
};

export function RevealApp() {
  const [step, setStep] = useState<Step>(1);
  const [schema, setSchema] = useState<FileSchema | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState("");
  const [showFixes, setShowFixes] = useState(false);

  const handleFileProcessed = useCallback(
    (columns: ColumnInfo[], fileName: string, sensitivity: SensitivityLevel) => {
      setSchema({
        columns,
        sensitivity,
        fileName,
        fromFile: true,
      });
      setStep(2);
      setRiskResult(null);
      setShowFixes(false);
    },
    []
  );

  const handleStartFromScratch = useCallback(() => {
    setSchema({
      ...DEFAULT_SCHEMA,
      columns: DEFAULT_SCHEMA.columns.map((c) => ({ ...c, id: uid() })),
    });
    setStep(2);
    setRiskResult(null);
    setShowFixes(false);
  }, []);

  const handleSchemaChange = useCallback((newSchema: FileSchema) => {
    setSchema(newSchema);
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setSchema(null);
    setRiskResult(null);
    setShowFixes(false);
  }, []);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setShowFixes(false);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    if (schema) {
      const result = computeRisk(schema);
      setRiskResult(result);
      setAnalysisTimestamp(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }
    setIsAnalyzing(false);
    setStep(3);
  }, [schema]);

  const handleSuggestFixes = useCallback(() => {
    setShowFixes(true);
    setStep(4);
  }, []);

  const handleBackToSchema = useCallback(() => {
    setStep(2);
    setShowFixes(false);
  }, []);

  const handleBackToAnalysis = useCallback(() => {
    setStep(3);
    setShowFixes(false);
  }, []);

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

          {step === 2 && schema && (
            <SchemaStep
              schema={schema}
              onSchemaChange={handleSchemaChange}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
            />
          )}

          {step === 3 && riskResult && schema && (
            <AnalysisStep
              riskResult={riskResult}
              timestamp={analysisTimestamp}
              schema={schema}
              onRerun={handleAnalyze}
              onSuggestFixes={handleSuggestFixes}
              onBack={handleBackToSchema}
            />
          )}

          {step === 4 && showFixes && schema && (
            <FixStep
              schema={schema}
              onBack={handleBackToAnalysis}
            />
          )}
        </div>
      </main>
    </div>
  );
}
