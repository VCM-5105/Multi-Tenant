"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import { Plus, CheckSquare, Calendar, User, AlertCircle, Filter } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async (filterParam = activeFilter) => {
    try {
      let url = "/tasks";
      if (filterParam !== "all") {
        url += `?filter=${filterParam}`;
      }
      const [taskRes, projRes, teamRes] = await Promise.all([
        api.get(url),
        api.get("/projects"),
        api.get("/team"),
      ]);

      if (taskRes.data?.success) setTasks(taskRes.data.data);
      if (projRes.data?.success) setProjects(projRes.data.data);
      if (teamRes.data?.success) setTeam(teamRes.data.data);
    } catch (err) {
      console.error("Tasks fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeFilter);
  }, [activeFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/tasks", {
        project_id: projectId,
        assignee_id: assigneeId || null,
        title,
        description,
        priority,
        due_date: dueDate || null,
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks(activeFilter);
    } catch (err) {
      alert("Failed to create task: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Items & Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Lorem ipsum dolor sit amet. Marking tasks completed automatically updates your project derived progress.
          </p>
        </div>
        <button
          onClick={() => {
            if (projects.length > 0 && !projectId) setProjectId(projects[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs (Section 07: Overdue & Upcoming) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "all", label: "All Tasks" },
          { id: "overdue", label: "⚠️ Overdue Tasks" },
          { id: "due_this_week", label: "📅 Due This Week" },
          { id: "my_tasks", label: "👤 Assigned to Me" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === f.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks Table/List */}
      <Card>
        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No tasks found for this filter view.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.status !== "completed";

              return (
                <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{task.title}</span>
                      <Badge>{task.priority.toUpperCase()}</Badge>
                      {isOverdue && <Badge variant="danger">OVERDUE</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Project: <strong className="text-slate-700">{task.project_name}</strong>
                      {task.assignee_name && ` • Assignee: ${task.assignee_name}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {task.due_date && (
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}

                    {/* Interactive Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none transition ${
                        task.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="completed">Completed ✓</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Responsive Navigation"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              {submitting ? "Saving..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
