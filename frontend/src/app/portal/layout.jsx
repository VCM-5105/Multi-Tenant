"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";

export default function ClientPortalLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "client")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Connecting to client portal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title={user?.context?.companyName ? `${user.context.companyName} Portal` : "Client Portal"} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8">{children}</main>
    </div>
  );
}
