"use client";

import { RotateCcw, ArrowRight, FileText, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type FileSchema,
  type SensitivityLevel,
  SENSITIVITY_LEVELS,
} from "@/lib/schema";
import { cn } from "@/lib/utils";

interface SchemaStepProps {
  schema: FileSchema;
  onSensitivityChange: (sens: SensitivityLevel) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

const sensColorMap: Record<SensitivityLevel, string> = {
  Public: "bg-green-light text-green border-green-mid",
  "Quasi-identifier": "bg-yellow-light text-yellow border-yellow-mid",
  Sensitive: "bg-orange-light text-orange border-orange-mid",
  "Direct identifier": "bg-red-light text-red border-red-mid font-semibold",
};

const sensDescriptions: Record<SensitivityLevel, string> = {
  Public: "Non-sensitive data that can be freely shared",
  "Quasi-identifier": "Can be combined with other data to identify individuals",
  Sensitive: "Protected data like health, financial, or personal information",
  "Direct identifier": "Directly identifies individuals (SSN, email, name)",
};

export function SchemaStep({
  schema,
  onSensitivityChange,
  onAnalyze,
  onReset,
}: SchemaStepProps) {
  const { columns, sensitivity, fileName, fromFile } = schema;

  const ctaDesc = () => {
    switch (sensitivity) {
      case "Direct identifier":
        return "Direct identifiers detected — high re-identification risk. Run the analyzer now.";
      case "Sensitive":
        return "Sensitive data requires careful handling. Analyze to assess disclosure risks.";
      case "Quasi-identifier":
        return "Quasi-identifiers can be combined to re-identify individuals. Analyze to see the risk score.";
      default:
        return "Select the sensitivity level for this file, then run the analyzer.";
    }
  };

  return (
    <div className="anim-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-blue rounded-[6px] flex items-center justify-center text-white text-[11px] font-bold">
            2
          </div>
          <h2 className="text-[15px] font-bold text-text-1">Define schema</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="w-3.5 h-3.5" />
          Change file
        </Button>
      </div>

      {fromFile && fileName && (
        <div className="flex items-center gap-3 p-3 px-4 bg-green-light border border-green-mid rounded-lg mb-4">
          <FileText className="w-[18px] h-[18px] text-green" />
          <div>
            <div className="text-[13px] font-semibold text-text-1">{fileName}</div>
            <div className="text-[12px] text-text-3">
              {columns.length} column{columns.length !== 1 ? "s" : ""} detected
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="quasi">Auto-detected</Badge>
          </div>
        </div>
      )}

      <Card className="mb-4">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Columns className="w-4 h-4 text-text-3" />
            <span className="text-[13px] font-semibold text-text-1">Detected Columns</span>
            <span className="text-[12px] text-text-3 ml-1">({columns.length})</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {columns.map((col) => (
              <span
                key={col.id}
                className="inline-flex items-center px-2.5 py-1 bg-bg-subtle border border-border rounded-md text-[12px] font-mono text-text-2"
              >
                {col.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-bg-subtle">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-text-1 mb-0.5">
                File Sensitivity Level
              </div>
              <div className="text-[12px] text-text-3">
                {sensDescriptions[sensitivity]}
              </div>
            </div>
            <Select
              value={sensitivity}
              onValueChange={(v) => onSensitivityChange(v as SensitivityLevel)}
            >
              <SelectTrigger className={cn("w-48", sensColorMap[sensitivity])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENSITIVITY_LEVELS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="bg-gradient-to-br from-blue-light to-green-light border border-blue-mid rounded-xl p-7 flex items-center justify-between gap-6">
        <div>
          <h3 className="text-[16px] font-bold text-text-1 mb-1">
            Ready to analyze?
          </h3>
          <p className="text-[13px] text-text-2 leading-relaxed">{ctaDesc()}</p>
        </div>
        <Button size="lg" onClick={onAnalyze}>
          <ArrowRight className="w-4 h-4" />
          Analyze Schema
        </Button>
      </div>
    </div>
  );
}
