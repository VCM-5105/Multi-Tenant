"use client";

import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, LogOut } from "lucide-react";

export default function SupportModeBanner() {
  const { supportMode, exitSupportMode } = useAuth();

  if (!supportMode) return null;

  return (
    <div className="bg-amber-400 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
        <span>
          You are currently viewing <strong className="underline">{supportMode.agency?.name || "Agency Workspace"}</strong> in Super Admin Support Mode.
        </span>
      </div>
      <button
        type="button"
        onClick={exitSupportMode}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 text-amber-100 hover:bg-black rounded font-medium transition shadow-sm text-xs"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Exit Support Mode</span>
      </button>
    </div>
  );
}
