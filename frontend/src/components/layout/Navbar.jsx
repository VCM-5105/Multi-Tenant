"use client";

import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import { LogOut, User } from "lucide-react";

export default function Navbar({ title = "AppZex Platform" }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900">{user.name}</p>
              <div className="mt-0.5">
                <Badge>{user.role?.replace("_", " ").toUpperCase()}</Badge>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
