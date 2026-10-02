"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Building2,
  Users,
  MessageSquare,
  Layers,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/workspace", icon: LayoutDashboard },
  { label: "Projects", href: "/workspace/projects", icon: FolderKanban },
  { label: "Tasks", href: "/workspace/tasks", icon: CheckSquare },
  { label: "Clients", href: "/workspace/clients", icon: Building2 },
  { label: "Team", href: "/workspace/team", icon: Users },
  { label: "Feedback", href: "/workspace/feedback", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Workspace Brand / Agency Name */}
        <div className="h-16 border-b border-slate-200 px-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="font-bold text-slate-900 text-sm truncate">
              {user?.context?.agencyName || "Agency Workspace"}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">AppZex Tenant</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/workspace"
                ? pathname === "/workspace"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400">
        <p>AppZex SaaS v1.0</p>
        <p className="text-slate-400 mt-0.5 truncate">Active: {user?.email}</p>
      </div>
    </aside>
  );
}
