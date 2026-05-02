"use client";

import { useRef, useEffect } from "react";
import { RotateCcw, Plus, X, ArrowRight, FileText } from "lucide-react";
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
  type SchemaRow,
  type SensitivityLevel,
  SENSITIVITY_LEVELS,
} from "@/lib/schema";
import { uid, cn } from "@/lib/utils";

interface SchemaStepProps {
  rows: SchemaRow[];
  fileName: string | null;
  fromFile: boolean;
  onRowsChange: (rows: SchemaRow[]) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

const sensColorMap: Record<SensitivityLevel, string> = {
  Public: "bg-green-light text-green border-green-mid",
  "Quasi-identifier": "bg-yellow-light text-yellow border-yellow-mid",
  Sensitive: "bg-orange-light text-orange border-orange-mid",
  "Direct identifier": "bg-red-light text-red border-red-mid font-semibold",
};

export function SchemaStep({
  rows,
  fileName,
  fromFile,
  onRowsChange,
  onAnalyze,
  onReset,
}: SchemaStepProps) {
  const newRowRef = useRef<HTMLInputElement>(null);

  const updateRow = (id: string, field: keyof SchemaRow, value: string) => {
    onRowsChange(
      rows.map((r) =>
        r.id === id
          ? { ...r, [field]: value, auto: field === "name" ? false : r.auto }
          : r
      )
    );
  };

  const deleteRow = (id: string) => {
    if (rows.length > 1) {
      onRowsChange(rows.filter((r) => r.id !== id));
    }
  };

  const addRow = () => {
    const newRow: SchemaRow = {
      id: uid(),
      name: "",
      sens: "Public",
      auto: false,
    };
    onRowsChange([...rows, newRow]);
    setTimeout(() => newRowRef.current?.focus(), 50);
  };

  const directCount = rows.filter((r) => r.sens === "Direct identifier").length;
  const quasiCount = rows.filter((r) => r.sens === "Quasi-identifier").length;
  const sensitiveCount = rows.filter((r) => r.sens === "Sensitive").length;

  const ctaDesc = () => {
    if (directCount > 0) {
      return `${directCount} direct identifier${directCount > 1 ? "s" : ""} detected — high re-identification risk. Run the analyzer now.`;
    }
    if (quasiCount >= 3) {
      return `${quasiCount} quasi-identifiers can be combined to re-identify individuals. Analyze to see the risk score.`;
    }
    return "Tag each column's sensitivity level, then run the analyzer to detect re-identification vulnerabilities.";
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
              {rows.length} column{rows.length !== 1 ? "s" : ""} detected · headers
              auto-filled
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="quasi">Auto-detected</Badge>
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle border-b border-border">
                <th className="w-12 text-center text-[11px] font-semibold text-text-3 uppercase tracking-wide py-2.5 px-4">
                  #
                </th>
                <th className="text-left text-[11px] font-semibold text-text-3 uppercase tracking-wide py-2.5 px-4">
                  Column Name
                </th>
                <th className="w-52 text-left text-[11px] font-semibold text-text-3 uppercase tracking-wide py-2.5 px-4">
                  Sensitivity Tag
                </th>
                <th className="w-20 text-center text-[11px] font-semibold text-text-3 uppercase tracking-wide py-2.5 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors"
                >
                  <td className="text-center text-[12px] text-text-4 font-medium py-2 px-4">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-1.5">
                      <Input
                        ref={index === rows.length - 1 ? newRowRef : undefined}
                        value={row.name}
                        onChange={(e) => updateRow(row.id, "name", e.target.value)}
                        placeholder="column_name"
                        className="flex-1"
                      />
                      {row.auto && (
                        <span className="font-mono text-[10px] font-medium text-blue bg-blue-light border border-blue-mid rounded px-1.5 py-0.5 shrink-0">
                          auto
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <Select
                      value={row.sens}
                      onValueChange={(v) => updateRow(row.id, "sens", v)}
                    >
                      <SelectTrigger className={cn(sensColorMap[row.sens])}>
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
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(row.id)}
                      disabled={rows.length === 1}
                      className="hover:bg-red-light hover:text-red"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-bg-subtle border-t border-border rounded-b-lg">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-text-3">
              <strong className="text-text-2 font-medium">{rows.length}</strong>{" "}
              column{rows.length !== 1 ? "s" : ""}
            </span>
            {directCount > 0 && (
              <Badge variant="direct">{directCount} Direct</Badge>
            )}
            {quasiCount > 0 && (
              <Badge variant="quasi">{quasiCount} Quasi</Badge>
            )}
            {sensitiveCount > 0 && (
              <Badge variant="sensitive">{sensitiveCount} Sensitive</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="w-3.5 h-3.5" />
            Add column
          </Button>
        </div>
      </Card>

      <div className="bg-gradient-to-br from-blue-light to-green-light border border-blue-mid rounded-xl p-7 flex items-center justify-between gap-6 mt-5">
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
