"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Badge from "../../components/ui/Badge";
import { FolderKanban, Building2, CheckSquare, Clock, ArrowRight } from "lucide-react";

export default function WorkspaceDashboard() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, cliRes, taskRes, actRes] = await Promise.all([
          api.get("/projects"),
          api.get("/clients"),
          api.get("/tasks"),
          api.get("/activity"),
        ]);

        if (projRes.data?.success) setProjects(projRes.data.data);
        if (cliRes.data?.success) setClients(cliRes.data.data);
        if (taskRes.data?.success) setTasks(taskRes.data.data);
        if (actRes.data?.success) setActivities(actRes.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute average derived progress across all projects
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + Number(p.progress_percentage || 0), 0) /
            projects.length
        )
      : 0;

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading workspace dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agency Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. High-level view of your active agency operations.
        </p>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Companies</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{clients.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Derived Completion</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{avgProgress}%</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{tasks.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects List with Derived Progress Bars */}
        <div className="lg:col-span-2">
          <Card
            title="Projects Overview"
            subtitle="Derived progress dynamically calculated from completed tasks."
            action={
              <Link href="/workspace/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No projects created yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{project.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Client: <strong className="text-slate-700">{project.company_name}</strong>
                        </p>
                      </div>
                      <Badge>{project.status.toUpperCase()}</Badge>
                    </div>
                    {/* Derived Progress Bar */}
                    <div className="mt-3">
                      <ProgressBar value={project.progress_percentage} />
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>Tasks: {project.completed_tasks} / {project.total_tasks} completed</span>
                        <span>Priority: {project.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <Card title="Activity Timeline" subtitle="Audit trail of recent events.">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent activity recorded.</p>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex gap-3 text-xs border-l-2 border-slate-200 pl-3 py-1">
                    <div>
                      <p className="font-semibold text-slate-800">{act.event_type}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        By {act.actor_name || "System"} • <Badge className="text-[10px] py-0">{act.visibility}</Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
