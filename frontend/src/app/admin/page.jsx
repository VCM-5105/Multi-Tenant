"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  Shield,
  Building2,
  Users,
  FolderKanban,
  Search,
  LogIn,
  Ban,
  CheckCircle,
  Activity,
} from "lucide-react";

export default function SuperAdminPage() {
  const { enterSupportMode } = useAuth();

  const [stats, setStats] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [activity, setActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, agenciesRes, actRes] = await Promise.all([
        api.get("/super-admin/stats"),
        api.get(`/super-admin/agencies?search=${searchTerm}&status=${statusFilter}`),
        api.get("/super-admin/activity"),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (agenciesRes.data?.success) setAgencies(agenciesRes.data.data);
      if (actRes.data?.success) setActivity(actRes.data.data);
    } catch (err) {
      console.error("Super Admin data fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchTerm, statusFilter]);

  // Suspend / Activate Agency Toggle
  const handleToggleStatus = async (agencyId, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    const confirmMsg =
      currentStatus === "suspended"
        ? "Re-activate this agency workspace?"
        : "Suspend this agency? All of its users will be blocked from logging in immediately.";

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/super-admin/agencies/${agencyId}/status`, {
        status: nextStatus,
      });
      fetchAdminData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Enter Support Mode
  const handleEnterSupport = async (agencyId) => {
    try {
      const res = await api.post(`/super-admin/agencies/${agencyId}/support-mode`);
      if (res.data?.success) {
        const { supportToken, agency } = res.data.data;
        enterSupportMode(supportToken, agency);
      }
    } catch (err) {
      alert("Failed to enter support mode: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading platform console...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Lorem ipsum dolor sit amet. Manage all SaaS agency tenants, toggle account status, and enter support mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand">SUPER ADMIN ACTIVE</Badge>
        </div>
      </div>

      {/* Platform KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agencies (Tenants)</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{stats.agencies.total_agencies}</h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  <span className="text-emerald-600 font-semibold">{stats.agencies.active_agencies} Active</span> •{" "}
                  <span className="text-rose-600 font-semibold">{stats.agencies.suspended_agencies} Suspended</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Users</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{stats.total_users}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Companies</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{stats.total_clients}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{stats.total_projects}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Agency Management Table */}
      <Card
        title="Agencies Directory"
        subtitle="Search, filter, suspend accounts, or enter support mode session."
      >
        {/* Search & Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by agency name, email, or slug..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Agency Name</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Metrics</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No agencies match your search criteria.
                  </td>
                </tr>
              ) : (
                agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{agency.name}</strong>
                      <span className="text-[11px] text-slate-400">{agency.slug}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{agency.primary_email}</td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-600">
                      {agency.plan}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {agency.member_count} users • {agency.client_count} clients • {agency.project_count} projects
                    </td>
                    <td className="py-3 px-4">
                      <Badge>{agency.status.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {/* Enter Support Mode */}
                      <button
                        onClick={() => handleEnterSupport(agency.id)}
                        title="Enter Agency Workspace as Support Admin"
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Support Mode</span>
                      </button>

                      {/* Suspend / Activate Toggle */}
                      <button
                        onClick={() => handleToggleStatus(agency.id, agency.status)}
                        className={`px-2.5 py-1 border rounded font-semibold text-[11px] inline-flex items-center gap-1 transition ${
                          agency.status === "suspended"
                            ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"
                        }`}
                      >
                        {agency.status === "suspended" ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
