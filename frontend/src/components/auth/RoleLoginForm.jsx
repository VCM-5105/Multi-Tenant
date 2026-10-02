"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, AlertCircle, KeyRound } from "lucide-react";

const DEMO_CREDENTIALS = {
  super_admin: {
    email: "superadmin@appzex.com",
    password: "password",
    label: "Super Admin Demo",
  },
  agency_admin: {
    email: "admin@apexdigital.com",
    password: "password",
    label: "Agency Admin Demo",
  },
  agency_team: {
    email: "dev@apexdigital.com",
    password: "password",
    label: "Agency Team Demo",
  },
  client: {
    email: "client@globexcorp.com",
    password: "password",
    label: "Client Lead Demo",
  },
};

export default function RoleLoginForm({ selectedRole }) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear errors when role switches
  useEffect(() => {
    setError("");
  }, [selectedRole]);

  // Autofill button helper
  const handleAutofill = () => {
    const creds = DEMO_CREDENTIALS[selectedRole];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Verify that the user logged into the portal matching their selected card
      if (selectedRole === "super_admin" && user.role !== "super_admin") {
        throw new Error("This account is not a Super Admin. Please select the Agency or Client portal.");
      }
      if (
        (selectedRole === "agency_admin" || selectedRole === "agency_team") &&
        user.role !== "agency_admin" &&
        user.role !== "agency_team"
      ) {
        throw new Error("This account does not belong to an agency workspace. Please select the correct portal.");
      }
      if (selectedRole === "client" && user.role !== "client") {
        throw new Error("This account is not a Client user. Please select your agency role.");
      }

      // Role-based smart routing
      if (user.role === "super_admin") {
        router.push("/admin");
      } else if (user.role === "client") {
        router.push("/portal");
      } else {
        router.push("/workspace");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Password
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

      {/* Quick Demo Autofill Pill */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleAutofill}
          className="w-full py-2 px-3 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Autofill credentials for {DEMO_CREDENTIALS[selectedRole]?.label}</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
      >
        {loading ? (
          "Signing in..."
        ) : (
          <>
            <span>Continue to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
