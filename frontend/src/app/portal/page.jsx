"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  FolderKanban,
  MessageSquare,
  FileText,
  Download,
  Plus,
  Calendar,
  AlertCircle,
  Building,
} from "lucide-react";

export default function ClientPortalPage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Feedback Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPortalData = async () => {
    try {
      const [projRes, meetRes, fbRes, fileRes] = await Promise.all([
        api.get("/projects"),
        api.get("/meetings"),
        api.get("/feedback"),
        api.get("/files"),
      ]);

      if (projRes.data?.success) {
        setProjects(projRes.data.data);
        if (projRes.data.data.length > 0 && !projectId) {
          setProjectId(projRes.data.data[0].id);
        }
      }
      if (meetRes.data?.success) setMeetings(meetRes.data.data);
      if (fbRes.data?.success) setFeedback(fbRes.data.data);
      if (fileRes.data?.success) setFiles(fileRes.data.data);
    } catch (err) {
      console.error("Client portal fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        project_id: projectId,
        title,
        description,
      });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      fetchPortalData();
    } catch (err) {
      alert("Error submitting request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleGenerateAiSummary = async (meetingId) => {
  try {
    const res = await api.post(`/meetings/${meetingId}/summarize`);
    alert("AI Summary: " + res.data.data.aiSummary);
  } catch (err) {
    alert("Failed: " + err.message);
  }
};

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download file: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading client portal...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card (Section 08 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
            Customer Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
            Welcome, {user?.context?.companyName || user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Lorem ipsum dolor sit amet. Track real-time progress on your projects, view shared documents, and submit change requests directly to your agency team.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={projects.length === 0}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Change Request</span>
          </button>
        </div>
      </div>

      {/* Active Projects (Derived Progress Section) */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Your Active Projects</h2>
        {projects.length === 0 ? (
          <Card className="text-center py-8">
            <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No active projects assigned to your company currently.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <Card key={project.id}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-base">{project.name}</h3>
                  <Badge>{project.status.toUpperCase()}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {project.description || "Lorem ipsum dolor sit amet, scope details."}
                </p>

                {/* Derived Progress Bar */}
                <div className="pt-3 border-t border-slate-100">
                  <ProgressBar value={project.progress_percentage} />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>{project.completed_tasks} of {project.total_tasks} deliverables completed</span>
                    {project.expected_completion_date && (
                      <span>Target: {new Date(project.expected_completion_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Shared Meetings & Shared Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared Meeting Notes */}
        <Card
          title="Shared Meeting Notes"
          subtitle="Summaries and milestones shared with your team."
        >
          {meetings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No meeting notes shared yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <strong className="text-slate-800">{m.title}</strong>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(m.meeting_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.notes}</p>
                  <button onClick={() => handleGenerateAiSummary(meeting.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition">
                   <span>AI Summarize</span>
                      </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Shared Files & Assets */}
        <Card
          title="Shared Documents & Assets"
          subtitle="Secure downloads authorized for your team."
        >
          {files.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No files shared with your portal yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {files.map((file) => (
                <div key={file.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 truncate">{file.file_name}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file.id, file.file_name)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Your Change Requests History */}
      <Card
        title="Your Change Requests"
        subtitle="Track status and responses from the agency team."
      >
        {feedback.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">You have not submitted any change requests.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedback.map((fb) => (
              <div key={fb.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 text-xs">{fb.title}</h4>
                  <Badge>{fb.status.toUpperCase()}</Badge>
                </div>
                <p className="text-xs text-slate-600">{fb.description}</p>
                {fb.agency_response && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900 rounded-lg">
                    <strong>Agency Response:</strong> {fb.agency_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Change Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Change Request">
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Change Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Please change the hero section button colour"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the change or feedback in detail..."
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
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
