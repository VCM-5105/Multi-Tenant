"use client";

import { Shield, Building2, Users2, UserCheck } from "lucide-react";

const ROLE_ICONS = {
  super_admin: Shield,
  agency_admin: Building2,
  agency_team: Users2,
  client: UserCheck,
};

export default function RoleCard({ role, title, subtitle, isSelected, onClick }) {
  const Icon = ROLE_ICONS[role] || Building2;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {isSelected && (
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subtitle}</p>
      </div>
    </button>
  );
}
