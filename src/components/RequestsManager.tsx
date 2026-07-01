"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Droplet,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import RaiseRequestModal from "./RaiseRequestModal";

interface BloodRequest {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: string;
  notes: string | null;
  patientAge: number | null;
  status: string;
  createdAt: string | Date;
}

interface RequestsManagerProps {
  hospitalId: string;
  initialRequests: BloodRequest[];
}

export default function RequestsManager({ hospitalId, initialRequests }: RequestsManagerProps) {
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/requests?hospitalId=${hospitalId}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error("Failed to refresh requests:", err);
    }
  };

  const handleRequestCreated = () => {
    setSuccessMessage("Blood request successfully created and broadcasted! 🎉");
    fetchRequests();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filter logic
  const filteredRequests = requests.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchUrgency = urgencyFilter === "ALL" || r.urgency === urgencyFilter;
    return matchStatus && matchUrgency;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "ACCEPTED":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600";
      case "IN_PROGRESS":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600";
      case "FULFILLED":
        return "bg-green-500/10 border-green-500/20 text-green-600";
      case "REJECTED":
        return "bg-red-500/10 border-red-500/20 text-red-600";
      case "EXPIRED":
        return "bg-muted border-border text-muted-foreground";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case "LOW":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20";
      case "CRITICAL":
        return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations / Requests Portal</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Manage Blood Requests</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Raise requests for emergency units, monitor live status progress, and track notifications sent to blood banks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Raise Blood Request
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-muted-foreground uppercase">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground shrink-0">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Urgency</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request Grid list */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-sm">
          No blood requests match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
                      <Droplet className="h-4 w-4 fill-red-600" />
                    </div>
                    <div>
                      <span className="font-extrabold text-foreground text-sm">{req.bloodGroup} Needed</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                        #RQ-{req.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getUrgencyStyle(req.urgency)}`}>
                      {req.urgency}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                  {req.notes || "No additional patient clinical notes provided."}
                </p>

                {/* Metadata displays */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Units: {req.unitsRequired}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Raised: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 mt-4 border-t border-border/60">
                <Link
                  href={`/dashboard/hospital/requests/${req.id}`}
                  className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center group cursor-pointer"
                >
                  View Details & Timeline <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raised Blood Request Form Modal */}
      <RaiseRequestModal
        hospitalId={hospitalId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRequestCreated}
      />
    </div>
  );
}
