"use client";

import { useState, useCallback } from "react";
import { Upload, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractHeaders } from "@/lib/csv";
import { guessSensitivityFromColumns, type ColumnInfo, type SensitivityLevel } from "@/lib/schema";
import { uid } from "@/lib/utils";

interface UploadStepProps {
  onFileProcessed: (columns: ColumnInfo[], fileName: string, sensitivity: SensitivityLevel) => void;
  onStartFromScratch: () => void;
}

export function UploadStep({ onFileProcessed, onStartFromScratch }: UploadStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      try {
        const headers = await extractHeaders(file);
        if (headers.length === 0) {
          alert("Could not detect column headers. Please check your file format.");
          return;
        }

        const columns: ColumnInfo[] = headers.map((h) => ({
          id: uid(),
          name: h,
        }));

        const sensitivity = guessSensitivityFromColumns(headers);
        onFileProcessed(columns, file.name, sensitivity);
      } catch {
        alert("Could not parse file. Please try a different format.");
      }
    },
    [onFileProcessed]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="anim-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-[22px] h-[22px] bg-blue rounded-[6px] flex items-center justify-center text-white text-[11px] font-bold">
          1
        </div>
        <h2 className="text-[15px] font-bold text-text-1">Import your data</h2>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200 bg-white ${
          isDragOver
            ? "border-blue bg-blue-light scale-[1.01]"
            : "border-border-strong hover:border-blue hover:bg-blue-light"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,.tsv,.txt,.xls,.xlsx"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={handleFileChange}
        />

        <div
          className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center mx-auto mb-4 text-[22px] transition-colors ${
            isDragOver ? "bg-blue-light" : "bg-bg-muted"
          }`}
        >
          <FolderOpen className="w-6 h-6 text-text-2" />
        </div>

        <h3 className="text-[16px] font-semibold text-text-1 mb-1.5">
          Drop your CSV or Excel file here
        </h3>
        <p className="text-[13px] text-text-3 mb-5 leading-relaxed">
          Reveal reads column headers only — no row data is ever processed.
          <br />
          Supports CSV, TSV, and Excel files.
        </p>

        <Button variant="outline" className="pointer-events-none mb-2">
          <Upload className="w-3.5 h-3.5" />
          Choose file
        </Button>

        <div className="flex gap-1.5 justify-center mt-4">
          {[".csv", ".tsv", ".xlsx", ".xls"].map((ext) => (
            <span
              key={ext}
              className="font-mono text-[11px] font-medium bg-bg-muted text-text-2 border border-border rounded px-2 py-0.5"
            >
              {ext}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-text-4 text-[12px] font-medium uppercase tracking-widest my-5">
        <div className="flex-1 h-px bg-border" />
        or
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onStartFromScratch}>
          <Plus className="w-3.5 h-3.5" />
          Start from scratch
        </Button>
      </div>
    </div>
  );
}
