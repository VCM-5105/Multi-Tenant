"use client";

import { useState } from "react";
import Link from "next/link";
import RoleCard from "../../components/auth/RoleCard";
import RoleLoginForm from "../../components/auth/RoleLoginForm";
import Card from "../../components/ui/Card";
import { Layers } from "lucide-react";

const ROLES = [
  {
    id: "agency_admin",
    title: "Agency Admin",
    subtitle: "Full control over agency workspace, team, clients, and projects.",
  },
  {
    id: "agency_team",
    title: "Agency Team",
    subtitle: "Access assigned projects, track tasks, and update progress.",
  },
  {
    id: "client",
    title: "Agency Client",
    subtitle: "Customer portal to follow project status and submit change requests.",
  },
  {
    id: "super_admin",
    title: "Super Admin",
    subtitle: "AppZex platform owner: global metrics, agency accounts, support mode.",
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("agency_admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="text-center max-w-md mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">AppZex</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Select Your Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Choose your role to proceed.
        </p>
      </div>

      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* The 4 Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map((r) => (
            <RoleCard
              key={r.id}
              role={r.id}
              title={r.title}
              subtitle={r.subtitle}
              isSelected={selectedRole === r.id}
              onClick={() => setSelectedRole(r.id)}
            />
          ))}
        </div>

        {/* Selected Role Login Form Card */}
        <Card className="max-w-md mx-auto">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Sign In as {ROLES.find((r) => r.id === selectedRole)?.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your verified credentials to enter your workspace.
            </p>
          </div>

          <RoleLoginForm selectedRole={selectedRole} />

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New agency?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Register Agency Workspace &rarr;
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
