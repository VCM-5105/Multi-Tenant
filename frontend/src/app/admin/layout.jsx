"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import { Shield } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Checking platform credentials...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="AppZex Platform Super Admin Console" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">{children}</main>
    </div>
  );
}
