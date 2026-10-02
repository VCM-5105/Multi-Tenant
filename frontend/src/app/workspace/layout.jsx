"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import SupportModeBanner from "../../components/layout/SupportModeBanner";

export default function WorkspaceLayout({ children }) {
  const router = useRouter();
  const { user, loading, supportMode } = useAuth();

  useEffect(() => {
    if (!loading && !user && !supportMode) {
      router.push("/login");
    }
  }, [user, loading, supportMode, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Loading workspace session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SupportModeBanner />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar title={user?.context?.agencyName ? `${user.context.agencyName} Workspace` : "Agency Workspace"} />
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
