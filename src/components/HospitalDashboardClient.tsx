"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Building,
  Plus,
  ArrowRight,
  Clock,
  Droplet
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

interface HospitalDashboardClientProps {
  hospitalId: string;
  hospitalName: string;
  latitude: number;
  longitude: number;
  initialRequests: BloodRequest[];
}

export default function HospitalDashboardClient({
  hospitalId,
  hospitalName,
  latitude,
  longitude,
  initialRequests,
}: HospitalDashboardClientProps) {
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats calculation
  const activeCount = requests.filter((r) =>
    ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(r.status)
  ).length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;
  const criticalCount = requests.filter((r) =>
    r.urgency === "CRITICAL" && !["FULFILLED", "REJECTED", "EXPIRED"].includes(r.status)
  ).length;

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
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "CRITICAL":
        return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse font-extrabold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-background to-secondary/15 p-8 shadow-md">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Hospital Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
              {hospitalName}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Submit urgent blood requests, track real-time delivery status progression, and collaborate with local blood banks.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3.5 shrink-0 flex flex-col justify-center shadow-xs">
            <span className="text-xs text-muted-foreground block">Location Coordinates</span>
            <span className="text-sm font-semibold text-primary font-mono mt-1">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Active Requests</span>
            <span className="text-3xl font-bold text-foreground block">{activeCount}</span>
            <span className="text-[10px] text-muted-foreground/80 font-medium block">Awaiting fulfillment</span>
          </div>
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Fulfilled Requests</span>
            <span className="text-3xl font-bold text-foreground block">{fulfilledCount}</span>
            <span className="text-[10px] text-muted-foreground/80 font-medium block">Delivered to ward</span>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Critical Requests</span>
            <span className="text-3xl font-bold text-foreground block">{criticalCount}</span>
            <span className="text-[10px] text-muted-foreground/80 font-medium block">Urgent action required</span>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
        <h3 className="text-base font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-5 bg-muted/20 border border-border hover:border-primary/25 rounded-2xl flex flex-col justify-between h-32 transition-all group hover:bg-muted/40 cursor-pointer text-left w-full"
          >
            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
              <Plus className="h-5 w-5" />
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center">
                Raise Blood Request <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
                Log a new emergency or standard request for target blood groups.
              </p>
            </div>
          </button>

          <Link
            href="/dashboard/hospital/requests"
            className="p-5 bg-muted/20 border border-border hover:border-primary/25 rounded-2xl flex flex-col justify-between h-32 transition-all group hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center">
                View Active Requests <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
                Check details and visual timelines for all open clinical requests.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Grid of recent requests and activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests list */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-foreground">Recent Request Log</h3>
            <Link
              href="/dashboard/hospital/requests"
              className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center"
            >
              All Requests <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs italic">
                No requests logged yet. Click "Raise Blood Request" to create one.
              </div>
            ) : (
              requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between transition-all hover:border-primary/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-foreground">{req.bloodGroup} Needed</span>
                      <span className="inline-flex text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded font-bold">
                        {req.unitsRequired} Units
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Raised: {new Date(req.createdAt).toLocaleDateString()} | Urgency:{" "}
                      <span className="font-semibold">{req.urgency}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                    <Link
                      href={`/dashboard/hospital/requests/${req.id}`}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity summary */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">Activity Log</h3>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  No recent activities recorded.
                </div>
              ) : (
                requests.slice(0, 4).map((req) => (
                  <div key={req.id} className="flex space-x-3 text-xs">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 font-bold text-[9px]">
                      {req.bloodGroup}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-foreground leading-snug">
                        Request <span className="font-semibold">#RQ-{req.id.slice(-4).toUpperCase()}</span> set to{" "}
                        <span className="font-semibold text-primary">{req.status}</span>.
                      </p>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raised Blood Request Form Modal */}
      <RaiseRequestModal
        hospitalId={hospitalId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
