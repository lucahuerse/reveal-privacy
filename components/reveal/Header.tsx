"use client";

export function TopBanner() {
  return (
    <div className="bg-white border-b border-border px-6 py-2 flex items-center justify-center gap-2 text-[12px] text-text-2">
      <span className="w-1.5 h-1.5 bg-green rounded-full shrink-0" />
      All analysis runs locally in your browser — no data is uploaded or stored
    </div>
  );
}

export function Header() {
  return (
    <header className="bg-white border-b border-border px-8 h-14 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] bg-blue rounded-[7px] flex items-center justify-center text-white text-[13px] font-bold tracking-tight shrink-0">
          Rv
        </div>
        <span className="font-bold text-[16px] tracking-tight text-text-1">Reveal</span>
        <span className="text-[12px] text-text-3 ml-0.5">Privacy Risk Analyzer</span>
      </div>
      <div className="flex gap-1.5">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-bg-muted text-text-3 border border-border">
          HIPAA
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-bg-muted text-text-3 border border-border">
          GDPR
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-bg-muted text-text-3 border border-border">
          CCPA
        </span>
      </div>
    </header>
  );
}
