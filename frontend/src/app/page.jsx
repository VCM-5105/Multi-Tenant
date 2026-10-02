import Link from "next/link";
import { Layers, Shield, Building2, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Card from "../components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">AppZex</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              Register Agency
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-6">
          <span>Enterprise Multi-Tenant SaaS Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          All-in-One Agency Management & Client Collaboration
        </h1>

        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <span>Select Portal to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition"
          >
            Register Agency
          </Link>
        </div>

        {/* 4 Cards Showcase (Productive style) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <Card title="Multi-Tenant Isolation">
            <p className="text-xs text-slate-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Agency workspaces are strictly isolated in MySQL.
            </p>
          </Card>

          <Card title="Derived Progress Engine">
            <p className="text-xs text-slate-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Progress percentages derive dynamically from actual work.
            </p>
          </Card>

          <Card title="Restricted Client Portal">
            <p className="text-xs text-slate-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Customers follow projects and file change requests.
            </p>
          </Card>

          <Card title="Super Admin Support Mode">
            <p className="text-xs text-slate-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Privileged access mode with persistent security banner.
            </p>
          </Card>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 AppZex Multi-Tenant SaaS. Built with Next.js, React, Node.js & MySQL.</p>
      </footer>
    </div>
  );
}
