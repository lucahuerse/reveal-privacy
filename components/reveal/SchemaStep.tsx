"use client";

import { useState, useRef } from "react";
import { RotateCcw, ArrowRight, FileText, Columns, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  type ColumnInfo,
  SENSITIVITY_LEVELS,
} from "@/lib/schema";
import { cn, uid } from "@/lib/utils";

interface SchemaStepProps {
  schema: FileSchema;
  onSchemaChange: (schema: FileSchema) => void;
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
  onSchemaChange,
  onAnalyze,
  onReset,
}: SchemaStepProps) {
  const { columns, sensitivity, fileName, fromFile } = schema;
  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSensitivityChange = (sens: SensitivityLevel) => {
    onSchemaChange({ ...schema, sensitivity: sens });
  };

  const handleRemoveColumn = (id: string) => {
    onSchemaChange({
      ...schema,
      columns: columns.filter((c) => c.id !== id),
    });
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const newCol: ColumnInfo = {
        id: uid(),
        name: newColumnName.trim(),
      };
      onSchemaChange({
        ...schema,
        columns: [...columns, newCol],
      });
      setNewColumnName("");
      setIsAddingColumn(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddColumn();
    } else if (e.key === "Escape") {
      setIsAddingColumn(false);
      setNewColumnName("");
    }
  };

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

      <Card className="mb-4 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Columns className="w-4 h-4 text-text-3" />
            <span className="text-[13px] font-semibold text-text-1">Columns</span>
            <span className="text-[12px] text-text-3 ml-1">({columns.length})</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {columns.map((col) => (
              <span
                key={col.id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-bg-subtle border border-border rounded-md text-[12px] font-mono text-text-2 group"
              >
                {col.name}
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(col.id)}
                  className="w-4 h-4 rounded flex items-center justify-center text-text-3 hover:text-red hover:bg-red-light transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {isAddingColumn ? (
              <div className="inline-flex items-center gap-1.5">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newColumnName.trim()) {
                      setIsAddingColumn(false);
                    }
                  }}
                  placeholder="Column name"
                  className="h-7 w-32 text-[12px] font-mono"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim()}
                  className="h-7 px-2"
                >
                  Add
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsAddingColumn(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-transparent border border-dashed border-border-strong rounded-md text-[12px] text-text-3 hover:text-text-1 hover:border-text-3 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add column
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-bg-subtle rounded-b-lg">
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
              onValueChange={(v) => handleSensitivityChange(v as SensitivityLevel)}
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
