"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import { MessageSquare, CheckCircle, Clock, Reply } from "lucide-react";

export default function AgencyFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState("in_progress");
  const [responseComment, setResponseComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = async () => {
    try {
      const res = await api.get("/feedback");
      if (res.data?.success) setFeedbackList(res.data.data);
    } catch (err) {
      console.error("Feedback fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/feedback/${selectedItem.id}`, {
        status: newStatus,
        agency_response: responseComment,
      });
      setSelectedItem(null);
      setResponseComment("");
      fetchFeedback();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Feedback & Change Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Lorem ipsum dolor sit amet. Manage incoming client change requests and provide responses.
        </p>
      </div>

      <Card>
        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading feedback requests...</p>
        ) : feedbackList.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No feedback requests submitted yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbackList.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                    <Badge>{item.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Project: <strong className="text-slate-600">{item.project_name}</strong> • Submitted by: {item.submitter_name} ({item.submitter_email})
                  </p>

                  {/* Existing Agency Response */}
                  {item.agency_response && (
                    <div className="mt-2 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                      <strong>Agency Response:</strong> {item.agency_response}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setNewStatus(item.status);
                      setResponseComment(item.agency_response || "");
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Reply className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Respond</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Response Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Update Feedback Status & Response"
      >
        <form onSubmit={handleUpdateFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Workflow Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            >
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved ✓</option>
              <option value="declined">Declined ✗</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Agency Response to Client
            </label>
            <textarea
              rows={4}
              required
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
              placeholder="Explain the resolution or timeline for the client..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              {submitting ? "Saving..." : "Save Response"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
