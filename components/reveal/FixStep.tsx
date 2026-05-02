"use client";

import { useRef, useEffect } from "react";
import { Trash2, Minimize2, Shield, Lock, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type SchemaRow, getGeneralizedName } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface FixStepProps {
  rows: SchemaRow[];
  hasDirectIdentifiers: boolean;
  hasSensitive: boolean;
}

interface FixItem {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  priority: "CRITICAL" | "HIGH" | "MED" | "LOW";
  priorityClass: string;
  description: string;
  condition: boolean;
}

export function FixStep({ rows, hasDirectIdentifiers, hasSensitive }: FixStepProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const allFixItems: FixItem[] = [
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      iconClass: "bg-red-light text-red",
      title: "Remove Direct Identifiers",
      priority: "CRITICAL" as const,
      priorityClass: "bg-red-light text-red border-red-mid",
      description: "Drop all columns tagged Direct identifier before sharing",
      condition: hasDirectIdentifiers,
    },
    {
      icon: <Minimize2 className="w-3.5 h-3.5" />,
      iconClass: "bg-orange-light text-orange",
      title: "Generalize Quasi-Identifiers",
      priority: "HIGH" as const,
      priorityClass: "bg-orange-light text-orange border-orange-mid",
      description: "Replace exact values with ranges (Age to bracket, ZIP to prefix)",
      condition: true,
    },
    {
      icon: <Shield className="w-3.5 h-3.5" />,
      iconClass: "bg-yellow-light text-yellow",
      title: "Enforce k-Anonymity >= 5",
      priority: "MED" as const,
      priorityClass: "bg-yellow-light text-yellow border-yellow-mid",
      description: "Suppress/aggregate until k >= 5 per HIPAA Safe Harbor",
      condition: true,
    },
    {
      icon: <Lock className="w-3.5 h-3.5" />,
      iconClass: "bg-yellow-light text-yellow",
      title: "Apply l-Diversity",
      priority: "MED" as const,
      priorityClass: "bg-yellow-light text-yellow border-yellow-mid",
      description: "Diversify sensitive attribute values within each equivalence class",
      condition: hasSensitive,
    },
    {
      icon: <Waves className="w-3.5 h-3.5" />,
      iconClass: "bg-blue-light text-blue",
      title: "Differential Privacy Noise",
      priority: "LOW" as const,
      priorityClass: "bg-blue-light text-blue border-blue-mid",
      description: "Add Laplace/Gaussian noise for ML/aggregate outputs",
      condition: true,
    },
  ];

  const fixItems = allFixItems.filter((item) => item.condition);

  return (
    <div ref={sectionRef} className="anim-in">
      <div className="h-px bg-border my-8" />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-[22px] h-[22px] bg-green rounded-[6px] flex items-center justify-center text-white text-[11px] font-bold">
          4
        </div>
        <h2 className="text-[15px] font-bold text-text-1">Remediation Plan</h2>
      </div>

      <Card>
        <div className="grid grid-cols-2">
          {/* Remediation Steps */}
          <div className="p-[22px] border-r border-border">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-3 mb-4">
              Remediation Steps
            </div>
            <div>
              {fixItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 py-3 border-b border-border last:border-0"
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 mt-0.5",
                      item.iconClass
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-text-1 mb-0.5">
                      {item.title}
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                          item.priorityClass
                        )}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-[12px] text-text-2 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revised Schema */}
          <div className="p-[22px]">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-3 mb-4">
              Revised Schema
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-bg-subtle border-b border-border">
                  <th className="text-left text-[10.5px] font-semibold text-text-3 uppercase tracking-wide py-2 px-2.5">
                    Original
                  </th>
                  <th className="text-left text-[10.5px] font-semibold text-text-3 uppercase tracking-wide py-2 px-2.5">
                    Proposed
                  </th>
                  <th className="text-left text-[10.5px] font-semibold text-text-3 uppercase tracking-wide py-2 px-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isRemoved = row.sens === "Direct identifier";
                  const isChanged = row.sens === "Quasi-identifier";
                  const proposedName = getGeneralizedName(row.name, row.sens);

                  return (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="py-2 px-2.5">
                        <span
                          className={cn(
                            "font-mono text-[11.5px]",
                            (isRemoved || isChanged) && "line-through text-text-3"
                          )}
                        >
                          {row.name || "unnamed"}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={cn(
                            "font-mono text-[11.5px]",
                            isRemoved && "text-red",
                            isChanged && "text-green font-medium"
                          )}
                        >
                          {proposedName}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        {isRemoved && (
                          <Badge variant="removed" className="text-[10px] font-semibold uppercase tracking-wider">
                            REMOVED
                          </Badge>
                        )}
                        {isChanged && (
                          <Badge variant="changed" className="text-[10px] font-semibold uppercase tracking-wider">
                            CHANGED
                          </Badge>
                        )}
                        {!isRemoved && !isChanged && (
                          <Badge variant="kept" className="text-[10px] font-semibold uppercase tracking-wider">
                            KEPT
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
