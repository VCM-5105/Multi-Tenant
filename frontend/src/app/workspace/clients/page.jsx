"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { Plus, Building2, UserPlus, Mail, Phone, AlertCircle } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Client Company Modal
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Onboard Client User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("password");
  const [designation, setDesignation] = useState("Project Lead");
  const [modalMessage, setModalMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      if (res.data?.success) setClients(res.data.data);
    } catch (err) {
      console.error("Clients fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/clients", {
        company_name: companyName,
        primary_contact_person: contactPerson,
        email,
        phone,
        notes,
      });
      setIsCompanyModalOpen(false);
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      fetchClients();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClientUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalMessage("");
    try {
      await api.post(`/clients/${selectedClient.id}/users`, {
        name: userName,
        email: userEmail,
        password: userPassword,
        designation,
      });
      setModalMessage("Client portal login credentials created successfully!");
      setTimeout(() => {
        setIsUserModalOpen(false);
        setUserName("");
        setUserEmail("");
        setModalMessage("");
      }, 1500);
    } catch (err) {
      setModalMessage("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Companies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Lorem ipsum dolor sit amet. Manage customer companies and create portal user accounts.
          </p>
        </div>
        <button
          onClick={() => setIsCompanyModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Company</span>
        </button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading client companies...</p>
      ) : clients.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 text-sm">No Clients Enrolled</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first client company to assign projects and create client portal logins.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <Card key={client.id} className="flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{client.company_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Contact: {client.primary_contact_person}</p>
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    {client.total_projects || 0} Projects
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Onboard Client Portal User Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setIsUserModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Onboard Portal Login</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal 1: Add Client Company */}
      <Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} title="Add Client Company">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Globex Corporation"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Primary Contact Person *
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0820"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCompanyModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              {submitting ? "Saving..." : "Create Client Company"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Onboard Client Portal User */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={`Onboard Client User — ${selectedClient?.company_name || ""}`}
      >
        <form onSubmit={handleCreateClientUser} className="space-y-4">
          {modalMessage && (
            <div className={`p-3 text-xs rounded-lg ${modalMessage.includes("Error") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
              {modalMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact Full Name *
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Portal Login Email *
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="elena@globexcorp.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="password"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. VP of Product"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              {submitting ? "Creating..." : "Create Client Login"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
