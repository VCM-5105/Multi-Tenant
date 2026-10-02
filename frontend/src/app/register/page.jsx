"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import { Layers, ArrowRight, AlertCircle, Building2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAgency } = useAuth();

  const [agencyName, setAgencyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Software & Web Development");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agencyName.trim()) {
      setError("Agency Name is strictly mandatory to establish your tenant workspace.");
      return;
    }

    setLoading(true);

    try {
      await registerAgency({
        agency_name: agencyName,
        name: adminName,
        email,
        password,
        phone,
        industry,
      });

      // Redirect immediately to the new agency workspace
      router.push("/workspace");
    } catch (err) {
      setError(err.message || "Failed to register agency. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Register New Agency Workspace
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Establish your tenant account.
        </p>
      </div>

      <div className="max-w-lg w-full mx-auto">
        <Card>
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Agency Workspace Provisioning</h2>
              <p className="text-xs text-slate-500">All fields provision an isolated MySQL tenant workspace.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* MANDATORY AGENCY NAME */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Agency Name *</span>
                <span className="text-[10px] font-normal text-rose-500 lowercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  mandatory
                </span>
              </label>
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Horizon Digital Studio"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* ADMIN NAME */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Full Name *
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Jordan Bell"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agency.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Master Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* AGENCY INDUSTRY & PHONE (EXTRA SHOWCASE FIELDS) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                >
                  <option>Software & Web Development</option>
                  <option>Digital Marketing & SEO</option>
                  <option>Creative & UI/UX Design</option>
                  <option>Consulting & Strategy</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  "Provisioning Workspace..."
                ) : (
                  <>
                    <span>Create Agency Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an agency account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign In &rarr;
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
