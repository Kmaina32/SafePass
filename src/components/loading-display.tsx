
"use client";
import { KeyRound, ShieldCheck } from "lucide-react";

export function LoadingDisplay() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 text-primary">
      <div className="relative flex items-center justify-center w-24 h-24">
        <ShieldCheck className="w-24 h-24 text-primary animate-pulse" />
        <KeyRound className="absolute w-12 h-12 text-primary animate-spin-slow" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground animate-pulse">
            Loading SafePass Vault...
        </h2>
        <p className="text-muted-foreground">Securing your session.</p>
      </div>
    </div>
  );
}

